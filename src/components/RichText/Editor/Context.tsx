import { createContext, useContext } from "react";
import type { Editor as TiptapEditor } from "@tiptap/core";

export interface EditorContextValue {
  editor: TiptapEditor | null;
}

export const EditorContext = createContext<EditorContextValue>(
  { editor: null },
);

/**
 * Used by editor controls (Bold, Italic, Link, ...) and by any consumer
 * component placed inside <Editor>. Controls are NOT a toolbar
 * (RULE 4/5) — consumers decide layout, this context just gives whatever
 * they render access to the live editor instance.
 */
export const useRichTextEditor = (): TiptapEditor | null =>
  useContext(EditorContext).editor;
