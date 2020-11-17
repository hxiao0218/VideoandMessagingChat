/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';

import { PrivateRoute } from './_private';
import { GuestRoute } from './_guest';

const Loading = () => <h1>Loading ...</h1>;

const routes = [
  {
    path: '/',
    component: 'Home',
  },
  {
    path: '/login',
    component: 'Login',
    guest: true,
  },
  {
    path: '/main',
    component: 'MainView',
    private: true,
  },
  {
    path: '/register',
    component: 'Register',
    guest: true,
  },
  {
    path: '/profile',
    component: 'Profile',
    private: true,
  },
  {
    path: '404', // 404 fallback
    noExact: true, // all route "exact" by default
    component: '404',
  },
];

const views = (path) => lazy(() => import(`../components/${path}`));
// const view_auth = (path) => lazy(() => import(`../components/auth/${path}`));
// const view_home = (path) => lazy(() => import(`../components/pages/${path}`));

const router = () => (
  <Suspense fallback={<Loading />}>
    <Switch>
      {routes.map((route, index) => {
        if (route.path !== '404') {
          if (route.private) {
            return route.noExact
              ? <PrivateRoute key={index} path={route.path} component={views(route.component)} />
              : <PrivateRoute key={index} exact path={route.path} component={views(route.component)} />;
          }
          if (route.guest) {
            return route.noExact
              ? <GuestRoute key={index} path={route.path} component={views(route.component)} />
              : <GuestRoute key={index} exact path={route.path} component={views(route.component)} />;
          }

          return route.noExact
            ? <Route key={index} path={route.path} component={views(route.component)} />
            : <Route key={index} exact path={route.path} component={views(route.component)} />;
        }
        return <Route key={index} component={views(route.component)} />;
      })}
    </Switch>
  </Suspense>
);

export default router;
