import { useState } from "react";
import type { ReactNode } from "react";
import { Button, Flex, Input, InputNumber, Modal, Segmented, Space, Tabs, Typography } from "antd";
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from "@ant-design/icons";
import type {
  ImageAlign,
  ImageDisplayMode,
  ImageResponsive,
  ImageResponsiveKey,
  ImageResponsiveMode,
} from "../types";
import { ImageFigure } from "../shared/ImageFigure";
import {
  DEFAULT_RESPONSIVE_MODE,
  RESPONSIVE_DEVICES,
  RESPONSIVE_KEYS,
  RESPONSIVE_LARGE,
  RESPONSIVE_MAX,
  RESPONSIVE_MIN,
  RESPONSIVE_NAMES,
  RESPONSIVE_RANGES,
  normalizeResponsive,
} from "../responsive";

const { Text } = Typography;

const sizePresets = ["25%", "50%", "75%", "100%"];
const displayModeOptions: ImageDisplayMode[] = ["block", "float-left", "float-right"];

type PreviewRange = "xs" | "sm" | "md" | "large";
// Representative frame widths: a phone, a large phone, a tablet; Large uses the whole pane.
const PREVIEW_RANGES: { key: PreviewRange; label: string; frame: number | string }[] = [
  { key: "xs", label: "XS", frame: 375 },
  { key: "sm", label: "SM", frame: 640 },
  { key: "md", label: "MD", frame: 768 },
  { key: "large", label: "Large", frame: "100%" },
];

// Same pattern as the antd "Formatter" demo; an empty value must stay empty (not "%").
const formatPercent = (val?: number | string) => (val == null || `${val}` === "" ? "" : `${val}%`);
const parsePercent = (val?: string) => val?.replace(/[^\d.]/g, "") as unknown as number;

/** The fields the form edits. A snapshot is taken when the modal opens. */
export interface ImageEditValues {
  align: ImageAlign;
  displayMode: ImageDisplayMode;
  /** The normal width ("Width (all size)"), e.g. "50%". `null` = natural size. */
  width: string | null;
  responsive: ImageResponsive | null;
  alt: string;
  caption: string;
  captionAlign: ImageAlign;
}

export interface ImageEditModalProps {
  open: boolean;
  /** Static image attributes, only used by the live preview. */
  image: { src: string; title?: string; height?: string | null };
  /** Values at the moment the modal was opened. Give the component a new `key` for every opening. */
  values: ImageEditValues;
  /** Cancel, the close button and Esc all end up here: nothing is applied. */
  onClose: () => void;
  /** Only the fields that changed, ready for `updateAttributes` (ONE transaction = one undo step). */
  onSave: (patch: Record<string, unknown>) => void;
}

const alignIcons: Record<ImageAlign, ReactNode> = {
  left: <AlignLeftOutlined />,
  center: <AlignCenterOutlined />,
  right: <AlignRightOutlined />,
};

const AlignButtons = ({ value, onChange }: { value: ImageAlign; onChange: (value: ImageAlign) => void }) => (
  <Space.Compact>
    {(["left", "center", "right"] as const).map((align) => (
      <Button
        key={align}
        size="small"
        type={value === align ? "primary" : "default"}
        icon={alignIcons[align]}
        onClick={() => onChange(align)}
      />
    ))}
  </Space.Compact>
);

const Field = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <div>
    <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
    <div style={{ marginTop: 4 }}>{children}</div>
  </div>
);

/** Key order must not matter when two values are compared. */
const canon = (value: unknown): unknown =>
  value && typeof value === "object"
    ? Object.fromEntries(Object.keys(value).sort().map((k) => [k, canon((value as Record<string, unknown>)[k])]))
    : value;
const same = (a: unknown, b: unknown) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

/**
 * Edit form of an image in a Modal: a live preview on the left, the form on the right.
 * Edits are staged in a local draft and applied together by **Save** (one undo step);
 * Cancel, the close button and Esc throw the draft away. A click on the mask does nothing.
 */
export const ImageEditModal = ({ open, image, values, onClose, onSave }: ImageEditModalProps) => {
  const [initial] = useState(values);
  const [draft, setDraft] = useState(values);
  const [previewRange, setPreviewRange] = useState<PreviewRange>("large");
  // The mode is stored together with the values; until the first value exists the choice is kept here.
  const [pendingMode, setPendingMode] = useState<ImageResponsiveMode>(DEFAULT_RESPONSIVE_MODE);
  const responsiveMode = draft.responsive?.mode ?? pendingMode;

  const set = (patch: Partial<ImageEditValues>) => setDraft((d) => ({ ...d, ...patch }));

  const changeResponsiveMode = (mode: ImageResponsiveMode) => {
    setPendingMode(mode);
    if (draft.responsive) set({ responsive: { ...draft.responsive, mode } });
  };

  // `null` clears one range; when no range is left the value goes back to null.
  const changeResponsiveWidth = (key: ImageResponsiveKey, value: number | null) => {
    const next: Record<string, unknown> = { ...draft.responsive, mode: responsiveMode };
    if (value == null) delete next[key];
    else next[key] = value;
    set({ responsive: normalizeResponsive(next) });
  };

  // Only what actually changed, so an untouched field is never rewritten (e.g. a "480px" width).
  const patch: Record<string, unknown> = {};
  if (!same(draft.align, initial.align)) patch.align = draft.align;
  if (!same(draft.displayMode, initial.displayMode)) patch.displayMode = draft.displayMode;
  if (!same(draft.width, initial.width)) patch.width = draft.width;
  if (!same(draft.responsive, initial.responsive)) patch.responsive = draft.responsive;
  if (draft.alt !== initial.alt) patch.alt = draft.alt || null;
  if (draft.caption !== initial.caption) patch.caption = draft.caption || null;
  if (draft.captionAlign !== initial.captionAlign) patch.captionAlign = draft.captionAlign;
  const dirty = Object.keys(patch).length > 0;

  // The width the chosen range really gets (computed here: the preview renders without responsive CSS).
  const rangeValue = previewRange === "large" ? undefined : draft.responsive?.[previewRange];
  const effective = rangeValue != null ? `${rangeValue}%` : draft.width;
  const rangeInfo = PREVIEW_RANGES.find((r) => r.key === previewRange)!;

  const layout = (
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <Field label="Image Align">
        <AlignButtons value={draft.align} onChange={(align) => set({ align })} />
      </Field>

      <Field label="Display mode">
        <Space.Compact>
          {displayModeOptions.map((mode) => (
            <Button
              key={mode}
              size="small"
              type={draft.displayMode === mode ? "primary" : "default"}
              onClick={() => set({ displayMode: mode })}
            >
              {mode}
            </Button>
          ))}
        </Space.Compact>
      </Field>

      <Field label="Size Preset (%)">
        <Space size={4} wrap>
          {sizePresets.map((preset) => (
            <Button
              key={preset}
              size="small"
              type={draft.width === preset ? "primary" : "default"}
              onClick={() => set({ width: preset })}
            >
              {preset}
            </Button>
          ))}
          <Button size="small" danger={!draft.width} onClick={() => set({ width: null })}>
            Reset
          </Button>
        </Space>
      </Field>

      {/* The normal width: used from Large up and for every responsive range left empty */}
      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>Width (all size)</Text>
        <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
          Default. Used from Large ({RESPONSIVE_LARGE[responsiveMode]}) up and for every responsive
          range left empty.
        </Text>
        <InputNumber<number>
          min={1}
          max={100}
          precision={0}
          // Only a percentage can be shown here; a px width (e.g. "480px") leaves it empty.
          // parseFloat, not unary "+": +"50%" is NaN.
          value={typeof draft.width === "string" && draft.width.endsWith("%") ? Number.parseFloat(draft.width) : null}
          formatter={formatPercent}
          parser={parsePercent}
          onChange={(val) => set({ width: val == null ? null : `${val}%` })}
          aria-describedby="rte-image-width-devices"
          className="w-full mt-1"
        />
        <Text id="rte-image-width-devices" type="secondary" style={{ fontSize: 11, display: "block" }}>
          {RESPONSIVE_DEVICES[responsiveMode].large}
        </Text>
        {/* The normal width loses to a responsive range value. Say so. */}
        {draft.responsive && (
          <Text type="warning" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
            A responsive width is set. In a range that has a value, Width (all size) and the presets do
            not change the size you see (they still set the default).
          </Text>
        )}
      </div>
    </Space>
  );

  const responsiveTab = (
    <div>
      <Text type="secondary" style={{ fontSize: 12 }}>Responsive width (%)</Text>
      <Segmented
        block
        size="small"
        className="mt-1"
        value={responsiveMode}
        onChange={(mode) => changeResponsiveMode(mode as ImageResponsiveMode)}
        options={[
          { label: "Container", value: "container" },
          { label: "Viewport", value: "viewport" },
        ]}
      />
      <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 4 }}>
        {responsiveMode === "container"
          ? "Measured on the content width."
          : "Measured on the browser window width."}{" "}
        A value replaces Width (all size) in its range; an empty range (and Large) keeps it.
      </Text>
      {RESPONSIVE_KEYS.map((key) => (
        <div key={key} className="mt-2">
          <label htmlFor={`rte-image-rw-${key}`}>
            {RESPONSIVE_NAMES[key]}{" "}
            <Text type="secondary" style={{ fontSize: 12 }}>({RESPONSIVE_RANGES[responsiveMode][key]})</Text>
          </label>
          <InputNumber<number>
            id={`rte-image-rw-${key}`}
            min={RESPONSIVE_MIN}
            max={RESPONSIVE_MAX}
            precision={0}
            value={draft.responsive?.[key] ?? null}
            formatter={formatPercent}
            parser={parsePercent}
            onChange={(val) => changeResponsiveWidth(key, val)}
            aria-describedby={`rte-image-rw-devices-${key}`}
            className="w-full mt-1"
          />
          <Text id={`rte-image-rw-devices-${key}`} type="secondary" style={{ fontSize: 11, display: "block" }}>
            {RESPONSIVE_DEVICES[responsiveMode][key]}
          </Text>
        </div>
      ))}
    </div>
  );

  const captionTab = (
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <Field label="Alt text">
        <Input placeholder="Alt text" value={draft.alt} onChange={(e) => set({ alt: e.target.value })} />
      </Field>
      <Field label="Caption">
        <Input placeholder="Caption text" value={draft.caption} onChange={(e) => set({ caption: e.target.value })} />
      </Field>
      {draft.caption && (
        <Field label="Caption Align">
          <AlignButtons value={draft.captionAlign} onChange={(captionAlign) => set({ captionAlign })} />
        </Field>
      )}
    </Space>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={null}
      footer={null}
      closeIcon={null}
      centered
      destroyOnHidden
      width="min(1100px, 95vw)"
      zIndex={1052}
      // Clicking the mask must not throw the staged edits away.
      mask={{ closable: false }}
      rootClassName="rte-image-edit max-md_antModalFull"
      styles={{ container: { padding: 0, overflow: "hidden" }, body: { padding: 0 } }}
    >
      <div className="rte-image-edit__layout w-full">
        <div className="rte-image-edit__preview">
          <Flex align="center" justify="space-between" gap={8} wrap>
            <Segmented
              size="small"
              value={previewRange}
              onChange={(v) => setPreviewRange(v as PreviewRange)}
              options={PREVIEW_RANGES.map((r) => ({ label: r.label, value: r.key }))}
            />
            <span className="rte-image-edit__info">
              Showing: {rangeInfo.label} · {effective ?? "natural size"}
            </span>
          </Flex>
          <div className="rte-image-edit__stage">
            <div className="rte-image-edit__frame" style={{ width: rangeInfo.frame }}>
              <ImageFigure
                src={image.src}
                alt={draft.alt}
                title={image.title}
                height={image.height}
                caption={draft.caption || null}
                captionAlign={draft.captionAlign}
                displayMode={draft.displayMode}
                align={draft.align}
                width={effective}
                responsive={null}
              />
              {/* Placeholder text, so float / align are visible */}
              <div className="rte-image-edit__lines" aria-hidden="true">
                <i /><i /><i /><i /><i /><i />
              </div>
            </div>
          </div>
        </div>

        <div className="rte-image-edit__panel">
          <div className="rte-image-edit__title">Edit image</div>
          <div className="rte-image-edit__tabs">
            <Tabs
              size="small"
              items={[
                { key: "layout", label: "Layout", children: layout },
                { key: "responsive", label: "Responsive", children: responsiveTab },
                { key: "caption", label: "Caption", children: captionTab },
              ]}
            />
          </div>
          <Flex justify="flex-end" gap={8} className="rte-image-edit__footer">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" disabled={!dirty} onClick={() => onSave(patch)}>
              Save
            </Button>
          </Flex>
        </div>
      </div>
    </Modal>
  );
};
