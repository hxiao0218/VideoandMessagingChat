/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
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
  AppBar, Divider, Toolbar, Typography, Input, Fab, Modal,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import AddIcCallIcon from '@material-ui/icons/AddIcCall';
import VoicemailIcon from '@material-ui/icons/Voicemail';
import StopIcon from '@material-ui/icons/Stop';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PublishIcon from '@material-ui/icons/Publish';
import {
  useEffect, useRef, useState, useContext, useCallback,
} from 'react';
import { ReactMic } from 'react-mic';
import NewWindow from 'react-new-window';
import { Client as ConversationsClient } from '@twilio/conversations';
import {
  getMessages, sendMessage, retrieveToken, createConversation,
  fetchConversation, twilioMediaUpload, sendTwilioMessage,
  getMessagesByConversation, getVideoRoomToken,
} from '../network/getData';
import VideoRoom from './VideoRoom';
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

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 700,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
}));

function MessageChat({ user, contactList }) {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);
  const { userData, conversations, setConversations } = useContext(UserContext);
  const { twilioToken } = userData;
  const { contact } = useParams();
  const curContact = contactList.find((elem) => elem.id === contact);
  const contactName = curContact.username || '';
  const contactSID = curContact.sid;
  const contactCID = curContact.cid;
  const contactUID = curContact.cid;
  const [userId, setUserId] = useState(userData.user.id);
  const [conversationId, setConversationId] = useState(contactSID);
  const [messageList, setMessageList] = useState([]);
  const [messageObj, setMessageObj] = useState([]);
  const [inHover, setHover] = useState(false);
  const [conversationsReady, setConversationsReady] = useState(false);
  const [chatClient, setChatClient] = useState({});
  const [programChat, setProgramChat] = useState({});
  const [status, setStatus] = useState('');
  const [statusString, setStatusString] = useState('');
  const [record, setRecord] = useState(false);
  const [videoRoomComponent, setVideoRoomComponent] = useState(null);
  const [curRoomToken, setCurRoomToken] = useState(null);
  const [videoChatOn, setVideoChatOn] = useState(false);
  const didMountRef = useRef(false);

  const imgStyle = {
    maxWidth: '600px',
    maxHeight: '600px',
    borderRadius: 30,
    padding: 5,
  };

  const mediaBoxStyle = {
    overflow: 'scroll',
  };

  const contentTypeRegex = {
    photo: /^image/,
    video: /^video/,
    audio: /^audio/,
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const startRecording = () => {
    setRecord(true);
  };

  const stopRecording = () => {
    setRecord(false);
  };

  useEffect(() => {
    console.log('[messageList update]: ', messageList);
    const tmpObj = messageList.map((msg) => {
      if (msg.message_type === 'text') { // text
        return new Message({
          id: (msg.sender === userData.user.id) ? 0 : 1,
          message: msg.content,
          senderName: msg.timestamp,
        });
      } if (msg.content_type.match(contentTypeRegex.photo)) { // process image bubble
        console.log(msg);
        const imageComponent = (
          <a
            target="_blank"
            href={msg.mediaURL}
          >
            <img src={msg.mediaURL} alt={msg.content_type} style={imgStyle} />
          </a>
        );
        return new Message({
          id: (msg.sender === userData.user.id) ? 0 : 1,
          message: imageComponent,
          senderName: msg.timestamp,
        });
      } if (msg.content_type.match(contentTypeRegex.video)) { // process video bubble
        const videoComponent = (
          <a
            target="_blank"
            href={msg.mediaURL}
          >
            <video controls style={imgStyle}>
              <source src={msg.mediaURL} type={msg.content_type} />
              Your browser does not support the video tag.
            </video>
          </a>
        );
        return new Message({
          id: (msg.sender === userData.user.id) ? 0 : 1,
          message: videoComponent,
          senderName: msg.timestamp,
        });
      } if (msg.content_type.match(contentTypeRegex.audio)) { // process audio bubble
        const audioComponent = (
          <a
            target="_blank"
            href={msg.mediaURL}
          >
            <audio
              controls
              src={msg.mediaURL}
            >
              Your browser does not support the
              <code>audio</code>
              {' '}
              element.
            </audio>
          </a>
        );
        return new Message({
          id: (msg.sender === userData.user.id) ? 0 : 1,
          message: audioComponent,
          senderName: msg.timestamp,
        });
      }
      return null;
    });
    setMessageObj(tmpObj);
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
      const messageListBeforeSort = [...resp, ...mediaResp];
      setMessageList(messageListBeforeSort.sort((m1, m2) => m1.timestamp - m2.timestamp));
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

  const handleVideoRoomLogout = useCallback(() => {
    setCurRoomToken(null);
    setVideoChatOn(false);
    setVideoRoomComponent(null);
  }, []);

  const handleVoiceCall = async () => {
    console.log('contactUID', contactUID);
    let roomToken = curRoomToken;
    if (!curRoomToken) {
      const res = await getVideoRoomToken(userId, contactUID);
      setCurRoomToken(res.token);
      roomToken = res.token;
    }
    const newVideoRoomComponent = (
      <div>
        <VideoRoom
          roomName={contactUID}
          token={roomToken}
          handleLogout={handleVideoRoomLogout}
        />
      </div>
    );
    setVideoChatOn(true);
    setVideoRoomComponent(newVideoRoomComponent);
    // send message in place of notification
    await sendTwilioMessage(userId, '', conversationId);
  };

  const validObj = {
    photo: /\.(jpeg|jpg|png)$/,
    video: /\.(mp4)$/,
    audio: /\.(mp3)$/,
  };

  const validateFile = (file) => {
    const curSize = ((file.size / 1024) / 1024).toFixed(4); // MB
    const curName = file.name;
    const validateName = curName.match(validObj.photo)
      || curName.match(validObj.video) || curName.match(validObj.audio);
    // console.log('size', curSize, validateName);
    return (curSize < 20 && validateName);
  };

  const openMenu = () => {
    document.getElementsByClassName('extra-options')[0].style.display = 'block';
  };

  const uploadMedia = async (e) => {
    // access file
    const curFile = e.target.files[0];
    // console.log(curFile);
    // setFile(curFile);
    // setFileType('photo');
    if (!validateFile(curFile)) {
      alert('please enter a valid photo file less than 20 mb!');
    } else {
      try {
        const fileReader = new FileReader();
        fileReader.onloadend = async (fe) => {
          const arrayBuffer = fe.target.result;
          const imageType = curFile.type;
          const mediaSID = await twilioMediaUpload(arrayBuffer, imageType);
          sendTwilioMessage(userId, mediaSID, conversationId);
        };
        fileReader.readAsArrayBuffer(curFile);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const onStop = (recordedBlob) => {
    console.log('recordedBlob is: ', recordedBlob);
    const uploadButton = document.getElementById('uploadButton');
    uploadButton.style.display = 'block';
    const uploadHelper = async () => {
      const mediaType = recordedBlob.blob.type;
      const arrayBuffer = await recordedBlob.blob.arrayBuffer();
      console.log('[onData] arrayBuffer', arrayBuffer);
      const mediaSID = await twilioMediaUpload(arrayBuffer, mediaType);
      console.log('[onData] twilio media upload: ', mediaSID);
      sendTwilioMessage(userId, mediaSID, conversationId);
    };
    uploadButton.onclick = uploadHelper;
  };

  const playButtonStyles = {
    height: '50px',
    width: '50px',
  };

  const body = (
    <div style={modalStyle} className={classes.paper} id="micWrapper">
      <ReactMic
        record={record}
        className="sound-wave"
        onStop={onStop}
        strokeColor="#333333"
        backgroundColor="#000000"
        mimeType="audio/mp3"
      />
      <br />
      <button onClick={startRecording} type="button" style={playButtonStyles}>
        <PlayArrowIcon fontSize="large" />
        {' '}
        Start
      </button>
      <button onClick={stopRecording} type="button" style={playButtonStyles}>
        <StopIcon fontSize="large" />
        {' '}
        Stop
      </button>
      <button id="uploadButton" type="button" style={{ ...playButtonStyles, display: 'none' }}>
        <PublishIcon fontSize="large" />
        {' '}
        Upload
      </button>
      {/* <h2 id="simple-modal-title">Text in a modal</h2>
      <p id="simple-modal-description">
        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
      </p> */}
    </div>
  );

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
      width: '80%',
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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
      <main>
        <div className="content">
          <div className="chatFeedContainer">
            {videoChatOn
              ? videoRoomComponent
              : (
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
                maxWidth: 1200,
                maxHeight: 1200,
                margin: 5,
              },
            }
          }
                />
              )}
          </div>
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
                onChange={uploadMedia}
              />
              <Fab variant="extended" color="secondary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
                <AddIcon />
                {' '}
                Photo
              </Fab>
            </label>
            <label htmlFor="upload-video">
              <input
                style={{ display: 'none' }}
                id="upload-video"
                name="upload-video"
                type="file"
                onChange={uploadMedia}
              />
              <Fab variant="extended" color="secondary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
                <AddIcon />
                {' '}
                Video
              </Fab>
            </label>
            <label htmlFor="upload-audio">
              <input
                style={{ display: 'none' }}
                id="upload-audio"
                name="upload-audio"
                type="file"
                onChange={uploadMedia}
              />
              <Fab variant="extended" color="secondary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle}>
                <AddIcon />
                {' '}
                Audio
              </Fab>
            </label>
          </div>
          )}
          <div className="chat-input" style={inputStyles.chatInput}>
            <Fab color="primary" className="uploadButton" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle} onClick={() => setHover(!inHover)}>
              <AddIcon />
            </Fab>
            <Fab color="primary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle} onClick={handleVoiceCall}>
              <AddIcCallIcon />
            </Fab>
            <Fab color="primary" size="small" component="span" aria-label="add" style={inputStyles.buttonStyle} onClick={handleOpen}>
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
