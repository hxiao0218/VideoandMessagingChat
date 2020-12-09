/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import {
  Divider, Button,
  Drawer, List, ListItem, ListItemText, makeStyles, Typography, IconButton,
} from '@material-ui/core';
import ReactSearchBox from 'react-search-box';
import { Link, useHistory } from 'react-router-dom';
import './ContactComponent.css';
import AddIcon from '@material-ui/icons/Add';
import {
  getMessages, sendMessage, retrieveToken, createConversation,
  fetchConversation, twilioMediaUpload, sendTwilioMessage,
  getMessagesByConversation, deleteContact, addContact,
} from '../network/getData';

function AddContactsComponent({ userid, contactid }) {
  const addContactbutt = async () => {
    await addContact(userid, contactid);
    alert('Request Sent!');
    console.log('add contact in front end button', userid, contactid);
  };
  return (
    <IconButton aria-label="addContact" color="secondary" onClick={addContactbutt}>
      <AddIcon />
    </IconButton>
  );
}

export default AddContactsComponent;
