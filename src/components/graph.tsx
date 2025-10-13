import type { GraphOptions } from "@antv/g6";

import { Graph as G6Graph } from "@antv/g6";
import { useEffect, useRef } from "react";

export interface GraphProps {
  options: GraphOptions;
  id?: string;
  onRender?: (graph: G6Graph) => void;
  onDestroy?: () => void;
}

export const Graph = (props: GraphProps) => {
  const { options, onRender, onDestroy } = props;
  const graphRef = useRef<G6Graph>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    graphRef.current = new G6Graph({
      container: containerRef.current!,
      autoResize: true,
      autoFit: {
        type: "view", // 自适应类型：'view' 或 'center'
        options: {
          // 仅适用于 'view' 类型
          when: "overflow", // 何时适配：'overflow'(仅当内容溢出时) 或 'always'(总是适配)
          direction: "y", // 适配方向：'x'、'y' 或 'both'
        },
        animation: {
          // 自适应动画效果
          duration: 1000, // 动画持续时间(毫秒)
          easing: "ease-in-out", // 动画缓动函数
        },
      },
      layout: {
        type: "antv-dagre",
      },
      zoomRange: [0.3, 1],
      behaviors: [
        "drag-canvas",
        "zoom-canvas",
        "hover-activate",
        "click-select",
      ],
    });

    return () => {
      const graph = graphRef.current;

      if (graph) {
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
    graph
      .render()
      .then(() => onRender?.(graph))
      // eslint-disable-next-line no-console
      .catch((error) => console.debug(error));
  }, [options]);

  return <div ref={containerRef} className={"w-full h-full"} id={props.id} />;
};
