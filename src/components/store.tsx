import { create } from "zustand";
import { openDB } from "idb";
import { addToast } from "@heroui/react";

import { DialogSequence } from "@/components/dialog-sequences.tsx";
import logger from "@/components/logger.tsx";
import { TabItem } from "@/components/tabs.tsx";
import {
  getMinecraftLanguageCode,
  MinecraftLanguageCode,
} from "@/components/utils.tsx";

const workspaceStore = "workspace-store";
const dialogsStore = "dialogs-store";
const speakersStore = "speakers-store";
const stores = [workspaceStore, dialogsStore, speakersStore];
const abandonedStores = ["handle-store", "history-store", "session-store"];
const db = await openDB("tdeditor-db", 2510231510, {
  upgrade(db) {
    abandonedStores.forEach((storeName) => {
      if (db.objectStoreNames.contains(storeName)) {
        db.deleteObjectStore(storeName);
      }
    });
    stores.forEach((storeName) => {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    });
  },
});

// 工作区记录接口
interface WorkspaceRecord {
  folderName: string;
  folderHandle: FileSystemDirectoryHandle;
  lastAccessed: number;
  // 当前会话状态
  dialogsFolder?: FileSystemDirectoryHandle;
  dialogsFolderPath?: string;
  assessFolder?: FileSystemDirectoryHandle;
  assessFolderPath?: string;
  tabs: TabItem[];
}

// 工作区状态接口
interface WorkspaceState {
  // 历史工作区列表
  histories: string[];
  // 当前工作区
  currentWorkspace: WorkspaceRecord | null;

  // 历史工作区管理
  loadHistories: () => Promise<void>;
  loadCurrentWorkspace: () => Promise<void>;
  addWorkspace: (
    record: Omit<WorkspaceRecord, "lastAccessed">,
  ) => Promise<void>;
  getWorkspace: (folderName: string) => Promise<WorkspaceRecord | null>;
  getDirHandle: (
    folderName: string,
  ) => Promise<FileSystemDirectoryHandle | null>;

  // 当前工作区管理
  setCurrentWorkspace: (record: WorkspaceRecord) => void;
  clearCurrentWorkspace: () => void;

  // 文件夹管理
  setDialogsFolder: (
    folder: FileSystemDirectoryHandle,
    path: string,
  ) => Promise<void>;
  setAssessFolder: (
    folder: FileSystemDirectoryHandle,
    path: string,
  ) => Promise<void>;

  // 标签页管理
  openTab: (tab: TabItem) => Promise<void>;
  closeTab: (key: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  histories: [],
  currentWorkspace: null,

  // 历史工作区管理
  loadHistories: async () => {
    logger.info("loadHistories");
    const allRecords = await db.getAll(workspaceStore);
    const histories = allRecords
      .filter((record) => record.folderName)
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, 6)
      .map((record) => record.folderName);

    set({ histories });
  },

  loadCurrentWorkspace: async () => {
    let sessionState = useSessionStore.getState();

    const sessionWorkSpace = sessionState.currentWorkspace;

    if (!sessionWorkSpace) return;
    const currentWorkspace = await get().getWorkspace(sessionWorkSpace);

    if (currentWorkspace) {
      set({ currentWorkspace });
    }
    // 加载语言文件
    const assessFolder = currentWorkspace?.assessFolder;

    if (!assessFolder) return;
    try {
      const langDirHandle = await assessFolder.getDirectoryHandle("lang");
      const languageCode = getMinecraftLanguageCode();

      logger.info("languageCode:", languageCode);
      if (langDirHandle && !sessionState.translate.en_us) {
        try {
          const enFileHandle = await langDirHandle.getFileHandle("en_us.json");
          const enFile = await enFileHandle.getFile();
          const enContent = await enFile.text();

          logger.info("Loaded en_us:", enContent);
          sessionState.setTranslate(
            MinecraftLanguageCode["en-US"],
            JSON.parse(enContent),
          );
        } catch (e) {
          logger.warn(e);
        }
      }
      if (langDirHandle && !sessionState.translate[languageCode]) {
        try {
          const langFileHandle = await langDirHandle.getFileHandle(
            `${languageCode}.json`,
          );
          const langFile = await langFileHandle.getFile();
          const langContent = await langFile.text();

          logger.info("Loaded langFile:", langContent);
          sessionState.setTranslate(languageCode, JSON.parse(langContent));
        } catch (e) {
          logger.warn(e);
        }
      }
    } catch (e) {
      logger.warn("Failed to load langFile", e);
    }
  },

  addWorkspace: async (record: Omit<WorkspaceRecord, "lastAccessed">) => {
    const workspaceRecord: WorkspaceRecord = {
      ...record,
      lastAccessed: Date.now(),
    };

    // 保存工作区记录
    await db.put(workspaceStore, workspaceRecord, record.folderName);

    // 重新加载历史列表
    await get().loadHistories();

    logger.info("Workspace added:", workspaceRecord);
  },

  getWorkspace: async (folderName: string) => {
    return await db.get(workspaceStore, folderName);
  },

  getDirHandle: async (folderName: string) => {
    const workspace = await db.get(workspaceStore, folderName);

    return workspace?.folderHandle || null;
  },

  // 当前工作区管理
  setCurrentWorkspace: (record: WorkspaceRecord) => {
    set({ currentWorkspace: record });
    useSessionStore.getState().setCurrentWorkspace(record.folderName);
    get().loadCurrentWorkspace();
  },

  clearCurrentWorkspace: () => {
    set({ currentWorkspace: null });
    sessionStorage.removeItem("currentWorkspace");
  },

  // 文件夹管理
  setDialogsFolder: async (folder: FileSystemDirectoryHandle, path: string) => {
    const currentState = get();

    if (currentState.currentWorkspace) {
      currentState.currentWorkspace.dialogsFolder = folder;
      currentState.currentWorkspace.dialogsFolderPath = path;

      // 更新数据库中的记录
      await db.put(
        workspaceStore,
        currentState.currentWorkspace,
        currentState.currentWorkspace.folderName,
      );
    }
  },

  setAssessFolder: async (folder: FileSystemDirectoryHandle, path: string) => {
    const currentState = get();

    if (currentState.currentWorkspace) {
      currentState.currentWorkspace.assessFolder = folder;
      currentState.currentWorkspace.assessFolderPath = path;

      // 更新数据库中的记录
      await db.put(
        workspaceStore,
        currentState.currentWorkspace,
        currentState.currentWorkspace.folderName,
      );
    }
  },

  // 标签页管理
  openTab: async (tab: TabItem) => {
    const currentState = get();

    if (!currentState.currentWorkspace) return;

    let tabs: TabItem[];
    const tabItems = currentState.currentWorkspace.tabs;

    if (tabItems.find((t) => t.key === tab.key)) {
      // 更新
      tabs = tabItems.map((t) => (t.key === tab.key ? tab : t));
    } else {
      // 新增 同时只能有一个临时文件和新建文件
      if (tab.type === "new" && tabItems.some((t) => t.type === "new")) {
        tabs = tabItems;
        addToast({
          title: "别急，先把刚刚新建的文件保存一下",
          color: "warning",
        });
      } else {
        tabs = [...tabItems, tab];
      }
    }

    currentState.currentWorkspace.tabs = tabs;
    set({ currentWorkspace: currentState.currentWorkspace });

    // 更新数据库
    await db.put(
      workspaceStore,
      currentState.currentWorkspace,
      currentState.currentWorkspace.folderName,
    );
  },

  closeTab: async (key: string) => {
    const currentState = get();

    if (!currentState.currentWorkspace) return;

    currentState.currentWorkspace.tabs =
      currentState.currentWorkspace.tabs.filter((t) => t.key !== key);
    set({ currentWorkspace: currentState.currentWorkspace });

    // 更新数据库
    await db.put(
      workspaceStore,
      currentState.currentWorkspace,
      currentState.currentWorkspace.folderName,
    );
  },
}));

export interface DialogStoreState {
  dialogSequences: DialogSequence[];
  loadDialogSequences: () => Promise<void>;
  addOrUpdateDialogSequence: (dialog: DialogSequence) => Promise<void>;
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

  addOrUpdateDialogSequence: async (dialog: DialogSequence) => {
    await db.put(dialogsStore, dialog, dialog.id);
    await get().loadDialogSequences();
  },

  getDialogSequence: (id: string) => db.get(dialogsStore, id),

  deleteDialogSequence: async (id: string) => {
    await db.delete(dialogsStore, id);
    await get().loadDialogSequences();
  },
}));

export interface SessionStoreState {
  currentWorkspace: string | null;
  setCurrentWorkspace: (workspace: string) => void;
  lastSelectedNode: { id: string; node: string }[];
  setLastSelectedNode: (id: string, node: string) => void;
  getLastSelectedNode: (id: string | undefined) => string | undefined;
  translate: Record<MinecraftLanguageCode, Record<string, string> | undefined>;
  setTranslate: (
    lang: MinecraftLanguageCode,
    translate: Record<string, string>,
  ) => void;
  getTranslate: (key: string) => string;
}
export const useSessionStore = create<SessionStoreState>((set, get) => ({
  currentWorkspace: sessionStorage.getItem("currentWorkspace"),
  setCurrentWorkspace: (workspace: string) => {
    sessionStorage.setItem("currentWorkspace", workspace);
    set({ currentWorkspace: workspace });
  },
  lastSelectedNode: (() => {
    try {
      const stored = sessionStorage.getItem("lastSelectedNode");

      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      logger.warn("Failed to parse lastSelectedNode from sessionStorage", e);

      return [];
    }
  })(),
  setLastSelectedNode: (id: string, node: string) => {
    const currentState = get();
    const updated = [
      ...currentState.lastSelectedNode.filter((item) => item.id !== id),
      { id, node },
    ];

    sessionStorage.setItem("lastSelectedNode", JSON.stringify(updated));
    set({ lastSelectedNode: updated });
  },
  getLastSelectedNode: (id: string | undefined) => {
    if (!id) return;
    const currentState = get();
    const item = currentState.lastSelectedNode.find((item) => item.id === id);

    return item?.node;
  },
  translate: ((): Record<
    MinecraftLanguageCode,
    Record<string, string> | undefined
  > => {
    const allLanguages = Object.fromEntries(
      Object.values(MinecraftLanguageCode).map((value) => [value, undefined]),
    );

    try {
      const storedEn = sessionStorage.getItem("translate_en_us");
      const storedCurrent = sessionStorage.getItem(
        "translate_" + getMinecraftLanguageCode(),
      );

      logger.info("storedCurrent:", storedCurrent);
      if (storedEn) allLanguages.en_us = JSON.parse(storedEn) || undefined;
      if (storedCurrent)
        allLanguages[storedCurrent] = JSON.parse(storedCurrent) || undefined;
    } catch (e) {
      logger.warn("Failed to parse langFile from sessionStorage", e);
    }

    return allLanguages as Record<
      MinecraftLanguageCode,
      Record<string, string> | undefined
    >;
  })(),
  setTranslate: (lang, translate) => {
    sessionStorage.setItem("translate_" + lang, JSON.stringify(translate));
    set({ translate: { ...get().translate, [lang]: translate } });
  },
  getTranslate: (key: string) => {
    const currentState = get();

    return (
      currentState.translate[getMinecraftLanguageCode()]?.[key] ||
      currentState.translate.en_us?.[key] ||
      key
    );
  },
}));
