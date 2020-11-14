/* eslint-disable react/button-has-type */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';

export default function ErrorNotice(props) {
  return (
    <div className="error-notice">
      <span>{props.message}</span>
      <div>
        <button onClick={props.clearError}>X</button>
      </div>
    </div>
  );
}
