import { create } from "zustand";
import { openDB } from "idb";

import { DialogSequence } from "@/components/dialog-sequences.tsx";
import logger from "@/components/logger.tsx";
import { TabItem } from "@/components/tabs.tsx";

const historyStore = "history-store";
const handleStore = "handle-store";
const dialogsStore = "dialogs-store";
const speakersStore = "speakers-store";
const sessionStore = "session-store";
const stores = [
  historyStore,
  handleStore,
  dialogsStore,
  speakersStore,
  sessionStore,
];
const db = await openDB("tdeditor-db", 2510151356, {
  upgrade(db) {
    stores.forEach((storeName) => {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    });
  },
});

interface DirHandleStoreState {
  histories: string[];
  loadHistories: () => void;
  addHistory: (id: string, handle: FileSystemDirectoryHandle) => Promise<void>;
  getDirHandle: (id: string) => Promise<FileSystemDirectoryHandle>;
}

export const useHistoryStore = create<DirHandleStoreState>((set, get) => ({
  histories: [],

  loadHistories: async () => {
    logger.info("loadHistories");
    const allEntries = await db.getAll(historyStore);
    const allKeys = await db.getAllKeys(historyStore);
    const histories = allKeys
      .map((key, index) => [key, allEntries[index]])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, _]) => key);

    set({ histories: histories });
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
    logger.info("loadDialogSequences");
    const allEntries = await db.getAll(dialogsStore);

    set({ dialogSequences: allEntries });
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

interface SessionStoreState {
  // 会话唯一标识符
  sessionId: string;
  // 对话文件夹 handle
  dialogsFolder: FileSystemDirectoryHandle | undefined;
  // 对话文件夹路径
  dialogsFolderPath: String | undefined;
  setDialogsFolder: (
    folder: FileSystemDirectoryHandle,
    path: String,
  ) => Promise<void>;
  // 资源文件夹 handle
  assessFolder: FileSystemDirectoryHandle | undefined;
  // 资源文件夹路径
  assessFolderPath: String | undefined;
  setAssessFolder: (
    folder: FileSystemDirectoryHandle,
    path: String,
  ) => Promise<void>;
  loadSession: () => Promise<void>;
  tabs: TabItem[];
  openTab: (tab: TabItem) => Promise<void>;
  closeTab: (key: string) => Promise<void>;
}

// 获取当前会话的唯一标识
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("sessionId");

  if (!sessionId) {
    sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("sessionId", sessionId);
  }

  return sessionId;
};

// 临时存储 @TODO 刷新就没了，得改
export const useSessionStore = create<SessionStoreState>((set, get) => ({
  sessionId: getSessionId(),
  dialogsFolder: undefined,
  dialogsFolderPath: undefined,
  assessFolder: undefined,
  assessFolderPath: undefined,
  tabs: [],

  loadSession: async () => {
    const dbSessionId = await db.get(sessionStore, "sessionId");

    if (dbSessionId !== get().sessionId) {
      await db.clear(sessionStore);
      await db.put(sessionStore, get().sessionId, "sessionId");

      return;
    }
    set({
      dialogsFolder: await db.get(sessionStore, "dialogsFolder"),
      dialogsFolderPath: await db.get(sessionStore, "dialogsFolderPath"),
      assessFolder: await db.get(sessionStore, "assessFolder"),
      assessFolderPath: await db.get(sessionStore, "assessFolderPath"),
      tabs: await db.get(sessionStore, "tabs"),
    });
  },

  setDialogsFolder: async (folder: FileSystemDirectoryHandle, path: String) => {
    set({ dialogsFolder: folder });
    set({ dialogsFolderPath: path });
    await db.put(sessionStore, folder, "dialogsFolder");
    await db.put(sessionStore, path, "dialogsFolderPath");
  },
  setAssessFolder: async (folder: FileSystemDirectoryHandle, path: String) => {
    set({ assessFolder: folder });
    set({ assessFolderPath: path });
    await db.put(sessionStore, folder, "assessFolder");
    await db.put(sessionStore, path, "assessFolderPath");
  },

  openTab: async (tab: TabItem) => {
    let tabs: TabItem[];

    const tabItems = get().tabs || [];

    if (tabItems.find((t) => t.key === tab.key)) {
      // 更新
      tabs = tabItems.map((t) => (t.key === tab.key ? tab : t));
    } else {
      // 新增
      tabs = [...tabItems, tab];
    }
    set({ tabs });
    await db.put(sessionStore, tabs, "tabs");
  },
  closeTab: async (key: string) => {
    const tabs = get().tabs.filter((t) => t.key !== key);

    set({ tabs });
    await db.put(sessionStore, tabs, "tabs");
  },
}));
