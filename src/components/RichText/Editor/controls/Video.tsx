import { useRef, useState, type Ref } from "react";
import type { ReactNode } from "react";
import { Button, Modal, type ButtonProps, type ModalProps, type UploadFile, type UploadProps } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import { FilePicker, type FilePickerProps } from "@/components/FilePicker";
import { useRichTextEditor } from "../Context";

/** FilePicker config accepted by `<Video />`. Excludes `children` & `ref` (managed internally). */
type FilePickerConfig = Omit<FilePickerProps, "children" | "ref">;

export interface VideoProps
  extends Omit<ButtonProps, "onClick" | "name" | "onChange" | "ref"> {
  /** Title of the modal. Default "Insert video". */
  modalTitle?: ReactNode;
  /** Extra props for the antd Modal. */
  modalProps?: Omit<ModalProps, "open" | "onCancel">;
  /**
   * Turns an uploaded file into the video `src`. Default: the upload response when it is a
   * string, else `response.url` / `response.data.url`, else `file.url`.
   * Return `undefined` to skip the file.
   */
  getUrl?: (file: UploadFile) => string | undefined;
  /** FilePicker configuration — all FilePicker props go here. */
  filePicker?: FilePickerConfig;
  ref?: Ref<HTMLButtonElement>;
}

/** Used when neither `action` nor `customRequest` is given: embeds the video as a data URL (base64). */
const readAsDataUrl: UploadProps["customRequest"] = ({ file, onSuccess, onError }) => {
  const reader = new FileReader();
  reader.onload = () => onSuccess?.(reader.result as string);
  reader.onerror = () => onError?.(new Error("Unable to read the file."));
  reader.readAsDataURL(file as Blob);
};

const defaultGetUrl = (file: UploadFile): string | undefined => {
  const res = file.response as unknown;
  if (typeof res === "string") return res;
  if (res && typeof res === "object") {
    const r = res as { url?: unknown; data?: { url?: unknown } };
    if (typeof r.url === "string") return r.url;
    if (typeof r.data?.url === "string") return r.data.url;
  }
  return file.url;
};

/** Rejects script-capable schemes; allows http(s), relative paths, blob: and data:video/*. */
const isSafeSrc = (src: string) => {
  const s = src.trim();
  if (/^(javascript|vbscript):/i.test(s)) return false;
  if (/^data:/i.test(s)) return /^data:video\/(webm|mp4|ogg|mov|quicktime)[;,]/i.test(s);
  return true;
};

/**
 * Editor control (Phase 6) — inserts a self-hosted video. Opens a modal with a
 * `FilePicker`: pick, drop or paste a file, or (with `webcamRecord` / `screenRecord`)
 * record from webcam or screen.
 *
 * Without `action` / `customRequest` the video is embedded as a data URL
 * (base64) — fine for short clips, but it makes the stored content large.
 * For anything else upload the file and insert its URL:
 *
 *   <Video action="/api/upload" />                      // response: { url }
 *   <Video customRequest={...} getUrl={(f) => f.response.location} />
 *   <Video filePicker={{ webcamRecord: true, screenRecord: true }} />
 *
 * Requires createVideoExtensions() to be included in the editor's extensions.
 *
 * Needs the Refine context (FilePicker uses `useTranslate`).
 */
export const Video = ({
  modalTitle,
  modalProps,
  getUrl = defaultGetUrl,
  disabled,
  filePicker,
  // ref,
  ...buttonProps
}: VideoProps) => {
  const editor = useRichTextEditor();
  const [open, setOpen] = useState(false);
  // uids already handled in this modal session (onChange fires many times per file)
  const handled = useRef(new Set<string>());

  if (!editor) return null;

  // Merge user filePicker with defaults (video-only: enable recording, disable photo capture)
  const filePickerProps: FilePickerConfig = {
    accept: "video/*",
    pastable: true,
    listType: "picture",
    disabled,
    // No upload endpoint: embed the video as a data URL.
    customRequest: filePicker?.action ? filePicker.customRequest : readAsDataUrl,
    webcamRecord: true,
    screenRecord: true,
    webcam: false,
    screenCapture: false,
    ...filePicker,
  };

  const insertVideo = (src: string) => {
    editor.chain().focus().setVideo({ src }).run();
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    filePicker?.onChange?.(info);

    // Wait until nothing is still uploading, then insert the whole batch at once,
    // in the order the files were picked (not the order they happened to finish).
    if (!info.fileList.every((f) => f.status === "done" || f.status === "error")) return;
    const srcs: string[] = [];
    for (const file of info.fileList) {
      if (file.status !== "done" || handled.current.has(file.uid)) continue;
      handled.current.add(file.uid);
      const src = getUrl(file);
      if (src && isSafeSrc(src)) srcs.push(src);
    }
    if (srcs.length === 0) return;
    insertVideo(srcs[0]); // video node is atomic, insert one at a time
    // Failed files keep the modal open so the error stays visible.
    if (info.fileList.every((f) => f.status === "done")) setOpen(false);
  };

  return (
    <>
      <Button
        // ref={ref}
        icon={<VideoCameraOutlined />}
        disabled={disabled}
        {...buttonProps}
        onClick={() => setOpen(true)}
      />
      <Modal
        centered
        width={560}
        footer={null}
        destroyOnHidden
        title={modalTitle ?? "Insert video"}
        afterClose={() => handled.current.clear()}
        {...modalProps}
        open={open}
        onCancel={() => setOpen(false)}
      >
        <FilePicker
          {...filePickerProps}
          onChange={handleChange}
        />
      </Modal>
    </>
  );
};

// Video.displayName = "Video";