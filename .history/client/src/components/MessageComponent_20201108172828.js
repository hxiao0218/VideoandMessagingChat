/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-use-before-define */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-filename-extension */
import { Route, useParams } from 'react-router-dom';
import { ChatFeed, Message } from 'react-chat-ui';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { useEffect, useRef, useState } from 'react';
import { getMessages, sendMessage } from '../network/getData';
import './MessageComponent.css';

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
      // TODO: confirm schema
      message: msg.message,
    }));
    setMessageObj(tmpObj);
  }, [messageList]);
  // fetch previous messages
  // TODO: check contact schema
  useEffect(() => {
    const fetchMessages = async () => {
      const resp = await getMessages(recipientId, userId);
      if (!resp) return;
      setMessageList(resp);
    };
    fetchMessages();
  });

  const send = () => {
    const message = document.getElementById('msgInput').value;
    if (!message || !userId || !recipientId) return;
    sendMessage(userId, recipientId, message);
  };

  const inputStyles = {
    chatInput: {
      flex: 1,
    },
    inputStyle: {
      border: 'none',
      borderTopWidth: '1',
      borderTopStyle: 'solid',
      borderTopColor: '#ddd',
      fontSize: '16',
      outline: 'none',
      padding: '30',
      width: '100%',
    },
  };

  return (
    <div id="curMessage">
      <AppBar position="fixed" id="messageBar">
        <Toolbar>
          <Typography variant="h6" noWrap>
            Contact:
            {contact}
          </Typography>
        </Toolbar>
      </AppBar>

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
      <div className="chat-input" style={inputStyles.chatInput}>
        <input type="text" style={inputStyles.inputStyle} placeholder="input..." id="msgInput" />
        <Button color="primary" size="small" id="sendBtn" onClick={() => send()}>Send</Button>
      </div>
    </div>
  );
}

export default MessageComponent;
