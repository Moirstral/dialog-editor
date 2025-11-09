import * as React from "react";

import { Language } from "@/utils/utils.tsx";

const Flag: Partial<
  Record<
    keyof typeof Language,
    React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>
  >
> = {
  "zh-CN": ({ size, width, height, ...props }) => (
    <svg
      height={size || height}
      viewBox="0 0 900 600"
      width={size || width}
      {...props}
    >
      <path d="M0 0h900v600H0" fill="#EE1C25" />
      <g transform="translate(150,150) scale(3)">
        <path
          d="M0,-30 17.63355,24.27051 -28.53171,-9.27051H28.53171L-17.63355,24.27051"
          fill="#FF0"
          id="s"
        />
      </g>
      <use href="#s" transform="translate(300,60) rotate(23.036243)" />
      <use href="#s" transform="translate(360,120) rotate(45.869898)" />
      <use href="#s" transform="translate(360,210) rotate(69.945396)" />
      <use href="#s" transform="translate(300,270) rotate(20.659808)" />
    </svg>
  ),
  // "zh-HK": ({ size, width, height, ...props }) => (
  //   <svg
  //     fill="#ee1c25"
  //     height={size || height}
  //     viewBox="0 0 900 600"
  //     width={size || width}
  //     {...props}
  //   >
  //     <path d="M0 0h900v600H0" fill="#EE1C25" />
  //     <g id="a">
  //       <path
  //         d="M492.936 125.196a27.917 27.917 0 0 0-14.902 41.792 45.171 45.171 0 0 1-20.29 66.204 38.65 38.65 0 0 0-10.816 64.313 68.375 68.375 0 0 1-17.068-93.914 15.81 15.81 0 0 1-1.109-1.047 69.88 69.88 0 0 0 16.755 95.793 90.342 90.342 0 0 1 47.43-173.141"
  //         fill="#fff"
  //       />
  //       <path d="m451.98 181.1-27.565 12.021 29.366 6.476-19.951-22.5 2.915 29.93" />
  //     </g>
  //     <g id="b">
  //       <use transform="rotate(72 450 300)" xlinkHref="#a" />
  //       <use transform="rotate(216 450 300)" xlinkHref="#a" />
  //     </g>
  //     <use transform="rotate(72 450 300)" xlinkHref="#b" />
  //   </svg>
  // ),
  "zh-HK": ({ size, width, height, ...props }) => {
    const ZhCnFlag = Flag["zh-CN"];

    if (ZhCnFlag) {
      return <ZhCnFlag height={height} size={size} width={width} {...props} />;
    }

    return <DefaultFlag size={size} {...props} />;
  },
  "zh-TW": ({ size, width, height, ...props }) => {
    const ZhCnFlag = Flag["zh-CN"];

    if (ZhCnFlag) {
      return <ZhCnFlag height={height} size={size} width={width} {...props} />;
    }

    return <DefaultFlag size={size} {...props} />;
  },
  "en-US": ({ size, width, height, ...props }) => (
    <svg
      height={size || height}
      viewBox="0 0 7410 3900"
      width={size || width}
      {...props}
    >
      <path d="M0 0h7410v3900H0" fill="#b31942" />
      <path
        d="M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0"
        stroke="#FFF"
        strokeWidth="300"
      />
      <path d="M0 0h2964v2100H0" fill="#0a3161" />
      <g fill="#FFF">
        <g id="d">
          <g id="c">
            <g id="e">
              <g id="b">
                <path
                  d="m247 90 70.534 217.082-184.66-134.164h228.253L176.466 307.082z"
                  id="a"
                />
                <use xlinkHref="#a" y="420" />
                <use xlinkHref="#a" y="840" />
                <use xlinkHref="#a" y="1260" />
              </g>
              <use xlinkHref="#a" y="1680" />
            </g>
            <use x="247" xlinkHref="#b" y="210" />
          </g>
          <use x="494" xlinkHref="#c" />
        </g>
        <use x="988" xlinkHref="#d" />
        <use x="1976" xlinkHref="#c" />
        <use x="2470" xlinkHref="#e" />
      </g>
    </svg>
  ),
};
const DefaultFlag = ({
  size = 36,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg height={size} viewBox="0 0 15 10" width={size} {...props}>
    <path d="M0 0h15v10H0" fill="#CCC" />
  </svg>
);

export const FlagIcon = ({
  lang,
  size = 48,
}: {
  lang: keyof typeof Language;
  size?: number;
}) => {
  const Icon = Flag[lang] || DefaultFlag;

  return <Icon size={size} />;
};
