import { AudioPlayer } from "../shared/AudioPlayer";
import type { NodeRenderer } from "@/components/RichText/core/renderer/nodes";

export const audioNodeRenderers: Record<string, NodeRenderer> = {
  audio: (node, key) => (
    <AudioPlayer key={key} src={String(node.attrs?.src ?? "")} title={node.attrs?.title} />
  ),
};
