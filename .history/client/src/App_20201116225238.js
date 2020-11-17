/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
import './App.css';
import React, { useState, useEffect } from 'react';
// import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import Axios from 'axios';
// import MainView from './components/MainView';
// import Header from './components/layout/Header';
// import Home from './components/Home';
// import Login from './components/Login';
// import Register from './components/Register';
// import Profile from './components/Profile';
import UserContext from './context/UserContext';
import Router from './router/router';

import './style.css';

export default function App() {
  const [userData, setUserData] = useState({
    token: undefined,
    user: undefined,
  });

  useEffect(() => {
    let isMounted = true;
    const checkLoggedIn = async () => {
      let token = localStorage.getItem('auth-token');
      if (token === null) {
        localStorage.setItem('auth-token', '');
        token = '';
      }
      const tokenRes = await Axios.post(
        'http://localhost:5000/users/tokenIsValid',
        null,
        { headers: { 'x-auth-token': token } },
      );
      if (tokenRes.data) {
        const userRes = await Axios.get('http://localhost:5000/users/', {
          headers: { 'x-auth-token': token },
        });
        if (isMounted) {
          setUserData({
            token,
            user: userRes.data,
          });
        }
      }
    };
    checkLoggedIn();
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider value={{ userData, setUserData, loggedIn }}>
          {/* <Header /> */}
          <div className="container">
            <Router />
            {/* <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/main" component={MainView} />
              <Route exact path="/profile" component={Profile} />
            </Switch> */}
          </div>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  );
}
