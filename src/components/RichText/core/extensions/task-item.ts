/**
 * Editor-only TaskItem override. Split from ./core.ts (mirroring
 * nodes/Image/editor/extensions.ts's split from nodes/Image/extension.ts)
 * so that Viewer — which uses createCoreExtensions()'s plain
 * schema-only TaskItem purely for parsing — never pulls in @tiptap/react's
 * NodeView runtime or the Ant Design Checkbox control (spec section 33:
 * keep the Viewer bundle lightweight).
 *
 * Editor passes this to createCoreExtensions({ taskItem: ... })
 * automatically (see Editor.tsx) — consumers don't need to wire
 * it up themselves the way they do for the additive Phase 4+ features
 * (Table/Image/etc.); a styled checklist is baseline Phase 1 behavior,
 * not opt-in.
 */

import type { AnyExtension } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import TiptapTaskItem from "@tiptap/extension-task-item";
import { TaskItemNodeView } from "@/components/RichText/Editor/nodeviews/TaskItemNodeView";

export const createTaskItemForEditor = (): AnyExtension =>
  TiptapTaskItem.extend({
    addNodeView() {
      return ReactNodeViewRenderer(TaskItemNodeView);
    },
  }).configure({ nested: true });
