export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "TraceDialog 对话编辑器",
  description: "为 TraceDialog 提供的可视化对话编辑器",
  links: {
    github: "https://github.com/Moirstral/TraceDialog",
  },
  poweredBy: [
    { name: "Vite", desc: "开发构建工具", url: "https://vitejs.dev" },
    { name: "React", desc: "JavaScript 库", url: "https://reactjs.org" },
    {
      name: "HeroUI",
      desc: "美观的 React UI 库",
      url: "https://www.heroui.com",
    },
    {
      name: "AntV G6",
      desc: "简单、易用、完备的图可视化引擎",
      url: "https://g6.antv.antgroup.com",
    },
    { name: "Boxicons", desc: "开源图标库", url: "https://boxicons.com/" },
    {
      name: "TypeScript",
      desc: "JavaScript 超集",
      url: "https://www.typescriptlang.org",
    },
    { name: "TailwindCSS", desc: "CSS 框架", url: "https://tailwindcss.com" },
    { name: "Moirstral", desc: "作者", url: "https://github.com/Moirstral" },
  ],
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
};
