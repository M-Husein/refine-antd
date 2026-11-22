import { type Ref } from "react";
import { Button, type ButtonProps } from "antd";
import { OrderedListOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";

export interface OrderedListProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}

/** Editor control — toggles an ordered list. */
export const OrderedList = (props: OrderedListProps) => {
  const editor = useRichTextEditor();
  if (!editor) return null;
  return (
    <Button
      // ref={ref}
      type={editor.isActive("orderedList") ? "primary" : "default"}
      icon={<OrderedListOutlined />}
      disabled={!editor.can().chain().focus().toggleOrderedList().run()}
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      {...props}
    />
  );
};

// OrderedList.displayName = "OrderedList";