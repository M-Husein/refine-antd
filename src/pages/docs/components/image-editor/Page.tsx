import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
// import { Card } from 'antd';
import { ImageEditor } from '@/components/ImageEditor';
import { FilePicker, type FilePickerProps } from '@/components/FilePicker';

export default function Page(){
  useDocumentTitle("<ImageEditor />");

  const [file, setFile] = useState<string | null>(null);

  const handleFileChange: FilePickerProps['onChange'] = ({ fileList }) => {
    const newFile = fileList[fileList.length - 1]?.originFileObj;
    if (newFile) {
      if (file) {
        URL.revokeObjectURL(file); // Clean up previous object URL
      }
      setFile(URL.createObjectURL(newFile));
    }
  };

  useEffect(() => {
    // Revoke the object URL, to allow the garbage collector to destroy the uploaded before file
    return () => {
      if (file) URL.revokeObjectURL(file);
    }
  }, [file]);

  return (
    <div className="max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<ImageEditor />"}</h1>

      <div className="mb-4">
        <FilePicker
          accept="image/*"
          maxCount={1}
          pastable
          webcam
          screenCapture
          showUploadList={false}
          // Keep the file in the browser only, do not upload
          beforeUpload={() => false}
          onChange={handleFileChange}
        />
      </div>

      {!file && (
        <div style={{ padding: 20, textAlign: 'center' }}>
          Please upload an image to start editing.
        </div>
      )}

      <ImageEditor 
        value={file} 
        // disabled
      />
    </div>
  );
}
