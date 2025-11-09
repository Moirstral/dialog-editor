import {
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
} from "@heroui/react";
import {
  Fragment,
  HTMLAttributes,
  JSX,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  CodeFileIcon,
  CopyIcon,
  DotsVerticalIcon,
  EditIcon,
  RefreshIcon,
  TrashIcon,
} from "@/components/icons.tsx";
import { Color } from "@/utils/mc-style.tsx";
import {
  useDialogStore,
  useSessionStore,
  useWorkspaceStore,
} from "@/components/store.tsx";
import logger from "@/components/logger.tsx";

export enum DialogType {
  OVERLAY = "OVERLAY",
  SCREEN = "SCREEN",
  MENU = "MENU",
}
export enum Position {
  LEFT = "LEFT",
  CENTER = "CENTER",
  RIGHT = "RIGHT",
}
export enum AnimationType {
  NONE = "NONE", // 无动画效果
  FADE_IN = "FADE_IN", // 渐入效果
  SLIDE_IN_FROM_BOTTOM = "SLIDE_IN_FROM_BOTTOM", // 从底部滑入效果
  BOUNCE = "BOUNCE", // 弹跳效果
}
export enum RenderOption {
  // 填充：图片等比缩放，溢出部分不会显示，优先满足长边。
  FILL = "FILL",
  // 适应：整体展示图片，如果图片比例和窗口比例不一致，则按照图片比例显示。
  FIT = "FIT",
  // 拉伸：图片不会等比缩放，拉伸图片使其填满窗口区域，拉伸不够的地方，但能够保证图片整体都在包裹区内。
  STRETCH = "STRETCH",
  // 平铺：如果图片没有窗口区域大，则图片会重复地铺在窗口区域，直至填满包裹区。
  // 如果图片大于窗口区域，则无视窗口大小，该多大就多大，溢出部分不会显示。
  TILE = "TILE",
  // 居中：图片按照原大小，整体居中，处于窗口水平垂直居中。
  CENTER = "CENTER",
}
export enum Animation {
  // 无动画效果
  NONE = "NONE",
  // 渐入效果
  FADE_IN = "FADE_IN",
}

// 文本接口定义
export interface Component {
  text?: string;
  translate?: string;
  color?: string;
}
export function getText(
  component?: Component | Component[] | string,
): JSX.Element {
  if (typeof component === "string") {
    return <>{component}</>;
  }
  if (Array.isArray(component)) {
    return (
      <>
        {component.map((item, index) => (
          <span key={index}>{getText(item)}</span>
        ))}
      </>
    );
  }

  const textContent = useSessionStore
    .getState()
    .getTranslate(component?.translate || component?.text || "")
    .replace(/@i/g, "[玩家]");

  const parts = textContent.split("\n");

  return (
    <span style={{ color: Color(component?.color ?? "") }}>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {part}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * 获取组件的纯文本内容，不包含任何HTML标签或样式
 * @param component 文本组件
 * @returns 纯文本内容
 */
export function getPlainText(
  component?: Component | Component[] | string,
): string {
  if (typeof component === "string") {
    return component;
  }
  if (Array.isArray(component)) {
    return component.map((item) => getPlainText(item)).join("");
  }

  return useSessionStore
    .getState()
    .getTranslate(component?.translate || component?.text || "")
    .replace(/@i/g, "[玩家]");
}

// 立绘信息接口定义
export interface Portrait {
  // 图片路径
  path: string;
  // 立绘显示位置
  position?: Position;
  // 立绘亮度
  brightness?: number;
  // 动画类型
  animationType?: AnimationType;
  // 立绘缩放大小，范围0-5，默认为1
  size?: number;
}

// 对话框选项接口定义
export interface Option {
  // 选项显示的文本
  text: Component[] | Component | string;
  // 文本对齐 LEFT, RIGHT, CENTER, 默认为 CENTER
  text_align?: Position;
  // 背景图片 path
  background?: string;
  // 提示文本
  tooltips?: Component[] | Component | string;
  // 选择此选项后跳转到的对话ID
  target?: string;
  // 选择该选项后执行的命令
  command?: string[];
  // 控制该选项是否可见的指令
  visibility_command?: string;
  // 宽度固定值 大于0，此项优先于 widthPercentage
  width?: number;
  // 宽度占比
  widthPercentage?: number;
  // 高度 固定值 大于0
  height?: number;
  // 相对位置 LEFT, RIGHT, CENTER, 默认为 CENTER
  align?: Position;
  // 外间距
  margin?: number[];
  // 内间距
  padding?: number[];
}

// 物品接口定义
export interface Item {
  // 物品的注册表名称，例如 "minecraft:stone"
  item: string;
  // 物品数量，默认为1
  count?: number;
  // 物品的NBT数据，以字符串形式表示的JSON对象
  nbt?: string;
}

// 屏幕背景图片信息接口定义
export interface Background {
  // 图片路径
  path: string;
  // 渲染选项
  renderOption?: RenderOption;
  // 动画类型
  animation_type?: Animation;
}

// 对话条目接口定义
export interface DialogEntry {
  // 对话ID，用于跳转
  id: string;
  // 对话文本内容，可以是字符串或文本组件JSON对象
  text: Component[] | Component | string;
  // 说话者名称，可以是字符串或文本组件JSON对象
  speaker?: Component[] | Component | string;
  // 立绘信息列表
  portraits?: Portrait[];
  // 下一条对话的ID，如果为空则按顺序显示下一条
  next?: string;
  // 可选的对话选项
  options?: Option[] | Option[][];
  // 该对话条目完成后执行的命令
  command?: string[];
  // 是否允许跳过此对话条目
  allowSkip?: boolean;
  // 是否在此条对话后结束整个对话
  endDialog?: boolean;
  // 该对话条目的可见性命令
  visibility_command?: string;
  // 需要在对话中显示的物品列表
  display_items?: Item[];
  // 屏幕背景图片信息
  background_image?: Background;
  // 对话框背景图片
  dialog_image?: string;
  // 对话音频文件路径（相对于assets/dialog/sounds/目录）
  audio?: string;
}

// 对话序列接口定义
export interface DialogSequence {
  // 对话序列的唯一标识符
  id: string;
  // 是否已修改
  modified?: boolean;
  // 对话框类型 可选值：OVERLAY、SCREEN、MENU 默认为SCREEN
  type?: DialogType;
  // 对话序列的标题
  title?: string;
  // 对话序列的描述
  description?: string;
  // 对话序列中的所有对话条目
  entries: DialogEntry[];
  // 对话序列的起始对话ID，如果为空则从第一个条目开始
  start: string;
  // 是否允许通过ESC键关闭对话，默认为false
  allowClose?: boolean;
  // 开启界面后是否无敌
  invulnerable?: boolean;
  // 开启界面后是否隐身, 如果为 true 则 invulnerable 默认且必定为 true
  invisible?: boolean;
  // 是否是从数据库中加载
  fromDB?: () => boolean;
}

// 说话者接口定义
export interface Speaker {
  id: string;
  name: string;
  value: Component;
  portrait?: Portrait;
}

const ListboxWrapper = ({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}) => <div className={className}>{children}</div>;

interface ListboxWrapperProps extends HTMLAttributes<HTMLDivElement> {}

// 对话序列组件
export const DialogSequences = ({ ...props }: ListboxWrapperProps) => {
  const navigate = useNavigate();
  const workspaceState = useWorkspaceStore();
  const dialogsFolder = workspaceState.currentWorkspace?.dialogsFolder;
  const [items, setItems] = useState<
    {
      id: string;
      handle: FileSystemFileHandle;
      dialogSequence?: DialogSequence;
    }[]
  >([]);

  useEffect(() => {
    const loadEntries = async () => {
      if (!dialogsFolder) return;

      const entries: {
        id: string;
        handle: FileSystemFileHandle;
        dialogSequence?: DialogSequence;
      }[] = [];

      const entriesArray = [];

      for await (const [name, handle] of dialogsFolder.entries()) {
        const id = name.replace(/\.json$/, "");
        const dialogSequence = await useDialogStore
          .getState()
          .getDialogSequence(id);

        dialogSequence && (dialogSequence.fromDB = () => true);
        if (handle.kind === "file" && name.endsWith(".json")) {
          try {
            entriesArray.push({
              id,
              handle,
              dialogSequence,
            });
          } catch (e) {
            logger.error("Failed to parse dialog file:", name, e);
          }
        }
      }
      entriesArray.sort((a, b) => a.id.localeCompare(b.id));
      entries.push(...entriesArray);
      setItems(entries);
    };

    loadEntries().catch((e) => logger.error("Failed to load entries:", e));
  }, [dialogsFolder]);

  const loadDialogData = async (key: string, handle: FileSystemFileHandle) => {
    const file = await handle.getFile();
    const content = await file.text();

    const dialogSequence = JSON.parse(content) as DialogSequence;

    const updatedItems = items.map((item) =>
      item.id === key ? { ...item, dialogSequence } : item,
    );

    logger.info("Load dialog sequence:", dialogSequence);
    setItems(updatedItems);
    await useDialogStore.getState().addOrUpdateDialogSequence(dialogSequence);
  };

  return (
    <>
      <ScrollShadow {...props}>
        <ListboxWrapper className="w-full max-h-full text-inherit">
          <Listbox
            emptyContent={
              <div className={"text-center select-none"}>--- 空 ---</div>
            }
            items={items}
            label="Dialog Sequence List"
            onAction={async (key) => {
              let find = items.find((e) => e.id === key);

              if (!find) return;
              // 目前只有从数据库加载才会有fromDB, 如果不是就代表是从文件加载的，不需要重复加载
              if (!find.dialogSequence || find.dialogSequence.fromDB) {
                await loadDialogData(key as string, find.handle);
              }
              await workspaceState.openTab({
                type: "permanent",
                key: key as string,
              });
              navigate(`/${key}`);
            }}
          >
            {(item) => (
              <ListboxItem
                key={item.id}
                className="group"
                description={
                  item.dialogSequence?.title ||
                  item.dialogSequence?.description ||
                  " "
                }
                endContent={
                  <Popover placement="right">
                    <PopoverTrigger>
                      <DotsVerticalIcon className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <Listbox
                        aria-label="Actions"
                        onAction={async (key) => {
                          logger.info("Action:", key, item.id);
                          switch (key) {
                            case "reload":
                              await loadDialogData(item.id, item.handle);
                              break;
                            case "edit":
                              break;
                            case "copy":
                              break;
                            default:
                              break;
                          }
                        }}
                      >
                        <ListboxItem
                          key="reload"
                          startContent={<RefreshIcon size={18} />}
                        >
                          重载文件
                        </ListboxItem>
                        <ListboxItem
                          key="edit"
                          startContent={<EditIcon size={18} />}
                        >
                          编辑对话
                        </ListboxItem>
                        <ListboxItem
                          key="copy"
                          showDivider
                          startContent={<CopyIcon size={18} />}
                        >
                          复制为新文件
                        </ListboxItem>
                        {/*<ListboxItem showDivider />*/}
                        <ListboxItem
                          key="delete"
                          className={"text-danger"}
                          color={"danger"}
                          startContent={<TrashIcon size={18} />}
                        >
                          删除文件
                        </ListboxItem>
                      </Listbox>
                    </PopoverContent>
                  </Popover>
                }
                startContent={<CodeFileIcon size={40} />}
              >
                {item.handle.name}
              </ListboxItem>
            )}
          </Listbox>
        </ListboxWrapper>
      </ScrollShadow>
    </>
  );
};
