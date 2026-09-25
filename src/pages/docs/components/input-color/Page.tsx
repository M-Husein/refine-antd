import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
// import { Card } from 'antd';
import { InputColor } from '@/components/InputColor';

export default function Page(){
  useDocumentTitle("<InputColor />");

  const [color, setColor] = useState('');

  return (
    <div className="xl_max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<InputColor />"}</h1>

      <InputColor
        value={color}
        onChange={(_val, css) => setColor(css)}
      />
    </div>
  );
}
