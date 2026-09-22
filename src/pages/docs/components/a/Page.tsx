// import { useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
// import { Card } from 'antd';
import { Link } from 'react-router';
import { A } from '@/components/A';

export default function Page(){
  useDocumentTitle("<A /> - " + APP.name);

  return (
    <div className="xl_max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<A />"}</h1>

      <div className="space-x-2">
        <A href="/docs">Link</A>
        <b>-</b>
        <A As={Link} to="/docs">React Router Link</A>
        <b>-</b>
        <A href="/docs" disabled>Link disabled</A>
        <b>-</b>
        <A As={Link} to="/docs" disabled>React Router Link disabled</A>
      </div>
    </div>
  );
}
