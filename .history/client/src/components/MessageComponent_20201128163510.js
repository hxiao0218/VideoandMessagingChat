/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-use-before-define */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-filename-extension */
import { Route, useParams } from 'react-router-dom';
import { ChatFeed, Message } from 'react-chat-ui';
import {
  AppBar, Divider, Toolbar, Typography, Input, Fab,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import {
  useEffect, useRef, useState, useContext,
} from 'react';
import { getMessages, sendMessage } from '../network/getData';
import UserContext from '../context/UserContext';
import useInterval from './utils';
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
  const { userData } = useContext(UserContext);
  const { contact } = useParams();
  console.log(contact, userData.user.id);
  // console.log(contactList);
  const contactName = contactList.find((elem) => elem.id === contact).username || '';
  // const contactName = contactList[Number(contact) - 1].username || '';
  // TODO: check contact obj schema
  // console.log('out', contact, user.id);
  const [recipientId, setRecipientId] = useState(contact);
  const [userId, setUserId] = useState(userData.user.id);
  const [messageList, setMessageList] = useState([]);
  const [messageObj, setMessageObj] = useState([]);

  useEffect(() => {
    // console.log(messageList);
    const tmpObj = messageList.map((msg) => new Message({
      id: (msg.sender === userData.user.id) ? 0 : 1,
      message: msg.content,
      senderName: msg.created_at,
    }));
    setMessageObj(tmpObj);
  }, [messageList]);
  // fetch previous messages
  // useEffect(() => {
  //   // const contactID_cache = contact.id;
  //   // const userID_cache = user.id;
  //   // console.log('upper', recipientId, userId);
  //   const fetchMessages = async () => {
  //     // console.log('msg component recipient, userids', recipientId, userId);
  //     const resp = await getMessages(recipientId, userId);
  //     // console.log(resp);
  //     if (!resp) return;
  //     setMessageList(resp);
  //   };
  //   fetchMessages();
  // }, [recipientId, userId]);

  useInterval(() => {
    const fetchMessages = async () => {
      // console.log('msg component recipient, userids', recipientId, userId);
      const resp = await getMessages(recipientId, userId);
      // console.log(resp);
      if (!resp) return;
      setMessageList(resp);
    };
    fetchMessages();
  }, 1000);

  const send = () => {
    const message = document.getElementById('msgInput').value;
    // console.log(message);
    if (!message || !userId || !recipientId) return;
    sendMessage(userId, recipientId, message);
    // clear input field
    document.getElementById('msgInput').value = '';
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
            showSenderName
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
            <label htmlFor="upload-photo">
              <input
                style={{ display: 'none' }}
                id="upload-photo"
                name="upload-photo"
                type="file"
              />
              <Fab color="primary" size="small" component="span" aria-label="add">
                <AddIcon />
              </Fab>
            </label>
            <input type="text" style={inputStyles.inputStyle} placeholder="input..." id="msgInput" />
            <Button color="primary" size="small" id="sendBtn" onClick={() => send()}>Send</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MessageComponent;
