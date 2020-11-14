/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { Link } from 'react-router-dom';
import Options from '../auth/Options';

export default function Header() {
  return (
    <div>
      <Link to="/">
        <h1>Homepage</h1>
      </Link>
      <Options />
    </div>
  );
}
