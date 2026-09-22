import { useEffect, useRef } from 'react';
// import { useCustom } from '@refinedev/core';
import dataIcon from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { customData } from './parts/constants';

export interface EmojiMartProps {
  onEmojiSelect?: (emoji: any) => void;
  onAddCustomEmoji?: (emoji: any) => void;
  onClickOutside?: (event: MouseEvent) => void;
  theme?: 'auto' | 'light' | 'dark';
  set?: 'native' | 'apple' | 'facebook' | 'google';
  skin?: 1 | 2 | 3 | 4 | 5 | 6;
  icons?: 'auto' | 'outline' | 'solid';
  locale?: string;
  maxReactions?: number;
  previewPosition?: 'top' | 'bottom' | 'none';
  searchPosition?: 'sticky' | 'static' | 'none';
  navPosition?: 'top' | 'bottom' | 'none';
  perLine?: number;
  skinTonePosition?: 'head' | 'headline' | 'search' | 'none';
  categories?: string[];
  categoryIcons?: Record<string, any>;
  dynamicWidth?: boolean;
  autoFocus?: boolean;
  noCountryFlags?: boolean;
  showSkinTones?: boolean;
  // Allow index signature so pass-through props still work
  [key: string]: any;
}

export interface IconPickerProps extends EmojiMartProps, React.HTMLAttributes<HTMLDivElement> {}

export const IconPicker = ({ 
  className, 
  style, 
  ...etc 
}: IconPickerProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(divRef.current){
      const picker = divRef.current.querySelector('em-emoji-picker') as HTMLElement & {
        shadowRoot: ShadowRoot;
      };

      if (picker?.shadowRoot && !picker.shadowRoot.getElementById('qCss')) {
        const style = document.createElement('style');
        
        // const fontFamily = window.getComputedStyle((document.getElementById('root') as any).childNodes[0])?.fontFamily || 'inherit';
        const fontFamily = window.getComputedStyle(document.documentElement) // document.body
          .getPropertyValue('--q-font-family')
          .trim() || 'inherit';

        // console.log({ fontFamily });
        
        style.id = "qCss";
        style.textContent = `.emoji-mart-emoji span{font-family:${fontFamily}!important}.emoji-mart-emoji img{width:100%;object-fit:contain}.scroll{scrollbar-width:thin;scrollbar-color:#aaa #0000}`;
        picker.shadowRoot.appendChild(style);
      }
    }
  }, []);

  return (
    <div 
      ref={divRef} 
      className={className} 
      style={style}
    >
      <Picker 
        // theme="light"
        // skinTonePosition="none"
        {...etc}
        data={dataIcon} //  || {}
        custom={customData}
        // onAddCustomEmoji={() => console.log('onAddCustomEmoji')}
      />
    </div>
  );
}

/*
const {
    data: dataIcon,
    isLoading,
    isFetching,
    isRefetching,
  } = useCustom({
    method: "get",
    url: "json/emoji-mart.json",
    meta: {
      prefixUrl: "/", // window.location.origin + 
      cases: () => true,
    },
    queryOptions: {
      staleTime: 1.8e+6 // 30 minutes
    }
  });

  // console.log({ dataIcon });

  let loadingIcons = isLoading || isFetching || isRefetching;

  useEffect(() => {
    if(!loadingIcons && divRef.current){
      const picker = divRef.current.querySelector('em-emoji-picker') as any;
      if (picker) {
        if (!picker.shadowRoot.getElementById('qCss')) {
          const style = document.createElement('style');
          style.id = "qCss";
          style.textContent = `.emoji-mart-emoji img{width:100%;object-fit:contain}.scroll{scrollbar-width:thin;scrollbar-color:#aaa #0000}`;
          picker.shadowRoot.appendChild(style);
        }
      }
    }
  }, [loadingIcons]);
*/
