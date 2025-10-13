import { create } from "zustand";
import { openDB } from "idb";

import { DialogSequence } from "@/components/dialog-sequences.tsx";

const historyStore = "history-store";
const handleStore = "handle-store";
const dialogsStore = "dialogs-store";
const speakersStore = "speakers-store";
const db = await openDB("tdeditor-db", 1, {
  upgrade(db) {
    db.createObjectStore(historyStore);
    db.createObjectStore(handleStore);
    db.createObjectStore(dialogsStore);
    db.createObjectStore(speakersStore);
  },
});

interface DirHandleStoreState {
  histories: string[];
  loadHistories: () => void;
  addHistory: (id: string, handle: FileSystemDirectoryHandle) => Promise<void>;
  getDirHandle: (id: string) => Promise<FileSystemDirectoryHandle>;
}

let loadTimeout: NodeJS.Timeout | null = null;

export const useHistoryStore = create<DirHandleStoreState>((set, get) => ({
  histories: [],

  loadHistories: () => {
    // 清除之前的定时器
    if (loadTimeout) {
      clearTimeout(loadTimeout);
    }

    // 设置新的定时器，延迟执行
    loadTimeout = setTimeout(async () => {
      const allEntries = await db.getAll(historyStore);
      const allKeys = await db.getAllKeys(historyStore);
      const histories = allKeys
        .map((key, index) => [key, allEntries[index]])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([key, _]) => key);

      set({ histories: histories });
    }, 100); // 100ms防抖延迟
  },

  addHistory: async (id: string, handle: FileSystemDirectoryHandle) => {
    await db.delete(historyStore, id);
    await db.delete(handleStore, id);
    await db.put(historyStore, Date.now(), id);
    await db.put(handleStore, handle, id);
    // 重新加载数据以触发更新
    get().loadHistories();
  },

  getDirHandle: (id: string) => db.get(handleStore, id),
}));

export interface DialogStoreState {
  dialogSequences: DialogSequence[];
  loadDialogSequences: () => Promise<void>;
  addDialogSequence: (dialog: DialogSequence) => Promise<void>;
  getDialogSequence: (id: string) => Promise<DialogSequence>;
  deleteDialogSequence: (id: string) => Promise<void>;
}

export const useDialogStore = create<DialogStoreState>((set, get) => ({
  dialogSequences: [],

  loadDialogSequences: async () => {
    // 清除之前的定时器
    if (loadTimeout) {
      clearTimeout(loadTimeout);
    }

    // 设置新的定时器，延迟执行
    loadTimeout = setTimeout(async () => {
      const allEntries = await db.getAll(dialogsStore);

      set({ dialogSequences: allEntries });
    }, 100); // 100ms防抖延迟
  },

  addDialogSequence: async (dialog: DialogSequence) => {
    await db.put(dialogsStore, dialog, dialog.id);
    await get().loadDialogSequences();
  },

  getDialogSequence: (id: string) => db.get(dialogsStore, id),

  deleteDialogSequence: async (id: string) => {
    await db.delete(dialogsStore, id);
    await get().loadDialogSequences();
  },
}));

interface TempStoreState {
  // 对话文件夹 handle
  dialogsFolder: FileSystemDirectoryHandle | undefined;
  // 对话文件夹路径
  dialogsFolderPath: String | undefined;
  setDialogsFolder: (folder: FileSystemDirectoryHandle, path: String) => void;
  // 资源文件夹 handle
  assessFolder: FileSystemDirectoryHandle | undefined;
  // 资源文件夹路径
  assessFolderPath: String | undefined;
  setAssessFolder: (folder: FileSystemDirectoryHandle, path: String) => void;
}

// 临时存储 @TODO 刷新就没了，得改
export const useTempStore = create<TempStoreState>((set) => ({
  dialogsFolder: undefined,
  dialogsFolderPath: undefined,
  assessFolder: undefined,
  assessFolderPath: undefined,
  setDialogsFolder: (folder: FileSystemDirectoryHandle, path: String) => {
    set({ dialogsFolder: folder });
    set({ dialogsFolderPath: path });
  },
  setAssessFolder: (folder: FileSystemDirectoryHandle, path: String) => {
    set({ assessFolder: folder });
    set({ assessFolderPath: path });
  },
}));
