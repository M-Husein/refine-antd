import { HomeOutlined } from '@ant-design/icons'; // , UserOutlined, SettingOutlined, ToolOutlined, 
// import { AiOutlineHome } from "react-icons/ai";
// import { TbBowlSpoon } from "react-icons/tb";
// import { ImSpoonKnife } from "react-icons/im";
// import { LuFlag } from "react-icons/lu"; // LuUserRoundCog, 
// import { GrCurrency } from "react-icons/gr";
// import { PiMapPinAreaFill, PiCity, PiPhone } from "react-icons/pi";
import { FaCode } from "react-icons/fa";

export const RESOURCES: any[] = [
  {
    name: "home",
    list: "/docs", // /admin 
    meta: { label: "Home", icon: <HomeOutlined /> } 
  },
  
  {
    name: "components",
    meta: { icon: <FaCode /> }, 
  },
  {
    name: "a",
    list: "/docs/components/a",
    meta: { parent: "components", label: "A", icon: <FaCode /> },
  },
  {
    name: "img",
    list: "/docs/components/img",
    meta: { parent: "components", label: "Img", icon: <FaCode /> },
  },
  {
    name: "form",
    list: "/docs/components/form",
    meta: { parent: "components", label: "Form", icon: <FaCode /> },
  },
  {
    name: "input-color",
    list: "/docs/components/input-color",
    meta: { parent: "components", label: "InputColor", icon: <FaCode /> },
  },
  {
    name: "avatar",
    list: "/docs/components/avatar",
    meta: { parent: "components", label: "Avatar", icon: <FaCode /> },
  },
  {
    name: "placeholder",
    list: "/docs/components/placeholder",
    meta: { parent: "components", label: "Placeholder", icon: <FaCode /> },
  },
  {
    name: "image-editor",
    list: "/docs/components/image-editor",
    meta: { parent: "components", label: "ImageEditor", icon: <FaCode /> },
  },
  {
    name: "icon-picker",
    list: "/docs/components/icon-picker",
    meta: { parent: "components", label: "IconPicker", icon: <FaCode /> },
  },
  {
    name: "theme-editor",
    list: "/docs/theme-editor",
    meta: { label: "Theme Editor", icon: <b>🎨</b> }
  },
  {
    name: "devs",
    list: "/docs/devs",
    meta: { label: "Devs" } // , icon: <b>⚙️</b>
  },
];
