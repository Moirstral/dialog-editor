import { useEffect, useRef, useState } from "react";
import { Form, Snippet } from "@heroui/react";

import MCComponentEditor from "@/components/mc-component-editor.tsx";
import { Navbar } from "@/components/navbar.tsx";

export default function TestPage() {
  const form = useRef<HTMLFormElement>(null);
  const defaultValue =
    "§c这是红色文本. \n§l这是加粗的红色文本.\n通过'\\n'换行，换行后样式不重置\n§a这是绿色文本.§r\n§n下划线§r\n§m删除线§r\n§o斜体§r\n§k乱码\n§#FF0000HEX色";
  const [value, setValue] = useState<string>();
  const [json, setJson] = useState<string>();
  const [warning, setWarning] = useState<string[]>();
  const handleFormSubmit = () => {
    setTimeout(() => {
      if (!form.current) return;
      const formData = new FormData(form.current!);

      setJson(JSON.stringify(Object.fromEntries(formData), null, 2));
    }, 100);
  };
  const handleValueChange = (v: string) => {
    setValue(v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n"));
  };

  useEffect(() => {
    handleValueChange(defaultValue);
  }, []);

  useEffect(() => {
    handleFormSubmit();
  }, [form.current]);

  useEffect(() => {
    if (!value) return;
    const msg: string[] = [];

    if (value.indexOf("\\") > -1) {
      msg.push("已转码，粘贴到某些IDE（如 JetBrains 系列）时需注意转义字符 \\");
    }

    if (value.match(/§#([0-9a-fA-F]{6})/g)) {
      msg.push("如果未装相应 Mod 或插件，HEX颜色（#FFFFFF）可能并不能正确显示");
    }

    setWarning(msg);
  }, [value]);

  return (
    <div className="relative flex flex-col h-screen">
      <Navbar isShowTabs={false} />
      <main className="w-full min-h-3/5">
        <div className="flex flex-col items-center justify-center h-full">
          <Form
            ref={form}
            className="w-3/4"
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit();
            }}
          >
            <MCComponentEditor
              isClearable
              defaultValue={defaultValue}
              label="Minecraft Component 编辑器"
              maxRows={16}
              name={"minecraft.component"}
              placeholder="建议显示代码进行编辑"
              onChange={handleFormSubmit}
              onValueChange={handleValueChange}
            />
          </Form>
          {value && (
            <Snippet
              hideSymbol
              className="w-3/4 max-h-2/5 mt-5"
              classNames={{
                pre: "whitespace-pre-wrap break-all max-h-full overflow-y-auto scrollbar-auto scrollbar-2 -mr-3 pr-2",
              }}
              tooltipProps={{ content: "复制到剪贴板" }}
            >
              {value}
            </Snippet>
          )}
          {value && (
            <Snippet
              hideSymbol
              className="w-3/4 mt-5"
              classNames={{
                content: "overflow-x-auto scrollbar-auto scrollbar-2 w-full",
              }}
              tooltipProps={{ content: "复制到剪贴板" }}
            >
              {json?.split("\n").map((item, index) => (
                <span key={index} className={"whitespace-pre"}>
                  {item}
                </span>
              ))}
            </Snippet>
          )}
          {value && (
            <div className="w-3/4 p-3 text-tiny">
              {warning?.map((item, index) => (
                <div key={index} className="text-warning">
                  ⚠️ {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
