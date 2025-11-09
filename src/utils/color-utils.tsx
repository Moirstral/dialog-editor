import logger from "@/components/logger.tsx";

/**
 * 将 rgba 颜色转换为十六进制格式
 * @param r 红色通道值（0-255）
 * @param g 绿色通道值（0-255）
 * @param b 蓝色通道值（0-255）
 * @param a 透明度值（0-1），可选
 * @param ignoreAlpha
 * @returns 十六进制格式的颜色字符串，例如 "#FF000080"
 */
export const rgbaToHex = (
  r: number,
  g: number,
  b: number,
  a?: number,
  ignoreAlpha: boolean = true,
): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);

    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = "#" + toHex(r) + toHex(g) + toHex(b);

  if (a !== undefined && !(ignoreAlpha && a === 1.0)) {
    const alpha = Math.round(a * 255);

    return hex + toHex(alpha);
  }

  return hex;
};

/**
 * 将 rgba 字符串转换为十六进制格式
 * @param rgba rgba 字符串，例如 "rgba(255, 0, 0, 0.5)"
 * @returns 十六进制格式的颜色字符串，例如 "#FF000080"
 */
export const rgbaStringToHex = (rgba: string): string => {
  // 匹配 rgba() 格式
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

  if (!match) {
    throw new Error("Invalid RGBA format");
  }

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] ? parseFloat(match[4]) : undefined;

  return rgbaToHex(r, g, b, a);
};

/**
 * 解析颜色字符串
 * @param color 颜色字符串，例如 "#FF0000" 或 "rgba(255, 0, 0, 0.5)"
 * @returns 包含红色、绿色、蓝色和透明度值的数组，例如 [255, 0, 0, 1.0]
 */
export const parseColor = (color: string): [number, number, number, number] => {
  if (color.startsWith("#")) {
    // 处理十六进制颜色
    if (color.length > 6) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const a =
        color.length === 9 ? parseInt(color.slice(7, 9), 16) / 255 : 1.0;

      return [r, g, b, a];
    }
  }
  // 处理 rgba() 格式
  const match = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  );

  if (match) {
    return [
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
      parseFloat(match[4]) || 1.0,
    ];
  }

  return [0, 0, 0, 1.0];
};

/**
 * 解析 linear-gradient 字符串
 * @param gradientString linear-gradient 字符串，例如 "linear-gradient(90deg, rgba(255, 205, 26, 1) 0%, rgba(255, 46, 157, 1) 100%)"
 * @returns 包含位置和颜色的数组，例如 [{ position: 0, color: "red" }, { position: 1, color: "blue" }]
 */
export const parseLinearGradient = (
  gradientString: string,
): Array<{ position: number; color: string }> => {
  // 匹配 linear-gradient 格式
  const gradientRegex = /linear-gradient\((.*)\)/;
  const match = gradientString.toLowerCase().match(gradientRegex);

  if (!match) {
    throw new Error("Invalid linear-gradient format");
  }

  // 提取参数部分
  const params = match[1];
  // 使用正则表达式分割参数，以避免在 rgba() 等函数中错误分割
  const parts = params.split(/,(?![^()]*\))/).map((part) => part.trim());

  // 解析颜色节点
  const colorStops: Array<{ position: number; color: string }> = [];
  const colorParts: string[] = [];

  parts.forEach((part) => {
    if (
      part.includes("deg") ||
      part.includes("rad") ||
      part.startsWith("to ")
    ) {
      // 角度或方向参数，跳过
      return;
    }
    colorParts.push(part);
  });

  colorParts.forEach((part, index) => {
    const lastSpaceIndex = part.lastIndexOf(" ");
    let color: string;
    let positionStr: string | undefined;

    if (lastSpaceIndex !== -1) {
      const potentialColor = part.substring(0, lastSpaceIndex).trim();
      const potentialPosition = part.substring(lastSpaceIndex + 1).trim();

      // 简单的位置检查，例如 "50%" or "0.5"
      if (potentialPosition.match(/^[\d.]+%?$/)) {
        color = potentialColor;
        positionStr = potentialPosition;
      } else {
        // 没有有效位置，整个都是颜色
        color = part;
      }
    } else {
      color = part;
    }

    let position: number;

    if (positionStr) {
      // 有明确位置
      if (positionStr.endsWith("%")) {
        position = parseFloat(positionStr) / 100;
      } else {
        position = parseFloat(positionStr);
      }
    } else {
      // 自动计算位置
      position =
        index === 0
          ? 0
          : index === colorParts.length - 1
            ? 1
            : index / (colorParts.length - 1);
    }

    colorStops.push({ position, color });
  });

  logger.info("parseLinearGradient", gradientString, colorStops);

  return colorStops;
};

/**
 * 计算渐变
 * @param length 颜色数量
 * @param colorStops 颜色节点数组，例如 [{ position: 0, color: "#FF0000" }, { position: 1, color: "#0000FF" }]
 * @param ignoreAlpha 是否忽略透明度
 * @returns 包含计算出的颜色的数组，例如 ["#FF0000", "#0000FF"]
 */
export const calculateGradientColors = (
  length: number,
  colorStops: Array<{ position: number; color: string }>,
  ignoreAlpha: boolean = false,
): string[] => {
  // 按位置排序颜色节点
  const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);

  const colors: string[] = [];

  for (let i = 0; i < length; i++) {
    const ratio = length > 1 ? i / (length - 1) : 0;

    // 找到当前比率所在的两个颜色节点
    let leftStop = sortedStops[0];
    let rightStop = sortedStops[sortedStops.length - 1];

    for (let j = 0; j < sortedStops.length - 1; j++) {
      if (
        ratio >= sortedStops[j].position &&
        ratio <= sortedStops[j + 1].position
      ) {
        leftStop = sortedStops[j];
        rightStop = sortedStops[j + 1];
        break;
      }
    }

    // 计算在两个节点之间的插值
    let segmentRatio =
      (ratio - leftStop.position) / (rightStop.position - leftStop.position);

    segmentRatio = Math.max(0, Math.min(1, segmentRatio)); // 限制在0-1之间

    const [leftR, leftG, leftB, leftA] = parseColor(leftStop.color);
    const [rightR, rightG, rightB, rightA] = parseColor(rightStop.color);

    const r = Math.round(leftR + (rightR - leftR) * segmentRatio);
    const g = Math.round(leftG + (rightG - leftG) * segmentRatio);
    const b = Math.round(leftB + (rightB - leftB) * segmentRatio);
    const a =
      (ignoreAlpha && 1) || Math.round(leftA + (rightA - leftA) * segmentRatio);

    colors.push(rgbaToHex(r, g, b, a));
  }

  logger.info("calculateGradientColors", colors);

  return colors;
};

/**
 * 应用渐变颜色到文本
 * @param text 要应用渐变的文本
 * @param gradient 渐变字符串，例如 "linear-gradient(45deg, #FF0000 0%, #FF00FF 100%)"
 * @returns 包含应用了渐变颜色的文本，例如 "§#FF0000这§#0000FF是§#00FF00渐§#FFFF00变§#FF00FF色"
 */
export const applyGradientColor = (text: string, gradient: string): string => {
  // 空字符不应用颜色
  const length = text.replace(/\s/g, "").length;

  if (length === 0) return "";

  const colors = calculateGradientColors(
    length,
    parseLinearGradient(gradient),
    true,
  );

  logger.info("applyGradientColor", text, gradient, colors);

  let index = 0;

  // 逐字应用颜色
  return text
    .split("")
    .map((char) =>
      char.match(/\s/g) ? char : `§${colors[index++]?.toUpperCase()}${char}`,
    )
    .join("");
};
