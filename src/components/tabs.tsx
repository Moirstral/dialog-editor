import { Chip } from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";

import { XIcon } from "@/components/icons.tsx";
import { HorizontalScrollbars } from "@/components/scrollbars.tsx";
import { useSessionStore } from "@/components/store.tsx";

export interface TabItem {
  key: string;
  type: "temp" | "permanent";
  data?: any;
}

export const Tabs = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const activeTabRef = useRef<HTMLDivElement>(null);

  // 自动滚动到激活的 tab
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [id]);

  return (
    <HorizontalScrollbars
      topScrollbar
      className={
        "hidden md:flex items-baseline gap-3 top-2 left-60 w-[calc(100vw-25rem)] h-11 -mb-2 fixed z-99 whitespace-nowrap"
      }
      orientation={"horizontal"}
      size={150}
    >
      <div className="absolute bottom-0 border-b-1 border-default w-[calc(100vw-25rem)]" />
      <Chip
        ref={!id ? activeTabRef : null}
        className={`h-8 text-small rounded-b-none cursor-pointer select-none ${!id ? "border-1 border-b-background" : "border-0 hover:border-1"}`}
        radius={"sm"}
        size={"lg"}
        variant="bordered"
        onClick={() => {
          if (id) navigate("/");
        }}
      >
        首页
      </Chip>
      {useSessionStore.getState().tabs?.map((tab: TabItem) => (
        <Chip
          key={tab.key}
          ref={id === tab.key ? activeTabRef : null}
          className={`h-8 text-small gap-3 rounded-b-none ${id === tab.key ? "border-1 border-b-background" : "border-0 hover:border-1"}`}
          endContent={<XIcon size={18} />}
          radius={"sm"}
          size={"lg"}
          variant="bordered"
          onClick={() => {
            if (id !== tab.key) {
              navigate(`/${tab.key}`);
            }
          }}
          onClose={async () => {
            await useSessionStore.getState().closeTab(tab.key);
            if (id === tab.key) navigate("/");
          }}
        >
          {tab.key}
        </Chip>
      ))}
    </HorizontalScrollbars>
  );
};
