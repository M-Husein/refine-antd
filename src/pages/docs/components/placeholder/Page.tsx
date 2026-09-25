// import { useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { Card } from 'antd';
import { Placeholder } from '@/components/Placeholder';

export default function Page(){
  useDocumentTitle("<Placeholder />");

  return (
    <div className="xl_max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<Placeholder />"}</h1>

      <div className="space-x-2">
        <Placeholder
          width={95}
          height={95}
          color="red" // fill
          fontSize="4.5rem"
        />

        <Placeholder
          color="yellow"
          fontSize={27}
          content={
            <div 
              className="text-center"
              style={{
                lineHeight: 1.2
              }}
            >
              Muhamad<br />
              Danish<br />
              Ali
            </div>
          }
          width={150}
        />
      </div>
    </div>
  );
}
