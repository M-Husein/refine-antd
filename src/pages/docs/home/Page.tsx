// import { useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { type HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
import { Card } from 'antd';

export default function Page(){
  useDocumentTitle("Home");

  return (
    <div className="py-4 px-2 xl_max-w-screen-xl mx-auto">
      <Card 
        title="Home"
        className="shadow"
      >
        {/* @ts-ignore */}
        {/* {UNDEFINED} */}
      </Card>
    </div>
  );
}
