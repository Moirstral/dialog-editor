import { Button } from "@heroui/react";
import { useEffect } from "react";

import { DropFolder } from "@/components/drop-folder.tsx";
import logger from "@/components/logger.tsx";
import { siteConfig } from "@/config/site.ts";
import { CodeFolderIcon } from "@/components/icons.tsx";
import DefaultLayout from "@/layouts/default.tsx";
import { useHistoryStore, useSessionStore } from "@/components/store.tsx";

export default function IndexPage() {
  const { histories, loadHistories, addHistory, getDirHandle } =
    useHistoryStore();

  useEffect(() => {
    loadHistories();
  }, []);

  const selectFolder = (folder: FileSystemDirectoryHandle | null) => {
    if (!folder) return;

    // 定义递归遍历函数
    const traverseDirectory = async (
      dirHandle: FileSystemDirectoryHandle,
      path = "",
    ) => {
      let valid = false;

      for await (const [name, entry] of dirHandle.entries()) {
        if (entry.kind === "directory") {
          const fullPath = `${path}/${name}`;

          if (fullPath.endsWith("/data/dialog/dialogs")) {
            await useSessionStore.getState().setDialogsFolder(entry, fullPath);
            valid = true;
          } else if (fullPath.includes("/assess/dialogs")) {
            await useSessionStore.getState().setAssessFolder(entry, fullPath);
            valid = true;
          }
          // 递归处理子目录
          await traverseDirectory(entry, fullPath);
        }
      }
      if (valid) {
        await addHistory(folder.name, folder);
      }
    };

    // 开始遍历根目录
    traverseDirectory(folder, folder.name).catch((err: Error) =>
      logger.error("打开文件夹失败：", folder, err),
    );
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
    <DefaultLayout>
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
                  <div
                    className={"text-sm m-2 pl-2"}
                    style={{ lineHeight: "2" }}
                  >
                    <p>
                      对话文件夹：
                      <span>
                        <span className={"text-primary-500"}>
                          {useSessionStore(
                            (state) => state.dialogsFolderPath || "未选择",
                          )}
                        </span>
                      </span>
                    </p>
                    <p>
                      资源文件夹：
                      <span>
                        <span className={"text-primary-500"}>
                          {useSessionStore(
                            (state) => state.assessFolderPath || "未选择",
                          )}
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
                <div className={"text-lg font-medium mb-4"}>
                  <div className={"mb-4"}>最近</div>
                  {histories.map((id) => (
                    <div key={id}>
                      <Button
                        color="primary"
                        size="sm"
                        variant="light"
                        onPress={() => {
                          getDirHandle(id).then((folder) => {
                            if (!folder) return;
                            requestFolderPermission(folder).then(
                              (p) => p && selectFolder(folder ?? null),
                            );
                          });
                        }}
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
                      <li>assess\dialogs\lang</li>
                      <li>assess\dialogs\textures\backgrounds</li>
                      <li>assess\dialogs\textures\dialog_background</li>
                      <li>assess\dialogs\textures\portraits</li>
                      <li>assess\dialogs\textures\textures\gui\sprites</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DropFolder>
    </DefaultLayout>
  );
}
