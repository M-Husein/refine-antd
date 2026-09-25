import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
import { Input, Button } from 'antd';
import { Form } from '@/components/forms/Form';

export default function Page(){
  useDocumentTitle("<Form />");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (evt: React.SyntheticEvent) => {
    evt.preventDefault();
    
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3e3);
  };

  return (
    <div className="xl_max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<Form />"}</h1>

      <Form
        disabled={isSubmitted}
        onSubmit={handleSubmit}
      >
        <label htmlFor="name">Name</label>
        <Input
          name="name"
          id="name"
          className="mt-1 mb-2"
          disabled={isSubmitted}
        />

        <Button
          htmlType="submit"
          type="primary"
          loading={isSubmitted}
        >
          Submit
        </Button>
      </Form>
    </div>
  );
}
