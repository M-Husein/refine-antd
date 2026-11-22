import { type Ref } from "react";
import { Button, type ButtonProps } from "antd";
import { UndoOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";

export interface UndoProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}

/** Editor control — undoes the last change. */
export const Undo = (props: UndoProps) => {
  const editor = useRichTextEditor();
  if (!editor) return null;
  return (
    <Button
      // ref={ref}
      icon={<UndoOutlined />}
      disabled={!editor.can().undo()}
      onClick={() => editor.chain().focus().undo().run()}
      {...props}
    />
  );
};

// Undo.displayName = "Undo";