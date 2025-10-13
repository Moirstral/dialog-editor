import { ExtensionCategory, register } from "@antv/g6";
import { ReactNode } from "@antv/g6-extension-react";
import { Card, CardBody } from "@heroui/react";

import { DialogEntry, getText } from "@/components/dialog-sequences.tsx";

register(ExtensionCategory.NODE, "dialog-entry", ReactNode);

export const DialogEntryCard = ({ data }: { data: any }) => {
  const entry: DialogEntry = data;

  const isHovered = data.states?.includes("active");
  const isSelected = data.states?.includes("selected");

  const className = `${isHovered && "bg-foreground-100"} ${isSelected && "border-1"}`;

  if (typeof entry.text === "string") {
    entry.text = { translate: entry.text };
  }

  return (
    <Card className={`w-full h-full ${className}`.trim()} id={entry.id}>
      <CardBody>
        <p>{getText(entry.speaker)}</p>
        <p>{getText(entry.text)}</p>
      </CardBody>
    </Card>
  );
};
