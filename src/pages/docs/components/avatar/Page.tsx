// import { useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
// import { Card } from 'antd';
import { Avatar } from '@/components/Avatar';

const SIZES = [50, 70, 90, 110, 130, 150];

const AVATAR_SRC = [
  {
    src: 'hijab_girl_1.jpg',
    alt: 'Fairuz'
  },
  {
    src: 'hijab_girl_2.webp',
    alt: 'Jean'
  },
  {
    src: 'hijab_girl_3.jpg',
    alt: 'Anisa'
  },
  {
    src: 'hijab_girl_4.jpg',
    alt: 'Jasmine'
  },
];

export default function Page(){
  useDocumentTitle("<Avatar />");

  return (
    <div className="xl_max-w-screen-xl mx-auto">
      <h1 className="h4 mb-4">{"<Avatar />"}</h1>

      <div className="space-x-2">
        <Avatar 
          // https://api.dicebear.com/6.x/adventurer/svg?seed=Annie&backgroundColor=b6e3f4
        />

        {AVATAR_SRC.map(item => (
          <Avatar
            key={item.src}
            src={"/media/img/avatars/" + item.src}
            size={75}
            alt={item.alt}
            className="rounded-full"
          />
        ))}

        <Avatar
          src={`https://api.dicebear.com/6.x/adventurer/svg?seed=Johny&backgroundColor=b6e3f4`}
          size={75}
          alt="Johny"
          className="rounded-full"
        />

        <Avatar
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8dXNlcnxlbnwwfHwwfHw%3D&w=1000&q=80"
          size={75}
          alt="Catherine Missal"
          className="rounded-full"
        />
      </div>

      <div className="space-x-2 mt-4">
        {SIZES.map(item => (
          <Avatar
            key={item}
            src={"/media/img/avatars/" + item}
            size={item}
            alt={item + ""}
            className="rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
