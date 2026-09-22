// import { LuCrop, LuSquare } from "react-icons/lu";
// import { FaCropSimple } from "react-icons/fa6";
import type { PresetName } from '../useImageFilters';

export const aspectRatioOptions = [
  { 
    label: 'Freeform', 
    value: '', 
    // icon: LuCrop
  },
  { 
    label: '1:1 - Square', // e.g Instagram
    value: 1 / 1, 
    // icon: LuSquare
  },
  { 
    label: '2:3 - Portrait', 
    value: 2 / 3, 
    // icon: LuSquare
  },
  { 
    label: '4:3 - Standard Photo', 
    value: 4 / 3, 
    // icon: LuSquare
  },
  { 
    label: '3:4 - Portrait Photo', 
    value: 3 / 4, 
    // icon: LuSquare
  },
  { 
    label: '16:9 - Widescreen / Video', 
    value: 16 / 9, 
    // icon: LuSquare
  },
  { 
    label: '9:16 - Story / TikTok / Reel', 
    value: 9 / 16, 
    // icon: LuSquare
  },
  { 
    label: '3:2 - Classic DSLR', 
    value: 3 / 2, 
    // icon: LuSquare
  },
  { 
    label: '2:1 - Header / Banner', 
    value: 2 / 1, 
    // icon: LuSquare
  },
];

export const presetOptions: PresetName[] = [
  'None',
  'Sepia',
  'Grayscale',
  'Vintage',
  'Warm',
  'Cool',
  'Dramatic',
];

export const presetSelectOptions = presetOptions.map(value => ({
  label: value,
  value
}));
