import type { MultipartUploadFile, MultipartUploadFiles } from '@/shared/platform/ports';

/**
 * React Native FormData: a local URI is appended as `{ uri, name, type }`, which
 * fetch turns into a multipart file part. Bytes go through a Blob when needed.
 */

function partFromUri(uri: string, metadata: { name: string; type: string }): MultipartUploadFile {
  return {
    appendTo(body, fieldName) {
      // React Native's FormData accepts this shape; the DOM typings do not.
      body.append(fieldName, { uri, name: metadata.name, type: metadata.type } as unknown as Blob);
    },
    async remove() {
      // The camera / crop file stays; the outbox still points at it until sent.
    },
  };
}

export function createRnMultipartUploadFiles(): MultipartUploadFiles {
  return {
    async prepare(bytes, metadata) {
      const blob = new Blob([Uint8Array.from(bytes)], { type: metadata.type });
      return {
        appendTo(body, fieldName) {
          body.append(fieldName, blob, metadata.name);
        },
        async remove() {},
      };
    },
    async fromUri(uri, metadata) {
      return partFromUri(uri, metadata);
    },
  };
}
