import { useMemo, useState } from "react";
import { Button, Card, Divider, Segmented, Space, Tooltip } from "antd";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  Editor,
  Content,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading,
  BulletList,
  OrderedList,
  Checklist,
  CodeBlockControl,
  Link,
  Undo,
  Redo,
  TableControl,
  TableToolbar,
  ImageControl,
  VideoControl,
  AudioControl,
  EmbedControl,
  MathControl,
  createEditorExtensions,
  convertContent,
  type ContentFormat,
  type JSONContent,
} from "@/components/RichText/Editor";
import { initialJson, initialMarkdown } from './parts/data';

const Toolbar = () => (
  <Space wrap size={[4, 4]} className="w-full p-1 !sticky top-12 z-1 bg-white">
    <Heading />
    <Space.Compact>
      <Bold />
      <Italic />
      <Underline />
      <Strikethrough />
    </Space.Compact>
    <Space.Compact>
      <BulletList />
      <OrderedList />
      <Checklist />
      <Tooltip title="Code block">
        <CodeBlockControl />
      </Tooltip>
    </Space.Compact>
    <Link />
    <TableControl />
    <ImageControl />
    <VideoControl />
    <AudioControl />
    <EmbedControl providers={["youtube", "vimeo"]} />
    <MathControl />
    <Space.Compact>
      <Undo />
      <Redo />
    </Space.Compact>
  </Space>
);

export default function Page() {
  useDocumentTitle("<Editor />");

  const [format, setFormat] = useState<ContentFormat>("markdown");
  const [value, setValue] = useState<string | JSONContent>(initialJson);
  const [readOnly, setReadOnly] = useState(false);
  // Created once: a new extensions array rebuilds the editor.
  const extensions = useMemo(() => createEditorExtensions(), []);

  // value and format must change together: json is an object, html/markdown are strings.
  // convertContent keeps the current document (including your edits) and re-encodes it.
  const changeFormat = (next: ContentFormat) => {
    setValue(convertContent(value, format, next, extensions));
    setFormat(next);
  };

  // Reload the bundled sample document in the current format.
  const resetSample = () => {
    setValue(
      format === "markdown" 
        ? initialMarkdown 
        : convertContent(initialJson, "json", format, extensions)
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<Editor />"}</h1>

      <Card size="small" className="mb-4">
        <Space wrap>
          <Segmented
            value={format}
            onChange={(v) => changeFormat(v as ContentFormat)}
            options={["markdown", "html", "json"]}
          />
          <Segmented
            value={readOnly ? "readOnly" : "editable"}
            onChange={(v) => setReadOnly(v === "readOnly")}
            options={["editable", "readOnly"]}
          />
          <Button onClick={resetSample}>Reset sample</Button>
        </Space>
      </Card>

      <Editor
        value={value}
        format={format}
        onChange={setValue}
        readOnly={readOnly}
        extensions={extensions}
        placeholder="Start typing..."
      >
        <Toolbar />
        <TableToolbar />
        <div className="rounded-lg border border-solid border-gray-300 p-3">
          <Content />
        </div>
      </Editor>

      <Divider />
      <h2 className="h5 mb-2">Value ({format})</h2>
      <pre className="text-xs overflow-auto max-h-96">
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
