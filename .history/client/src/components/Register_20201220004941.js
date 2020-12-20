// /* eslint-disable quotes */
// /* eslint-disable jsx-a11y/label-has-associated-control */
// /* eslint-disable react/jsx-filename-extension */
// /* eslint-disable no-unused-expressions */
import React, { useState, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import Axios from "axios";
import UserContext from "../context/UserContext";
import ErrorNotice from "../Errormsg/ErrorNotice";

// const herokuBaseURL = 'https://server2-heroku-new.herokuapp.com/';
const herokuBaseURL = "/";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { setUserData } = useContext(UserContext);
  const history = useHistory();

  const submit = async (e) => {
    try {
      e.preventDefault();

      const newUser = {
        username,
        email,
        password,
        confirmPassword,
      };
      // const registerRes =
      await Axios.post(`${herokuBaseURL}users/register`, newUser);
      const loginRes = await Axios.post(`${herokuBaseURL}users/login`, {
        username,
        password,
      });
      setUserData({
        token: loginRes.data.token,
        user: loginRes.data.user,
      });
      // localStorage.setItem("auth-token", loginRes.data.token);
      history.push("/login");
    } catch (err) {
      err.response.data.msg && setError(err.response.data.msg);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && (
        <ErrorNotice message={error} clearError={() => setError(undefined)} />
      )}
      <form onSubmit={submit}>
        <label htmlFor="register-username">Username</label>
        <input
          type="text"
          id="register-username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="register-email">Email</label>
        <input
          type="email"
          id="register-email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="register-password">Password</label>
        <input
          type="password"
          id="register-password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="register-ConfirmPassword">Enter Password Again</label>
        <input
          type="password"
          id="register-ConfirmPassword"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <input type="submit" value="Register" />
      </form>
      <h6>
        <Link to="/login">Already have an account ?</Link>
      </h6>
    </div>
  );
}
