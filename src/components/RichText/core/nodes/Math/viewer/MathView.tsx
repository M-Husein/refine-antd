import { MathView } from "../shared/MathView";
import type { NodeRenderer } from "@/components/RichText/core/renderer/nodes";

export const mathNodeRenderers: Record<string, NodeRenderer> = {
  math: (node, key) => (
    <MathView key={key} latex={String(node.attrs?.latex ?? "")} display />
  ),
  mathInline: (node, key) => (
    <MathView key={key} latex={String(node.attrs?.latex ?? "")} display={false} />
  ),
};
