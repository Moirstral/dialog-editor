// 测试颜色
// { id: "black", name: "小黑", value: { translate: "%i", color: "black" } },
// { id: "dark_blue", name: "小蓝", value: { translate: "%i", color: "dark_blue" } },
// { id: "dark_green", name: "小绿", value: { translate: "%i", color: "dark_green" } },
// { id: "dark_aqua", name: "小青", value: { translate: "%i", color: "dark_aqua" } },
// { id: "dark_red", name: "小红", value: { translate: "%i", color: "dark_red" } },
// { id: "dark_purple", name: "小紫", value: { translate: "%i", color: "dark_purple" } },
// { id: "gold", name: "小金", value: { translate: "%i", color: "gold" } },
// { id: "gray", name: "小灰", value: { translate: "%i", color: "gray" } },
// { id: "dark_gray", name: "小灰", value: { translate: "%i", color: "dark_gray" } },
// { id: "blue", name: "小蓝", value: { translate: "%i", color: "blue" } },
// { id: "green", name: "小绿", value: { translate: "%i", color: "green" } },
// { id: "aqua", name: "小青", value: { translate: "%i", color: "aqua" } },
// { id: "red", name: "小红", value: { translate: "%i", color: "red" } },
// { id: "light_purple", name: "小紫", value: { translate: "%i", color: "light_purple" } },
// { id: "yellow", name: "小黄", value: { translate: "%i", color: "yellow" } },
// { id: "white", name: "小白", value: { translate: "%i", color: "white" } },
export const Colors = {
  black: "#000000",
  dark_blue: "#0000AA",
  dark_green: "#00AA00",
  dark_aqua: "#00AAAA",
  dark_red: "#AA0000",
  dark_purple: "#AA00AA",
  gold: "#FFAA00",
  gray: "#AAAAAA",
  dark_gray: "#555555",
  blue: "#5555FF",
  green: "#55FF55",
  aqua: "#55FFFF",
  red: "#FF5555",
  light_purple: "#FF55FF",
  yellow: "#FFFF55",
  white: "#FFFFFF",
} as const; // 使用 as const 使对象属性变为只读常量，便于推导

export const Color = (color: string) => {
  const key = color as keyof typeof Colors;

  return Colors[key] || color;
};
