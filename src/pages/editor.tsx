import { ExtensionCategory, GraphOptions, register } from "@antv/g6";
import { useEffect, useMemo, useState } from "react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactNode } from "@antv/g6-extension-react";

import { DialogEntryCard } from "@/components/dialog-entry.tsx";
import { DialogSequence, Option } from "@/components/dialog-sequences.tsx";
import { Graph } from "@/components/graph.tsx";
import logger from "@/components/logger.tsx";
import { FormSwitch } from "@/components/form-switch.tsx";
import {
  useDialogStore,
  useWorkspaceStore,
  useSessionStore,
} from "@/components/store.tsx";
import { DialogOptionCard } from "@/components/dialog-option.tsx";
import {
  getLanguageCode,
  getMinecraftLanguageCode,
  Language,
  MinecraftLanguageCode,
  writeDialogFile,
  writeLanguageFile,
} from "@/components/utils.tsx";
import { FlagIcon } from "@/components/flag.tsx";

// 注册 React 节点扩展
register(ExtensionCategory.NODE, "react", ReactNode);

export default function EditorPage() {
  const workspaceState = useWorkspaceStore();
  const sessionState = useSessionStore();
  const { id } = useParams<{ id: string }>();
  const dialogStore = useDialogStore();
  const defaultDialogSequence = {
    id: id || "",
    start: "start",
    entries: [
      {
        id: "start",
        text: { translate: `dialog.${id}.entry.start.text` },
      },
    ],
  };
  const navigate = useNavigate();
  const [dialogSequence, setDialogSequence] = useState<DialogSequence>(
    defaultDialogSequence,
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // 当前文件是否需要有固定文本
  const [isFixedText, setIsFixedText] = useState(false);
  // 翻译后的语言
  const [translatedLang, setTranslatedLang] = useState<MinecraftLanguageCode>(
    getMinecraftLanguageCode(),
  );

  useEffect(() => {
    if (!sessionState.currentWorkspace) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    logger.info("Dialog Sequence:", id);
    id &&
      dialogStore.getDialogSequence(id).then((dialogSequence) => {
        logger.info("Dialog Sequence:", dialogSequence);
        if (dialogSequence) {
          setDialogSequence(dialogSequence);
        } else {
          workspaceState.openTab({ type: "new", key: id }).then(() => {
            setDialogSequence(defaultDialogSequence);
          });
        }
      });
  }, [id, dialogStore]);

  useEffect(() => {
    isFixedText && onOpen();
  }, [isFixedText]);

  function hashCode(content: string) {
    let hash = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);

      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }

    return hash;
  }

  const data = useMemo(() => {
    const nodes: Array<{ id: string; combo?: string; data?: any }> = [];
    const edges: Array<{ source: string; target: string; data?: any }> = [];
    const combos: Array<{
      id: string;
      type?: string;
      style?: any;
      data?: any;
    }> = [];

    dialogSequence.entries.forEach((entry, index) => {
      const options = entry.options?.flat().map((option, i) => ({
        ...option,
        id: `${entry.id}-opt-${i}`,
      }));
      const comboId = options && `${entry.id}-combo`;

      // 如果说话者为字符串，则添加到待翻译列表
      if (entry.speaker && typeof entry.speaker === "string") {
        setIsFixedText(true);
      }
      // 如果文本为字符串，则添加到待翻译列表
      if (entry.text && typeof entry.text === "string") {
        setIsFixedText(true);
      }

      // 添加对话框条目节点
      nodes.push({
        ...entry,
        data: {
          type: "entry",
        },
        combo: comboId || undefined,
      });

      if (entry.next) {
        // 如果有下一个条目，则添加连接边
        edges.push({
          source: entry.id,
          target: entry.next,
        });
      } else if (options && options.length > 0) {
        // 如果有选项，则添加选项节点，并创建组合
        const hash = hashCode(comboId!) % 360;
        const combo = {
          id: comboId!,
          type: "rect",
          style: {
            fill: `hsl(${hash}, 70%, 85%)`,
            stroke: `hsl(${hash}, 70%, 80%)`,
            padding: 35,
            radius: 35,
          },
        };

        combos.push(combo);
        options.forEach((option) => {
          // 如果选项的文本为字符串，则添加到待翻译列表
          if (option.text && typeof option.text === "string") {
            setIsFixedText(true);
          }
          // 如果选项的提示文本为字符串，则添加到待翻译列表
          if (option.tooltips && typeof option.tooltips === "string") {
            setIsFixedText(true);
          }
          nodes.push({
            ...option,
            data: {
              type: "option",
            },
            combo: comboId,
          });
          edges.push({
            source: entry.id,
            target: option.id,
          });
          option.target &&
            edges.push({
              source: option.id,
              target: option.target,
            });
        });
      } else if (index < dialogSequence.entries.length - 1) {
        // 如果没有选项，且不是最后一个条目，则添加默认的连接边
        edges.push({
          source: entry.id,
          target: dialogSequence.entries[index + 1].id,
        });
      }
    });

    return {
      nodes,
      edges,
      combos,
    };
  }, [dialogSequence.entries]);

  const options = useMemo<GraphOptions>(
    () => ({
      data,
      node: {
        type: "react",
        style: (d) => {
          const style = {
            component: {
              entry: <DialogEntryCard data={d} />,
              option: <DialogOptionCard data={d} />,
            }[d.data?.type as string] ?? <></>,
            portLinkToCenter: true,
            ports: [
              { placement: "top" as const },
              // { placement: "right" as const },
              { placement: "bottom" as const },
              // { placement: "left" as const },
            ],
          };
          const size = {
            entry: [500, 200],
            option: [400, 50],
          }[d.data?.type as string] ?? [400, 200];

          Object.assign(style, {
            size,
            dx: -size[0] / 2,
            dy: -size[1] / 2,
          });

          return style;
        },
      },
      edge: {
        type: "polyline",
        style: {
          stroke: "#8b9baf",
          lineWidth: 2,
          radius: 20,
          endArrow: true,
          labelText: (d): string => (d.data?.text as string) ?? "",
          labelBackground: true,
          labelBackgroundFill: "#f8f8f8",
          labelBackgroundOpacity: 1,
          labelBackgroundLineWidth: 2,
          labelBackgroundStroke: "#8b9baf",
          labelPadding: [1, 10],
          labelBackgroundRadius: 4,
          router: { type: "orth" },
        },
      },
    }),
    [data],
  );

  const onSubmit = (e: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.currentTarget));
    const dialogSequenceMarged = {
      ...dialogSequence,
      ...formData,
      allowClose: formData.allowClose === "true",
      invulnerable: formData.invulnerable === "true",
      invisible: formData.invisible === "true",
    };

    setDialogSequence(dialogSequenceMarged);

    logger.info("Dialog Sequence:", dialogSequenceMarged);
  };

  function convertToLanguageFile() {
    const toBeSaved = { ...dialogSequence };
    const toBeTranslated: Record<string, string> = {};

    toBeSaved.entries.forEach((entry) => {
      if (entry.speaker && typeof entry.speaker === "string") {
        const key = `dialog.speaker.${entry.speaker}`;

        toBeTranslated[key] = entry.speaker;
        entry.speaker = {
          translate: key,
        };
      }
      if (entry.text && typeof entry.text === "string") {
        const key = `dialog.${dialogSequence.id}.entry.${entry.id}.text`;

        toBeTranslated[key] = entry.text;
        entry.text = {
          translate: key,
        };
      }
      function convert(option: Option, count: number) {
        // 如果选项的文本为字符串，则添加到待翻译列表
        if (option.text && typeof option.text === "string") {
          const key = `dialog.${dialogSequence.id}.entry.${entry.id}.options.${count}`;

          toBeTranslated[key] = option.text;
          option.text = {
            translate: key,
          };
        }
        // 如果选项的提示文本为字符串，则添加到待翻译列表
        if (option.tooltips && typeof option.tooltips === "string") {
          const key = `dialog.${dialogSequence.id}.entry.${entry.id}.options.${count}.tooltips`;

          toBeTranslated[key] = option.tooltips;
          option.tooltips = {
            translate: key,
          };
        }
      }
      let count = 0;

      entry.options?.forEach((option) => {
        if (Array.isArray(option)) {
          option.forEach((item) => {
            convert(item, count++);
          });
        } else {
          convert(option, count++);
        }
      });
    });

    writeLanguageFile(translatedLang, toBeTranslated)
      .then((lang) => {
        sessionState.setTranslate(translatedLang, lang);

        // 更新对话文件
        toBeSaved &&
          writeDialogFile(dialogSequence.id, toBeSaved)
            .then(() => {
              addToast({
                color: "success",
                title: "自动转换完成",
                description: "如果显示异常或乱码，请刷新页面。",
              });
              dialogStore
                .addOrUpdateDialogSequence(toBeSaved)
                .then(() => setDialogSequence(toBeSaved))
                .catch(() => dialogStore.deleteDialogSequence(toBeSaved.id));
            })
            .catch(() =>
              addToast({
                color: "warning",
                title: "写入失败",
                description: dialogSequence.id + ".json 文件写入失败",
              }),
            );
      })
      .catch(() =>
        addToast({
          color: "warning",
          title: "写入失败",
          description: translatedLang + ".json 文件写入失败",
        }),
      );
  }

  return (
    (sessionState.currentWorkspace && (
      <div
        key={`title-${dialogSequence.id}`}
        className={"w-full h-full overflow-hidden"}
      >
        <Tabs
          aria-label="Options"
          classNames={{
            base: "absolute z-10 md:pl-3",
            panel: "absolute z-9 w-full sm:w-auto md:pl-3",
          }}
        >
          <Tab key="property" title="属性">
            <Card
              className={"w-full sm:w-96 py-2 mt-10 max-h-[calc(100vh-11rem)]"}
            >
              <ScrollShadow className="scrollbar-1 scrollbar-auto gutter-both">
                <CardBody>
                  <Form className="w-full gap-3" onSubmit={onSubmit}>
                    <Input
                      isClearable
                      isRequired
                      defaultValue={dialogSequence.id}
                      label="ID (唯一，请勿重复)"
                      labelPlacement="inside"
                      name="id"
                      type="text"
                    />
                    <Select
                      defaultSelectedKeys={[
                        dialogSequence.type?.toString() ?? "SCREEN",
                      ]}
                      label="类型"
                      name="type"
                    >
                      <SelectItem key={"OVERLAY"}>
                        覆层（类似字幕，不影响操作）
                      </SelectItem>
                      <SelectItem key={"SCREEN"}>
                        屏幕（默认，影响操作）
                      </SelectItem>
                      <SelectItem key={"MENU"}>
                        菜单（屏幕的变种，对话框较窄）
                      </SelectItem>
                    </Select>
                    <Input
                      isClearable
                      defaultValue={dialogSequence.title}
                      label="标题"
                      labelPlacement="inside"
                      name="title"
                      type="text"
                    />
                    <Textarea
                      isClearable
                      defaultValue={dialogSequence.description}
                      label="描述"
                      labelPlacement="inside"
                      minRows={1}
                      name="description"
                      placeholder={"不会在游戏中显示，仅做标识"}
                    />
                    <FormSwitch
                      defaultSelected={dialogSequence.allowClose}
                      description="是否允许通过 Esc 键关闭对话"
                      label="是否可关闭"
                      name="allowClose"
                      value="true"
                    />
                    <FormSwitch
                      defaultSelected={dialogSequence.invulnerable}
                      description={[
                        "开启对话框后是否无敌",
                        "无敌后不受伤害，且不可被选中",
                      ]}
                      label="是否无敌"
                      name="invulnerable"
                      value="true"
                    />
                    <FormSwitch
                      defaultSelected={dialogSequence.invisible}
                      description={[
                        "开启对话框后是否隐身，隐身后玩家且不可见",
                        "隐身后必定无敌",
                      ]}
                      label="是否隐身"
                      name="invisible"
                      value="true"
                    />
                    <div className="flex gap-2 w-full mt-3">
                      <Button className={"w-4/7"} type="reset" variant="flat">
                        重置
                      </Button>
                      <Button className={"w-4/7"} color="primary" type="submit">
                        保存
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </ScrollShadow>
            </Card>
          </Tab>
          <Tab key="sequence" title="对话序列" />
        </Tabs>
        <Graph id={`dialog-entries-${dialogSequence.id}`} options={options} />
        <Modal
          isDismissable={false}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>自动转换</ModalHeader>
                <ModalBody>
                  当前文件存在固定文本，是否自动转换为语言文件？
                  <Select
                    defaultSelectedKeys={[getLanguageCode()]}
                    label="将语言文件保存为"
                    name="language"
                    renderValue={(items) => {
                      return items.map((item) => (
                        <div key={item.key} className="flex items-center gap-2">
                          <span className="text-small">{item.textValue}</span>
                          <span className="text-tiny text-default-400">
                            {getMinecraftLanguageCode(
                              item.key as keyof typeof Language,
                            )}
                            .json
                          </span>
                          <div className={"-mt-2 absolute right-12 top-4"}>
                            <FlagIcon
                              lang={item.key as keyof typeof Language}
                            />
                          </div>
                        </div>
                      ));
                    }}
                    variant="underlined"
                    onSelectionChange={(selection) => {
                      setTranslatedLang(
                        MinecraftLanguageCode[
                          selection.currentKey as keyof typeof MinecraftLanguageCode
                        ],
                      );
                    }}
                  >
                    {Object.entries(Language).map(
                      ([languageCode, language]) => (
                        <SelectItem key={languageCode} textValue={language}>
                          <div className="flex gap-2 items-center">
                            <FlagIcon
                              lang={languageCode as keyof typeof Language}
                            />
                            <div className="flex flex-col">
                              <span className="text-small">{language}</span>
                              <span className="text-tiny text-default-400">
                                {
                                  MinecraftLanguageCode[
                                    languageCode as keyof typeof MinecraftLanguageCode
                                  ]
                                }
                                .json
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ),
                    )}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="warning"
                    variant="light"
                    onPress={() => {
                      // TODO
                      onClose();
                    }}
                  >
                    不再提示
                  </Button>
                  <Button variant="light" onPress={onClose}>
                    取消
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      convertToLanguageFile();
                      onClose();
                    }}
                  >
                    保存
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    )) || <></>
  );
}
