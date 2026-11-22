import { type Ref } from "react";
import { Button, type ButtonProps } from "antd";
import { ItalicOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";

export interface ItalicProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}

/** Editor control — toggles the italic mark. */
export const Italic = (props: ItalicProps) => {
  const editor = useRichTextEditor();
  if (!editor) return null;
  return (
    <Button
      // ref={ref}
      type={editor.isActive("italic") ? "primary" : "default"}
      icon={<ItalicOutlined />}
      disabled={!editor.can().chain().focus().toggleItalic().run()}
      onClick={() => editor.chain().focus().toggleItalic().run()}
      {...props}
    />
  );
};

// Italic.displayName = "Italic";