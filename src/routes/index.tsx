import { lazy, Suspense } from "react";
import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router"; // NavigateToResource
import { Outlet } from "react-router";
import { View as ErrorComponent } from '@/components/views/errors/View';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SplashScreen } from '@/components/SplashScreen';
import { Layout } from '@/components/layout/main/Layout';
import { lazyComponent } from '@/utils/components';

const LayoutAdmin = lazy(() => import('@/components/layout/admin/default'));

const lazyApp = (component: any) => (
  <ErrorBoundary>
    <Suspense fallback={<SplashScreen />}>
      {component}
    </Suspense>
  </ErrorBoundary>
);

const PrivateRoute = ({ children }: any) => (
  <Authenticated
    key="authenticated-inner"
    fallback={<CatchAllNavigate to="/login" />}
  >
    {children}
  </Authenticated>
);

const LayoutAdminApp = () => (
  <PrivateRoute>
    {lazyApp(
      <LayoutAdmin>
        <Outlet />
      </LayoutAdmin>
    )}
  </PrivateRoute>
);

// const LayoutAuth = () => (
//   <Authenticated
//     key="authenticated-outer"
//     fallback={<Outlet />}
//   >
//     <NavigateToResource />
//   </Authenticated>
// );

// Pages:
// const AuthSocial = lazy(() => import('@/pages/auth-social/Page'));

// Settings
// const AppSettings = lazy(() => import('@/pages/admin/settings/app/Page'));

// const ShowUser = lazy(() => import('@/pages/admin/settings/users/Show'));
// const CreateUser = lazy(() => import('@/pages/admin/settings/users/Create'));

// const RolesPermissions = lazy(() => import('@/pages/admin/settings/roles-permissions/Page'));
// const Teams = lazy(() => import('@/pages/admin/settings/teams/Page'));
// const ShowTeam = lazy(() => import('@/pages/admin/settings/teams/Show'));

// const Currencies = lazy(() => import('@/pages/admin/currencies/Page'));
// const City = lazy(() => import('@/pages/admin/city/Page'));
// const Province = lazy(() => import('@/pages/admin/province/Page'));
// const Country = lazy(() => import('@/pages/admin/country/Page'));

export const routes: any[] = [
  {
    path: "/",
    element: <Layout><Outlet /></Layout>,
    children: [
      { 
        index: true, 
        element: lazyComponent(lazy(() => import('@/pages/home/Page')), <SplashScreen />) 
      },
      // { 
      //   path: "articles", 
      //   element: lazyComponent(lazy(() => import('@/pages/articles/Page')), <SplashScreen />) 
      // },
      // { 
      //   path: "contact-us", 
      //   element: lazyComponent(lazy(() => import('@/pages/contact-us/Page')), <SplashScreen />) 
      // },

      // Private
      // {
      //   element: (
      //     <PrivateRoute>
      //       <Outlet />
      //     </PrivateRoute>
      //   ),
      //   children: [
      //     { 
      //       path: "settings", 
      //       element: lazyComponent(lazy(() => import('@/pages/settings/Page')), <SplashScreen />) 
      //     },
      //     // { 
      //     //   path: "editor", 
      //     //   element: lazyComponent(lazy(() => import('@/pages/editor/Page')), <SplashScreen />) 
      //     // },
      //   ]
      // },
    ],
  },

  {
    path: "docs", 
    element: <LayoutAdminApp />,
    children: [
      { 
        index: true, 
        element: lazyComponent(lazy(() => import('@/pages/docs/home/Page'))) 
      },
      {
        path: "components", 
        children: [
          // { 
          //   index: true, 
          //   element: lazyComponent(lazy(() => import('@/pages/docs/components/a/Page'))) 
          // },
          { 
            path: "a", 
            element: lazyComponent(lazy(() => import('@/pages/docs/components/a/Page'))) 
          },
          { 
            path: "img", 
            element: lazyComponent(lazy(() => import('@/pages/docs/components/img/Page'))) 
          },
          { 
            path: "form", 
            element: lazyComponent(lazy(() => import('@/pages/docs/components/form/Page'))) 
          },
          { 
            path: "input-color", 
            element: lazyComponent(lazy(() => import('@/pages/docs/components/input-color/Page'))) 
          },
          { 
            path: "avatar", 
            element: lazyComponent(lazy(() => import('@/pages/docs/components/avatar/Page'))) 
          },
          { 
            path: "placeholder", 
            element: lazyComponent(lazy(() => import('@/pages/docs/components/placeholder/Page'))) 
          },
          { 
            path: "image-editor", 
            element: lazyComponent(lazy(() => import('@/pages/docs/components/image-editor/Page'))) 
          },
          { 
            path: "icon-picker", 
            element: lazyComponent(lazy(() => import('@/pages/docs/components/icon-picker/Page'))) 
          },
        ]
      },
      { 
        path: "theme-editor", 
        element: lazyComponent(lazy(() => import('@/pages/docs/theme-editor/Page'))) 
      },
      { 
        path: "devs", 
        element: lazyComponent(lazy(() => import('@/pages/docs/devs/Page'))) 
      },
      // {
      //   path: "currencies", 
      //   children: [
      //     { index: true, element: lazyComponent(Currencies) },
      //     // { path: ":id", element: lazyComponent(ShowTeam) },
      //   ]
      // },

      // {
      //   path: "settings",
      //   children: [
      //     // { path: "app", element: lazyComponent(AppSettings) },
      //     {
      //       path: "users",
      //       children: [
      //         { 
      //           index: true, 
      //           element: lazyComponent(lazy(() => import('@/pages/admin/settings/users/Page'))) 
      //         },
      //         // { path: "create", element: lazyComponent(CreateUser) },
      //         // { path: ":id", element: lazyComponent(ShowUser) },
      //       ],
      //     },
      //   ],
      // },
    ]
  },

  // {
  //   path: "auth/reset-password",
  //   element: lazyComponent(ResetPassword, <SplashScreen />)
  // },
  // {
  //   path: "auth/social/callback/:provider",
  //   children: [
  //     { index: true, element: lazyComponent(AuthSocial, <SplashScreen />) },
  //   ],
  // },

  // {
  //   path: '/', 
  //   element: <LayoutAuth />,
  //   children: [
  //     { 
  //       path: "login", 
  //       element: lazyComponent(lazy(() => import('@/pages/login/Page')), <SplashScreen />) 
  //     },
  //     { 
  //       path: "register", 
  //       element: lazyComponent(lazy(() => import('@/pages/register/Page')), <SplashScreen />) 
  //     },
  //     { 
  //       path: "forgot-password", 
  //       element: lazyComponent(lazy(() => import('@/pages/forgot-password/Page')), <SplashScreen />) 
  //     },
  //     { 
  //       path: "reset-password", 
  //       element: lazyComponent(lazy(() => import('@/pages/reset-password/Page')), <SplashScreen />) 
  //     },
  //     // { 
  //     //   path: "auth/:provider/callback", 
  //     //   element: lazyComponent(lazy(() => import('@/pages/auth/socials/Page')), <SplashScreen />) 
  //     // },
  //   ],
  // },

  // { path: "403", Component: <ErrorComponent code={403} /> },
  { path: "*", Component: ErrorComponent },
];
