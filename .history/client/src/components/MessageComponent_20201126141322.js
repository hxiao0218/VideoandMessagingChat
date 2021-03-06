/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-use-before-define */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-filename-extension */
import { Route, useParams } from 'react-router-dom';
import { ChatFeed, Message } from 'react-chat-ui';
import {
  AppBar, Divider, Toolbar, Typography,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { useEffect, useRef, useState } from 'react';
import { getMessages, sendMessage } from '../network/getData';
import './MessageComponent.css';

function MessageComponent({ user, contactList }) {
  return (
    <div id="MessageComponent">
      {/* <Typography variant="h6" noWrap>
        Message
      </Typography> */}
      <Route path="/message/:contact">
        <MessageChat user={user} contactList={contactList} />
      </Route>
    </div>
  );
}

function MessageChat({ user, contactList }) {
  const { contact } = useParams();
  const contactID_cache = contact.id;
  const userID_cache = user.id;
  console.log(contact);
  // console.log(contactList);
  const contactName = contactList.find((elem) => elem.id === contact).username || '';
  // const contactName = contactList[Number(contact) - 1].username || '';
  // TODO: check contact obj schema
  const [recipientId, setRecipientId] = useState(contactID_cache);
  const [userId, setUserId] = useState(userID_cache);
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
      console.log('msg component recipient, userids', contactID_cache, userID_cache);
      const resp = await getMessages(contactID_cache, userID_cache);
      console.log(resp);
      if (!resp) return;
      setMessageList(resp);
    };
    fetchMessages();
  }, []);

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
      // borderTopWidth: '1',
      // borderTopStyle: 'solid',
      // borderTopColor: '#ddd',
      fontSize: '15px',
      outline: 'none',
      padding: '10px',
      width: '90%',
      'border-radius': '5px',
      '-moz-border-radius': '5px',
      '-webkit-border-radius': '5px',
    },
  };

  return (
    <div className="curMessage">
      <AppBar position="fixed" id="messageBar">
        <Toolbar>
          <Typography variant="h6" noWrap>
            {contactName}
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <div className="content">
          <ChatFeed
            messages={messageObj}
            hasInputField={false}
            bubblesCentered={false}
          // JSON: Custom bubble styles
            bubbleStyles={
            {
              text: {
                fontSize: 15,
              },
              chatbubble: {
                borderRadius: 30,
                padding: 10,
                backgroundColor: '#007AFF',
              },
            }
          }
          />
          <Divider />
          <br />
          <div className="chat-input" style={inputStyles.chatInput}>
            <input type="text" style={inputStyles.inputStyle} placeholder="input..." id="msgInput" />
            <Button color="primary" size="small" id="sendBtn" onClick={() => send()}>Send</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MessageComponent;
