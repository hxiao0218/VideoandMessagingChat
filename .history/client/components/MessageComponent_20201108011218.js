/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-use-before-define */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-filename-extension */
import { Route, useParams } from 'react-router-dom';
import { ChatFeed, Message } from 'react-chat-ui';
import { useEffect, useRef, useState } from 'react';
import { getMessages, sendMessage } from '../network/getData';

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
  // TODO: check contact obj schema
  const [recipientId, setRecipientId] = useState(contact.id);
  const [userId, setUserId] = useState(user.id);
  const [messageList, setMessageList] = useState([]);
  const [messageObj, setMessageObj] = useState([]);

  useEffect(() => {
    const tmpObj = messageList.map((msg, index) => new Message({
      id: index + 1,
      message: msg,
    }));
    setMessageObj(tmpObj);
  }, [messageList]);
  // fetch previous messages
  // TODO: check contact obj
  useEffect(() => {
    const fetchMessages = async () => {
      const resp = await getMessages(recipientId, userId);
      if (!resp) return;
      setMessageList(resp);
    };
    fetchMessages();
  });

  const sendMessage = () => {
    const message = document.getElementById('msg').value;
    if (!message || !userId || !recipientId) return;
    sendMessage(userId, recipientId, message);
  };
  return (
    <div id="curMessage">
      <p>
        Contact:
        {contact}
      </p>
      <ChatFeed
        messages={messageObj}
        hasInputField={false}
        bubblesCentered={false}
        // JSON: Custom bubble styles
        bubbleStyles={
          {
            text: {
              fontSize: 30,
            },
            chatbubble: {
              borderRadius: 70,
              padding: 40,
            },
          }
        }
      />
    </div>
  );
}

export default MessageComponent;
