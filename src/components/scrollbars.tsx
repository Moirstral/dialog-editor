import { FC, WheelEvent } from "react";
import { cn, ScrollShadow, ScrollShadowProps } from "@heroui/react";

interface HorizontalScrollbarsProps extends ScrollShadowProps {
  scrollbarSize?: number;
  topScrollbar?: boolean;
}

/**
 * 横向滚动条
 * @param children 子组件
 * @param onWheel 滚动事件
 * @param className 类名
 * @param topScrollbar 是否在顶部显示滚动条
 * @param props 其他属性
 * @constructor
 */
export const HorizontalScrollbars: FC<HorizontalScrollbarsProps> = ({
  children,
  onWheel,
  className,
  topScrollbar,
  ...props
}) => {
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    // 首先执行传入的 onWheel 回调（如果存在）
    onWheel?.(e);

    // 将垂直滚动转换为水平滚动
    const delta = e.deltaY || e.deltaX;
    // 获取当前滚动元素的引用
    const scrollElement = e.currentTarget;

    if (delta !== 0 && scrollElement) {
      const currentScrollLeft = scrollElement.scrollLeft || 0;

      // 执行水平滚动
      scrollElement.scrollLeft = currentScrollLeft + delta;
    }
  };

  return (
    <ScrollShadow
      className={cn(
        className,
        "overflow-y-hidden scrollbar-1 scrollbar-auto overscroll-contain pt-1",
        topScrollbar && "transform-[scaleY(-1)]",
      )}
      orientation={"horizontal"}
      onWheel={handleWheel}
      {...props}
    >
      {(topScrollbar && (
        <div className={"transform-[scaleY(-1)]"}>{children}</div>
      )) ||
        children}
    </ScrollShadow>
  );
};
