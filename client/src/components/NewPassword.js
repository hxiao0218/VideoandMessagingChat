// /* eslint-disable react/jsx-filename-extension */
// /* eslint-disable jsx-a11y/label-has-associated-control */
// /* eslint-disable no-unused-expressions */
// /* eslint-disable quotes */
import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Axios from "axios";
import ErrorNotice from "../Errormsg/ErrorNotice";

// const herokuBaseURL = "https://server2-heroku-new.herokuapp.com/";
const herokuBaseURL = "/";

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams();
  console.log(token);
  const [error, setError] = useState("");
  const history = useHistory();

  const submit = async (e) => {
    try {
      e.preventDefault();

      const newInfo = {
        password,
        confirmPassword,
        token,
      };
      // const registerRes =
      await Axios.post(`${herokuBaseURL}users/new-password`, newInfo);
      history.push("/login");
    } catch (err) {
      err.response.data.msg && setError(err.response.data.msg);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {error && (
        <ErrorNotice message={error} clearError={() => setError(undefined)} />
      )}
      <form onSubmit={submit}>
        <label htmlFor="reset-password">Enter New Password</label>
        <input
          type="password"
          id="reset-password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="reset-ConfirmPassword">Enter Password Again</label>
        <input
          type="password"
          id="reset-ConfirmPassword"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <input type="submit" value="Reset Password" />
      </form>
    </div>
  );
}
