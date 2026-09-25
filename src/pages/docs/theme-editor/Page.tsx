import { useState, StrictMode } from "react"; // useEffect, 
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
// import { useGetIdentity } from "@refinedev/core";
import { Button, ConfigProvider, message, theme as antdTheme } from 'antd';
import antdID from 'antd/locale/id_ID';
import type { Theme } from 'antd-token-previewer';
import {
  enUS,
  parsePlainConfig,
  // parseThemeConfig,
  ThemeEditor,
  // zhCN,
} from 'antd-token-previewer';
import idID from './parts/id-ID';

// const ANT_DESIGN_V5_CUSTOM_THEME_PRO = 'ant-design-v5-custom-theme';

export default function Page(){
  useDocumentTitle("Theme Editor");

  // const identity = useGetIdentity(); // { data: identity }
  // // console.log('identity:', identity);

  // const globalToken = antdTheme.getDesignToken();

  const [messageApi, contextHolder] = message.useMessage();
  const [lang, setLang] = useState('en-US'); // zh-CN
  const [advanced, setAdvanced] = useState(true);
  const [mode, setMode] = useState<any>('global'); // ThemeEditorMode
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState<Theme>({
    name: 'Custom Theme',
    key: 'refine_antd_theme',
    config: {
      // token: {
      //   ...globalToken,
      //   // motion: false,
      //   // colorBgLayout: "var(--q-bg-main)",
      // }, 
    },
  });

  // console.log({ 
  //   globalToken, 
  //   // dark: antdTheme.darkAlgorithm,
  //   // compact: antdTheme.compactAlgorithm, 
  // });

  const handleThemeChange = (newTheme: Theme) => {
    console.log(newTheme);
    setTheme(newTheme);
  };

  // useEffect(() => {
  //   const storedConfig = localStorage.getItem(ANT_DESIGN_V5_CUSTOM_THEME_PRO);
  //   if (storedConfig) {
  //     setTheme((prev) => ({
  //       ...prev,
  //       config: parseThemeConfig(JSON.parse(storedConfig)),
  //     }));
  //   }
  // }, []);

  const handleSave = () => {
    console.log(theme.config, parsePlainConfig(theme.config));
    // localStorage.setItem(
    //   ANT_DESIGN_V5_CUSTOM_THEME_PRO,
    //   JSON.stringify(parsePlainConfig(theme.config)),
    // );
    messageApi.success('Successfully saved');
  };

  return (
    <StrictMode>
      {contextHolder}

      <ConfigProvider
        locale={lang === 'id-ID' ? antdID : undefined}
        theme={{
          hashed: true,
          algorithm: isDark ? antdTheme.darkAlgorithm : undefined,
        }}
      >
        <ThemeEditor
          theme={theme}
          onThemeChange={handleThemeChange}
          locale={lang === 'id-ID' ? idID : enUS}
          advanced={advanced}
          onAdvancedChange={setAdvanced}
          mode={mode}
          onModeChange={setMode}
          actions={
            <>
              <Button
                type="text"
                icon={lang === 'id-ID' ? 'ID' : 'EN'}
                onClick={() => setLang(lang === 'en-US' ? 'id-ID' : 'en-US')}
                style={{ marginRight: 8 }}
              />
              <Button
                type="text"
                // icon={
                //   isDark ? (
                //     <DarkTheme style={{ fontSize: 16 }} />
                //   ) : (
                //     <Light style={{ fontSize: 16 }} />
                //   )
                // }
                icon={<b>{isDark ? "🌛" : "🌞"}</b>}
                onClick={() => setIsDark(!isDark)}
                style={{ marginRight: 8 }}
              />
              <Button type="primary" onClick={handleSave}>
                Save
              </Button>
            </>
          }
        />
      </ConfigProvider>
    </StrictMode>
  );
}
