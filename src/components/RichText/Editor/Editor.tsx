import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useEditor } from "@tiptap/react";
import type { AnyExtension } from "@tiptap/core";
import { createCoreExtensions } from "@/components/RichText/core/extensions/core";
import { mergeExtensions } from "@/components/RichText/core/extensions/merge";
import { createTaskItemForEditor } from "@/components/RichText/core/extensions/task-item";
import { parseContent } from "@/components/RichText/core/content/parse";
import { serializeContent } from "@/components/RichText/core/content/serialize";
import type { ContentFormat, ControlledContentProps } from "@/components/RichText/core/types";
import { EditorContext } from "./Context";

export interface EditorProps extends ControlledContentProps {
  /** Temporary lock — does NOT replace Viewer (spec 8.4). */
  readOnly?: boolean;
  /** Placeholder shown when the document is empty. */
  placeholder?: string;
  /**
   * Extension point for Phase 4+ features (tables, text-style, image,
   * media, math, diagrams, advanced content). Additive to the Phase 1
   * core set — this file does not need to change as those land.
   */
  extensions?: AnyExtension[];
  className?: string;
  children?: ReactNode;
}

export const Editor = ({
  value,
  format = "json",
  onChange,
  readOnly = false,
  placeholder,
  extensions: extraExtensions,
  className,
  children,
}: EditorProps) => {
  const extensions = useMemo(
    () =>
      // mergeExtensions lets a consumer extension replace a same-named core
      // one in place (e.g. the CodeMirror-backed `codeBlock`), instead of
      // registering a duplicate name.
      mergeExtensions(
        createCoreExtensions({
          placeholder,
          // Swaps in the antd-Checkbox NodeView for checklists — always on,
          // not opt-in, since a styled checklist is baseline behavior the
          // same way Bold/Italic are. Viewer uses the plain
          // schema-only TaskItem from createCoreExtensions()'s own default.
          taskItem: createTaskItemForEditor(),
        }),
        extraExtensions,
      ),
    [placeholder, extraExtensions],
  );

  // The (value, format) pair the editor's document currently reflects: what
  // we were created with, what we last emitted via onChange, or what the
  // sync effect below last applied. The effect skips when the incoming props
  // are that same pair, so our own echo (or a no-op re-render) never goes
  // back through setContent and clobbers the cursor. The format is part of
  // the pair on purpose: the same document in another format is a different
  // string, and a value that merely equals one emitted under another format
  // must still be applied.
  const synced = useRef<{ value: unknown; format: ContentFormat }>({ value, format });

  // Parsed once, at creation. useEditor only reads `content` when it builds
  // the editor; evaluating it inline re-parsed (markdown-it + HTML -> JSON for
  // markdown) on every render, i.e. on every keystroke.
  const [initialContent] = useState(() => parseContent(value, format, extensions));

  const editor = useEditor({
    extensions,
    editable: !readOnly,
    content: initialContent,
    onUpdate: ({ editor: e }) => {
      const next = serializeContent(e.getJSON(), format, extensions);
      synced.current = { value: next, format };
      onChange?.(next);
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (value === undefined) return;
    if (synced.current.value === value && synced.current.format === format) return;
    synced.current = { value, format };
    const doc = parseContent(value, format, extensions);
    editor.commands.setContent(doc, { emitUpdate: false });
    // `extensions` is deliberately not a dependency: a new schema must not
    // re-apply the value on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value, format]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className={["rte-editor", className].filter(Boolean).join(" ")}>
        {children}
      </div>
    </EditorContext.Provider>
  );
};
