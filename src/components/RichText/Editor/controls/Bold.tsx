import { type Ref } from "react";
import { Button, type ButtonProps } from "antd";
import { BoldOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";

export interface BoldProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}

/** Editor control — toggles the bold mark. Not a toolbar; place it anywhere. */
export const Bold = (props: BoldProps) => {
  const editor = useRichTextEditor();
  if (!editor) return null;
  return (
    <Button
      // ref={ref}
      type={editor.isActive("bold") ? "primary" : "default"}
      icon={<BoldOutlined />}
      disabled={!editor.can().chain().focus().toggleBold().run()}
      onClick={() => editor.chain().focus().toggleBold().run()}
      {...props}
    />
  );
};

// Bold.displayName = "Bold";