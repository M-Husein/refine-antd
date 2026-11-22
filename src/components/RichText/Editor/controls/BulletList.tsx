import { type Ref } from "react";
import { Button, type ButtonProps } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";

export interface BulletListProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}

/** Editor control — toggles a bullet list. */
export const BulletList = (props: BulletListProps) => {
  const editor = useRichTextEditor();
  if (!editor) return null;
  return (
    <Button
      // ref={ref}
      type={editor.isActive("bulletList") ? "primary" : "default"}
      icon={<UnorderedListOutlined />}
      disabled={!editor.can().chain().focus().toggleBulletList().run()}
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      {...props}
    />
  );
};

// BulletList.displayName = "BulletList";