import { type Ref } from "react";
import { Button, type ButtonProps } from "antd";
import { CodeOutlined } from "@ant-design/icons";
import { useRichTextEditor } from "../Context";

export interface CodeBlockProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Editor control — toggles a code block on the current block. Works with
 * the plain code block `createCoreExtensions()` ships; add
 * `createCodeBlockEditorExtensions()` to `extensions` to get the
 * CodeMirror-backed one (language/theme Selects, copy, line numbers).
 * Typing three backticks and a space inserts one too.
 */
export const CodeBlock = (props: CodeBlockProps) => {
  const editor = useRichTextEditor();
  if (!editor) return null;
  return (
    <Button
      // ref={ref}
      type={editor.isActive("codeBlock") ? "primary" : "default"}
      icon={<CodeOutlined />}
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      {...props}
    />
  );
};

// CodeBlock.displayName = "CodeBlock";