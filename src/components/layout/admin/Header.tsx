// import { useMemo } from "react";
// import type { IUser } from '@/types/Types';
import { useGetIdentity } from "@refinedev/core"; // , useWarnAboutChange, useTranslate, useLogout
import { Layout, Dropdown, Button, Avatar, Grid } from "antd"; // Modal, Switch, Badge,
import { UserOutlined } from '@ant-design/icons'; // , MoonFilled, SunFilled, SettingOutlined
import { FaBars } from "react-icons/fa6";
// import { NavLink } from "react-router"; // useLocation,
// import { NavLink } from "@/components/router";
// import { LanguageMenu } from '@/components/LanguageMenu';
import { Img } from '@/components/Img';
// import { useLogoutAlert } from '@/hooks/useLogoutAlert';
import { useThemedLayoutContext } from "@/hooks/useThemedLayoutContext";

// const overlayStyle = {
//   left: 'auto',
//   right: 0
// };

export const Header = () => {
  // const translate = useTranslate();
  // const [modalApi, modalContextHolder] = Modal.useModal();
  // const { mutate, mutation: { isPending } } = useUpdate();
  const { setMobileSiderOpen } = useThemedLayoutContext();
  const breakpoint = Grid.useBreakpoint();
  // const isMobile = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;
  const isMobile = !breakpoint.lg;
  
  const { data: currentUser, refetch } = useGetIdentity<any>(); // IUser
  // const { mutate: mutateLogout, isPending: isPendingLogout } = useLogout();
  // const { warnWhen, setWarnWhen } = useWarnAboutChange();
  
  const { name, username, email, avatar } = currentUser || {};
  const fixName = name || username;

  // useLogoutAlert(modalApi);

  // const doLogout = () => {
  //   if(!warnWhen){
  //     mutateLogout();
  //     return;
  //   }

  //   if(window.confirm(translate("warnWhenUnsavedChanges"))){
  //     setWarnWhen(false);
  //     mutateLogout();
  //   }
  // }

  return (
    <Layout.Header
      style={{ padding: '0 14px' }}
      className="bg-nav !sticky h-12 flex items-center top-0 z-1051 shadow"
      id="navMain"
    >
      {isMobile && (
        <a 
          href="/"
          className="py-2 px-1 flex-none"
        >
          <Img 
            width={24} 
            height={24} 
            src="/favicon.svg" // logo.svg
            fallback="/logo-32x32.png" // logo-36x36.png 
            alt={APP.name} 
          />
        </a>
      )}

      <div className="relative h-12 ml-auto flex items-center">
        {/* <div className="h-full flex items-center relative mx-3">
          <LanguageMenu
            overlayStyle={overlayStyle}
            // user={currentUser}
          />
        </div> */}

        <Dropdown
          getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentElement!}
          // styles={{ root: overlayStyle }}
          trigger={['click']}
          classNames={{
            root: "max-md_w-screen"
          }}
          placement={isMobile ? "bottom" : "bottomRight"}
          menu={{
            items: [
              {
                key: "/settings",
                label: (
                  <a // NavLink 
                    href="/" // to
                    className="flex items-center justify-center"
                  >
                    <Avatar
                      size={55}
                      shape="square"
                      icon={<UserOutlined />}
                      src={avatar}
                      alt={fixName}
                      style={{ fontSize: 29 }}
                    />
                    <section className="md_w-48 flex-1 ml-3">
                      {!!fixName && (
                        <strong className="text-lg leading-6">
                          {fixName}
                        </strong>
                      )}
                      
                      {email && (
                        <div className="text-sm text-gray-500 truncate">
                          {email}
                        </div>
                      )}
                    </section>
                  </a>
                )
              },
              // {
              //   type: "divider"
              // },
              // {
              //   key: 2,
              //   label: "Logout",
              //   disabled: isPendingLogout,
              //   onClick: doLogout
              // }
            ],
          }}
        >
          <Button 
            type="text"
            className="flex items-center !p-0" //  h-full
          >
            <Avatar
              size={30}
              shape="square"
              icon={<UserOutlined />}
              src={avatar}
              // src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
              alt={fixName}
              // crossOrigin="anonymous"
              style={{ display: 'flex' }}
            />
          </Button>
        </Dropdown>

        <b 
          hidden
          className="btnRefetchUser"
          onClick={() => refetch()} 
        />
      </div>

      {isMobile && (
        <Button
          type="text"
          size="large"
          icon={<FaBars />}
          className="ml-2 -mr-3"
          onClick={() => setMobileSiderOpen(true)}
        />
      )}

      {/* {modalContextHolder} */}
    </Layout.Header>
  );
};
