import type { AnyExtension } from "@tiptap/core";
import type { ContentFormat, ContentValue } from "@/components/RichText/core/types";
import { createCoreExtensions } from "@/components/RichText/core/extensions/core";
import { mergeExtensions } from "@/components/RichText/core/extensions/merge";
import { parseContent } from "./parse";
import { serializeContent } from "./serialize";

/**
 * Converts a document between public formats using the full schema (core
 * extensions + yours), exactly like `<Editor>` / `<Viewer>` build it.
 *
 * Pass the same `extensions` you give to `<Editor>`. Do NOT call
 * `serializeContent` / `parseContent` with only your extra extensions: the
 * schema would have no `doc` node ("Schema is missing its top node type").
 *
 *   convertContent(json, "json", "markdown", extensions)
 */
export const convertContent = (
  value: unknown,
  from: ContentFormat,
  to: ContentFormat,
  extensions: AnyExtension[] = [],
): ContentValue["value"] => {
  const schema = mergeExtensions(createCoreExtensions(), extensions);
  return serializeContent(parseContent(value, from, schema), to, schema);
};
