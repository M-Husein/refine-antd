import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
// import { Card } from 'antd';
import { ImageEditor } from '@/components/ImageEditor';

export default function Page(){
  useDocumentTitle("<ImageEditor />");

  const [file, setFile] = useState<string | null>(null);

  const handleFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    let newFile = evt.target.files?.[0];
    if (newFile) {
      if (file) {
        URL.revokeObjectURL(file); // Clean up previous object URL
      }
      setFile(URL.createObjectURL(newFile));
    }

    // Clear the event target value to give the possibility to upload the same image:
    evt.target.value = '';
  };

  useEffect(() => {
    // Revoke the object URL, to allow the garbage collector to destroy the uploaded before file
    return () => {
      if (file) URL.revokeObjectURL(file);
    }
  }, [file]);

  return (
    <div className="xl_max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<ImageEditor />"}</h1>

      <p>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </p>

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
