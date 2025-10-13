/// <reference types="vite/client" />
export {};

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
  interface DataTransferItem {
    getAsFileSystemHandle?: () => Promise<FileSystemHandle | null>;
  }
  interface FileSystemHandle {
    queryPermission?: (
      opt?: FileSystemHandlePermissionDescriptor,
    ) => Promise<PermissionState>;
    requestPermission?: (
      opt?: FileSystemHandlePermissionDescriptor,
    ) => Promise<PermissionState>;
  }
}
