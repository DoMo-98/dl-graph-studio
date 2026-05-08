import { vi } from "vitest";

type ProjectExportTestOptions = {
  objectUrl?: string;
};

export function setupProjectExportTest({
  objectUrl = "blob:project-file",
}: ProjectExportTestOptions = {}) {
  const OriginalBlob = globalThis.Blob;
  const blobDescriptor = Object.getOwnPropertyDescriptor(globalThis, "Blob");
  const blobParts: BlobPart[][] = [];
  const createObjectURLDescriptor = Object.getOwnPropertyDescriptor(
    URL,
    "createObjectURL",
  );
  const revokeObjectURLDescriptor = Object.getOwnPropertyDescriptor(
    URL,
    "revokeObjectURL",
  );
  const createObjectURL = vi.fn(() => objectUrl);
  const revokeObjectURL = vi.fn();
  const anchorClick = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => undefined);

  vi.stubGlobal(
    "Blob",
    vi.fn((parts?: BlobPart[], options?: BlobPropertyBag) => {
      blobParts.push(parts ?? []);
      return new OriginalBlob(parts, options);
    }),
  );
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectURL,
  });

  return {
    anchorClick,
    blobParts,
    createObjectURL,
    revokeObjectURL,
    restore: () => {
      anchorClick.mockRestore();

      if (blobDescriptor) {
        Object.defineProperty(globalThis, "Blob", blobDescriptor);
      } else {
        Reflect.deleteProperty(globalThis, "Blob");
      }

      if (createObjectURLDescriptor) {
        Object.defineProperty(
          URL,
          "createObjectURL",
          createObjectURLDescriptor,
        );
      } else {
        Reflect.deleteProperty(URL, "createObjectURL");
      }

      if (revokeObjectURLDescriptor) {
        Object.defineProperty(
          URL,
          "revokeObjectURL",
          revokeObjectURLDescriptor,
        );
      } else {
        Reflect.deleteProperty(URL, "revokeObjectURL");
      }
    },
  };
}
