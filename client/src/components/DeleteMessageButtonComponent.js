/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import {
  Divider, Button,
  Drawer, List, ListItem, ListItemText, makeStyles, Typography, IconButton,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import RemoveIcon from '@material-ui/icons/Remove';
import ReactSearchBox from 'react-search-box';
import { Link, useHistory } from 'react-router-dom';
import HighlightOffOutlinedIcon from '@material-ui/icons/HighlightOffOutlined';

import './ContactComponent.css';
import {
  getMessages, sendMessage, retrieveToken, createConversation,
  fetchConversation, twilioMediaUpload, sendTwilioMessage,
  getMessagesByConversation, deleteContact, deleteOneMesssage,
} from '../network/getData';

function deleteMessageButton({ userid, contactid, messageContent }) {
  const deleteMessageButt = async () => {
    // await deleteContact(userid, contactid);
    await deleteOneMesssage(userid, contactid, messageContent);
    alert('Message Deleted!');
    console.log('Message deleted in front end');
  };
  return (
    <>
      <IconButton id="conversationbutton" aria-label="deleteContact" size="small" style={{ fontSize: '10px' }} color="primary" onClick={deleteMessageButt}>
        <HighlightOffOutlinedIcon />
      </IconButton>
      <span id="messageBubble">{messageContent}</span>
    </>
  );
}

export default deleteMessageButton;
