import { GraphEvent, GraphOptions, NodeEvent } from "@antv/g6";
import { Graph as G6Graph } from "@antv/g6";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";

import {
  DoubleLeftIcon,
  DoubleRightIcon,
  TargetIcon,
} from "@/components/icons.tsx";
import { DialogEntry, getPlainText } from "@/components/dialog-sequences.tsx";
import logger from "@/components/logger.tsx";
import { useSessionStore } from "@/components/store.tsx";

export interface GraphProps {
  options: GraphOptions;
  id?: string;
  onRender?: (graph: G6Graph) => void;
  onDestroy?: () => void;
}

export const Graph = (props: GraphProps) => {
  const sessionState = useSessionStore.getState();
  const { options, id: graphId, onRender, onDestroy } = props;
  const graphRef = useRef<G6Graph>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const selectedNode = async (nodeId: string) => {
    const graph = graphRef.current;

    if (!graph) return;
    logger.info("selectedNode", nodeId);
    try {
      await graph.focusElement(nodeId);
      nodes.forEach((node) => {
        graph
          .setElementState(node.id, (nodeId === node.id && "selected") || "")
          .catch((error) => logger.warn(error));
      });
    } catch (error) {
      logger.warn(error);
    }
  };

  useEffect(() => {
    graphRef.current = new G6Graph({
      container: containerRef.current!,
      autoResize: true,
      layout: {
        type: "antv-dagre",
        // sortByCombo: true,
      },
      zoomRange: [0.3, 1],
      behaviors: [
        "drag-canvas",
        "zoom-canvas",
        "hover-activate",
        "click-select",
        "focus-element",
      ],
      plugins: [
        {
          key: "minimap",
          type: "minimap",
          container: minimapRef.current!,
          maskStyle: {
            background: "#0003",
          },
        },
      ],
    });
    graphRef.current.on(GraphEvent.AFTER_ELEMENT_UPDATE, () => {
      const graph = graphRef.current;

      if (!graph || graph.destroyed) return;
      const nodes = graph?.getElementDataByState("node", "selected") || [];

      if (graphId && nodes.length > 0 && nodes[0].id) {
        sessionState.setLastSelectedNode(graphId, nodes[0].id);
      }
    });
    // 节点双击事件
    graphRef.current.on(NodeEvent.DBLCLICK, () => {});

    return () => {
      const graph = graphRef.current;

      if (graph) {
        graph.off(GraphEvent.AFTER_ELEMENT_UPDATE);
        graph.off(NodeEvent.DBLCLICK);
        graph.destroy();
        onDestroy?.();
        graphRef.current = undefined;
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const graph = graphRef.current;

    if (!container || !graph || graph.destroyed) return;
    graph.setOptions(options);
    setNodes(graph.getNodeData());
    graph
      .render()
      .then(() => {
        onRender?.(graph);
        setNodes(graph.getNodeData());
      })
      .catch((error) => logger.warn(error));
  }, [options]);

  useEffect(() => {
    const graph = graphRef.current;

    if (!graph || graph.destroyed || !nodes || nodes.length === 0) return;

    const lastSelectedNode =
      sessionState.getLastSelectedNode(graphId) || nodes.slice(-1)[0].id;

    logger.info("lastSelectedNode", lastSelectedNode);
    selectedNode(lastSelectedNode);
  }, [nodes]);

  return (
    <>
      <div
        ref={containerRef}
        // 高度 = 100vh - 导航栏高度4rem - 底部工具栏高度3rem
        className={"w-full h-[calc(100vh-7rem)]"}
        id={props.id}
      />
      <aside
        className={
          "bottom-14 right-2 text-default-500 border border-default-100"
        }
        style={{
          position: "fixed",
        }}
      >
        <ButtonGroup className="w-full max-w-full h-12" radius="sm">
          <Tooltip content="滚动到第一个节点">
            <Button
              isIconOnly
              className="text-inherit"
              variant="light"
              onPress={() => selectedNode(nodes[0].id)}
            >
              <DoubleLeftIcon />
            </Button>
          </Tooltip>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly className="text-inherit" variant="light">
                <Tooltip content="滚动到指定节点">
                  <TargetIcon />
                </Tooltip>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              className={
                "max-h-dvh md:max-h-[calc(100vh/2)] max-w-sm overflow-y-auto scrollbar-2 scrollbar-auto gutter-stable"
              }
              items={nodes}
              onAction={(key) => selectedNode(key as string)}
            >
              {(item: DialogEntry) => (
                <DropdownItem
                  key={item.id}
                  description={getPlainText(item.text)}
                >
                  {item.id}{" "}
                  <span className={"text-default-500"}>
                    {getPlainText(item.speaker)}
                  </span>
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
          <Tooltip content="滚动到最后一个节点">
            <Button
              isIconOnly
              className="text-inherit"
              variant="light"
              onPress={() => selectedNode(nodes[nodes.length - 1].id)}
            >
              <DoubleRightIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>
        <div
          ref={minimapRef}
          className={"bg-foreground-100 w-60 h40"}
          id={`${props.id}-minimap`}
        />
      </aside>
    </>
  );
};
