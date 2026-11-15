import "../styles/content.css";
import "../styles/viewer.css";
import "mathlive/static.css";

export { Viewer } from "./Viewer";
export type { ViewerProps } from "./Viewer";

export {
  defaultNodeRenderers,
  mergeNodeRenderers,
} from "@/components/RichText/core/renderer/nodes";
export type { NodeRenderer, RenderContext } from "@/components/RichText/core/renderer/nodes";

export {
  defaultMarkRenderers,
  mergeMarkRenderers,
} from "@/components/RichText/core/renderer/marks";
export type { MarkRenderer } from "@/components/RichText/core/renderer/marks";

// Phase 4/5 shared presentation for viewer-only bundles
export { tableNodeRenderers } from "@/components/RichText/core/extensions/table";
export { imageNodeRenderers } from "@/components/RichText/core/nodes/Image/viewer/ImageView";
export { ImageFigure, ImageInlineSpan } from "@/components/RichText/core/nodes/Image/shared/ImageFigure";

// Phase 6 shared presentation for viewer-only bundles
export { videoNodeRenderers } from "@/components/RichText/core/nodes/Video/viewer/VideoView";
export { VideoPlayer } from "@/components/RichText/core/nodes/Video/shared/VideoPlayer";
export { audioNodeRenderers } from "@/components/RichText/core/nodes/Audio/viewer/AudioView";
export { AudioPlayer } from "@/components/RichText/core/nodes/Audio/shared/AudioPlayer";
export { createEmbedNodeRenderers } from "@/components/RichText/core/nodes/Embed/viewer/EmbedView";
export { EmbedFrame } from "@/components/RichText/core/nodes/Embed/shared/EmbedFrame";
export { resolveEmbed, EMBED_SANDBOX } from "@/components/RichText/core/nodes/Embed/security";
export type {
  EmbedProvider,
  ResolvedEmbed,
  EmbedValidationOptions,
} from "@/components/RichText/core/nodes/Embed/security";

// Phase 7 shared presentation for viewer-only bundles
export { mathNodeRenderers } from "@/components/RichText/core/nodes/Math/viewer/MathView";
export { MathView } from "@/components/RichText/core/nodes/Math/shared/MathView";

// Phase 9 shared presentation for viewer-only bundles. The highlighter
// lazy-loads CodeMirror's language packages with import(); no EditorView is
// ever created (spec 24.2).
export { createCodeBlockNodeRenderers, codeBlockNodeRenderers } from "@/components/RichText/core/nodes/CodeBlock/viewer/CodeBlockView";
export { CodeBlockStatic } from "@/components/RichText/core/nodes/CodeBlock/shared/CodeBlockStatic";
export { CODE_LANGUAGES, resolveCodeLanguage, codeLanguageLabel } from "@/components/RichText/core/nodes/CodeBlock/languages";
export type { CodeLanguage } from "@/components/RichText/core/nodes/CodeBlock/languages";
export type { CodeBlockTheme } from "@/components/RichText/core/nodes/CodeBlock/types";

export type {
  ContentFormat,
  ContentValue,
  JSONContent,
} from "@/components/RichText/core/types";

export { createViewerPreset } from "./preset";
export type { ViewerPresetOptions } from "./preset";
