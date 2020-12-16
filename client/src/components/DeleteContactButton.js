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
import './ContactComponent.css';
import {
  getMessages, sendMessage, retrieveToken, createConversation,
  fetchConversation, twilioMediaUpload, sendTwilioMessage, deleteConversation,
  getMessagesByConversation, deleteContact, deleteMediaConversation,
} from '../network/getData';

function DeleteContactButton({
  userid, contactid, conversationId, contactcid,
}) {
  const deleteContactbutt = async () => {
    await deleteContact(userid, contactid);
    alert('Delete contact successfully!');
    console.log('contact deleted in front end');
  };

  const deleteConversationbutt = async () => {
    console.log('delete conversation button front end', 'userid', userid, 'contactid', contactid, 'conversationid', conversationId, 'contactcid', contactcid);
    await deleteConversation(userid, contactid);
    await deleteMediaConversation(conversationId, contactcid);
    alert('Delete Conversation Successfully!');
    console.log('conversation deleted in front end');
  };
  return (
    <>
      <IconButton aria-label="deleteContact" size="small" style={{ fontSize: '10px' }} color="primary" onClick={deleteContactbutt}>
        <DeleteIcon />
        Delete Contact
      </IconButton>
      <IconButton aria-label="deleteContact" size="small" style={{ fontSize: '10px' }} color="primary" onClick={deleteConversationbutt}>
        <RemoveIcon />
        Delete Conversation
      </IconButton>
    </>
  );
}

export default DeleteContactButton;
