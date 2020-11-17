/* eslint-disable arrow-body-style */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/prop-types */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
// import UserContext from '../context/UserContext';
// import Auth from '../store/auth'

const FALLBACK = '/login';

export const GuestRoute = ({ component: Component, userData, ...rest }) => {
  // const { userData } = useContext(UserContext);
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!userData.token || !userData.user) {
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
