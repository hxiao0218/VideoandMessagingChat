import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import UserContext from '../context/UserContext';
// import Auth from '../store/auth'

const FALLBACK = '/login';
const { loggedIn } = useContext(UserContext);

export const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (Auth.state.logged) {
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
