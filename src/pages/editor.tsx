import type { GraphOptions } from "@antv/g6";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Form,
  Input,
  ScrollShadow,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea,
} from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";

import { DialogEntryCard } from "@/components/dialog-entry.tsx";
import { DialogSequence } from "@/components/dialog-sequences.tsx";
import { Graph } from "@/components/graph.tsx";
import logger from "@/components/logger.tsx";
import { FormSwitch } from "@/components/form-switch.tsx";
import { useDialogStore, useSessionStore } from "@/components/store.tsx";

export default function EditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  let dialogsFolder = useSessionStore((state) => state.dialogsFolder);
  const dialogStore = useDialogStore();

  // 如果ID不存在，跳转到主页
  useEffect(() => {
    if (!id || !dialogsFolder) {
      navigate("/");
    }
  }, [id, dialogsFolder, navigate]);

  const [dialogSequence, setDialogSequence] = useState<DialogSequence>({
    id: id || "",
    start: "start",
    entries: [],
  });

  useEffect(() => {
    logger.info("Dialog Sequence:", id);
    id &&
      dialogStore.getDialogSequence(id).then((dialogSequence) => {
        setDialogSequence(dialogSequence);
      });
  }, [id, dialogStore]);

  const data = useMemo(
    () => ({
      nodes: dialogSequence.entries.map((entry) => ({
        ...entry,
      })),
      edges: [
        // 创建条目之间的连接边
        ...(dialogSequence.entries
          ?.map((entry, index) => {
            // 如果不是最后一个条目，连接到下一个条目
            if (index < dialogSequence.entries.length - 1) {
              return {
                source: entry.id,
                target: dialogSequence.entries[index + 1].id,
              };
            }

            // 如果是最后一个条目，可以选择不连接或连接到特定节点
            return null;
          })
          .filter(Boolean) as Array<{ source: string; target: string }>),
      ].filter((edge) => edge.source && edge.target), // 过滤掉无效边
    }),
    [dialogSequence.entries],
  );

  const options = useMemo<GraphOptions>(
    () => ({
      data,
      node: {
        type: "dialog-entry",
        style: (d) => {
          const style = {
            component: <DialogEntryCard data={d} />,
            portLinkToCenter: true,
            ports: [
              { placement: "top" as const },
              { placement: "right" as const },
              { placement: "bottom" as const },
              { placement: "left" as const },
            ],
          };

          Object.assign(style, {
            size: [400, 200],
            dx: -200,
            dy: -100,
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

  return (
    <div className={"w-full h-full overflow-hidden"}>
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
      <Graph id="dialog-entries" options={options} />
    </div>
  );
}
