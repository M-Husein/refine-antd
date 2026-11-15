import type { AnyExtension, JSONContent } from "@tiptap/core";
import type { ContentFormat } from "@/components/RichText/core/types";
import { assertDocShape, emptyDoc } from "./json";
import { htmlToJson } from "./html";
import { markdownToJson } from "./markdown";

const isDocObject = (value: unknown): boolean =>
  typeof value === "object" && value !== null && (value as JSONContent).type === "doc";

/**
 * Converts a value in any public ContentFormat into the canonical Tiptap
 * JSON document. This is the single entry point Editor/Viewer use
 * so "JSON is canonical" (RULE 1) is enforced in exactly one place.
 */
export const parseContent = (
  value: unknown,
  format: ContentFormat,
  extensions: AnyExtension[],
): JSONContent => {
  if (value == null) return emptyDoc();

  // A Tiptap document object is unambiguous whatever `format` says. This
  // happens when a consumer changes `format` and `value` in separate updates
  // (one render sees the new format with the old JSON value); parsing that
  // object as html/markdown would turn it into the text "[object Object]".
  if (format !== "json" && isDocObject(value)) return assertDocShape(value);

  if (format !== "json" && typeof value !== "string") {
    throw new Error(
      `[rte] Invalid content for format="${format}": expected a string, got ${typeof value}.`,
    );
  }

  switch (format) {
    case "json":
      return assertDocShape(value);
    case "html":
      return htmlToJson(String(value), extensions);
    case "markdown":
      return markdownToJson(String(value), extensions);
    default: {
      const _exhaustive: never = format;
      throw new Error(`[rte] Unknown content format: ${String(_exhaustive)}`);
    }
  }
};
