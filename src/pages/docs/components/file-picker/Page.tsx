import { useState } from "react";
import { Button, Card, Divider, Switch, Typography } from "antd";
import type { UploadFile } from "antd";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { FilePicker } from "@/components/FilePicker";

export default function Page() {
  useDocumentTitle("<FilePicker />");

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [pastable, setPastable] = useState(true);
  const [webcam, setWebcam] = useState(true);
  const [screenCapture, setScreenCapture] = useState(true);
  const [webcamRecord, setWebcamRecord] = useState(true);
  const [screenRecord, setScreenRecord] = useState(true);
  const [pasteUrl, setPasteUrl] = useState(true);
  const [disabled, setDisabled] = useState(false);

  return (
    <div className="max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<FilePicker />"}</h1>

      <Card size="small" className="mb-4">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <Switch checked={pastable} onChange={setPastable} id="paste" /> pastable
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={webcam} onChange={setWebcam} /> webcam
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={screenCapture} onChange={setScreenCapture} /> screenCapture
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={webcamRecord} onChange={setWebcamRecord} /> webcamRecord
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={screenRecord} onChange={setScreenRecord} /> screenRecord
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={pasteUrl} onChange={setPasteUrl} /> pasteUrl
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={disabled} onChange={setDisabled} /> disabled
          </label>
        </div>
        <Typography.Text type="secondary" className="block mt-2">
          Webcam and screen capture only work on HTTPS or localhost. From URL only works for links whose
          server allows CORS (e.g. https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png).
        </Typography.Text>
      </Card>

      <FilePicker
        multiple
        maxCount={5}
        accept="image/*,video/*" // .pdf
        maxBytes={5 * 1024 * 1024}
        pastable={pastable}
        webcam={webcam}
        webcamRecord={webcamRecord}
        screenCapture={screenCapture}
        screenRecord={screenRecord}
        pasteUrl={pasteUrl}
        disabled={disabled}
        listType="picture"
        // Do not upload anywhere, keep the files in state only
        beforeUpload={() => false}
        fileList={files}
        onChange={({ fileList }) => setFiles(fileList)}
        renderExtra={() => <Button onClick={() => setFiles([])} disabled={!files.length}>Clear</Button>}
      />

      <Divider />

      <h2 className="h5 mb-2">Selected files ({files.length})</h2>
      <pre className="text-xs">
        {JSON.stringify(
          files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
          null,
          2
        )}
      </pre>
    </div>
  );
}
