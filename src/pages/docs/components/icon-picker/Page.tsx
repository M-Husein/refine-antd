// import { useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
// import { Card } from 'antd';
import { IconPicker } from '@/components/IconPicker';

export default function Page(){
  useDocumentTitle("<IconPicker /> - " + APP.name);

  return (
    <div className="xl_max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<IconPicker />"}</h1>

      <div className="space-y-4">
        <IconPicker
          theme="light"

        />


      </div>
    </div>
  );
}
