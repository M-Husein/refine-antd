// import { useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
// import { Card } from 'antd';
import { Img } from '@/components/Img';

export default function Page(){
  useDocumentTitle("<Img /> - " + APP.name);

  return (
    <div className="xl_max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<Img />"}</h1>

      <div className="space-x-2">
        <Img 
          // width={24} 
          // height={24} 
          // alt="" 
          src="/media/img/vite-refine-antd.jpeg" 
          className="max-w-full h-auto"
        />
      </div>
    </div>
  );
}
