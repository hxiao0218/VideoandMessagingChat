/* eslint-disable quotes */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
// import React, { Suspense, lazy } from 'react';
import React from "react";
import { Switch, Route } from "react-router-dom";
import { PrivateRoute } from "./_private";
import { GuestRoute } from "./_guest";
import MainView from "../components/MainView";
import Home from "../components/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import Profile from "../components/Profile";
import PostCarousel from "../components/PostCarousel";
import CreatePost from "../components/CreatePost";
import NewPassword from "../components/NewPassword";
import Reset from "../components/Reset";

// const Loading = () => <h1>Loading ...</h1>;

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/login",
    component: Login,
    guest: true,
  },
  {
    path: "/main",
    component: MainView,
    private: true,
  },
  {
    path: "/register",
    component: Register,
    guest: true,
  },
  {
    path: "/profile",
    component: Profile,
    private: true,
  },
  {
    path: "/create",
    component: CreatePost,
    private: true,
  },
  {
    path: "/posts",
    component: PostCarousel,
    private: true,
  },
  {
    path: "/reset",
    component: Reset,
    guest: true,
  },
  {
    path: "/reset/:token",
    component: NewPassword,
    noExact: true,
    guest: true,
  },

  // {
  //   path: '404', // 404 fallback
  //   noExact: true, // all route "exact" by default
  //   component: '404',
  // },
];

// console.log(`../components/${routes[0].component}`);

// const views = (path) => lazy(() => import(`../components/${path}`));
// const view_auth = (path) => lazy(() => import(`../components/auth/${path}`));
// const view_home = (path) => lazy(() => import(`../components/pages/${path}`));

const router = React.memo(({ userData }) => (
  // <Suspense fallback={<Loading />}>
  <Switch>
    {routes.map((route, index) => {
      if (route.path !== "404") {
        if (route.private) {
          return route.noExact ? (
            <PrivateRoute
              key={index}
              path={route.path}
              component={route.component}
            />
          ) : (
            <PrivateRoute
              key={index}
              exact
              path={route.path}
              component={route.component}
              userData={userData}
            />
          );
        }
        if (route.guest) {
          return route.noExact ? (
            <GuestRoute
              key={index}
              path={route.path}
              component={route.component}
            />
          ) : (
            <GuestRoute
              key={index}
              exact
              path={route.path}
              component={route.component}
              userData={userData}
            />
          );
        }

        return route.noExact ? (
          <Route key={index} path={route.path} component={route.component} />
        ) : (
          <Route
            key={index}
            exact
            path={route.path}
            component={route.component}
          />
        );
      }
      return <Route key={index} component={route.component} />;
    })}
  </Switch>
  // </Suspense>
));

export default router;
