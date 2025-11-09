import { Button, Link, Tooltip } from "@heroui/react";
import { useEffect } from "react";

import { DropFolder } from "@/components/drop-folder.tsx";
import logger from "@/components/logger.tsx";
import { siteConfig } from "@/config/site.ts";
import { CodeFolderIcon, RefreshIcon } from "@/components/icons.tsx";
import { useWorkspaceStore, WorkspaceRecord } from "@/components/store.tsx";

export default function IndexPage() {
  const {
    histories,
    loadHistories,
    addWorkspace,
    getWorkspace,
    getDirHandle,
    setCurrentWorkspace,
    setDialogsFolder,
    setAssessFolder,
    currentWorkspace,
  } = useWorkspaceStore();

  useEffect(() => {
    loadHistories();
    logger.info("currentWorkspace", currentWorkspace);
  }, []);

  useEffect(() => {
    if (histories.length === 0) return;
    loadWorkspace().catch((_) => {});
  }, [histories]);

  const loadWorkspace = async (workspace?: string) => {
    const id = workspace || histories[0];

    logger.info("loadWorkspace", id);
    if (currentWorkspace?.folderName === id) return;

    const folder = await getDirHandle(id);

    logger.info("loadWorkspace", folder);
    if (!folder) return;
    const hasPermission = await requestFolderPermission(folder);

    if (!hasPermission) return;

    // 检查是否有工作区记录
    const workspaceRecord = await getWorkspace(id);

    if (workspaceRecord) {
      // 恢复工作区状态
      setCurrentWorkspace(workspaceRecord);

      // 设置文件夹状态
      if (workspaceRecord.dialogsFolder && workspaceRecord.dialogsFolderPath) {
        await setDialogsFolder(
          workspaceRecord.dialogsFolder,
          workspaceRecord.dialogsFolderPath,
        );
      }
      if (workspaceRecord.assessFolder && workspaceRecord.assessFolderPath) {
        await setAssessFolder(
          workspaceRecord.assessFolder,
          workspaceRecord.assessFolderPath,
        );
      }

      logger.info("Workspace restored:", workspaceRecord);
    } else {
      // 没有工作区记录，重新扫描文件夹
      await selectFolder(folder);
      logger.info("Workspace created:", folder.name);
    }
  };

  // 定义递归遍历函数
  const traverseDirectory = async (
    dirHandle: FileSystemDirectoryHandle,
    path = dirHandle.name,
  ): Promise<{
    dialogsFolderPath?: string;
    dialogsFolder?: FileSystemDirectoryHandle;
    assessFolderPath?: string;
    assessFolder?: FileSystemDirectoryHandle;
  }> => {
    let dialogsFolderPath = undefined;
    let dialogsFolder = undefined;
    let assessFolderPath = undefined;
    let assessFolder = undefined;

    for await (const [name, entry] of dirHandle.entries()) {
      if (entry.kind === "directory") {
        const fullPath = `${path}/${name}`;

        if (fullPath.endsWith("/data/dialog/dialogs")) {
          dialogsFolderPath = fullPath;
          dialogsFolder = entry;
          logger.info("Dialogs folder found:", dialogsFolderPath);
        } else if (fullPath.endsWith("/assets/dialog")) {
          assessFolderPath = fullPath;
          assessFolder = entry;
          logger.info("Assess folder found:", assessFolderPath);
        }
        // 递归处理子目录
        const {
          dialogsFolderPath: subDialogPath,
          dialogsFolder: subDialogsFolder,
          assessFolderPath: subAssessPath,
          assessFolder: subAssessFolder,
        } = await traverseDirectory(entry, fullPath);

        // 合并结果
        if (subDialogPath) {
          dialogsFolderPath = subDialogPath;
          dialogsFolder = subDialogsFolder;
        }
        if (subAssessPath) {
          assessFolderPath = subAssessPath;
          assessFolder = subAssessFolder;
        }
      }
    }

    return { dialogsFolderPath, dialogsFolder, assessFolderPath, assessFolder };
  };

  const selectFolder = async (folder: FileSystemDirectoryHandle | null) => {
    logger.info("Selected folder:", folder);
    if (!folder) return;

    // 开始遍历根目录
    try {
      const {
        dialogsFolderPath,
        dialogsFolder,
        assessFolderPath,
        assessFolder,
      } = await traverseDirectory(folder);

      logger.info("selectFolder", dialogsFolderPath, dialogsFolder);
      // 如果找到了对话文件夹，创建工作区记录
      if (dialogsFolderPath && dialogsFolder) {
        const workspaceRecord: WorkspaceRecord = {
          folderName: folder.name,
          folderHandle: folder,
          dialogsFolderPath,
          dialogsFolder,
          assessFolderPath,
          assessFolder,
          tabs: [],
          lastAccessed: Date.now(),
        };

        // 添加工作区记录
        await addWorkspace(workspaceRecord);

        // 设置为当前工作区
        setCurrentWorkspace(workspaceRecord);

        // 设置文件夹状态
        await setDialogsFolder(dialogsFolder, dialogsFolderPath);
        if (assessFolder && assessFolderPath) {
          await setAssessFolder(assessFolder, assessFolderPath);
        }
      }
    } catch (err) {
      logger.error("打开文件夹失败：", folder, err);
    }
  };

  const requestFolderPermission = async (folder: FileSystemDirectoryHandle) => {
    const permission = await folder.queryPermission?.({ mode: "readwrite" });

    if (permission === "granted") {
      // 已经有权限，可以继续操作
      return true;
    } else {
      // 没有权限，尝试请求权限
      const status = await folder.requestPermission?.({ mode: "readwrite" });

      if (status === "granted") {
        return true;
      } else {
        logger.warn("用户未授权目录权限");
      }
    }

    return false;
  };

  return (
    <DropFolder
      className={"w-full h-full drag:bg-blue-100 drag:dark:bg-blue-900/20"}
      id={"drop-folder"}
      onFolderSelect={selectFolder}
    >
      <div
        className={"w-full h-full flex flex-col items-center justify-center"}
      >
        <div
          className={"w-6xl min-h-120 max-w-full text-default-500 px-10 py-5"}
        >
          <div className={"text-2xl font-bold mb-10"}>
            欢迎使用 {siteConfig.name}
          </div>
          <div className={"md:flex md:flex-row md:justify-between w-full"}>
            <div className={"md:w-1/2"}>
              <div className={"text-lg font-medium mb-4"}>
                <div className={"mb-4"}>启动</div>
                <div>
                  <Button
                    color={"primary"}
                    size={"sm"}
                    variant={"light"}
                    onPress={() => {
                      if (window.showDirectoryPicker) {
                        window
                          .showDirectoryPicker()
                          .then((folder: FileSystemDirectoryHandle) => {
                            selectFolder(folder);
                          })
                          .catch((err: Error) => {
                            logger.warn(
                              "Failed to open directory picker:",
                              err,
                            );
                          });
                      } else {
                        logger.warn("Directory picker API not supported");
                      }
                    }}
                  >
                    <CodeFolderIcon size={18} /> 打开文件夹...
                  </Button>
                </div>
                {currentWorkspace && (
                  <div
                    className={"text-sm m-2 pl-2"}
                    style={{ lineHeight: "2" }}
                  >
                    <div className="w-full">
                      对话文件夹：
                      {currentWorkspace?.dialogsFolderPath || "未选择"}
                    </div>
                    <div className="w-full flex items-center">
                      资源文件夹：
                      {currentWorkspace?.assessFolderPath || (
                        <>
                          <span>未选择</span>
                          <Tooltip
                            content="重新扫描文件夹，请按说明创建资源文件夹"
                            placement="right"
                          >
                            <Link
                              className="cursor-pointer ml-3"
                              onPress={() =>
                                traverseDirectory(
                                  currentWorkspace?.folderHandle,
                                )
                              }
                            >
                              <RefreshIcon size={16} />
                            </Link>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className={"text-lg font-medium mb-4"}>
                <div className={"mb-4"}>最近</div>
                {histories.map((id) => (
                  <div key={id}>
                    <Button
                      color="primary"
                      size="sm"
                      variant="light"
                      onPress={async () => await loadWorkspace(id)}
                    >
                      <CodeFolderIcon size={18} /> {id}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className={"md:w-1/2 hidden md:block"}>
              <div className={"text-lg font-medium mb-4"}>如何使用</div>
              <ul className={"text-md list-decimal pl-5 space-y-2"}>
                <li>请先选择一个对话文件夹和语言文件夹</li>
                <li>如果使用 KubeJs 请直接选择 kubejs 文件夹</li>
                <li>如果使用 Global Packs 请直接选择 global_packs 文件夹</li>
                <li>
                  可直接拖动文件夹到此处，选择后将自动识别 data 和 assess
                  文件夹，如不存在则加载失败
                </li>
                <li>
                  <p>正确的文件夹结构为：</p>
                  <ul className={"text-sm list-disc pt-2 pl-5 space-y-2"}>
                    <li>data\dialog\dialogs</li>
                    <li>assess\dialog\lang</li>
                    <li>assess\dialog\textures\backgrounds</li>
                    <li>assess\dialog\textures\dialog_background</li>
                    <li>assess\dialog\textures\portraits</li>
                    <li>assess\dialog\textures\textures\gui\sprites</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DropFolder>
  );
}
