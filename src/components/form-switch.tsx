import { FC } from "react";
import { cn, Switch } from "@heroui/react";
import { SwitchProps } from "@heroui/switch";

interface FormSwitchProps extends SwitchProps {
  label: string;
  description?: string | string[];
}

/**
 * 表单开关组件
 * @param label 标签
 * @param description 描述
 * @param classNames 类名
 * @param props 组件属性
 * @constructor
 */
export const FormSwitch: FC<FormSwitchProps> = ({
  label,
  description,
  classNames = {
    base: cn(
      "inline-flex flex-row-reverse w-full max-w-full bg-content2 hover:bg-content3",
      "justify-between cursor-pointer rounded-xl py-3 px-1.5",
    ),
    wrapper: "p-0 h-5 overflow-visible mr-1",
    thumb: cn(
      "w-6 h-6 border-2 shadow-lg",
      "group-data-[hover=true]:border-primary",
      //selected
      "group-data-[selected=true]:ms-6",
      // pressed
      "group-data-[pressed=true]:w-7",
      "group-data-pressed:group-data-selected:ms-4",
    ),
  },
  ...props
}) => {
  const descriptions = Array.isArray(description)
    ? description
    : description
      ? [description]
      : [];

  return (
    <Switch classNames={classNames} {...props}>
      <div className="flex flex-col gap-1">
        <p className="text-tiny">{label}</p>
        {descriptions.map((d, index) => (
          <p key={index} className="text-tiny text-default-400">
            {d}
          </p>
        ))}
      </div>
    </Switch>
  );
};
