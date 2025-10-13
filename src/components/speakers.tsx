import { Button, Chip, Divider } from "@heroui/react";
import { useState } from "react";

import { PlusIcon, UserIcon } from "@/components/icons.tsx";
import { Speaker } from "@/components/dialog-sequences.tsx";
import { Color } from "@/components/mc-color.tsx";
import { HorizontalScrollbars } from "@/components/scrollbars.tsx";

export const InitSpeakers = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: "player", name: "玩家", value: { translate: "%i" } },
    {
      id: "moirstral",
      name: "Moirstral",
      value: { translate: "Moirstral", color: "red" },
    },
  ]);

  const addSpeaker = (speaker: Speaker) => {
    setSpeakers([...speakers, speaker]);
  };

  return { speakers, setSpeakers, addSpeaker };
};

export const Speakers = ({ speakers }: { speakers: Speaker[] }) => {
  return (
    <div className="inline-flex items-center h-full w-full">
      <UserIcon className="min-w-6" size={20} />
      <Divider className={"ml-4"} orientation="vertical" />
      <HorizontalScrollbars
        className={
          "items-center gap-3 px-3 h-full flex max-w-[calc(100%-6rem)]"
        }
        orientation={"horizontal"}
        size={60}
      >
        {speakers.map((speaker) => (
          <Chip
            key={speaker.id}
            className={"cursor-pointer hover:opacity-hover"}
            size="md"
            style={{ color: Color(speaker.value.color as string) }}
            variant="shadow"
          >
            {speaker.name || speaker.value.translate}
          </Chip>
        ))}
      </HorizontalScrollbars>
      <Button
        key="add-speaker"
        isIconOnly
        className="text-default-500"
        variant="light"
        onPress={() => {
          alert("add speaker");
        }}
      >
        <PlusIcon size={18} />
      </Button>
    </div>
  );
};
