import type { AnyExtension } from "@tiptap/core";
import { createTableExtensions, tableNodeRenderers } from "@/components/RichText/core/extensions/table";
import { createImageExtensions } from "@/components/RichText/core/nodes/Image/extension";
import { createVideoExtensions } from "@/components/RichText/core/nodes/Video/extension";
import { createAudioExtensions } from "@/components/RichText/core/nodes/Audio/extension";
import { createEmbedExtensions } from "@/components/RichText/core/nodes/Embed/extension";
import { createMathExtensions } from "@/components/RichText/core/nodes/Math/extension";
import { imageNodeRenderers } from "@/components/RichText/core/nodes/Image/viewer/ImageView";
import { videoNodeRenderers } from "@/components/RichText/core/nodes/Video/viewer/VideoView";
import { audioNodeRenderers } from "@/components/RichText/core/nodes/Audio/viewer/AudioView";
import { createEmbedNodeRenderers } from "@/components/RichText/core/nodes/Embed/viewer/EmbedView";
import { mathNodeRenderers } from "@/components/RichText/core/nodes/Math/viewer/MathView";
import { createCodeBlockNodeRenderers } from "@/components/RichText/core/nodes/CodeBlock/viewer/CodeBlockView";
import type { NodeRenderer } from "@/components/RichText/core/renderer/nodes";

export interface ViewerPresetOptions {
  /** Extra hostnames allowed for `custom` embeds. Keep identical to the Editor's. */
  allowedCustomOrigins?: string[];
}

/**
 * Parsing extensions + node renderers for every optional node. Spread into
 * `<Viewer {...createViewerPreset()} />`. Memoize it (module constant or `useMemo`).
 */
export const createViewerPreset = ({ allowedCustomOrigins }: ViewerPresetOptions = {}): {
  extensions: AnyExtension[];
  nodeRenderers: Record<string, NodeRenderer>;
} => ({
  extensions: [
    ...createTableExtensions(),
    ...createImageExtensions(),
    ...createVideoExtensions(),
    ...createAudioExtensions(),
    ...createEmbedExtensions({ allowedCustomOrigins }),
    ...createMathExtensions(),
  ],
  nodeRenderers: {
    ...tableNodeRenderers,
    ...imageNodeRenderers,
    ...videoNodeRenderers,
    ...audioNodeRenderers,
    ...createEmbedNodeRenderers({ allowedCustomOrigins }),
    ...mathNodeRenderers,
    ...createCodeBlockNodeRenderers(),
  },
});
