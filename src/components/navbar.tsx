import {
  Divider,
  Link,
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  Tooltip,
} from "@heroui/react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, HeartFilledIcon } from "@/components/icons.tsx";
import { Tabs } from "@/components/tabs.tsx";

import favicon from "/favicon.svg";

export const Navbar = ({ isShowTabs = true }) => {
  return (
    <HeroUINavbar shouldHideOnScroll maxWidth="full">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <div className="font-bold text-inherit w-44 flex justify-center items-center">
            <img
              alt="favicon"
              className="w-8 h-8 inline-block mr-5"
              src={favicon}
            />
            {siteConfig.sortName}
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="basis-1/5 sm:basis-full" justify="end">
        <Link
          isExternal
          href={siteConfig.links.github[0]}
          title="GitHub"
          onContextMenu={(e) => {
            e.preventDefault();
            window.open(siteConfig.links.github.slice(-1)[0], "_blank");
          }}
        >
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <Tooltip
          content={
            <div className="px-1 py-2">
              <div className="text-default-600 text-lg text-center">
                技术支持
              </div>
              <Divider className={"my-3"} />
              {siteConfig.poweredBy.map((item) => (
                <Link
                  key={item.name}
                  isExternal
                  className="flex items-center gap-1 text-current"
                  href={item.url}
                  title={item.name}
                >
                  <p className="text-primary text-right w-24 mr-2">
                    {item.name}
                  </p>
                  <p className="text-default-500">{item.desc}</p>
                </Link>
              ))}
            </div>
          }
        >
          <HeartFilledIcon className="hidden md:flex text-red-400 cursor-pointer hover:animate-heart-beat" />
        </Tooltip>

        {isShowTabs && <Tabs />}
      </NavbarContent>
    </HeroUINavbar>
  );
};
