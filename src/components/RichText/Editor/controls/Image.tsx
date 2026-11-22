import { useRef, useState, type Ref } from "react";
import type { ReactNode } from "react";
import { Button, Modal, type ButtonProps, type ModalProps, type UploadFile, type UploadProps } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { NodeSelection } from "@tiptap/pm/state";
import { FilePicker, type FilePickerProps } from "@/components/FilePicker";
import { useRichTextEditor } from "../Context";

/** FilePicker config accepted by `<ImageControl />`. Excludes `children` & `ref` (managed internally). */
type FilePickerConfig = Omit<FilePickerProps, "children" | "ref">;

export interface ImageProps
  extends Omit<ButtonProps, "onClick" | "name" | "onChange" | "ref"> {
  /** Title of the modal. Default "Insert image". */
  modalTitle?: ReactNode;
  /** Extra props for the antd Modal. */
  modalProps?: Omit<ModalProps, "open" | "onCancel">;
  /**
   * Turns an uploaded file into the image `src`. Default: the upload response when it is a
   * string, else `response.url` / `response.data.url`, else `file.url`.
   * Return `undefined` to skip the file.
   */
  getUrl?: (file: UploadFile) => string | undefined;
  /** FilePicker configuration — all FilePicker props go here. */
  filePicker?: FilePickerConfig;
  ref?: Ref<HTMLButtonElement>;
}

/** Used when neither `action` nor `customRequest` is given: embeds the image as a data URL. */
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

/** Rejects script-capable schemes; allows http(s), relative paths, blob: and data:image/*. */
const isSafeSrc = (src: string) => {
  const s = src.trim();
  if (/^(javascript|vbscript):/i.test(s)) return false;
  if (/^data:/i.test(s)) return /^data:image\/(png|jpe?g|gif|webp|avif|bmp|svg\+xml)[;,]/i.test(s);
  return true;
};

/**
 * Editor control (Phase 5) — inserts a block image. Opens a modal with a
 * `FilePicker`: pick, drop or paste a file, or (with `pasteUrl` / `webcam` /
 * `screenCapture`) add one from a URL, the camera or the screen.
 *
 * Without `action` / `customRequest` the image is embedded as a data URL
 * (base64) — fine for small images, but it makes the stored content large.
 * For anything else upload the file and insert its URL:
 *
 *   <ImageControl action="/api/upload" />                      // response: { url }
 *   <ImageControl customRequest={...} getUrl={(f) => f.response.location} />
 *   <ImageControl filePicker={{ accept: "image/*", webcam: true }} />
 *
 * Requires createImageEditorExtensions() (or createImageExtensions() for
 * read/parse only) to be included in the editor's extensions.
 *
 * Needs the Refine context (FilePicker uses `useTranslate`).
 */
export const Image = ({
  modalTitle,
  modalProps,
  getUrl = defaultGetUrl,
  disabled,
  filePicker,
  // ref,
  ...buttonProps
}: ImageProps) => {
  const editor = useRichTextEditor();
  const [open, setOpen] = useState(false);
  // uids already handled in this modal session (onChange fires many times per file)
  const handled = useRef(new Set<string>());

  if (!editor) return null;

  // Merge user filePicker with defaults
  const filePickerProps: FilePickerConfig = {
    accept: "image/*",
    pastable: true,
    listType: "picture",
    disabled,
    // No upload endpoint: embed the image as a data URL.
    customRequest: filePicker?.action ? filePicker.customRequest : readAsDataUrl,
    webcam: true,
    screenCapture: true,
    pasteUrl: true,
    ...filePicker,
  };

  const insertImages = (srcs: string[]) => {
    const content = srcs.map((src) => ({ type: "image", attrs: { src } }));
    const { selection } = editor.state;
    const chain = editor.chain().focus();
    (selection instanceof NodeSelection
      ? chain.insertContentAt(selection.to, content)
      : chain.insertContent(content)
    ).run();
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
    insertImages(srcs);
    // Failed files keep the modal open so the error stays visible.
    if (info.fileList.every((f) => f.status === "done")) setOpen(false);
  };

  return (
    <>
      <Button
        // ref={ref}
        icon={<PictureOutlined />}
        disabled={disabled}
        {...buttonProps}
        onClick={() => setOpen(true)}
      />
      <Modal
        centered
        width={725}
        footer={null}
        destroyOnHidden
        title={modalTitle ?? "Insert image"}
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

// Image.displayName = "Image";