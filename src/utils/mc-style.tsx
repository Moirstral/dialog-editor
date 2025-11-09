export const FORMAT_CODE = "§";
export const ALL_COLOR = "0123456789abcdef";
export const ALL_STYLE = ALL_COLOR + "klmnor";

export enum Colors {
  black = "#000000",
  dark_blue = "#0000AA",
  dark_green = "#00AA00",
  dark_aqua = "#00AAAA",
  dark_red = "#AA0000",
  dark_purple = "#AA00AA",
  gold = "#FFAA00",
  gray = "#AAAAAA",
  dark_gray = "#555555",
  blue = "#5555FF",
  green = "#55FF55",
  aqua = "#55FFFF",
  red = "#FF5555",
  light_purple = "#FF55FF",
  yellow = "#FFFF55",
  white = "#FFFFFF",
}

export const Color = (color: string) => {
  if (!color) return color;
  if (color.startsWith(FORMAT_CODE)) {
    const code = color.slice(1);

    // 如果是#开头，代表是 HEX 颜色编码，直接返回，但这里也不做校验
    if (code.startsWith("#")) return code;
    // 如果是MC颜色编码，code是 Colors 的index的16进制
    try {
      const index = parseInt(code, 16);
      const keys = Object.keys(Colors);

      if (index >= 0 && index < keys.length) {
        const key = keys[index] as keyof typeof Colors;

        return Colors[key];
      }
    } catch {
      return color;
    }
  }
  const key = color as keyof typeof Colors;

  return Colors[key] || color;
};

export enum Styles {
  color = "c", // 默认一个，一般也用不到
  bold = "l",
  italic = "o",
  underlined = "n",
  strikethrough = "m",
  obfuscated = "k",
  reset = "r",
}

export enum StylesTitle {
  color = "颜色",
  bold = "粗体",
  italic = "斜体",
  underlined = "下划线",
  strikethrough = "删除线",
  obfuscated = "混淆",
  reset = "重置",
}
