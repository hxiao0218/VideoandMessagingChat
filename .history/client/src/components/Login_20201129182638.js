/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-filename-extension */
import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import Axios from 'axios';
import UserContext from '../context/UserContext';
import ErrorNotice from '../Errormsg/ErrorNotice';
import { retrieveToken } from '../network/getData';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { setUserData } = useContext(UserContext);
  const history = useHistory();

  const submit = async (e) => {
    try {
      e.preventDefault();
      const loginUser = {
        username,
        password,
      };
      // console.log(loginUser);
      const loginRes = await Axios.post(
        'http://localhost:5000/users/login',
        loginUser,
      );
      console.log(loginRes);
      const twilioRes = await retrieveToken(loginRes.data.user.id);
      console.log(twilioRes);
      setUserData({
        token: loginRes.data.token,
        user: loginRes.data.user,
      });
      // if (!loggedIn) setLoggedIn(true);
      localStorage.setItem('auth-token', loginRes.data.token);
      history.push('/main');
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response.data.msg && setError(err.response.data.msg);
    }
  };

  return (
    <div>
      <h2>Log in</h2>
      {error && (
        <ErrorNotice message={error} clearError={() => setError(undefined)} />
      )}
      <form onSubmit={submit}>
        <label htmlFor="login-username">Username</label>
        <input
          type="text"
          id="login-username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="login-password">Password</label>
        <input
          type="password"
          id="login-password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input type="submit" value="Log in" />
      </form>
    </div>
  );
};

export default Login;
