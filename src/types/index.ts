import { SVGProps } from "react";
import { BaseEditor, BaseRange, Element, Range } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// 定义自定义类型
export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  color?: string;
  isFormatCode?: boolean; // 用于隐藏格式代码
};

export type CustomTextKey = keyof Omit<CustomText, "text" | "isFormatCode">;

type CustomElement = {
  type: "paragraph";
  children: CustomText[];
};
export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    nodeToDecorations?: Map<Element, Range[]>;
    focus: () => void;
  };

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}
