/**
 * markdown-it plugin: GFM task lists (`- [ ] todo`, `- [x] done`).
 *
 * markdown-it has no task-list support, so without this a checklist that
 * `jsonToMarkdown` wrote as `- [x] text` came back as a plain bullet list
 * whose items start with the literal text "[x] ". This rewrites such a list
 * into the HTML the Tiptap TaskList/TaskItem extensions parse:
 *
 *   <ul data-type="taskList"><li data-type="taskItem" data-checked="true">…
 *
 * A list is only converted when EVERY item has the marker (a TaskList can
 * only contain TaskItems); a mixed list stays a plain bullet list.
 */

import type { MarkdownIt, StateCore, Token } from "markdown-it";

const MARKER = /^\[([ xX])\](?:[ \t]+|$)/;

type Tokens = Token[];

/** The inline token holding the first paragraph of a list item, if any. */
const firstInlineOf = (tokens: Tokens, liIdx: number) =>
  tokens[liIdx + 1]?.type === "paragraph_open" && tokens[liIdx + 2]?.type === "inline"
    ? tokens[liIdx + 2]
    : null;

export const taskListMarkdownItPlugin = (md: MarkdownIt) => {
  md.core.ruler.after("inline", "task_lists", (state: StateCore) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const open = tokens[i];
      if (open.type !== "bullet_list_open") continue;

      // Direct <li> children of this list: same nesting as `open` + 1.
      const items: number[] = [];
      for (let j = i + 1; j < tokens.length; j++) {
        const t = tokens[j];
        if (t.type === "bullet_list_close" && t.level === open.level) break;
        if (t.type === "list_item_open" && t.level === open.level + 1) items.push(j);
      }
      if (!items.length) continue;

      const inlines = items.map((li) => firstInlineOf(tokens, li));
      if (!inlines.every((t) => t && MARKER.test(t.content))) continue;

      open.attrSet("data-type", "taskList");
      items.forEach((li, n) => {
        const inline = inlines[n]!;
        const checked = MARKER.exec(inline.content)![1].toLowerCase() === "x";
        tokens[li].attrSet("data-type", "taskItem");
        tokens[li].attrSet("data-checked", checked ? "true" : "false");

        // Strip the marker from the source text and from its first text child.
        inline.content = inline.content.replace(MARKER, "");
        const first = inline.children?.[0];
        if (first?.type === "text") first.content = first.content.replace(MARKER, "");
      });
    }
  });
};
