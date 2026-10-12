"""
Occa - categoriemodel trainen voor op de telefoon.

Mapstructuur van je foto's (mapnaam = categorie):

    clothing_data/train/
      T-Shirt/   *.jpg
      Pants/     *.jpg
      ...

Gebruik (publieke clothing-dataset na prepare):
    python prepare_clothing_dataset.py --out ./clothing_data
    python train.py --data ./clothing_data/train --out ./export

Of met eigen winkelfoto's (mapnamen = categories.json ids):
    python train.py --data ./dataset --out ./export

Resultaat in --out:
    occa_category.tflite   model voor ML Kit (standaard int8/uint8; --quantize float16 optioneel)
    labels.json               index -> categorie, zelfde volgorde als de modeloutput
    report.txt                nauwkeurigheid per categorie op de validatieset

ML Kit Image Labeling accepteert UINT8 of FLOAT32+NormalizationOptions-metadata.
Float16-export houdt float32-I/O zonder metadata → faalt op het toestel. Daarom is
int8 de standaard voor de app-asset.
"""

import argparse
import json
import os
import pathlib

import numpy as np
import tensorflow as tf

IMG_SIZE = 224
SEED = 42


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--data", required=True, help="map met een submap per categorie")
    p.add_argument("--out", default="./export")
    p.add_argument("--epochs", type=int, default=15, help="epochs met bevroren basismodel")
    p.add_argument(
        "--finetune-epochs",
        type=int,
        default=8,
        help="extra epochs met bovenste lagen ontdooid (0 = overslaan)",
    )
    p.add_argument("--batch", type=int, default=32)
    p.add_argument("--val-split", type=float, default=0.2)
    p.add_argument(
        "--weights",
        default="imagenet",
        help="'imagenet' (aanbevolen) of 'none' om zonder voorgetraind model te testen",
    )
    p.add_argument(
        "--early-stop-patience",
        type=int,
        default=3,
        help="epochs zonder val_accuracy-verbetering voordat training stopt",
    )
    p.add_argument(
        "--class-weight",
        choices=("none", "sqrt", "balanced"),
        default="none",
        help="gewicht per klasse; 'balanced'/'sqrt' kunnen TFLite-kwantisatie schaden op deze set",
    )
    p.add_argument(
        "--quantize",
        choices=("int8", "float16"),
        default="int8",
        help="int8/uint8 = ML Kit-compatibel (~1.2 MB); float16 ≈ hogere acc maar zonder metadata niet voor ML Kit",
    )
    return p.parse_args()


def class_weights_for(mode, data_dir, class_names):
    """Optional class weights. Default none — full balanced hurt int8 TFLite on this set."""
    if mode == "none":
        return None
    counts = []
    root = pathlib.Path(data_dir)
    for name in class_names:
        n = sum(1 for p in (root / name).iterdir() if p.is_file())
        counts.append(max(n, 1))
    total = sum(counts)
    n_classes = len(counts)
    raw = {i: total / (n_classes * c) for i, c in enumerate(counts)}
    if mode == "sqrt":
        return {i: float(np.sqrt(w)) for i, w in raw.items()}
    return raw


def load_datasets(data_dir, batch, val_split):
    common = dict(
        validation_split=val_split,
        seed=SEED,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=batch,
        label_mode="int",
    )
    train = tf.keras.utils.image_dataset_from_directory(
        data_dir, subset="training", **common
    )
    val = tf.keras.utils.image_dataset_from_directory(
        data_dir, subset="validation", **common
    )
    class_names = train.class_names

    # Augmentatie alleen tijdens training, in de datapijplijn.
    # Zo komt ze niet in het model dat op de telefoon draait.
    augment = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.1),
            tf.keras.layers.RandomZoom(0.2),
            tf.keras.layers.RandomTranslation(0.08, 0.08),
            tf.keras.layers.RandomContrast(0.2),
        ],
        name="augment",
    )
    train_aug = train.map(
        lambda x, y: (augment(x, training=True), y),
        num_parallel_calls=tf.data.AUTOTUNE,
    )

    return (
        train_aug.prefetch(tf.data.AUTOTUNE),
        train.prefetch(tf.data.AUTOTUNE),  # onbewerkt, voor quantisatie-kalibratie
        val.prefetch(tf.data.AUTOTUNE),
        class_names,
    )


def build_model(num_classes, weights):
    # Invoer: ruwe pixels 0-255. MobileNetV3 doet de schaling zelf (include_preprocessing),
    # zodat de telefoon de foto ongewijzigd kan aanleveren.
    base = tf.keras.applications.MobileNetV3Small(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights=None if weights == "none" else weights,
        include_preprocessing=True,
        pooling="avg",
    )
    base.trainable = False

    inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3), name="image")
    x = base(inputs, training=False)
    x = tf.keras.layers.Dropout(0.25)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="scores")(x)
    return tf.keras.Model(inputs, outputs), base


def compile_model(model, lr):
    model.compile(
        optimizer=tf.keras.optimizers.Adam(lr),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )


def early_stop_callback(patience):
    return tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=patience,
        restore_best_weights=True,
        mode="max",
    )


def export_tflite(model, train_ds, out_dir, quantize="int8"):
    """Export TFLite for on-device ML Kit.

    int8 → uint8 I/O (ML Kit-safe, no metadata). float16 → float32 I/O without
    NormalizationOptions metadata — higher eval accuracy, but ML Kit rejects it.
    """
    saved = os.path.join(out_dir, "saved_model")
    model.export(saved)  # Keras 3; levert een SavedModel voor de converter

    conv = tf.lite.TFLiteConverter.from_saved_model(saved)
    conv.optimizations = [tf.lite.Optimize.DEFAULT]

    if quantize == "int8":
        def representative():
            # Meer batches → stabielere int8-kalibratie
            for images, _ in train_ds.take(80):
                for img in images:
                    yield [tf.expand_dims(tf.cast(img, tf.float32), 0)]

        conv.representative_dataset = representative
        conv.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
        conv.inference_input_type = tf.uint8
        conv.inference_output_type = tf.float32
    else:
        # Higher accuracy on desktop eval; not usable via ML Kit until metadata is packed.
        conv.target_spec.supported_types = [tf.float16]

    tflite_bytes = conv.convert()
    path = os.path.join(out_dir, "occa_category.tflite")
    pathlib.Path(path).write_bytes(tflite_bytes)
    return path


def evaluate_tflite(path, val_ds, class_names):
    # XNNPACK on some macOS/TF combos fails at allocate_tensors; use builtins only.
    try:
        interp = tf.lite.Interpreter(
            model_path=path,
            experimental_op_resolver_type=tf.lite.experimental.OpResolverType.BUILTIN_WITHOUT_DEFAULT_DELEGATES,
        )
    except (AttributeError, TypeError, ValueError):
        interp = tf.lite.Interpreter(model_path=path)
    interp.allocate_tensors()
    inp = interp.get_input_details()[0]
    out = interp.get_output_details()[0]
    in_dtype = inp["dtype"]

    n = len(class_names)
    confusion = np.zeros((n, n), dtype=int)
    for images, labels in val_ds:
        for img, label in zip(images.numpy(), labels.numpy()):
            batch = np.expand_dims(img.astype(in_dtype), 0)
            interp.set_tensor(inp["index"], batch)
            interp.invoke()
            pred = int(np.argmax(interp.get_tensor(out["index"])[0]))
            confusion[label, pred] += 1

    lines = []
    total_ok = int(np.trace(confusion))
    total = int(confusion.sum())
    lines.append(f"Totaal: {total_ok}/{total} goed ({total_ok / max(total, 1):.0%})\n")
    lines.append("Per categorie (goed / aantal, meest verward met):")
    for i, name in enumerate(class_names):
        row = confusion[i]
        count = int(row.sum())
        ok = int(row[i])
        others = [
            (int(row[j]), class_names[j]) for j in range(n) if j != i and row[j] > 0
        ]
        others.sort(reverse=True)
        mixed = (
            f", verward met {others[0][1]} ({others[0][0]}x)" if others else ""
        )
        lines.append(f"  {name:<20} {ok}/{count}{mixed}")
    return "\n".join(lines)


def main():
    args = parse_args()
    os.makedirs(args.out, exist_ok=True)

    train_ds, calib_ds, val_ds, class_names = load_datasets(
        args.data, args.batch, args.val_split
    )
    print(f"Categorieën ({len(class_names)}): {class_names}")

    class_weight = class_weights_for(args.class_weight, args.data, class_names)
    if class_weight is None:
        print("Class weights: none")
    else:
        print(
            "Class weights: "
            f"{ {class_names[i]: round(w, 2) for i, w in class_weight.items()} }"
        )

    model, base = build_model(len(class_names), args.weights)
    fit_kw = {"class_weight": class_weight} if class_weight is not None else {}

    compile_model(model, 1e-3)
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        # Fresh EarlyStopping per phase — reusing one callback across fit()
        # calls leaves stale "best" weights from the frozen phase.
        callbacks=[early_stop_callback(args.early_stop_patience)],
        **fit_kw,
    )

    if args.finetune_epochs > 0:
        # Bovenste lagen van het basismodel bijtrainen met een lage leersnelheid
        base.trainable = True
        for layer in base.layers[:-30]:
            layer.trainable = False
        compile_model(model, 1e-5)
        model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=args.finetune_epochs,
            callbacks=[early_stop_callback(args.early_stop_patience)],
            **fit_kw,
        )

    path = export_tflite(model, calib_ds, args.out, quantize=args.quantize)
    print(f"Quantisatie: {args.quantize}")

    labels = {str(i): name for i, name in enumerate(class_names)}
    pathlib.Path(args.out, "labels.json").write_text(
        json.dumps(labels, ensure_ascii=False, indent=2) + "\n"
    )

    report = evaluate_tflite(path, val_ds, class_names)
    pathlib.Path(args.out, "report.txt").write_text(report + "\n")
    size_mb = os.path.getsize(path) / 1e6
    print(f"\nModel: {path} ({size_mb:.1f} MB)\n{report}")


if __name__ == "__main__":
    main()
