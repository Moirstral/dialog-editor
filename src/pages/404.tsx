import { Button, Link } from "@heroui/react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { Navbar } from "@/components/navbar.tsx";
import { siteConfig } from "@/config/site.ts";

export default function NotFoundPage() {
  useEffect(() => {
    document.title = `页面未找到 - ${siteConfig.name}`;
  }, []);
  const { url } = useParams<{ url: string }>();

  useEffect(() => {
    if (url) {
      window.history.replaceState({}, "", url);
    }
  }, [url]);

  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="w-full min-h-3/5">
        <div className="flex flex-col items-center justify-center h-full select-none">
          <div className="font-bold text-9xl text-foreground-200">4 0 4</div>

          <p className="text-xl text-center text-foreground-500 my-10">
            哎呀！这个页面好像迷路了... <br />
            它可能正在宇宙的某个角落探险呢！
          </p>

          <Link href="/">
            <Button
              // className="bg-linear-to-tr from-indigo-500 to-cyan-400 w-40 h-14"
              className="w-40 h-14 text-md"
              radius="full"
            >
              带我回首页
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
