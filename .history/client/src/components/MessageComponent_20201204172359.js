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
import {
  getMessages, sendMessage, retrieveToken, createConversation,
  fetchConversation, twilioMediaUpload, sendTwilioMessage,
  getMessagesByConversation,
} from '../network/getData';
import UserContext from '../context/UserContext';

import useInterval from './utils';
import './MessageComponent.css';

const Chat = require('twilio-chat');
const blobUtil = require('blob-util');

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
  const { userData, conversations, setConversations } = useContext(UserContext);
  const { twilioToken } = userData;
  const { contact } = useParams();
  // console.log('contact', contact, userData.user.id);
  // console.log('contactList', contactList);
  const curContact = contactList.find((elem) => elem.id === contact);
  const contactName = curContact.username || '';
  const contactSID = curContact.sid;
  const contactCID = curContact.cid;
  // console.log('curContact', curContact, contactName, contactSID, contactCID);
  // const contactName = contactList[Number(contact) - 1].username || '';
  // console.log('out', contact, user.id);
  const [userId, setUserId] = useState(userData.user.id);
  const [conversationId, setConversationId] = useState(contactSID);
  const [messageList, setMessageList] = useState([]);
  const [messageObj, setMessageObj] = useState([]);
  // const [mediaList, setMediaList] = useState([]);
  // const [file, setFile] = useState({});
  const [fileType, setFileType] = useState('');
  const [inHover, setHover] = useState(false);
  const [conversationsReady, setConversationsReady] = useState(false);
  const [chatClient, setChatClient] = useState({});
  const [programChat, setProgramChat] = useState({});
  const [status, setStatus] = useState('');
  const [statusString, setStatusString] = useState('');
  const didMountRef = useRef(false);

  useEffect(() => {
    // console.log(messageList);
    // const tmpObj = messageList.map((msg) => new Message({
    //   id: (msg.sender === userData.user.id) ? 0 : 1,
    //   message: msg.content,
    //   senderName: msg.timestamp,
    // }));
    // setMessageObj(tmpObj);
    console.log('[messageList update]: ', messageList);
  }, [messageList]);

  useInterval(() => {
    const fetchMessages = async () => {
      console.log('msg component recipient, userids', contact, userId);
      const resp = await getMessages(contact, userId);
      console.log('getMessages Resp', resp);
      const mediaResp = await getMessagesByConversation(conversationId);
      console.log('mediaResp', mediaResp);
      // prevent repetitive re-rendering
      if ((!resp && !mediaResp) || (resp.length + mediaResp.length === messageList.length)) return;
      setMessageList([...resp, ...mediaResp]);
    };
    fetchMessages();
    if (!chatClient.on) return;
    chatClient.on('tokenAboutToExpire', async () => {
      const new_token = await retrieveToken(userId);
      userData.twilioToken = new_token;
    });
    chatClient.on('tokenExpired', async () => {
      const new_token = await retrieveToken(userId);
      userData.twilioToken = new_token;
    });
    chatClient.on('conversationJoined', (conversation) => {
      // console.log('conversation', conversation);
      setConversations([...conversations, conversation]);
    });
    chatClient.on('conversationLeft', (thisConversation) => {
      setConversations([...conversations.filter((it) => it !== thisConversation)]);
    });
  }, 10000);

  // useEffect(() => {
  //   if (!file || !fileType) return;
  //   if (!didMountRef.current) didMountRef.current = true;
  //   else {
  //     console.log('got here1!');
  //     if (!validateFile()) {
  //       alert('please enter a valid photo file less than 20 mb!');
  //     } else {
  //       // upload file
  //       console.log('got here2!');
  //       const formData = new FormData();
  //       formData.append(fileType, file);
  //       console.log('formdata', formData);
  //       conversationsClient.getChannelBySid(conversationId).then((channel) => {
  //         console.log('channel', channel);
  //         channel.sendMessage(formData);
  //       });
  //     }
  //   }
  // }, [file, fileType]);

  useEffect(() => {
    if (!twilioToken) return;
    const initConversations = async () => {
      // if (!twilioToken)
      window.chatClient = ConversationsClient;
      const curClient = await ConversationsClient.create(twilioToken);
      // console.log('curClient', curClient);
      setChatClient(curClient);
      setStatusString('Connecting to Twilio…');
      const curProgClient = await Chat.Client.create(twilioToken);
      setProgramChat(curProgClient);
      // console.log('curProgramChat', programChat);
    };
    initConversations();
  }, [twilioToken]);

  useEffect(() => {
    if (!chatClient.on) return;
    // console.log('got ehre!', chatClient);
    chatClient.on('connectionStateChanged', (state) => {
      // console.log('state', state);
      if (state === 'connecting') {
        setStatus('default');
        setStatusString('Connecting to Twilio…');
      }
      if (state === 'connected') {
        setStatus('success');
        setStatusString('You are connected.');
      }
      if (state === 'disconnecting') {
        setStatus('default');
        setStatusString('Disconnecting from Twilio…');
        setConversationsReady(false);
      }
      if (state === 'disconnected') {
        setStatus('warning');
        setStatusString('Disconnected');
        setConversationsReady(false);
      }
      if (state === 'denied') {
        setStatus('error');
        setStatusString('Failed to connect.');
        setConversationsReady(false);
      }
    });
    const async_cb2 = async () => {
      try {
        console.log('conversationId', conversationId);
        if (!conversationId) { // create conversation + persist sid
          const new_sid = await createConversation(contact, contactCID);
          console.log(new_sid);
          setConversationId(new_sid);
        } else { // fetch conversation
          const resp = await fetchConversation(conversationId);
          console.log(resp);
        }
      } catch (error) {
        console.log(error);
      }
    };
    async_cb2();
    chatClient.on('conversationJoined', (conversation) => {
      console.log('conversation', conversation);
      setConversations([...conversations, conversation]);
    });
    chatClient.on('conversationLeft', (thisConversation) => {
      setConversations([...conversations.filter((it) => it !== thisConversation)]);
    });
  }, [chatClient]);

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

  const validateFile = (file) => {
    const curSize = ((file.size / 1024) / 1024).toFixed(4); // MB
    const curName = file.name;
    const validateName = curName.match(validObj[fileType]);
    // console.log('size', curSize, validateName);
    if (curSize >= 20 || !validateName) return false;
    return true;
  };

  const openMenu = () => {
    document.getElementsByClassName('extra-options')[0].style.display = 'block';
  };

  const uploadPhoto = async (e) => {
    // access file
    const curFile = e.target.files[0];
    // console.log(curFile);
    // setFile(curFile);
    setFileType('photo');
    if (!validateFile(curFile)) {
      alert('please enter a valid photo file less than 20 mb!');
    } else {
      // upload file
      // postFile(curFile, conversationId);
      // const res = twilioMediaAuth();
      // console.log('twilioMediaAuth', res);
      try {
        const fileReader = new FileReader();
        fileReader.onloadend = async (fe) => {
          const arrayBuffer = fe.target.result;
          const imageType = 'image/png';
          // const imageBlob = blobUtil.arrayBufferToBlob(arrayBuffer, imageType);
          // console.log('imageBlob', imageBlob);
          const mediaSID = await twilioMediaUpload(arrayBuffer, imageType);
          // console.log('photo link', mediaSID);
          sendTwilioMessage(userId, mediaSID, conversationId);
        };
        fileReader.readAsArrayBuffer(curFile);
      } catch (error) {
        console.log(error);
      }
      // const formData = new FormData();
      // formData.append(fileType, curFile);
      // console.log('formdata', formData);
      // console.log('client', programChat);
      // const resp = await programChat.getChannelBySid(conversationId);
      // console.log(resp);
      // programChat.getChannelBySid(conversationId).then((convo) => {
      //   console.log('channel', convo);
      //   // convo.sendMessage(formData);
      // });
      // chatClient.getConversationByUniqueName(userId).then((convo) => {
      //   console.log('convo', convo);
      //   convo.sendMessage(formData);
      // });
    }
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
