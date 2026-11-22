import { useState, type Ref } from "react";
import { Button, Popover, Input, Space, type ButtonProps } from "antd";
import { ContainerOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";
import type { EmbedProvider } from "@/components/RichText/core/nodes/Embed/security";

export interface EmbedProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
  /** Allowed embed provider. Default: "youtube". */
  provider?: EmbedProvider;
}

/** Editor control (Phase 6) — inserts an embed (YouTube, Vimeo, custom iframe). */
export const Embed = ({ provider = "youtube", ...props }: EmbedProps) => {
  const editor = useRichTextEditor();
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState("");

  if (!editor) return null;

  const apply = () => {
    if (src) editor.chain().focus().setEmbed({ src, provider }).run();
    setOpen(false);
    setSrc("");
  };

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      content={
        <Space.Compact>
          <Input
            // placeholder="https://youtube.com/watch?v=..."
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            onPressEnter={apply}
            style={{ width: 260 }}
          />
          <Button type="primary" onClick={apply}>
            Insert
          </Button>
        </Space.Compact>
      }
    >
      <Button 
        // ref={ref} 
        icon={<ContainerOutlined />} 
        {...props} 
      />
    </Popover>
  );
};

// Embed.displayName = "Embed";