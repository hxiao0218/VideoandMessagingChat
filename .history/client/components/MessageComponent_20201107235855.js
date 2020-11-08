/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-filename-extension */
import { Route } from 'react-router-dom';

function MessageComponent() {

  return (
    <div id="MessageComponent">
      <h2>Message</h2>
      <Route path="/message/:mid"/>
    </div>
  )
}

export default MessageComponent;
