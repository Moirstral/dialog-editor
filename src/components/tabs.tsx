import {
  Button,
  Chip,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { XIcon } from "@/components/icons.tsx";
import { HorizontalScrollbars } from "@/components/scrollbars.tsx";
import { useWorkspaceStore } from "@/components/store.tsx";

export interface TabItem {
  key: string;
  type: "temp" | "permanent" | "new";
  edited?: boolean;
  data?: any;
}

export const Tabs = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const activeTabRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [toBeClosedTab, setToBeClosedTab] = useState<TabItem>();

  // 自动滚动到激活的 tab
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [id, activeTabRef.current]);

  const closeTab = async (tab?: TabItem) => {
    if (!tab) return;
    if (tab.edited && !isOpen) {
      setToBeClosedTab(tab);
      onOpen();
    } else {
      await useWorkspaceStore.getState().closeTab(tab.key);
      if (id === tab.key) navigate("/");
    }
  };

  return (
    <>
      <HorizontalScrollbars
        topScrollbar
        className={cn(
          "hidden md:flex items-baseline gap-3 top-2 left-60",
          "w-[calc(100vw-25rem)] h-11 -mb-2 fixed z-40 whitespace-nowrap",
        )}
        orientation={"horizontal"}
        size={150}
      >
        <div className="absolute bottom-0 border-1 border-default w-full min-w-[calc(100vw-25rem)]" />
        <Chip
          ref={!id ? activeTabRef : null}
          className={cn(
            "h-8 text-small rounded-b-none cursor-pointer select-none",
            !id
              ? "border-2 border-b-background"
              : "border-0 text-default-500 hover:bg-default hover:text-inherit",
          )}
          radius={"md"}
          size={"lg"}
          variant="bordered"
          onClick={() => {
            if (id) navigate("/");
          }}
        >
          首页
        </Chip>
        {useWorkspaceStore
          .getState()
          .currentWorkspace?.tabs?.map((tab: TabItem) => (
            <Chip
              key={tab.key}
              ref={id === tab.key ? activeTabRef : null}
              className={cn(
                "h-8 text-small gap-3 rounded-b-none cursor-pointer select-none",
                id === tab.key
                  ? "border-2 border-b-background"
                  : cn(
                      "border-0 text-default-500 hover:bg-default hover:text-inherit before:absolute",
                      "hover:before:hidden before:-left-0.5 before:h-3 before:border-1 before:border-default",
                    ),
              )}
              endContent={<XIcon size={16} />}
              radius={"md"}
              size={"lg"}
              startContent={
                tab.type === "new" && (
                  <span className="items-center font-bold text-default-500 text-md">
                    *
                  </span>
                )
              }
              variant="bordered"
              onAuxClick={async (e) => {
                // 处理中键点击
                if (e.button === 1) {
                  e.preventDefault();
                  await closeTab(tab);
                }
              }}
              onClick={() => {
                if (id !== tab.key) {
                  navigate(`/${tab.key}`);
                }
              }}
              onClose={() => closeTab(tab)}
            >
              {tab.key}
            </Chip>
          ))}
      </HorizontalScrollbars>
      <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>关闭确认</ModalHeader>
              <ModalBody>当前文件存在未保存的修改，是否关闭？</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button
                  color="primary"
                  onPress={() => closeTab(toBeClosedTab).then(() => onClose())}
                >
                  确认
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
