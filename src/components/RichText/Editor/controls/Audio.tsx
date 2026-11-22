import { useState, type Ref } from "react";
import { Button, Popover, Input, Space, type ButtonProps } from "antd";
import { CustomerServiceOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";

export interface AudioProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}

/** Editor control (Phase 6) — inserts an audio file from a direct file URL. */
export const Audio = (props: AudioProps) => {
  const editor = useRichTextEditor();
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState("");

  if (!editor) return null;

  const apply = () => {
    if (src) editor.chain().focus().setAudio({ src }).run();
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
            // placeholder="https://example.com/audio.mp3"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            onPressEnter={apply}
            style={{ width: 260 }}
          />
          <Button 
            type="primary" 
            onClick={apply}
          >
            Insert
          </Button>
        </Space.Compact>
      }
    >
      <Button 
        // ref={ref} 
        icon={<CustomerServiceOutlined />} 
        {...props} 
      />
    </Popover>
  );
};

// Audio.displayName = "Audio";