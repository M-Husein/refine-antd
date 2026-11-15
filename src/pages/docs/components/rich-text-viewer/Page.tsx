import { useMemo, useState } from "react";
import { Card, Segmented } from "antd";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Viewer, createViewerPreset } from "@/components/RichText/Viewer";
import type { ContentFormat } from "@/components/RichText/Viewer";

const SAMPLES: Record<Exclude<ContentFormat, "json">, string> = {
  markdown: `# Rich text viewer

Renders **Markdown**, *HTML* or Tiptap JSON without creating an editor.

- [x] Read only
- [ ] No ProseMirror at runtime

| Format | Input |
| ------ | ----- |
| json | Tiptap JSON |
| html | HTML string |
| markdown | Markdown string |

Inline math $E = mc^2$ and a code block:

\`\`\`ts
const hello = (name: string) => \`Hello, \${name}\`;
\`\`\`
`,
  html: `<h1>Rich text viewer</h1>
<p>Renders <strong>HTML</strong> too.</p>
<ul><li>One</li><li>Two</li></ul>`,
};

export default function Page() {
  useDocumentTitle("<Viewer />");

  const [format, setFormat] = useState<Exclude<ContentFormat, "json">>("markdown");
  // Created once: a new extensions array re-parses the content.
  const preset = useMemo(() => createViewerPreset(), []);

  return (
    <div className="max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<Viewer />"}</h1>

      <Card size="small" className="mb-4">
        <Segmented value={format} onChange={(v) => setFormat(v as "markdown" | "html")} options={["markdown", "html"]} />
      </Card>

      <div className="rounded-lg border border-solid border-gray-300 p-3">
        <Viewer value={SAMPLES[format]} format={format} {...preset} />
      </div>
    </div>
  );
}
