import {
  // type ContentFormat,
  type JSONContent,
} from "@/components/RichText/Editor";

export const initialJson: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Tiptap + Ant Design RTE — full feature demo" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Phases 1–3 (marks, lists, links) plus 4–6 (table, image, video, audio, embed) are all wired up below. Try " },
        { type: "text", text: "editing", marks: [{ type: "bold" }] },
        { type: "text", text: ", " },
        { type: "text", text: "formatting", marks: [{ type: "italic" }] },
        { type: "text", text: ", inserting media, or flipping to the read-only viewer with the toggle above." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Heading 2" }],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Heading 3" }],
    },
    {
      type: "heading",
      attrs: { level: 4 },
      content: [{ type: "text", text: "Heading 4" }],
    },
    {
      type: "heading",
      attrs: { level: 5 },
      content: [{ type: "text", text: "Heading 5" }],
    },
    {
      type: "heading",
      attrs: { level: 6 },
      content: [{ type: "text", text: "Heading 6" }],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: true },
          content: [{ type: "paragraph", content: [{ type: "text", text: "Core marks, lists, links (Phase 1)" }] }],
        },
        {
          type: "taskItem",
          attrs: { checked: true },
          content: [{ type: "paragraph", content: [{ type: "text", text: "JSON / HTML / Markdown formats (Phase 2)" }] }],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [{ type: "paragraph", content: [{ type: "text", text: "Diagrams (Phase 8) — not yet built" }] }],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Links now open a modal (URL, Text, Target, Rel, Tab Index, Title, ARIA Label) — try " },
        {
          type: "text",
          text: "this simple link",
          marks: [{ type: "link", attrs: { href: "https://example.com" } }],
        },
        { type: "text", text: " or " },
        {
          type: "text",
          text: "this one that opens in a new tab",
          marks: [{ type: "link", attrs: { href: "https://example.com", target: "_blank", rel: "noopener noreferrer" } }],
        },
        { type: "text", text: ". An image can be a link too: " },
        {
          type: "imageInline",
          attrs: { src: "https://picsum.photos/id/237/64/64", alt: "Linked thumbnail" },
          marks: [{ type: "link", attrs: { href: "https://example.com" } }],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Math (Phase 7): Einstein's " },
        { type: "mathInline", attrs: { latex: "E=mc^2" } },
        { type: "text", text: " inline, and a block equation below — click either to edit with MathLive." },
      ],
    },
    {
      type: "math",
      attrs: { latex: "\\int_0^1 x^2\\,dx = \\frac{1}{3}", display: true },
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Code blocks (Phase 9) use CodeMirror 6 — pick a language and theme from the header, copy the code, or just type three backticks. Try Tab to indent and ArrowDown at the last line to leave the block." },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: "jsx" },
      content: [{ type: "text", text: "import { Crepe } from '@milkdown/crepe'\nimport '@milkdown/crepe/theme/common/style.css'\n// We have some themes for you to choose, ex.\nimport '@milkdown/crepe/theme/frame.css'\n\n// Or you can create your own theme\nimport './your-theme.css'\n\nconst crepe = new Crepe({\n  root: '#app',\n  defaultValue: '# Hello, Milkdown!',\n})\n\ncrepe.create().then(() => {\n  console.log('Milkdown is ready!')\n})\n\n// Before unmount\ncrepe.destroy()" }],
    },
    {
      type: "codeBlock",
      attrs: { language: "python" },
      content: [{ type: "text", text: "def greet(name: str) -> str:\n    return f\"Hello, {name}!\"\n\nprint(greet(\"world\"))" }],
    },
    {
      type: "codeBlock",
      attrs: { language: "plaintext" },
      content: [{ type: "text", text: "No language selected \u2014 this block is plain text.\nLine two." }],
    },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Phase" }] }] },
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Feature" }] }] },
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Status" }] }] },
          ],
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "4" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Table" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Done" }] }] },
          ],
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "5" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Image" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Done" }] }] },
          ],
        },
      ],
    },
    {
      type: "image",
      attrs: {
        src: "https://picsum.photos/id/1015/640/360",
        alt: "Mountain river",
        caption: "Block image with a caption (Phase 5)",
        align: "left",
        displayMode: "block",
        // width: 480,
      },
    },
    {
      type: "embed",
      attrs: {
        src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        provider: "youtube",
        // width: 480,
        // height: 270,
        title: "Sample embed (Phase 6)",
      },
    },
  ],
};

/** The same document as `initialJson`, as the Editor serializes it with `format="markdown"`. */
export const initialMarkdown = `# Tiptap \\+ Ant Design RTE — full feature demo

Phases 1-3 \\(marks, lists, links\\) plus 4-6 \\(table, image, video, audio, embed\\) are all wired up below\\. Try **editing**, _formatting_, inserting media, or flipping to the read\\-only viewer with the toggle above\\.

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

- [x] Core marks, lists, links \\(Phase 1\\)
- [x] JSON / HTML / Markdown formats \\(Phase 2\\)
- [ ] Diagrams \\(Phase 8\\) — not yet built

Links now open a modal \\(URL, Text, Target, Rel, Tab Index, Title, ARIA Label\\) — try [this simple link](https://example.com) or <a href="https://example.com" target="_blank" rel="noopener noreferrer">this one that opens in a new tab</a>\\. An image can be a link too: [![Linked thumbnail](https://picsum.photos/id/237/64/64)](https://example.com)

Math \\(Phase 7\\): Einstein's $E=mc^2$ inline, and a block equation below — click either to edit with MathLive\\.

$$\\int_0^1 x^2\\,dx = \\frac{1}{3}$$

Code blocks \\(Phase 9\\) use CodeMirror 6 — pick a language and theme from the header, copy the code, or just type three backticks\\. Try Tab to indent and ArrowDown at the last line to leave the block\\.

\`\`\`jsx
import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
// We have some themes for you to choose, ex.
import '@milkdown/crepe/theme/frame.css'

// Or you can create your own theme
import './your-theme.css'

const crepe = new Crepe({
  root: '#app',
  defaultValue: '# Hello, Milkdown!',
})

crepe.create().then(() => {
  console.log('Milkdown is ready!')
})

// Before unmount
crepe.destroy()
\`\`\`

\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("world"))
\`\`\`

\`\`\`
No language selected — this block is plain text.
Line two.
\`\`\`

| Phase | Feature | Status |
| --- | --- | --- |
| 4 | Table | Done |
| 5 | Image | Done |

<figure data-rte-image data-align="left" data-display-mode="block"><img src="https://picsum.photos/id/1015/640/360" alt="Mountain river"/><figcaption>Block image with a caption (Phase 5)</figcaption></figure>

<div class="rte-embed"><iframe data-rte-embed data-src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" data-provider="youtube" title="Sample embed (Phase 6)" style="width:100%;height:100%;border:0"></iframe></div>
`;
