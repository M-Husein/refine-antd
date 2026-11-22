import { type Ref } from "react";
import { Button, type ButtonProps } from "antd";
import { StrikethroughOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";

export interface StrikethroughProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}

/** Editor control — toggles the strikethrough mark. */
export const Strikethrough = (props: StrikethroughProps) => {
  const editor = useRichTextEditor();
  if (!editor) return null;
  return (
    <Button
      // ref={ref}
      type={editor.isActive("strike") ? "primary" : "default"}
      icon={<StrikethroughOutlined />}
      disabled={!editor.can().chain().focus().toggleStrike().run()}
      onClick={() => editor.chain().focus().toggleStrike().run()}
      {...props}
    />
  );
};

// Strikethrough.displayName = "Strikethrough";