import { useEffect, useState, ReactNode, useRef } from "react";
import { Alert, Button } from "@heroui/react";

import { Navbar } from "@/components/navbar";
import { DoubleLeftIcon, DoubleRightIcon } from "@/components/icons.tsx";
import { siteConfig } from "@/config/site.ts";
import { DialogSequences } from "@/components/dialog-sequences.tsx";
import { InitSpeakers, Speakers } from "@/components/speakers.tsx";
import { Tabs } from "@/components/tabs.tsx";
import { useSessionStore } from "@/components/store.tsx";
import logger from "@/components/logger.tsx";

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sessionStore = useSessionStore();

  // 添加侧边栏引用
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 添加窗口大小监听
  useEffect(() => {
    // 加载会话存储
    sessionStore.loadSession().then(() => logger.info("Session loaded"));

    const handleResize = () => {
      // 当屏幕宽度小于某个阈值时自动折叠侧边栏
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // 初始化检查
    handleResize();

    // 添加事件监听器
    window.addEventListener("resize", handleResize);

    // 清理事件监听器
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 添加点击外部区域监听
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 检查是否为小屏幕
      if (window.innerWidth >= 768) return;

      // 检查侧边栏是否存在且未折叠
      if (!isCollapsed && sidebarRef.current) {
        // 检查点击目标是否在侧边栏外部
        if (!sidebarRef.current.contains(event.target as Node)) {
          setIsCollapsed(true);
        }
      }
    };

    // 添加点击事件监听器
    document.addEventListener("mousedown", handleClickOutside);

    // 清理事件监听器
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const { speakers: speakers } = InitSpeakers();

  return (
    <div className="relative flex flex-col h-screen">
      {!("showOpenFilePicker" in self) && (
        <aside className="fixed top-16 w-full z-999">
          <Alert
            className="w-19/20 md:max-w-4xl mx-auto"
            color="warning"
            description="请使用 Chrome 或 Edge 浏览器"
            title="当前浏览器不支持 File System Access API，无法使用相关功能"
            variant="faded"
          />
        </aside>
      )}
      <Navbar />
      <Tabs />
      {/*侧边栏*/}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full w-56 bg-foreground-50 transition-transform duration-300 ease-in-out shadow-medium z-99 text-foreground-600`}
        style={{
          transform: isCollapsed ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        <Button
          isIconOnly
          className={`${isCollapsed ? "pl-3" : "p-0 bg-foreground-50 text-inherit"} 2xl:hidden absolute top-4 -right-4`}
          radius="full"
          size="sm"
          onPress={toggleSidebar}
        >
          {isCollapsed ? (
            <DoubleRightIcon className="transition-transform duration-300 hover:translate-x-1" />
          ) : (
            <DoubleLeftIcon className="transition-transform duration-300 hover:-translate-x-1" />
          )}
        </Button>
        <p className="font-bold text-inherit p-5">{siteConfig.name}</p>
        <DialogSequences className="max-w-full max-h-full mx-3" />
      </aside>
      <main
        className={`container flex-grow pb-12 pl-0 ${isCollapsed ? "" : "md:pl-56"} max-w-full`}
      >
        {children}
      </main>
      {/*底栏*/}
      <aside
        className={`fixed left-0 bottom-0 w-full h-12 p-0 bg-background pl-4 ${isCollapsed ? "" : "md:pl-60"} shadow-medium z-10`}
      >
        <Speakers speakers={speakers} />
      </aside>
    </div>
  );
}
