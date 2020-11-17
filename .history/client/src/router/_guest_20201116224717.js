/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/prop-types */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import UserContext from '../context/UserContext';
// import Auth from '../store/auth'

const FALLBACK = '/login';

export const GuestRoute = ({ component: Component, ...rest }) => {
  const { loggedIn } = useContext(UserContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!loggedIn) {
          return <Component {...props} />;
        }
        return (
          <Redirect to={{
            pathname: FALLBACK,
            state: {
              from: props.location,
            },
          }}
          />
        );
      }}
    />
  );
};
