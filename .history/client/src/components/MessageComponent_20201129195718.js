/* eslint-disable no-lonely-if */
/* eslint-disable no-alert */
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
import { Client as ConversationsClient } from '@twilio/conversations';
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
  const { twilioToken } = userData;
  console.log('two', twilioToken);
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
  const [file, setFile] = useState({});
  const [fileType, setFileType] = useState('');
  const [inHover, setHover] = useState(false);
  const [conversationsReady, setConversationsReady] = useState(false);
  const [conversationsClient, setConversationsClient] = useState({});
  const [status, setStatus] = useState('');
  const [statusString, setStatusString] = useState('');
  const [conversations, setConversations] = useState([]);
  const didMountRef = useRef(false);

  useEffect(() => {
    // console.log(messageList);
    const tmpObj = messageList.map((msg) => new Message({
      id: (msg.sender === userData.user.id) ? 0 : 1,
      message: msg.content,
      senderName: msg.created_at,
    }));
    setMessageObj(tmpObj);
  }, [messageList]);

  useInterval(() => {
    const fetchMessages = async () => {
      console.log('msg component recipient, userids', contact, userId);
      const resp = await getMessages(contact, userId);
      // console.log(resp);
      if (!resp) return;
      setMessageList(resp);
    };
    fetchMessages();
  }, 5000);

  useEffect(() => {
    if (!file || !fileType) return;
    if (!didMountRef.current) didMountRef.current = true;
    else {
      if (!validateFile()) {
        alert('please enter a valid photo file less than 20 mb!');
      } else {
        // upload file
      }
      // upload file
    }
  }, [file, fileType]);

  useEffect(() => {
    if (!twilioToken) return;
    const initConversations = async () => {
      // if (!twilioToken)
      console.log('twilioToken', twilioToken);
      window.conversationsClient = ConversationsClient;
      const curClient = await ConversationsClient.create(twilioToken);
      console.log('curClient', curClient);
      setConversationsClient(curClient);
      setStatusString('Connecting to Twilio…');
    };
    initConversations();
  }, [twilioToken]);

  // useEffect(() => {
  //   if (conversationsClient === {}) return;
  //   conversationsClient.on('connectionStateChanged', (state) => {
  //     if (state === 'connecting') {
  //       setStatus('default');
  //       setStatusString('Connecting to Twilio…');
  //     }
  //     if (state === 'connected') {
  //       setStatus('success');
  //       setStatusString('You are connected.');
  //     }
  //     if (state === 'disconnecting') {
  //       setStatus('default');
  //       setStatusString('Disconnecting from Twilio…');
  //       setConversationsReady(false);
  //     }
  //     if (state === 'disconnected') {
  //       setStatus('warning');
  //       setStatusString('Disconnected');
  //       setConversationsReady(false);
  //     }
  //     if (state === 'denied') {
  //       setStatus('error');
  //       setStatusString('Failed to connect.');
  //       setConversationsReady(false);
  //     }
  //   });
  //   conversationsClient.on('conversationJoined', (conversation) => {
  //     setConversations([...conversations, conversation]);
  //   });
  //   conversationsClient.on('conversationLeft', (thisConversation) => {
  //     setConversations([...conversations.filter((it) => it !== thisConversation)]);
  //   });
  // }, [conversationsClient]);

  useEffect(() => {
    console.log('[conversations]', conversations);
  }, [conversations]);

  const send = () => {
    const message = document.getElementById('msgInput').value;
    // console.log(message);
    if (!message || !userId || !contact) return;
    sendMessage(userId, contact, message);
    // clear input field
    document.getElementById('msgInput').value = '';
  };

  const validObj = {
    photo: /\.(jpeg|jpg|png)$/,
    video: /\.(mp4)$/,
    audio: /\.(mp3)$/,
  };

  const validateFile = () => {
    const curSize = ((file.size / 1024) / 1024).toFixed(4); // MB
    const curName = file.name;
    const validateName = curName.match(validObj[fileType]);
    if (curSize >= 20 || !validateName) return false;
    return true;
  };

  const openMenu = () => {
    document.getElementsByClassName('extra-options')[0].style.display = 'block';
  };

  const uploadPhoto = (e) => {
    // access file
    const curFile = e.target.files[0];
    console.log(curFile);
    setFile(curFile);
    setFileType('photo');
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
          {inHover && (
          <div className="extra-options">
            <label htmlFor="upload-photo">
              <input
                style={{ display: 'none' }}
                id="upload-photo"
                name="upload-photo"
                type="file"
                onChange={uploadPhoto}
              />
              <Fab variant="extended" color="secondary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
                <AddIcon />
                {' '}
                Photo
              </Fab>
            </label>
            <Fab variant="extended" color="secondary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
              <AddIcon />
              {' '}
              Video
            </Fab>
            <Fab variant="extended" color="secondary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
              <AddIcon />
              {' '}
              Audio
            </Fab>
          </div>
          )}
          <div className="chat-input" style={inputStyles.chatInput}>
            <Fab color="primary" className="uploadButton" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle} onClick={() => setHover(!inHover)}>
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
