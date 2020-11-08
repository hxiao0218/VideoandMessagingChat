/* eslint-disable no-use-before-define */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-filename-extension */
import { Route, useParams } from 'react-router-dom';
import { ChatFeed, Message } from 'react-chat-ui';


function MessageComponent() {
  // fetch previous messages

  return (
    <div id="MessageComponent">
      <h2>Message</h2>
      <Route path="/message/:contact">
        <MessageChat />
      </Route>
    </div>
  );
}

function MessageChat () {
  const { contact } = useParams();
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
