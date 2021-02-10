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
import AddIcCallIcon from '@material-ui/icons/AddIcCall';
import VoicemailIcon from '@material-ui/icons/Voicemail';
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
  // console.log('contact', contact, userData.user.id);
  // console.log(contactList);
  const contactName = contactList.find((elem) => elem.id === contact).username || '';
  // const contactName = contactList[Number(contact) - 1].username || '';
  // TODO: check contact obj schema
  // console.log('out', contact, user.id);
  const [userId, setUserId] = useState(userData.user.id);
  const [messageList, setMessageList] = useState([]);
  const [messageObj, setMessageObj] = useState([]);
  const [file, setFile] = useState('');
  const [inHover, setHover] = useState(false);

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
      console.log('msg component recipient, userids', contact, userId);
      const resp = await getMessages(contact, userId);
      // console.log(resp);
      if (!resp) return;
      setMessageList(resp);
    };
    fetchMessages();
  }, 1000);

  const send = () => {
    const message = document.getElementById('msgInput').value;
    // console.log(message);
    if (!message || !userId || !contact) return;
    sendMessage(userId, contact, message);
    // clear input field
    document.getElementById('msgInput').value = '';
  };

  const validateFile = (curFile) => {
    const curSize = ((curFile.size / 1024) / 1024).toFixed(4); // MB
    const curName = curFile.name;
    const validateName = curName.match(/\.(jpeg|jpg|png|mp3|wmv|mp4|xlsx|xls)$/);
  };

  const openMenu = () => {
    document.getElementsByClassName('extra-options')[0].style.display = 'block';
  };

  const handleFileChange = (e) => {
    // access file
    const curFile = e.target.files[0];
    console.log(curFile);
    setFile(curFile);
    // upload file
  };

  const inputStyles = {
    chatInput: {
      flex: 1,

    },
    inputStyle: {
      border: 'none',
      fontSize: '15px',
      outline: 'none',
      padding: '10px',
      margin: '5px',
      width: '70%',
      'border-radius': '5px',
      '-moz-border-radius': '5px',
      '-webkit-border-radius': '5px',
    },
    buttonStyle: {
      margin: '3px',
      '&:'
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
          <div className="extra-options">
            <label htmlFor="upload-photo">
              <input
                style={{ display: 'none' }}
                id="upload-photo"
                name="upload-photo"
                type="file"
                onChange={handleFileChange}
              />
              <Fab color="secondary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
                <AddIcon />
                {' '}
                Photo
              </Fab>
            </label>
            <Fab color="secondary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
              <AddIcon />
              {' '}
              Video
            </Fab>
            <Fab color="secondary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
              <AddIcon />
              {' '}
              Audio
            </Fab>
          </div>
          <div className="chat-input" style={inputStyles.chatInput}>
            <Fab color="primary" className="uploadButton" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
              <AddIcon />
            </Fab>
            <Fab color="primary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
              <AddIcCallIcon />
            </Fab>
            <Fab color="primary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
              <VoicemailIcon />
            </Fab>
            <input type="text" style={inputStyles.inputStyle} placeholder="input..." id="msgInput" />
            <Button color="primary" size="small" id="sendBtn" onClick={() => send()}>Send</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MessageComponent;
