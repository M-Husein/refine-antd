import { type Ref } from "react";
import { Button, type ButtonProps } from "antd";
import { UnderlineOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";

export interface UnderlineProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}

/** Editor control — toggles the underline mark. */
export const Underline = (props: UnderlineProps) => {
  const editor = useRichTextEditor();
  if (!editor) return null;
  return (
    <Button
      // ref={ref}
      type={editor.isActive("underline") ? "primary" : "default"}
      icon={<UnderlineOutlined />}
      disabled={!editor.can().chain().focus().toggleUnderline().run()}
      onClick={() => editor.chain().focus().toggleUnderline().run()}
      {...props}
    />
  );
};

// Underline.displayName = "Underline";