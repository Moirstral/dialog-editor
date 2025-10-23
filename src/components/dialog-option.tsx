import { Card, CardBody } from "@heroui/react";

import { DialogEntry, getText } from "@/components/dialog-sequences.tsx";

export const DialogOptionCard = ({ data }: { data: any }) => {
  const entry: DialogEntry = data;

  const isHovered = data.states?.includes("active");
  const isSelected = data.states?.includes("selected");

  const className = `${isHovered && "bg-foreground-100"} ${isSelected && "border-1"}`;

  if (typeof entry.text === "string") {
    entry.text = { translate: entry.text };
  }

  return (
    <Card className={`w-full h-full ${className}`.trim()} id={entry.id}>
      <CardBody className="text-center overflow-hidden text-ellipsis whitespace-nowrap">
        {getText(entry.text)}
      </CardBody>
    </Card>
  );
};
