import type { AnyExtension } from "@tiptap/core";
import { createTableExtensions } from "@/components/RichText/core/extensions/table";
import { createImageEditorExtensions } from "@/components/RichText/core/nodes/Image/editor/extensions";
import { createVideoExtensions } from "@/components/RichText/core/nodes/Video/extension";
import { createAudioExtensions } from "@/components/RichText/core/nodes/Audio/extension";
import { createEmbedEditorExtensions } from "@/components/RichText/core/nodes/Embed/editor/extensions";
import { createMathEditorExtensions } from "@/components/RichText/core/nodes/Math/editor/extensions";
import { createCodeBlockEditorExtensions } from "@/components/RichText/core/nodes/CodeBlock/editor/extensions";

export interface EditorPresetOptions {
  /** Extra hostnames allowed for `custom` embeds. See the README "Embed security". */
  allowedCustomOrigins?: string[];
}

/**
 * Every optional node (table, image, video, audio, embed, math, code block)
 * with its editing NodeView. Pass the result to `<Editor extensions={...} />`.
 * Memoize it (module constant or `useMemo`) so the editor is not rebuilt on every render.
 */
export const createEditorExtensions = ({ allowedCustomOrigins }: EditorPresetOptions = {}): AnyExtension[] => [
  ...createTableExtensions(),
  ...createImageEditorExtensions(),
  ...createVideoExtensions(),
  ...createAudioExtensions(),
  ...createEmbedEditorExtensions({ allowedCustomOrigins }),
  ...createMathEditorExtensions(),
  ...createCodeBlockEditorExtensions(),
];
