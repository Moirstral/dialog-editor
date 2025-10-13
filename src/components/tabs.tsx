import { Chip, Link } from "@heroui/react";

import { XIcon } from "@/components/icons.tsx";
import { HorizontalScrollbars } from "@/components/scrollbars.tsx";

export const Tabs = () => {
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
      <Link href={"/"}>
        <Chip
          className={`h-8 text-small rounded-b-none border-1 border-b-background cursor-pointer select-none`}
          radius={"sm"}
          size={"lg"}
          variant="bordered"
        >
          首页
        </Chip>
      </Link>
      {Array.from({ length: 0 }, (_, i) => (
        <Chip
          key={i}
          className={`h-8 text-small gap-3 rounded-b-none ${i == 2 ? "border-1 border-b-background" : "border-0 hover:border-1"}`}
          endContent={<XIcon size={18} />}
          radius={"sm"}
          size={"lg"}
          variant="bordered"
          onClose={() => {}}
        >
          Tab {i}
        </Chip>
      ))}
    </HorizontalScrollbars>
  );
};
