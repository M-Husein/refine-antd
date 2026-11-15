# 🧠 Master Blueprint & Design Concept: `FilePicker` Component

This document outlines the architectural specifications, interaction design, accessibility rules, and API contract for a modular **`FilePicker`** component supporting multiple file input methods (native, drag-and-drop, webcam, screen capture, smart paste) while remaining extensible for future integrations (File Manager & Cloud Storage).

## 1. Design Philosophy & Layout Blueprint (UI/UX)

The component utilizes a **Progressive Disclosure** pattern to keep the interface clean and uncluttered:

* **Primary Zone (Main Focus):** A unified, wide **Dropzone** area designed for the most common actions (clicking to choose files from disk or dragging-and-drop).
* **Secondary Action Bar:** Device capture buttons (Webcam/Selfie, Screen Capture) are neatly arranged below the primary area using Flexbox. These buttons automatically hide (*graceful degradation*) if the device/browser lacks support or is outside a secure context (`HTTPS` / `localhost`).
* **Future Expansion Slot:** A dedicated render prop (`renderExtra`) is provided to seamlessly inject future features (such as an internal File Manager or Google Drive API integration) without breaking the core layout structure.

## 2. Feature Breakdown & Behavior Specifications

### A. Features 1 & 2: Native Input & Drag-and-Drop

* **Default State:** Dashed border with neutral colors and a soft background. The entire area responds to clicks to trigger `<input type="file">`.
* **Drag-Over State:** When files are dragged over the area (`onDragOver`), the border turns solid with a primary accent color and a highlighted background.
* **Standard Validation:** Every incoming file (whether via click or drag) is validated against allowed file types (`accept`), maximum file size (`maxBytes`), and maximum file count (`maxFiles`).

### B. Features 3 & 4: Webcam Selfie & Screen Capture Modal

* **Feature Detection:** The component safely checks for `navigator.mediaDevices.getUserMedia` (webcam) and `getDisplayMedia` (screen capture) to prevent errors on unsupported browsers.
* **Modal Viewfinder & Review Flow:**
  1. Clicking the trigger opens a live stream preview modal.
  2. The user captures the photo or screen frame.
  3. The system converts the frame into a standard `File` object and injects it into the main file queue.
  4. Media streams are automatically stopped (*cleanup*) upon modal closure to turn off camera/screen indicator lights.

### C. Special Feature: Smart Paste (`paste={true}`)

* **Prop Control:** The feature is active only when `paste={true}` is explicitly passed.
* **Active Element Guard (Conflict Prevention):** The component must check `document.activeElement` before processing clipboard data. If the user is currently focused inside an `<input>`, `<textarea>`, `<select>`, or an element with `contenteditable="true"`, the paste action is **ignored** to avoid disrupting normal text typing.
* **3 Supported Clipboard Sources:**
  1. **Direct Files:** Copied files directly from the OS File Explorer (Windows/Mac).
  2. **Clipboard Images:** Screenshots or "Copy Image" from the web (automatically named with a timestamp).
  3. **URLs / Text Links:** If the text is a URL matching the `accept` parameter, the system automatically fetches it, converts it into a `Blob/File`, and adds it to the queue.

## 3. Accessibility (a11y) & Security Standards

* **Keyboard Accessibility:** The main dropzone features interactive attributes (`role="button"`, `tabIndex={0}`) enabling users to press `Enter` or `Space` to open the native file dialog.
* **Screen Reader Live Region:** Utilizes an `aria-live="polite"` container to announce file status updates (successful additions or validation errors) to screen readers.
* **Touch Targets:** All action buttons are designed with a minimum touch target size for comfortable use on mobile and desktop touchscreens.

## 4. API Contract & Props Interface (`FilePickerProps`)

Here is the clean, modern TypeScript interface structure based on your preferences:

```typescript
export type FileSource = 'local' | 'drag-drop' | 'webcam' | 'screen-capture' | 'file-manager' | 'google-drive';

export interface FileItem {
  id: string;
  file: File;
  previewUrl?: string;
  source: FileSource;
}

export interface FilePickerProps {
  value?: FileItem[];
  onChange?: (files: FileItem[]) => void;
  accept?: string;                  // Example: "image/*,.pdf,application/json"
  multiple?: boolean;
  maxBytes?: number;                // Maximum file size limit in bytes
  maxFiles?: number;                // Maximum number of files allowed
  
  // --- Feature Control Flags ---
  paste?: boolean;                  // Enables smart clipboard paste feature
  webcam?: boolean;                 // Enables webcam/selfie capture button & feature
  screenCapture?: boolean;          // Enables screen capture button & feature
  
  // --- Future Expansion Slot (Features 5 & 6) ---
  renderExtra?: () => React.ReactNode; // Custom render slot for future buttons (File Manager / Google Drive)
  
  disabled?: boolean;
  error?: string;
}
```