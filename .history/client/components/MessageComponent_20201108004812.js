/* eslint-disable no-use-before-define */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-filename-extension */
import { Route, useParams } from 'react-router-dom';
import { ChatFeed, Message } from 'react-chat-ui';

function MessageComponent({ user }) {
  return (
    <div id="MessageComponent">
      <h2>Message</h2>
      <Route path="/message/:contact">
        <MessageChat user={user} />
      </Route>
    </div>
  );
}

function MessageChat({ user }) {
  const { contact } = useParams();
  // fetch previous messages
  // TODO: check contact obj

  return (
    <div id="curMessage">
      <p>
        Contact:
        {contact}
      </p>
    </div>
  );
}

export default MessageComponent;
