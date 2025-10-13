import { useState, useCallback, DragEvent, FC, HTMLAttributes } from "react";

interface DropFolderProps extends HTMLAttributes<HTMLDivElement> {
  easyCreate?: boolean;
  onFolderSelect: (entry: FileSystemDirectoryHandle | null) => void;
  dragOverClassName?: string;
}

/**
 * 文件夹拖拽组件
 * @param children 子组件
 * @param easyCreate 是否创建默认组件
 * @param onFolderSelect 文件夹选择回调
 * @param className 类名
 * @param props 其他属性
 * @constructor
 */
export const DropFolder: FC<DropFolderProps> = ({
  children,
  easyCreate = false,
  onFolderSelect,
  className = easyCreate &&
    "rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 text-center drag:bg-blue-50 drag:dark:bg-blue-900/20 drag:border-blue-500",
  ...props
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    e.currentTarget.setAttribute("data-drag-over", "true");
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    e.currentTarget.removeAttribute("data-drag-over");
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      e.currentTarget.removeAttribute("data-drag-over");

      const items = e.dataTransfer.items;

      for (const item of items) {
        // 对于文件/目录条目，kind 将是“file”
        if (item.kind === "file") {
          let entry = await item.getAsFileSystemHandle?.();

          if (entry?.kind === "directory") {
            onFolderSelect(entry as FileSystemDirectoryHandle);

            // 只处理第一个目录
            return;
          }
        }
      }
    },
    [onFolderSelect],
  );

  return (
    <div
      className={`transition-colors ${className || ""}`.trim()}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      {...props}
    >
      {easyCreate && (
        <div className="flex flex-col items-center justify-center gap-4 h-full select-none">
          <div className="text-6xl">📁</div>
          <div className="text-lg font-medium">
            {isDragOver ? "释放文件夹" : "拖拽文件夹到此处"}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            支持拖拽文件夹或文件
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
