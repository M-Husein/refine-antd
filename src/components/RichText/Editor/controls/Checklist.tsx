import { type Ref } from "react";
import { Button, type ButtonProps } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";

export interface ChecklistProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}

/** Editor control — toggles a checklist (task list). */
export const Checklist = (props: ChecklistProps) => {
  const editor = useRichTextEditor();
  if (!editor) return null;
  return (
    <Button
      // ref={ref}
      type={editor.isActive("taskItem") ? "primary" : "default"}
      icon={<CheckOutlined />}
      disabled={!editor.can().chain().focus().toggleTaskList().run()}
      onClick={() => editor.chain().focus().toggleTaskList().run()}
      {...props}
    />
  );
};

// Checklist.displayName = "Checklist";