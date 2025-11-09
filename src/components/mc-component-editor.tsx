import { forwardRef } from "@heroui/system";
import {
  ChangeEvent,
  ClipboardEvent,
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CloseFilledIcon } from "@heroui/shared-icons";
import {
  Accordion,
  AccordionItem,
  addToast,
  Button,
  ButtonGroup,
  cn,
  Divider,
  Kbd,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TextAreaProps,
  Tooltip,
  useInput,
} from "@heroui/react";
import {
  Editable,
  ReactEditor,
  RenderLeafProps,
  Slate,
  useFocused,
  useSlate,
  withReact,
} from "slate-react";
import {
  createEditor,
  Descendant,
  Editor,
  Element,
  Node,
  Operation,
  Range,
  Text,
  TextUnit,
  Transforms,
} from "slate";
import { withHistory } from "slate-history";
import clsx from "clsx";
import { PressEvent } from "@react-types/shared/src/events";
import isHotkey from "is-hotkey";
import ColorPicker, { useColorPicker } from "react-best-gradient-color-picker";
import { Selection } from "@react-types/shared/src/selection";

import { CustomEditor, CustomText, CustomTextKey } from "@/types";
import {
  ALL_COLOR,
  Color,
  Colors,
  FORMAT_CODE,
  Styles,
  StylesTitle,
} from "@/utils/mc-style.tsx";
import Icon, { icons } from "@/components/icons.tsx";
import { useLocalStore } from "@/components/store.tsx";
import logger from "@/components/logger.tsx";
import { applyGradientColor } from "@/utils/color-utils.tsx";

const withCustom = <T extends Editor>(editor: T): T => {
  // const { insertBreak } = editor;
  const deleteBackward = editor.deleteBackward;
  const deleteForward = editor.deleteForward;

  editor.insertBreak = () => {
    // editor.marks = Editor.marks(editor);
    // // 执行 Slate 默认的换行操作
    // insertBreak();
    // 直接用换行符继承样式，零宽字符是为了解决某些BUG，最终会删除的
    editor.insertText("\n\u200B");
  };
  editor.deleteBackward = (unit: TextUnit) => {
    logger.info("deleteBackward", unit);
    // 如果删除的是零宽字符，则多删除一个字符
    if (unit === "character" && editor.selection) {
      const cursorPosition = editor.selection.anchor.offset;
      const currentNode = Node.descendant(editor, editor.selection.anchor.path);

      if (
        Text.isText(currentNode) &&
        currentNode.text.charAt(cursorPosition - 1) === "\u200B"
      ) {
        // 删除零宽字符及其前的一个字符
        Transforms.delete(editor, {
          at: {
            anchor: { ...editor.selection.anchor, offset: cursorPosition },
            focus: { ...editor.selection.focus, offset: cursorPosition - 2 },
          },
        });

        return;
      }
    }
    deleteBackward(unit);
  };
  editor.deleteForward = (unit: TextUnit) => {
    logger.info("deleteForward", unit);
    // 如果删除的是零宽字符，则多删除一个字符
    if (unit === "character" && editor.selection) {
      const cursorPosition = editor.selection.anchor.offset;
      const currentNode = Node.descendant(editor, editor.selection.anchor.path);

      if (
        Text.isText(currentNode) &&
        (currentNode.text.charAt(cursorPosition) === "\u200B" ||
          currentNode.text.charAt(cursorPosition + 1) === "\u200B")
      ) {
        logger.info("deleteForward", unit, cursorPosition, currentNode);
        // 删除零宽字符及其后的一个字符
        Transforms.delete(editor, {
          at: {
            anchor: { ...editor.selection.anchor, offset: cursorPosition },
            focus: { ...editor.selection.focus, offset: cursorPosition + 2 },
          },
        });

        return;
      }
    }
    deleteForward(unit);
  };

  return editor;
};

// Leaf 组件用于根据属性渲染文本样式
const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  const localStore = useLocalStore();

  if (leaf.isFormatCode) {
    // 隐藏格式代码
    return (
      <span
        {...attributes}
        className={
          localStore.editorDisplaysSourceCode
            ? "bg-foreground-300 px-1 rounded-sm"
            : "w-0 h-0 inline-block overflow-hidden whitespace-nowrap"
        }
        data-code={true}
      >
        {children}
      </span>
    );
  }

  let el = <>{children}</>;
  const dataAttributes: { [key: string]: any } = {};

  if (leaf.bold) {
    el = <strong>{el}</strong>;
    dataAttributes["data-bold"] = true;
  }

  if (leaf.italic) {
    el = <em>{el}</em>;
    dataAttributes["data-italic"] = true;
  }

  if (leaf.underlined) {
    el = <u>{el}</u>;
    dataAttributes["data-underlined"] = true;
  }

  if (leaf.strikethrough) {
    el = <s>{el}</s>;
    dataAttributes["data-strikethrough"] = true;
  }

  if (leaf.obfuscated) {
    // 我们需要一个 CSS 类来实现这个效果
    el = <span className="mosaic-effect">{el}</span>;
    dataAttributes["data-obfuscated"] = true;
  }

  const style: CSSProperties = {};

  if (leaf.color) {
    style.color = Color(leaf.color);
    dataAttributes["data-color-" + leaf.color.slice(1).toLowerCase()] = true;
  }

  return (
    <span {...attributes} {...dataAttributes} style={style}>
      {el}
    </span>
  );
};

// 检查格式是否激活
const isMarkActive = (format: CustomTextKey | "code", color?: string) => {
  // 确保有浏览器选择
  const domSelection = window.getSelection();

  if (!domSelection || domSelection.rangeCount === 0) {
    return false;
  }

  const { anchorNode } = domSelection;

  if (!anchorNode) {
    return false;
  }

  // 如果光标在文本节点上，获取其父元素；否则，它本身就是元素
  const element =
    anchorNode.nodeType === globalThis.Node.TEXT_NODE
      ? anchorNode.parentElement
      : (anchorNode as HTMLElement);

  if (!element) {
    return false;
  }

  // 使用 closest 检查当前元素或其任何父元素是否具有我们设置的 data-* 属性
  const dataAttribute = `data-${format}${(color && "-") || ""}${color?.toLowerCase()?.replace("#", "") || ""}`;
  const closest = element.closest(`[${dataAttribute}]`);

  return closest !== null;
};

// 切换格式
const toggleMark = (
  editor: CustomEditor,
  format: CustomTextKey | "reset",
  color?: string,
) => {
  const { selection } = editor;

  if (!selection || isMarkActive("code")) return;
  let isActive = false;

  if (format !== "reset") {
    isActive = isMarkActive(format, color);
    logger.info("isActive", isActive);
  }

  const getCode = () => {
    let code: string | undefined;

    if (isActive) {
      code = Styles.reset;
    } else {
      // 排除 color 格式，避免访问不存在的 Styles[color]
      if (format === "color") {
        code = color;
      } else {
        code = Styles[format];
      }
    }

    return code && FORMAT_CODE + code;
  };
  const code = `${getCode()}\u200B`;

  if (Range.isCollapsed(selection)) {
    if (code) {
      editor.insertText(code);
    }
  } else {
    // 范围选择
    const range = Editor.range(editor, selection);
    const [start, end] = Range.edges(range);

    // 要现在结尾插入，不然结尾的会插入到开始
    !isActive &&
      Transforms.insertText(editor, FORMAT_CODE + Styles.reset, { at: end });
    if (code) {
      // 在开头插入计算过的样式
      Transforms.insertText(editor, code, { at: start });
    }
  }
};

// 应用渐变颜色
const applyGradient = (editor: CustomEditor, gradient: string) => {
  const { selection } = editor;

  if (!selection) return;

  if (Range.isCollapsed(selection)) {
    addToast({
      title: "仅支持在选中文本时应用渐变颜色",
      color: "warning",
    });

    return;
  }
  // 范围选择
  const range = Editor.range(editor, selection);

  // 获取选择的文本
  const selectedText = Editor.string(editor, range);
  // 清洗格式代码
  const cleanedText = selectedText
    .replace(/§([0-9a-fk-or]|#([0-9a-fA-F]{6}))/g, "")
    .replace(/\u200B/g, "");

  Transforms.insertText(editor, applyGradientColor(cleanedText, gradient));
};

const FormatButton = ({
  format,
  icon,
  onPress,
}: {
  format: CustomTextKey | "reset";
  icon: icons;
  onPress?: (e: PressEvent) => void;
}) => {
  const editor = useSlate();
  const isActive = format !== "reset" && isMarkActive(format);

  return (
    <Tooltip
      content={
        <div>
          <div className="text-small font-bold">
            {StylesTitle[format]} ({FORMAT_CODE}
            {Styles[format]})
          </div>
          <div className="text-small font-bold">
            <Kbd keys={["alt"]}>Alt + {Styles[format].toUpperCase()}</Kbd> 或
            <Kbd keys={["ctrl"]}>Ctrl + {format[0].toUpperCase()}</Kbd>
          </div>
        </div>
      }
    >
      <Button
        isIconOnly
        className="text-inherit"
        size={"sm"}
        variant={isActive ? "solid" : "light"}
        onPress={onPress || (() => toggleMark(editor, format))}
      >
        <Icon icon={icon} size={18} />
      </Button>
    </Tooltip>
  );
};

const ColorButton = ({
  color,
  code,
  className,
  size,
  tooltip,
  onPress,
  isDisabled,
}: {
  color: string;
  code?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | number;
  tooltip?: "default" | "none" | string;
  onPress?: (e: PressEvent) => void;
  isDisabled?: boolean;
}) => {
  const editor = useSlate();
  const isActive = isMarkActive("color", code);
  const localStore = useLocalStore();
  const button = (
    <Button
      isIconOnly
      className={cn(
        "text-inherit",
        className,
        "border border-transparent data-[hover=true]:border-default",
      )}
      isDisabled={isDisabled}
      size={(typeof size === "string" && size) || "sm"}
      style={typeof size === "number" ? { width: size, height: size } : {}}
      variant={isActive ? "solid" : "light"}
      onPress={
        onPress ||
        (() => {
          toggleMark(editor, "color", code || color);
          if (!code) {
            localStore.addColorPickerColor(color);
          }
        })
      }
    >
      <span
        className="w-full h-full flex items-center justify-center font-bold rounded-sm"
        style={{
          background: color,
        }}
      >
        {code}
      </span>
    </Button>
  );

  return (
    (tooltip === "none" && button) || (
      <Tooltip
        content={
          ((!tooltip || tooltip === "default") && (
            <div className="text-small font-bold gap-3">
              {FORMAT_CODE}
              {code}
              <Kbd className={"ml-2"} keys={["alt"]}>
                Alt + {code?.toUpperCase()}
              </Kbd>
            </div>
          )) ||
          tooltip
        }
      >
        {button}
      </Tooltip>
    )
  );
};

const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const editor = useSlate();
  const inFocus = useFocused();
  const localStore = useLocalStore();
  // 颜色框是否显示
  const [isColorPickerOpen, setColorPickerOpen] = useState(false);
  // 取色器是否折叠
  const [isColorPickerFold, setColorPickerFold] = useState<Selection>(
    new Set(),
  );
  const [color, setColor] = useState(localStore.colorPickerColors[0]);
  const { valueToHex, handleChange, isGradient } = useColorPicker(
    color,
    setColor,
  );
  const onEditorChange = editor.onChange;

  editor.onChange = (options?: { operation?: Operation }) => {
    onEditorChange(options);
    setColorPickerOpen(false);
  };

  useEffect(() => {
    if (isColorPickerOpen || !editor.selection) return;
    // 取色器关闭，编辑器获取焦点
    editor.focus();
  }, [setColorPickerOpen]);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const { selection } = editor;
    const editorEl = ReactEditor.toDOMNode(editor, editor);
    const domSelection = window.getSelection();
    const hideToolbar = (toolbar: HTMLElement) => {
      setColorPickerOpen(false);
      toolbar.style.opacity = "0";
      toolbar.style.zIndex = "-999";
    };

    if (!domSelection || domSelection.rangeCount === 0) {
      return hideToolbar(el);
    }

    if (
      (!selection ||
        !inFocus ||
        !editorEl.closest(".group")?.matches("[data-focus-within=true]")) &&
      !isColorPickerOpen
    ) {
      return hideToolbar(el);
    }

    const domRange = domSelection.getRangeAt(0);
    let rect = domRange.getBoundingClientRect();

    if (
      rect.top === 0 &&
      rect.left === 0 &&
      rect.width === 0 &&
      rect.height === 0
    ) {
      const entry = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n as Element),
      });

      if (!entry) return;

      const [block] = entry;

      if (block) {
        const domNode = ReactEditor.toDOMNode(editor, block);

        rect = domNode.getBoundingClientRect();
      } else {
        return hideToolbar(el);
      }
    }

    const editorRect = editorEl.getBoundingClientRect();
    const toolbarHeight = el.offsetHeight;
    const toolbarWidth = el.offsetWidth;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 初始位置：光标正上方
    let top = rect.top - toolbarHeight;
    let left = rect.left + rect.width / 2 - toolbarWidth / 2;

    // 相对于编辑器容器的偏移
    const editorTop = editorRect.top;
    const editorLeft = editorRect.left;

    if (top < toolbarHeight) {
      top = rect.top - toolbarHeight / 2;
    }
    if (top < 5) {
      // 如果上方空间不足，显示在光标下方
      top = rect.bottom + toolbarHeight + 10;
    }

    // 左边界检测
    if (left < 20) {
      left = 20;
    }

    // 右边界检测
    if (left + toolbarWidth > viewportWidth) {
      left = viewportWidth - toolbarWidth - 5;
    }

    // 下边界检测
    if (top + toolbarHeight > viewportHeight) {
      top = viewportHeight - toolbarHeight - 5;
    }

    // 转换为相对于编辑器容器的坐标
    el.style.top = `${top - editorTop}px`;
    el.style.left = `${left - editorLeft}px`;

    el.style.opacity = "1";
    el.style.zIndex = "99";
  });

  return (
    <ButtonGroup
      ref={ref}
      isIconOnly
      className={
        "absolute -z-999 opacity-0 -top-10 left-5 bg-foreground/30 text-background rounded-md transition-all duration-300 ease-in-out backdrop-blur-xs overflow-hidden shadow-medium"
      }
      color={"default"}
      isDisabled={isMarkActive("code")}
      radius={"none"}
      size={"sm"}
      variant={"light"}
    >
      <Popover
        classNames={{
          content: [
            "bg-foreground-200 text-background backdrop-blur-xs rounded-sm overflow-hidden",
          ],
        }}
        isOpen={isColorPickerOpen}
        placement={"top-start"}
        shouldCloseOnBlur={false}
        onOpenChange={(open) => setColorPickerOpen(open)}
      >
        <PopoverTrigger>
          <Button
            className="text-inherit"
            isDisabled={false}
            variant={isColorPickerOpen ? "solid" : "light"}
          >
            <Icon icon="palette" size={18} />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          {() => (
            <>
              <Accordion
                isCompact
                selectedKeys={isColorPickerFold}
                onSelectionChange={setColorPickerFold}
              >
                <AccordionItem
                  key={"picker"}
                  indicator={({ isOpen }) => !isOpen && "[展开]"}
                  title={"取色器"}
                >
                  <ColorPicker
                    hideGradientType
                    hideOpacity
                    hidePresets
                    config={{
                      defaultColor: localStore.colorPickerColors[0],
                      defaultGradient: localStore.colorPickerGradients[0],
                    }}
                    height={268}
                    locales={{
                      CONTROLS: {
                        SOLID: "单色",
                        GRADIENT: "渐变",
                      },
                    }}
                    style={{
                      body: { background: "transparent!" },
                      rbgcpDegreeInput: { pointerEvents: "none" },
                      rbgcpControlBtnSelected: { background: "#17171A80" },
                      rbgcpInput: { background: "#17171A50" },
                      rbgcpInputsWrap: { background: "transparent!" },
                      rbgcpStopInputWrap: { background: "transparent!" },
                      rbgcpDegreeInputWrap: { background: "transparent!" },
                      rbgcpControlBtnWrapper: { background: "#17171A50" },
                    }}
                    value={color}
                    width={268}
                    onChange={setColor}
                  />
                  <div
                    className={"grid grid-cols-8 gap-0.5 grid-flow-dense mt-3"}
                  >
                    <div className={"col-span-2 row-span-2 pt-1"}>
                      <ColorButton
                        color={color}
                        isDisabled={false}
                        size={64}
                        tooltip={"应用颜色"}
                        onPress={() => {
                          if (isGradient) {
                            applyGradient(editor, color);
                            localStore.addColorPickerGradient(color);
                          } else {
                            toggleMark(
                              editor,
                              "color",
                              valueToHex().toUpperCase(),
                            );
                            localStore.addColorPickerColor(color);
                          }
                        }}
                      />
                    </div>
                    {localStore.colorPickerColors.slice(0, 12).map((color) => (
                      <ColorButton
                        key={color}
                        color={color}
                        isDisabled={false}
                        tooltip={color}
                        onPress={() => handleChange(color)}
                      />
                    ))}
                    {isGradient &&
                      localStore.colorPickerGradients
                        .slice(0, 8)
                        .map((color) => (
                          <ColorButton
                            key={color}
                            color={color}
                            isDisabled={false}
                            tooltip={color
                              .match(/\(\d+\S+,(.*)\)/)?.[1]
                              .toUpperCase()
                              .trim()}
                            onPress={() => setColor(color)}
                          />
                        ))}
                  </div>
                  <Divider className={"mt-4"} />
                </AccordionItem>
              </Accordion>
              <div className={"text-tiny text-left w-66 text-default-500 my-2"}>
                Minecraft 固定色
              </div>
              <div className={"flex flex-wrap gap-0.5 w-67.5 mb-2 mx-1"}>
                {Object.keys(Colors).map((color, index) => (
                  <ColorButton
                    key={color}
                    className={cn(index < 10 && "text-white")}
                    code={index.toString(16)}
                    color={Colors[color as keyof typeof Colors]}
                  />
                ))}
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
      <FormatButton format="bold" icon="bold" />
      <FormatButton format="italic" icon="italic" />
      <FormatButton format="underlined" icon="underline" />
      <FormatButton format="strikethrough" icon="strikethrough" />
      <FormatButton format="obfuscated" icon="obfuscated" />
      <FormatButton format="reset" icon="eraser" />
      <Tooltip content={"显示代码"}>
        <Button
          className="text-inherit"
          isDisabled={false}
          variant={localStore.editorDisplaysSourceCode ? "solid" : "light"}
          onPress={() => {
            localStore.toggleEditorDisplaysSourceCode();
          }}
        >
          <Icon icon="code" size={18} />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

type OmittedInputProps =
  | "isClearButtonFocusVisible"
  | "isLabelPlaceholder"
  | "isTextarea";

export interface MCComponentEditorProps
  extends Omit<TextAreaProps, OmittedInputProps> {}

const MCComponentEditor = forwardRef<"div", MCComponentEditorProps>(
  ({ style, minRows = 1, maxRows = 20, ...otherProps }, ref) => {
    // §c, §l, §#ffffff 等格式代码的正则表达式
    const regex = /§([0-9a-fk-or]|#([0-9a-fA-F]{6}))/g;
    const defaultValue = otherProps.defaultValue?.replace(regex, "§$1\u200B");
    const [value, setValue] = useState(defaultValue);
    const {
      Component,
      label,
      description,
      startContent,
      endContent,
      hasHelper,
      shouldLabelBeOutside,
      shouldLabelBeInside,
      isInvalid,
      errorMessage,
      getBaseProps,
      getLabelProps,
      getInputProps,
      getInnerWrapperProps,
      getInputWrapperProps,
      getHelperWrapperProps,
      getDescriptionProps,
      getErrorMessageProps,
      isClearable,
      getClearButtonProps,
    } = useInput<HTMLInputElement>({
      ...otherProps,
      ref,
      isMultiline: true,
      isInvalid:
        otherProps.isInvalid || (otherProps.isRequired && value === ""),
      errorMessage: otherProps.errorMessage || "请填写此字段。",
    });
    const decorate = useCallback(
      (([node, path]: [Node, number[]]) => {
        const ranges: Range[] = [];

        if (!Text.isText(node)) {
          return ranges;
        }

        const { text } = node;
        let match;

        // 跟踪整个文本节点的样式
        const activeStyles: Omit<CustomText, "text"> = {};

        let lastIndex = 0;

        while ((match = regex.exec(text)) !== null) {
          // 应用样式到当前匹配项之前的文本
          if (match.index > lastIndex) {
            ranges.push({
              ...activeStyles,
              anchor: { path, offset: lastIndex },
              focus: { path, offset: match.index },
            });
          }

          // 标记格式代码本身，以便在 Leaf 组件中隐藏
          ranges.push({
            isFormatCode: true,
            anchor: { path, offset: match.index },
            focus: { path, offset: match.index + match[0].length },
          });

          const formatCode = match[1];
          const hexCode = match[2];

          if (hexCode) {
            // 十六进制颜色代码，颜色代码会重置样式
            Object.keys(activeStyles).forEach(
              (key) => delete activeStyles[key as keyof typeof activeStyles],
            );
            activeStyles.color = `#${hexCode}`;
          } else if (formatCode) {
            if ("0123456789abcdefr".includes(formatCode)) {
              // 颜色代码或重置代码，重置所有样式
              Object.keys(activeStyles).forEach(
                (key) => delete activeStyles[key as keyof typeof activeStyles],
              );
              if (formatCode !== "r") {
                // 颜色代码
                activeStyles.color = `§${formatCode}`;
              }
            } else {
              // 格式代码是可叠加的
              switch (formatCode) {
                case "l":
                  activeStyles.bold = true;
                  break;
                case "m":
                  activeStyles.strikethrough = true;
                  break;
                case "n":
                  activeStyles.underlined = true;
                  break;
                case "o":
                  activeStyles.italic = true;
                  break;
                case "k":
                  activeStyles.obfuscated = true;
                  break;
              }
            }
          }
          lastIndex = match.index + match[0].length;
        }

        // 应用样式到最后一个格式代码之后的剩余文本
        if (text.length > lastIndex) {
          ranges.push({
            ...activeStyles,
            anchor: { path, offset: lastIndex },
            focus: { path, offset: text.length },
          });
        }

        return ranges;
      }) as (entry: [Node, number[]]) => Range[],
      [],
    );
    const editor = useMemo(
      () => withCustom(withHistory(withReact(createEditor() as CustomEditor))),
      [],
    );
    const editorRef = useRef<HTMLDivElement>(null);
    const [minHeight, setMinHeight] = useState<number>();
    const [maxHeight, setMaxHeight] = useState<number>();

    useEffect(() => {
      if (editorRef.current) {
        const computedStyle = window.getComputedStyle(editorRef.current);

        try {
          const lineHeight = parseFloat(
            computedStyle.lineHeight.replace("px", ""),
          );

          setMinHeight(lineHeight * Math.max(1, minRows));
          // -1 表示不限制最大高度
          maxRows !== -1 &&
            setMaxHeight(lineHeight * Math.max(1, maxRows, minRows));
        } catch {}
      }
    }, [editorRef.current]);

    editor.focus = () => {
      ReactEditor.focus(editor);
      if (!editor.selection) {
        Transforms.select(editor, Editor.end(editor, []));
      }
    };

    const descendants: Descendant[] = useMemo(() => {
      return [
        {
          type: "paragraph",
          children: [{ text: defaultValue || "" }],
        },
      ];
    }, [defaultValue]);

    // 对格式代码进行清洗
    const cleanFormat = (text: string) => {
      // 移除§r和颜色代码前的多余格式代码
      let cleanedText = text.replace(
        /(?:§[0-9a-fk-or]|§#[0-9a-fA-F]{6})+(§[0-9a-fr]|§#[0-9a-fA-F]{6})/g,
        "$1",
      );

      // 移除重复的格式代码 (包括非连续的)
      const parts = cleanedText.split(/(§[0-9a-fk-or]|§#[0-9a-fA-F]{6})/);

      if (parts.length <= 1) {
        return cleanedText;
      }

      let activeColor = "";
      let activeReset = false;
      const activeStyles = new Set<string>();
      const newParts: string[] = [parts[0]];

      for (let i = 1; i < parts.length; i += 2) {
        const formatCode = parts[i];
        const textContent = parts[i + 1] || "";
        const formatChar = formatCode[1];

        let isRedundant = false;

        if ("0123456789abcdef#".includes(formatChar)) {
          activeReset = false;
          if (formatCode === activeColor) {
            isRedundant = true;
          } else {
            activeColor = formatCode;
            // 根据Minecraft的规则，新的颜色代码会重置所有样式代码
            activeStyles.clear();
          }
        } else if ("lmnok".includes(formatChar)) {
          activeReset = false;
          if (activeStyles.has(formatCode)) {
            isRedundant = true;
          } else {
            activeStyles.add(formatCode);
          }
        } else if ("r" === formatChar) {
          if (activeReset) {
            isRedundant = true;
          }
          activeReset = true;
          activeColor = "";
          activeStyles.clear();
        }

        if (!isRedundant) {
          newParts.push(formatCode);
        }
        newParts.push(textContent);
      }

      return newParts.join("");
    };

    const handleValueChange = useCallback(
      (value: Descendant[]) => {
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type,
        );

        if (isAstChange) {
          const content = value
            .map((n) => {
              const node = n as Element;

              if (Element.isElement(node) && node.children) {
                return node.children
                  .map((c) => {
                    const child = c as CustomText;
                    let text = child.text;

                    if (text === "") return text;
                    let prefix = "";

                    if (child.color) prefix += `${child.color}`;
                    if (child.bold) prefix += `§l`;
                    if (child.italic) prefix += `§o`;
                    if (child.underlined) prefix += `§n`;
                    if (child.strikethrough) prefix += `§m`;
                    if (child.obfuscated) prefix += `§k`;

                    return `${prefix}${text}`.replace(/\u200B/g, "");
                  })
                  .join("");
              }

              return "";
            })
            .join("\n");

          const cleanedContent = cleanFormat(content);

          setValue(cleanedContent);
          otherProps.onChange?.({
            target: { value: cleanedContent },
          } as ChangeEvent<HTMLInputElement>);
          otherProps.onValueChange?.(cleanedContent);
        }
      },
      [editor, otherProps],
    );

    const handleCopy = useCallback(
      (event: ClipboardEvent, isCut: boolean = false) => {
        if (!editor.selection) return;
        event.preventDefault();
        const selectedText = Editor.string(editor, editor.selection).replace(
          /\u200B/g,
          "",
        );

        if (selectedText && selectedText.length > 0) {
          event.clipboardData?.setData("text/plain", selectedText);
        }

        isCut && editor.insertText("");
      },
      [editor],
    );

    const labelContent = label ? (
      <label {...getLabelProps()}>{label}</label>
    ) : null;

    const {
      className,
      ref: inputRef,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      value: inputValue,
      name,
      ...inputProps
    } = getInputProps();
    const HOTKEYS: { [key: string]: () => void } = {};

    // 样式
    Object.entries(Styles)
      .filter(([_, style]) => style !== "c")
      .forEach(([title, style]) => {
        HOTKEYS[`alt+${style}`] = () =>
          toggleMark(editor, title as CustomTextKey);
        HOTKEYS[`mod+${title[0]}`] = HOTKEYS[`alt+${style}`];
      });
    // 颜色
    for (const color of ALL_COLOR) {
      HOTKEYS[`alt+${color}`] = () => toggleMark(editor, "color", color);
    }
    // § Ctrl + 7
    HOTKEYS[`mod+7`] = () => editor.insertText("§");

    const content = (
      <Slate
        editor={editor}
        initialValue={descendants}
        onChange={handleValueChange}
      >
        <HoveringToolbar />
        <Editable
          {...inputProps}
          ref={editorRef}
          disableDefaultStyles
          className={clsx(
            "font-mono overflow-y-auto scrollbar-auto scrollbar-2 gutter-stable scroll-smooth",
            className,
          )}
          decorate={decorate}
          renderLeaf={(props) => <Leaf {...props} />}
          style={{
            whiteSpace: "pre-wrap",
            ...inputProps.style,
            minHeight: minHeight ? `${minHeight}px` : undefined,
            maxHeight: maxHeight ? `${maxHeight}px` : undefined,
            ...style,
          }}
          onCopy={handleCopy}
          onCut={(event) => {
            handleCopy(event, true);
          }}
          onKeyDown={(event) => {
            // 快捷键 Alt + 样式代码
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event as any)) {
                event.preventDefault();
                HOTKEYS[hotkey]?.();
              }
            }
          }}
        />
        <input
          ref={inputRef}
          // className={"w-0 text-transparent"}
          name={name}
          type="hidden"
          value={value || ""}
        />
      </Slate>
    );

    const clearButtonContent = useMemo(() => {
      return isClearable ? (
        <button
          {...getClearButtonProps()}
          onClick={() => {
            Transforms.delete(editor, {
              at: {
                anchor: Editor.start(editor, []),
                focus: Editor.end(editor, []),
              },
            });

            // 清除存储的样式标记
            const marks = Editor.marks(editor);

            if (marks) {
              Object.keys(marks).forEach((mark) => {
                Editor.removeMark(editor, mark as CustomTextKey);
              });
            }
          }}
        >
          <CloseFilledIcon />
        </button>
      ) : null;
    }, [isClearable, getClearButtonProps]);

    const innerWrapper = useMemo(() => {
      if (startContent || endContent) {
        return (
          <div {...getInnerWrapperProps()}>
            {startContent}
            {content}
            {endContent}
          </div>
        );
      }

      return <div {...getInnerWrapperProps()}>{content}</div>;
    }, [startContent, inputProps, endContent, getInnerWrapperProps]);

    const shouldShowError = isInvalid && errorMessage;
    const hasHelperContent = shouldShowError || description;
    const inputWrapperProps = getInputWrapperProps();

    inputWrapperProps.onClick = (event) => {
      if (
        editorRef.current === event.target ||
        editorRef.current?.contains(event.target as HTMLElement)
      ) {
        return;
      }
      event.preventDefault();
      editor.focus();
    };

    return (
      <Component {...getBaseProps()}>
        {shouldLabelBeOutside ? labelContent : null}
        <div {...inputWrapperProps}>
          {shouldLabelBeInside ? labelContent : null}
          {innerWrapper}
          {clearButtonContent}
        </div>
        {hasHelper && hasHelperContent ? (
          <div {...getHelperWrapperProps()}>
            {shouldShowError ? (
              <div {...getErrorMessageProps()}>{errorMessage}</div>
            ) : (
              <div {...getDescriptionProps()}>{description}</div>
            )}
          </div>
        ) : null}
      </Component>
    );
  },
);

MCComponentEditor.displayName = "MCComponentEditor";

export default MCComponentEditor;
