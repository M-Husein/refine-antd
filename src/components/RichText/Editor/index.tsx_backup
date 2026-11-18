import "../styles/content.css";
import "../styles/editor.css";
// Typeset math fonts; also tells MathLive's live editor not to fetch fonts at runtime.
import "mathlive/static.css";

export { Editor } from "./Editor";
export type { EditorProps } from "./Editor";

export { Content } from "./Content";
export type { ContentProps } from "./Content";

export {
  EditorContext,
  useRichTextEditor,
} from "./Context";

export { Bold } from "./controls/Bold";
export { Italic } from "./controls/Italic";
export { Underline } from "./controls/Underline";
export { Strikethrough } from "./controls/Strikethrough";
export { Heading } from "./controls/Heading";
export { BulletList } from "./controls/BulletList";
export { OrderedList } from "./controls/OrderedList";
export { Checklist } from "./controls/Checklist";
export { Link } from "./controls/Link";
export { Undo } from "./controls/Undo";
export { Redo } from "./controls/Redo";
export { FindAndReplace } from "./controls/FindAndReplace";
export { Table as TableControl } from "./controls/Table";
export { TableToolbar } from "./controls/TableToolbar";
export type { TableToolbarProps } from "./controls/TableToolbar";
export { Image as ImageControl } from "./controls/Image";

export { createCoreExtensions } from "@/components/RichText/core/extensions/core";
export type { CoreExtensionsOptions } from "@/components/RichText/core/extensions/core";

// Phase 4 — Table
export {
  createTableExtensions,
  tableNodeRenderers,
} from "@/components/RichText/core/extensions/table";
export type { TableExtensionsOptions } from "@/components/RichText/core/extensions/table";

// Phase 5 — Image
export { createImageExtensions, Image as ImageNode, ImageInline as ImageInlineNode } from "@/components/RichText/core/nodes/Image/extension";
export { createImageEditorExtensions } from "@/components/RichText/core/nodes/Image/editor/extensions";
export { imageNodeRenderers } from "@/components/RichText/core/nodes/Image/viewer/ImageView";
export { ImageFigure, ImageInlineSpan } from "@/components/RichText/core/nodes/Image/shared/ImageFigure";
export type {
  ImageAttributes,
  ImageInlineAttributes,
  ImageAlign,
  ImageDisplayMode,
  ImageVerticalAlign,
  ImageWidth,
  ImageResponsive,
} from "@/components/RichText/core/nodes/Image/types";

// Phase 6 — Media (Video, Audio, Embed)
export { Video as VideoControl } from "./controls/Video";
export { Audio as AudioControl } from "./controls/Audio";
export { Embed as EmbedControl } from "./controls/Embed";

export { createVideoExtensions, Video as VideoNode } from "@/components/RichText/core/nodes/Video/extension";
export { videoNodeRenderers } from "@/components/RichText/core/nodes/Video/viewer/VideoView";
export { VideoPlayer } from "@/components/RichText/core/nodes/Video/shared/VideoPlayer";
export type { VideoAttributes } from "@/components/RichText/core/nodes/Video/types";

export { createAudioExtensions, Audio as AudioNode } from "@/components/RichText/core/nodes/Audio/extension";
export { audioNodeRenderers } from "@/components/RichText/core/nodes/Audio/viewer/AudioView";
export { AudioPlayer } from "@/components/RichText/core/nodes/Audio/shared/AudioPlayer";

export { createEmbedExtensions, Embed as EmbedNode } from "@/components/RichText/core/nodes/Embed/extension";
export { createEmbedEditorExtensions } from "@/components/RichText/core/nodes/Embed/editor/extensions";
export { createEmbedNodeRenderers } from "@/components/RichText/core/nodes/Embed/viewer/EmbedView";
export { EmbedFrame } from "@/components/RichText/core/nodes/Embed/shared/EmbedFrame";
export { resolveEmbed, EMBED_SANDBOX } from "@/components/RichText/core/nodes/Embed/security";
export type {
  EmbedProvider,
  ResolvedEmbed,
  EmbedValidationOptions,
} from "@/components/RichText/core/nodes/Embed/security";
export type { EmbedExtensionOptions } from "@/components/RichText/core/nodes/Embed/extension";

// Phase 7 — Math
export { Math as MathControl } from "./controls/Math";

export { createMathExtensions, Math as MathNode, MathInline as MathInlineNode } from "@/components/RichText/core/nodes/Math/extension";
export { createMathEditorExtensions } from "@/components/RichText/core/nodes/Math/editor/extensions";
export { mathNodeRenderers } from "@/components/RichText/core/nodes/Math/viewer/MathView";
export { MathView } from "@/components/RichText/core/nodes/Math/shared/MathView";
export type { MathAttributes, MathInlineAttributes } from "@/components/RichText/core/nodes/Math/types";

// Phase 9 — CodeBlock (CodeMirror 6)
export { CodeBlock as CodeBlockControl } from "./controls/CodeBlock";
export { createCodeBlockExtensions, CodeBlock as CodeBlockNode } from "@/components/RichText/core/nodes/CodeBlock/extension";
export type { CodeBlockExtensionOptions } from "@/components/RichText/core/nodes/CodeBlock/extension";
export { createCodeBlockEditorExtensions } from "@/components/RichText/core/nodes/CodeBlock/editor/extensions";
export { createCodeBlockNodeRenderers, codeBlockNodeRenderers } from "@/components/RichText/core/nodes/CodeBlock/viewer/CodeBlockView";
export { CodeBlockStatic } from "@/components/RichText/core/nodes/CodeBlock/shared/CodeBlockStatic";
export { CODE_LANGUAGES, resolveCodeLanguage, codeLanguageLabel } from "@/components/RichText/core/nodes/CodeBlock/languages";
export type { CodeLanguage } from "@/components/RichText/core/nodes/CodeBlock/languages";
export type { CodeBlockTheme, CodeBlockAttributes, CodeBlockRuntimeOptions } from "@/components/RichText/core/nodes/CodeBlock/types";

export type {
  ContentFormat,
  ContentValue,
  ControlledContentProps,
  JSONContent,
  MarkdownRepresentation,
} from "@/components/RichText/core/types";

export { createEditorExtensions } from "./preset";
export type { EditorPresetOptions } from "./preset";

export { convertContent } from "@/components/RichText/core/content/convert";
