import { useState, useCallback, useDeferredValue } from "react";
import { type ItemType } from "antd/lib/menu/interface";
import { Layout, Menu, Grid, Drawer, Input, Skeleton } from "antd";
import { FaList } from "react-icons/fa6"; // FaHouse, FaChevronLeft
// import { QuestionCircleFilled } from '@ant-design/icons'; // , SearchOutlined
import {
  // useTranslate,
  CanAccess,
  useMenu,
  // useRefineContext,
  type TreeMenuItem,
  // useWarnAboutChange,
  // useGetIdentity,
} from "@refinedev/core";
import { useThemedLayoutContext } from "@/hooks/useThemedLayoutContext";
// import { NavLink } from '@/components/router'; // , A
import { NavLink } from 'react-router';
import { debounce } from 'q-js-utils/debounce';
import { Img } from '@/components/Img';
import { recursiveFilter } from '@/utils/recursive';
import { Title } from './Title'; // Title as TitleDefault

const width = 235;
const collapsedWidth = 60;

export interface SiderProps {
  // user: any,
  loading?: boolean,
  disabled?: boolean,
  theme?: any, // 'light' | 'dark'
  Title?: any, // React.ReactElement
  render?: any,
  meta?: any,
}

export const Sider = ({
  // user: currentUser,
  loading,
  theme: colorScheme,
  // Title: TitleFromProps,
  render,
  meta,
  disabled,
  // activeItemDisabled = false,
}: SiderProps) => {
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu({ meta });
  // const { hasDashboard } = useRefineContext();
  const { siderCollapsed, setSiderCollapsed, mobileSiderOpen, setMobileSiderOpen } = useThemedLayoutContext();
  // const { warnWhen, setWarnWhen } = useWarnAboutChange();
  // const { data: currentUser } = useGetIdentity<any>();
  
  // const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  // const isMobile = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;
  const isMobile = !breakpoint.lg;
  // const searchInputRef = useRef<any>(null);

  const [searchOn, setSearchOn] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredSearchValue = useDeferredValue(searchValue);

  // Prevent change browser url if has pagination params
  const clickLink = (isSelected: boolean) => (e: any) => {
    if(disabled || (isSelected && window.location.search)){
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const renderTreeView = (tree: TreeMenuItem[], selectedKey?: string): ItemType[] => {
    return tree.map((item: TreeMenuItem) => {
      // const { icon, label, route, key, name, children, parentName, meta, options } = item;
      const { key, name, children, meta, list: route } = item;
      const parentName = meta?.parent;
      const label = item?.label ?? meta?.label ?? name;
      const icon = meta?.icon;
      // const route = list;
      // const resourceName = name?.toLowerCase();

      // SubMenu (if it has children)
      if (children.length) { // children.length > 0
        return {
          key: key,
          icon: icon ?? <FaList />,
          disabled,
          label: (
            <CanAccess
              key={key}
              resource={name} // resourceName
              action="list"
              params={{ resource: item }}
            >
              {label}
            </CanAccess>
          ),
          // Recursively call renderTreeView to get the 'children' array of objects
          children: renderTreeView(children, selectedKey),
          // The CanAccess wrapping logic is moved to the label for the SubMenu title
        } as ItemType; 
      }

      // MenuItem (leaf node)
      const isSelected = key === selectedKey;
      // const isRoute = !(pickNotDeprecated(meta?.parent, options?.parent, parentName) !== void 0 && children.length === 0);
      const isRoute = !(parentName !== void 0 && !children.length); // children.length === 0)
      // const isActiveLink = isSelected ? { cursor: 'auto' } : void 0;
      
      return {
        key: key,
        icon: icon ?? (isRoute && <FaList />),
        disabled,
        // style: isActiveLink,
        label: (
          <CanAccess
            key={key}
            resource={name} // resourceName
            action="list"
            params={{ resource: item }}
          >
            <NavLink
              // @ts-ignore
              to={route ?? ""}
              // to={{
              //   pathname: route ?? "",
              //   search: i18n.language !== APP.defaultLang ? `lang=${i18n.language}` : void 0
              // }}
              // style={isActiveLink}
              inert={isSelected || disabled}
              tabIndex={isSelected || disabled ? -1 : void 0}
              title={!isMobile && !siderCollapsed ? label : void 0}
              onClick={clickLink(isSelected)}
            >
              {label}
            </NavLink>
            {!siderCollapsed && isSelected && <div className="a-menu-tree-arrow" />}
          </CanAccess>
        )
      } as ItemType;
    }).filter(item => item != null) as ItemType[]; // Filter out nulls if CanAccess didn't render anything
  };
  
  const debouncedFilter = useCallback(debounce((val: string) => {
    // if (!val) {
    //   setSearchResult(menus); // Or empty array
    //   return;
    // }

    const searchTerm = val.toLowerCase();
    const result = recursiveFilter(
      menuItems, // menuItems | menus
      (item: any) => item.label.toLowerCase().includes(searchTerm)
    );

    // console.log('result:', result);

    setSearchResult(result);
    setSearchOn(false);

    /** @DEV_OPTION : Collapse all nested child */
    if(result.length){
      setTimeout(() => {
        document.querySelectorAll('.sider-menu [aria-expanded=false]')
          .forEach((item: any) => item.click());
      }, 9);
    }
  }, 500), [menuItems]); // menuItems | menus

  const onFilterMenu = (e: any) => {
    e.stopPropagation();
    let val = e.target.value;
    setSearchValue(val);

    let valTrim = val.trim();
    if(valTrim){
      setSearchOn(true);
      debouncedFilter(valTrim);
      return;
    }
    setSearchResult([]);
  }

  const toggleSiderCollapse = (collapsed: boolean) => {
    setSiderCollapsed(collapsed);
    localStorage.setItem('asideMin', collapsed ? '1' : '0')
  }

  const onSearch = (_val: any, e: any) => {
    e.stopPropagation();

    let isClick = e.type === "click";

    // Expand sider only large device
    if(!isMobile && siderCollapsed && isClick){
      // setSiderCollapsed(false);
      toggleSiderCollapse(false);
    }
    // Focus input search
    if(isClick && e.target.tagName !== "INPUT"){
      setTimeout(() => {
        document.getElementById('siderSearch')?.focus();
      }, 1);
    }
  }

  // const dashboardItem: ItemType | null = hasDashboard ? {
  //   key: "dashboard",
  //   icon: <FaHouse />,
  //   label: (
  //     <>
  //       <Link to="/">{translate("dashboard.title")}</Link>
  //       {!siderCollapsed && selectedKey === "/" && <div className="a-menu-tree-arrow" />}
  //     </>
  //   )
  // } : null;

  const searchValueTrim = !!deferredSearchValue.trim();
  const items = renderTreeView(
    searchValueTrim ? searchResult : menuItems, // menuItems | menus 
    selectedKey
  );

  // const finalMenuItems = [
  //   ...(dashboardItem ? [dashboardItem] : []),
  //   ...items
  // ];

  const renderSider = () => {
    // If render prop is used, we still provide the items array for compatibility
    if (render) {
      return render({
        // dashboard: dashboardItem, // Pass the item object
        // items: finalMenuItems,    // Pass the combined items array
        items, 
        logout: null,
        collapsed: siderCollapsed,
      });
    }
    // Default case now returns the combined array of ItemType objects
    return items; // finalMenuItems;
  };

  const renderNotFound = () => {
    if(!searchOn && searchValueTrim && !items.length){
      let notFound = "not found"; // t('notFound')
      return (
        <b 
          className="text-center p-4 cursor-help" 
          title={notFound}
        >
          ❓
          {siderCollapsed ? "" : " " + notFound}
        </b>
      );
    }
  };

  const renderMenu = () => {
    return (
      <>
        {!loading && (
          <Input.Search
            // ref={searchInputRef}
            allowClear
            variant="filled" // filled | borderless
            id="siderSearch"
            // aria-hidden={siderCollapsed}
            className="relative shadow overflow-hidden bg-gray-700 sider-search"
            classNames={{
              input: "placeholder-gray-400",
              button: {
                icon: "text-white"
              }
            }}
            autoComplete="off"
            autoCorrect="off"
            placeholder="Search"
            disabled={disabled}
            value={searchValue}
            onChange={onFilterMenu}
            onSearch={onSearch}
          />
        )}

        {/* Not Found info */}
        {renderNotFound()}
        
        <Menu
          theme={colorScheme}
          mode="inline"
          inlineIndent={9}
          className="py-2 q-scroll scroll-hover border-0 overflow-auto overscroll-contain flex-1 sider-menu"
          selectedKeys={selectedKey ? [selectedKey] : []}
          defaultOpenKeys={defaultOpenKeys}
          onClick={() => isMobile && setMobileSiderOpen(false)}
          items={
          loading ? 
            // If loading, return a placeholder item for the Skeleton
            [{ 
              key: 'L', 
              label: <Skeleton active title={false} paragraph={{ rows: 5 }} className="p-1" />,
              // Ensure it doesn't try to render as a group/submenu
              type: 'group' 
            }]
            :
            // Otherwise, render the items from renderSider()
            renderSider()
          }
        />

        {/* <div 
          className={"bg-yellow-400 text-white rounded-lg m-2 " + (siderCollapsed ? "p-1 text-center" : "p-3")}
        >
          <Button
            shape="circle"
            icon={<QuestionCircleFilled  />}
            className="text-yellow-400"
            disabled={disabled}
          />
          
          <div hidden={siderCollapsed}>
            <h3 className="mb-0 mt-2">Need help?</h3>
            <p>Please check our docs</p>
            <Button
              shape="round"
              className="font-bold"
              disabled={disabled}
            >
              DOCUMENTATION
            </Button>
          </div>
        </div> */}
      </>
    );
  };

  if (isMobile) {
    return (
      <Drawer
        open={mobileSiderOpen}
        onClose={() => setMobileSiderOpen(false)}
        placement="left"
        closable={false}
        size={275}
        styles={{
          body: { padding: 0, overflow: 'unset' }
        }}
        rootClassName="z-1052 drawerMain siderMain"
      >
        <Layout>
          <Layout.Sider
            theme={colorScheme}
            width={275}
            style={{
              height: '100vh',
            }}
          >
            {renderMenu()}
          </Layout.Sider>
        </Layout>
      </Drawer>
    );
  }

  const widthSider = siderCollapsed ? collapsedWidth : width;

  return (
    <>
      <div
        style={{
          width: widthSider,
          transition: 'all .2s',
        }}
      />

      <Layout.Sider
        theme={colorScheme}
        className="fixed top-0 z-10 h-screen siderMain" //  bg-nav
        id="asideMain"
        collapsible
        collapsed={siderCollapsed}
        onCollapse={(collapsed, type) => {
          type === "clickTrigger" && toggleSiderCollapse(collapsed)
        }}
        width={width}
        collapsedWidth={collapsedWidth}
        breakpoint="lg"
      >
        <div
          style={{ width: widthSider }}
          className={(siderCollapsed ? "!p-0 justify-center" : "p-4 justify-start") + " flex items-center h-12 shadow relative z-2"}
        >
          <Title
            collapsed={siderCollapsed}
            text={APP.name}
            icon={
              <Img 
                width={24} 
                height={24} 
                src="/favicon.svg" // logo
                fallback="/logo-32x32.png" // logo-36x36.png 
                alt={APP.name} 
              />
            }
            href="/"
          />
        </div>
        
        {renderMenu()}
      </Layout.Sider>
    </>
  );
}

// useEffect(() => {
//   const handleKeyDown = (e: any) => {
//     // console.log('e:', e);
//     if(e.ctrlKey && e.key.toLowerCase() === 'k'){
//       e.preventDefault();
//       e.stopPropagation();

//       let ariaHidden = searchInputRef.current.input.getAttribute('aria-hidden');
//       // console.log('searchInputRef.current:', searchInputRef.current);
//       // console.log('ariaHidden:', ariaHidden);
//       if(ariaHidden === 'true'){
//         toggleSiderCollapse(false);
//         setTimeout(() => searchInputRef.current?.focus({ preventScroll: true }), 1);
//         return;
//       }
//       searchInputRef.current?.focus({ preventScroll: true });
//     }
//   }

//   window.addEventListener('keydown', handleKeyDown, true);
  
//   return () => window.removeEventListener('keydown', handleKeyDown, true);
// }, []);
