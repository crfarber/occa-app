# Handleiding: project installeren en ML-model trainen

Van een lege Mac tot een draaiende Occa-app (iOS development build) en een getraind
categoriemodel. Alle commando’s gaan uit van de **repo-root**, tenzij anders vermeld.

> ML Kit (custom TFLite) werkt **niet** in Expo Go. Je hebt een **development client** nodig
> (`pnpm ios` / `expo run:ios`).

---

## 1. Wat je nodig hebt

| Tool | Waarvoor | Richtlijn |
| ---- | -------- | --------- |
| macOS | iOS-builds | met Xcode |
| [Xcode](https://developer.apple.com/xcode/) (App Store) | iOS Simulator / device | eenmaal openen, license accepteren, Components naar wens |
| Xcode Command Line Tools | compilers | `xcode-select --install` |
| CocoaPods | iOS native deps | komt vaak mee via `pnpm ios`; anders `sudo gem install cocoapods` |
| Node.js ≥ 22.13 | JS-runtime | [nodejs.org](https://nodejs.org/) of `brew install node@22` |
| pnpm 11 | package manager | via Corepack (zie hieronder) |
| iPhone of Simulator | app draaien | fysiek toestel: developer mode / signing in Xcode |
| Python 3.11+ (aanbevolen) | model trainen | aparte venv onder `training/` |
| ~5 GB vrije schijf | dataset + TensorFlow | clothing-zip ~320 MB + TF |

Android is optioneel (`pnpm android` + Android Studio); deze handleiding focust op iOS.

---

## 2. pnpm en Node klaarzetten

```bash
# Node-versie checken (moet ≥ 22.13)
node -v

# Corepack aanzetten en pnpm uit package.json gebruiken
corepack enable
corepack prepare pnpm@11.21.0 --activate
pnpm -v
```

Als Corepack geblokkeerd is op nieuwere Node: `corepack enable` opnieuw of pnpm via
[pnpm.io/installation](https://pnpm.io/installation).

---

## 3. Project klonen en dependencies

```bash
git clone <jouw-repo-url> occa
cd occa
pnpm install
```

Eerste keer kan even duren (native modules + Expo).

### Omgevingsvariabelen

Maak een lokaal env-bestand (wordt niet gecommit):

```bash
cat > .env.local <<'EOF'
EXPO_PUBLIC_ENVIRONMENT=internal
EXPO_PUBLIC_AUTH_PROVIDER=demo
# Optioneel tot er een API is:
# EXPO_PUBLIC_API_BASE_URL=https://example.com
EOF
```

Met `demo` kun je zonder Azure AD inloggen. Productie weigert demo-login.

---

## 4. Xcode en eerste iOS-build

1. Open **Xcode** één keer → Settings → Accounts: Apple ID (gratis genoeg voor Simulator).
2. Accepteer de license als Xcode daarom vraagt.
3. Vanuit de repo-root:

```bash
pnpm ios
```

Dat doet grofweg:

1. `expo prebuild` → genereert `ios/` (staat niet in git)
2. CocoaPods installeren
3. Native build + install op Simulator (of aangesloten iPhone)
4. Metro starten met **dev client**

Duurt de eerste keer vaak 5–15 minuten.

**Fysiek iPhone:** open daarna `ios/*.xcworkspace` in Xcode, kies je Team onder Signing, of
gebruik `pnpm ios --device` / Device-kiezer in de Expo-CLI.

### Alleen Metro (na een geslaagde build)

```bash
pnpm start
```

Open de al geïnstalleerde development build; die verbindt met Metro.

### Native opnieuw genereren (na plugins / native deps)

```bash
pnpm prebuild          # expo prebuild --clean
pnpm ios
```

Nodig na toevoegen van native modules (ML Kit, camera, …), niet na elke JS-wijziging.

---

## 5. Dagelijkse workflow

```bash
cd occa
pnpm start          # Metro + QR / open in dev client
# of opnieuw native bouwen:
pnpm ios
```

Controles vóór een PR / push:

```bash
pnpm run ci
```

---

## 6. Categoriemodel trainen (TFLite)

Doel: `assets/models/occa_category.tflite` + `labels.json` voor on-device herkenning via ML Kit.

Downloads, `clothing_data/`, `.venv` en `training/export/` staan in `.gitignore` — die horen
niet in git. Het **gebundelde** model in `assets/models/` wél (dat gebruikt de app).

### 6.1 Eén commando (aanbevolen)

Vanuit de **repo-root**. Maakt zelf een Python-venv, downloadt de zip, traint (int8) en kopieert
naar `assets/models/`:

```bash
# Default-dataset (Alexey Grigorev, ~320 MB zip)
pnpm training

# Of een eigen zip-URL (moet images.csv + images/ bevatten, zelfde layout)
pnpm training -- https://github.com/alexeygrigorev/clothing-dataset/archive/refs/heads/master.zip
```

> Let op de `--` na `training`: zo geeft pnpm de URL door aan het script.

Bronnen:

| Wat | URL |
| --- | --- |
| GitHub-repo (CC0) | https://github.com/alexeygrigorev/clothing-dataset |
| Default zip | https://github.com/alexeygrigorev/clothing-dataset/archive/refs/heads/master.zip |

Optionele flags (na `--`):

```bash
pnpm training -- --quantize float16
pnpm training -- --min-count 100
pnpm training -- --skip-download          # bestaande clothing_data/train hergebruiken
pnpm training -- --data training/dataset  # eigen winkelfoto’s (map per klasse)
```

Gebruik bij voorkeur **Python 3.11 of 3.12** op het systeem (`python3`); het script zet een venv
onder `training/.venv/`.

### 6.2 Handmatig (zelfde stappen als het script)

```bash
cd training
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python prepare_clothing_dataset.py --url <zip-url> --force --out ./clothing_data
python train.py --data ./clothing_data/train --out ./export
cp export/occa_category.tflite export/labels.json ../assets/models/
```

### 6.3 Eigen winkelfoto’s

Mapnamen = `id` uit [`training/categories.json`](../training/categories.json). Richtlijn:
**100–500 foto’s per map**. Geen label-close-ups hier (later OCR).

```bash
pnpm training -- --data training/dataset --skip-download
# of alleen trainen:
# cd training && source .venv/bin/activate && python train.py --data ./dataset --out ./export
```

### 6.4 Na het trainen

1. Controleer dat `src/domeinen/capture/domain/category-model-labels.ts` **dezelfde volgorde**
   heeft als `assets/models/labels.json`.
2. App herladen (Metro). Nieuw native pakket alleen nodig bij nieuwe native modules, niet bij
   alleen een nieuw `.tflite`.
3. Mapping naar winkelcategorieën blijft in `interpret-labels.ts`.

---

## 7. Handige links (samenvatting)

| Onderwerp | URL / pad |
| --------- | --------- |
| Clothing dataset repo | https://github.com/alexeygrigorev/clothing-dataset |
| Clothing dataset zip | https://github.com/alexeygrigorev/clothing-dataset/archive/refs/heads/master.zip |
| Expo docs | https://docs.expo.dev/ |
| pnpm | https://pnpm.io/ |
| Xcode | https://developer.apple.com/xcode/ |
| Training README | [training/README.md](../training/README.md) |
| Categoriemodel (wiki) | [wiki/categorie-model.md](wiki/categorie-model.md) |
| Occa-brief | [occa-brief.md](occa-brief.md) |

---

## 8. Veelvoorkomende problemen

| Symptoom | Richting |
| -------- | -------- |
| “Recognising the photo failed” | Model niet geladen, of float16 zonder metadata — gebruik int8-export in `assets/models/` |
| Geen labels / lege lijst | Lage confidence int8; drempels in classifier / `interpret-labels` |
| Expo Go / geen ML Kit | Verplicht development build (`pnpm ios`) |
| `pod install` faalt | Xcode CLI tools, CocoaPods, `cd ios && pod install` na `pnpm prebuild` |
| App start niet (config) | `.env.local` mist verplichte `EXPO_PUBLIC_*` |
| TensorFlow import faalt | Andere Python-versie in venv (3.11/3.12), `pip install -U pip` |

---

## 9. Korte checklist “van scratch”

1. Xcode + Node ≥ 22.13 + `corepack enable` / pnpm  
2. `git clone` → `pnpm install` → `.env.local` met demo-auth  
3. `pnpm ios` (eerste native build)  
4. App openen, demo-login, scannen testen  
5. (Optioneel) `pnpm training` of `pnpm training -- <zip-url>` → model in `assets/models/`  
6. `pnpm run ci` groen houden  
