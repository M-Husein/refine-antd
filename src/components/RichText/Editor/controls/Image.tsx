import { forwardRef, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button, Modal, type ButtonProps, type ModalProps, type UploadFile, type UploadProps } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { NodeSelection } from "@tiptap/pm/state";
import { FilePicker, type FilePickerProps } from "@/components/FilePicker";
import { useRichTextEditor } from "../Context";

/**
 * FilePicker props accepted by `<ImageControl />`. Props that exist on both the
 * trigger button and the picker (`disabled`, `className`, `style`, `type`, `children`, ...)
 * keep their button meaning; only `name` and `onChange` go to the picker.
 * `fileList` is managed by the control.
 */
type PickerProps = Omit<
  FilePickerProps,
  keyof ButtonProps | "ref" | "children" | "fileList" | "defaultFileList"
> &
  Pick<FilePickerProps, "name" | "onChange">;

export interface ImageProps
  extends Omit<ButtonProps, "onClick" | "name" | "onChange" | "ref">,
    PickerProps {
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
}

/** Keys that belong to the FilePicker; everything else goes to the trigger button. */
const PICKER_KEYS = new Set<string>([
  "webcam",
  "screenCapture",
  "pasteUrl",
  "fetchUrl",
  "urlTimeout",
  "renderExtra",
  "hint",
  "pastable",
  "accept",
  "multiple",
  "maxCount",
  "action",
  "customRequest",
  "beforeUpload",
  "listType",
  "showUploadList",
  "name",
  "onChange",
  "headers",
  "data",
  "method",
  "withCredentials",
  "onRemove",
  "onPreview",
  "onDownload",
  "isImageUrl",
  "itemRender",
  "iconRender",
  "previewFile",
  "progress",
  "directory",
  "openFileDialogOnClick",
] satisfies (keyof FilePickerProps)[]);

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
 *
 * Requires createImageEditorExtensions() (or createImageExtensions() for
 * read/parse only) to be included in the editor's extensions.
 *
 * Needs the Refine context (FilePicker uses `useTranslate`).
 */
export const Image = forwardRef<HTMLButtonElement, ImageProps>(
  ({ modalTitle, modalProps, getUrl = defaultGetUrl, disabled, ...rest }, ref) => {
    const editor = useRichTextEditor();
    const [open, setOpen] = useState(false);
    // uids already handled in this modal session (onChange fires many times per file)
    const handled = useRef(new Set<string>());

    // Split the flat props: picker keys -> FilePicker, the rest -> trigger button.
    const pickerProps: Record<string, unknown> = {};
    const buttonProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      (PICKER_KEYS.has(key) ? pickerProps : buttonProps)[key] = value;
    }
    const {
      onChange,
      action,
      customRequest,
      accept = "image/*",
      pastable = true,
      listType = "picture",
      ...pickerRest
    } = pickerProps as Partial<FilePickerProps>;

    if (!editor) return null;

    // A block image stays node-selected after it is inserted, and inserting over a
    // node selection REPLACES it — so a second image would overwrite the first.
    // Insert after the selected node instead, and all images of a batch in one go.
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
      onChange?.(info);

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
          ref={ref}
          icon={<PictureOutlined />}
          disabled={disabled}
          {...(buttonProps as ButtonProps)}
          onClick={() => setOpen(true)}
        />
        <Modal
          centered
          width={560}
          footer={null}
          destroyOnHidden
          title={modalTitle ?? "Insert image"}
          afterClose={() => handled.current.clear()}
          {...modalProps}
          open={open}
          onCancel={() => setOpen(false)}
        >
          <FilePicker
            {...pickerRest}
            accept={accept}
            pastable={pastable}
            listType={listType}
            disabled={disabled}
            action={action}
            // No upload endpoint: embed the image as a data URL.
            customRequest={customRequest ?? (action ? undefined : readAsDataUrl)}
            onChange={handleChange}
          />
        </Modal>
      </>
    );
  },
);

Image.displayName = "Image";
