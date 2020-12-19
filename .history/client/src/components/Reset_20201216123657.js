/* eslint-disable react/jsx-filename-extension */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-expressions */
/* eslint-disable quotes */
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Axios from "axios";
import ErrorNotice from "../Errormsg/ErrorNotice";

export default function Reset() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const history = useHistory();

  const submit = async (e) => {
    try {
      e.preventDefault();

      const userEmail = {
        email,
      };
      await Axios.put("http://localhost:5000/users/reset", userEmail);
      history.push("/login");
    } catch (err) {
      err.response.data.msg && setError(err.response.data.msg);
    }
  };

  return (
    <div>
      <h2>Get a Reset Link</h2>
      {error && (
        <ErrorNotice message={error} clearError={() => setError(undefined)} />
      )}
      <form onSubmit={submit}>
        <label htmlFor="register-email">Email</label>
        <input
          type="email"
          id="register-email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input type="submit" value="SEND LINK" />
      </form>
    </div>
  );
}
