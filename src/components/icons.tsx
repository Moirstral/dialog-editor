import * as React from "react";

import { IconSvgProps } from "@/types";

const ICONS = {
  github: (props: IconSvgProps) => {
    return (
      <svg viewBox="0 0 24 24" {...props}>
        <path
          clipRule="evenodd"
          d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    );
  },

  "moon-filled": (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
        fill="currentColor"
      />
    </svg>
  ),

  "sun-filled": (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <g fill="currentColor">
        <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
        <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
      </g>
    </svg>
  ),

  "heart-filled": (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
        fill="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  ),

  "double-right": (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <g fill="currentColor">
        <path d="m7.71 17.71 5.7-5.71-5.7-5.71-1.42 1.42 4.3 4.29-4.3 4.29z" />
        <path d="m11.29 7.71 4.3 4.29-4.3 4.29 1.42 1.42 5.7-5.71-5.7-5.71z" />
      </g>
    </svg>
  ),

  "double-left": (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <g fill="currentColor">
        <path d="M12.71 16.29 8.41 12l4.3-4.29-1.42-1.42L5.59 12l5.7 5.71z" />
        <path d="M16.29 6.29 10.59 12l5.7 5.71 1.42-1.42-4.3-4.29 4.3-4.29z" />
      </g>
    </svg>
  ),

  plus: (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M3 13h8v8h2v-8h8v-2h-8V3h-2v8H3z" fill="currentColor" />
    </svg>
  ),

  "code-folder": (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M20 4h-8.59L10 2.59C9.63 2.22 9.11 2 8.59 2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m-8.79 10.29L9.8 15.7l-3.71-3.71L9.8 8.28l1.41 1.41-2.29 2.29 2.29 2.29Zm3 1.41-1.41-1.41L15.09 12 12.8 9.71l1.41-1.41 3.71 3.71-3.71 3.71Z"
        fill="currentColor"
      />
    </svg>
  ),

  "code-file": (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M14.71 2.29A1 1 0 0 0 14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-.27-.11-.52-.29-.71zm-3.75 15L9.55 18.7l-3.21-3.21 3.21-3.21 1.41 1.41-1.79 1.79 1.79 1.79Zm3.5 1.41-1.41-1.41 1.79-1.79-1.79-1.79 1.41-1.41 3.21 3.21-3.21 3.21ZM13 8.99V3.5L18.5 9H13Z"
        fill="currentColor"
      />
    </svg>
  ),

  user: (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M12 2a5 5 0 1 0 0 10 5 5 0 1 0 0-10M4 22h16c.55 0 1-.45 1-1v-1c0-3.86-3.14-7-7-7h-4c-3.86 0-7 3.14-7 7v1c0 .55.45 1 1 1"
        fill="currentColor"
      />
    </svg>
  ),

  close: (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="m7.76 14.83-2.83 2.83 1.41 1.41 2.83-2.83 2.12-2.12.71-.71.71.71 1.41 1.42 3.54 3.53 1.41-1.41-3.53-3.54-1.42-1.41-.71-.71 5.66-5.66-1.41-1.41L12 10.59 6.34 4.93 4.93 6.34 10.59 12l-.71.71z"
        fill="currentColor"
      />
    </svg>
  ),

  "dots-vertical": (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M10 10h4v4h-4zM10 16h4v4h-4zM10 4h4v4h-4z" fill="currentColor" />
    </svg>
  ),

  edit: (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M5 21h14c1.1 0 2-.9 2-2v-7h-2v7H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2"
        fill="currentColor"
      />
      <path
        d="M7 13v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l9-9a.996.996 0 0 0 0-1.41l-3-3a.996.996 0 0 0-1.41 0l-9.01 8.99A1 1 0 0 0 7 13m10-7.59L18.59 7 17.5 8.09 15.91 6.5zm-8 8 5.5-5.5 1.59 1.59-5.5 5.5H9z"
        fill="currentColor"
      />
    </svg>
  ),

  trash: (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zM6 20V8h12v12z"
        fill="currentColor"
      />
      <path d="M9 10h2v8H9zM13 10h2v8h-2z" fill="currentColor" />
    </svg>
  ),

  copy: (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M20 2H10c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 12H10V4h10z"
        fill="currentColor"
      />
      <path
        d="M14 20H4V10h2V8H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2h-2z"
        fill="currentColor"
      />
    </svg>
  ),

  refresh: (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M19.07 4.93a9.9 9.9 0 0 0-3.18-2.14 10.12 10.12 0 0 0-7.79 0c-1.19.5-2.26 1.23-3.18 2.14S3.28 6.92 2.78 8.11A9.95 9.95 0 0 0 1.99 12h2c0-1.08.21-2.13.63-3.11.4-.95.98-1.81 1.72-2.54.73-.74 1.59-1.31 2.54-1.71 1.97-.83 4.26-.83 6.23 0 .95.4 1.81.98 2.54 1.72.17.17.33.34.48.52L16 9.01h6V3l-2.45 2.45c-.15-.18-.31-.36-.48-.52M19.37 15.11c-.4.95-.98 1.81-1.72 2.54-.73.74-1.59 1.31-2.54 1.71-1.97.83-4.26.83-6.23 0-.95-.4-1.81-.98-2.54-1.72-.17-.17-.33-.34-.48-.52l2.13-2.13H2v6l2.45-2.45c.15.18.31.36.48.52.92.92 1.99 1.64 3.18 2.14 1.23.52 2.54.79 3.89.79s2.66-.26 3.89-.79c1.19-.5 2.26-1.23 3.18-2.14s1.64-1.99 2.14-3.18c.52-1.23.79-2.54.79-3.89h-2c0 1.08-.21 2.13-.63 3.11Z"
        fill="currentColor"
      />
    </svg>
  ),

  export: (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="m3,5v6h2v-6h14v14h-6v2h6c1.1,0,2-.9,2-2V5c0-1.1-.9-2-2-2H5c-1.1,0-2,.9-2,2Z"
        fill="currentColor"
      />
      <path
        d="M6.71 18.71 14 11.41 14 16 16 16 16 8 8 8 8 10 12.59 10 5.29 17.29 6.71 18.71z"
        fill="currentColor"
      />
    </svg>
  ),

  target: (props: IconSvgProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6" fill="currentColor" />
      <path
        d="M13 4.07V2h-2v2.07A8 8 0 0 0 4.07 11H2v2h2.07A8 8 0 0 0 11 19.93V22h2v-2.07A8 8 0 0 0 19.93 13H22v-2h-2.07A8 8 0 0 0 13 4.07M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6"
        fill="currentColor"
      />
    </svg>
  ),

  search: (props: IconSvgProps) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  ),

  bold: (props: IconSvgProps) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M13 4.5H7c-.83 0-1.5.67-1.5 1.5v12c0 .83.67 1.5 1.5 1.5h6.5c2.48 0 4.5-2.02 4.5-4.5 0-1.3-.56-2.46-1.44-3.28.58-.76.94-1.69.94-2.72 0-2.48-2.02-4.5-4.5-4.5m0 3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H8.5v-3zm.5 9h-5v-3h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5" />
    </svg>
  ),

  italic: (props: IconSvgProps) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M19 4H9v2h3.67L9.25 18H5v2h10v-2h-3.67l3.42-12H19z" />
    </svg>
  ),

  underline: (props: IconSvgProps) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M5 18h14v2H5zM6 4v6c0 3.31 2.69 6 6 6s6-2.69 6-6V4h-2v6c0 2.21-1.79 4-4 4s-4-1.79-4-4V4z" />
    </svg>
  ),

  strikethrough: (props: IconSvgProps) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M20 13v-2h-9c-2.64 0-3-1.44-3-3 0-.56.72-2 4-2 2.8 0 2.99 1.68 3 2.01h1L17 8c0-1.38-1.04-4-5-4-4.75 0-6 2.62-6 4 0 1.31.29 2.28.73 3H4v2zM18 15h-2c0 .12-.05 3-4 3s-3.99-1.82-4-2H6s.07 4 6 4c4.75 0 6-3.27 6-5" />
    </svg>
  ),

  obfuscated: (props: IconSvgProps) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="m19,3H5c-1.1,0-2,.9-2,2v14c0,1.1.9,2,2,2h14c1.1,0,2-.9,2-2V5c0-1.1-.9-2-2-2Zm-2,16v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2v-2h2v-2h-2v-2h2v-2h-2v-2h2v-2h-2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v14s-2,0-2,0Z" />
      <path d="M7 9H9V11H7z" />
      <path d="M9 7H11V9H9z" />
      <path d="M11 9H13V11H11z" />
      <path d="M13 7H15V9H13z" />
      <path d="M17 7H19V9H17z" />
      <path d="M15 9H17V11H15z" />
      <path d="M7 13H9V15H7z" />
      <path d="M9 11H11V13H9z" />
      <path d="M11 13H13V15H11z" />
      <path d="M13 11H15V13H13z" />
      <path d="M17 11H19V13H17z" />
      <path d="M15 13H17V15H15z" />
      <path d="M9 15H11V17H9z" />
      <path d="M13 15H15V17H13z" />
      <path d="M17 15H19V17H17z" />
    </svg>
  ),

  eraser: (props: IconSvgProps) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="m21,12.41c.78-.78.78-2.05,0-2.83l-5.59-5.59c-.78-.78-2.05-.78-2.83,0L3,13.59c-.78.78-.78,2.05,0,2.83l4.29,4.29c.19.19.44.29.71.29h14v-2h-7.59l6.59-6.59Zm-7-7l5.59,5.59-2.59,2.59-5.59-5.59,2.59-2.59Zm-5.59,13.59l-4-4,5.59-5.59,5.59,5.59-4,4h-3.17Z" />
    </svg>
  ),

  code: (props: IconSvgProps) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M9.71 16.29 5.41 12l4.3-4.29-1.42-1.42L2.59 12l5.7 5.71zM15.71 17.71l5.7-5.71-5.7-5.71-1.42 1.42 4.3 4.29-4.3 4.29z" />
    </svg>
  ),

  palette: (props: IconSvgProps) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M13.4 2.1c-3.16-.43-6.24.6-8.47 2.83S1.67 10.25 2.1 13.4c.53 3.89 3.46 7.21 7.29 8.25.86.23 1.74.35 2.62.35h.14c1.03-.02 1.97-.55 2.52-1.43.54-.88.6-1.95.15-2.88l-.2-.42c-.45-.94-.1-1.8.39-2.28s1.34-.84 2.28-.39l.41.2c.93.45 2 .39 2.88-.15a3 3 0 0 0 1.43-2.52c.01-.92-.1-1.85-.35-2.76-1.04-3.83-4.35-6.75-8.25-7.29Zm6.12 10.86c-.3.18-.65.2-.96.05l-.41-.2a3.96 3.96 0 0 0-4.56.78 3.96 3.96 0 0 0-.78 4.56l.2.42c.15.31.13.66-.05.96-.19.3-.49.47-.84.48-.74.02-1.48-.08-2.21-.28-3.06-.83-5.4-3.48-5.83-6.59-.34-2.53.48-5 2.27-6.79a7.96 7.96 0 0 1 5.66-2.34c.37 0 .75.03 1.13.08 3.11.42 5.75 2.76 6.59 5.83.2.73.29 1.47.28 2.21 0 .35-.18.66-.48.84Z" />
      <path d="M7.33 12.76a1 1 0 1 0 0 2 1 1 0 1 0 0-2M7.4 8.93a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 1 0 0-2.24M10.21 6.06a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 1 0 0-2.5M14.27 6.17a1.38 1.38 0 1 0 0 2.76 1.38 1.38 0 1 0 0-2.76" />
    </svg>
  ),
};

type IconProps = IconSvgProps & {
  icon: keyof typeof ICONS;
};

const Icon: React.FC<IconProps> = ({
  icon,
  size = 24,
  width,
  height,
  "aria-hidden": ariaHidden = true,
  focusable = "false",
  role = "presentation",
  ...props
}: IconProps) =>
  ICONS[icon]({
    width: size || width,
    height: size || height,
    "aria-hidden": ariaHidden,
    focusable,
    role,
    ...props,
  });

export default Icon;

export type icons = keyof typeof ICONS;

export const GithubIcon = (props: IconSvgProps) => (
  <Icon icon={"github"} {...props} />
);
export const MoonFilledIcon = (props: IconSvgProps) => (
  <Icon icon={"moon-filled"} {...props} />
);
export const SunFilledIcon = (props: IconSvgProps) => (
  <Icon icon={"sun-filled"} {...props} />
);
export const HeartFilledIcon = (props: IconSvgProps) => (
  <Icon icon={"heart-filled"} {...props} />
);

export const DoubleRightIcon = (props: IconSvgProps) => (
  <Icon icon={"double-right"} {...props} />
);

export const DoubleLeftIcon = (props: IconSvgProps) => (
  <Icon icon={"double-left"} {...props} />
);

export const PlusIcon = (props: IconSvgProps) => (
  <Icon icon={"plus"} {...props} />
);

export const CodeFolderIcon = (props: IconSvgProps) => (
  <Icon icon={"code-folder"} {...props} />
);

export const CodeFileIcon = (props: IconSvgProps) => (
  <Icon icon={"code-file"} {...props} />
);

export const UserIcon = (props: IconSvgProps) => (
  <Icon icon={"user"} {...props} />
);

export const XIcon = (props: IconSvgProps) => (
  <Icon icon={"close"} {...props} />
);

export const DotsVerticalIcon = (props: IconSvgProps) => (
  <Icon icon={"dots-vertical"} {...props} />
);

export const EditIcon = (props: IconSvgProps) => (
  <Icon icon={"edit"} {...props} />
);

export const TrashIcon = (props: IconSvgProps) => (
  <Icon icon={"trash"} {...props} />
);

export const CopyIcon = (props: IconSvgProps) => (
  <Icon icon={"copy"} {...props} />
);

export const RefreshIcon = (props: IconSvgProps) => (
  <Icon icon={"refresh"} {...props} />
);

export const ExportIcon = (props: IconSvgProps) => (
  <Icon icon={"export"} {...props} />
);

export const TargetIcon = (props: IconSvgProps) => (
  <Icon icon={"target"} {...props} />
);
