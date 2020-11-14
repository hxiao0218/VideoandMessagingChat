import React, { useState, useEffect, useRef } from 'react';
import { getUsers, joinChat, sendMessage } from '../network/getData';
import { setupWSConnection } from '../network/notifications';

function MainView() {
  const [contacts, setContacts] = useState(0); // number of contacts
  const [messages, setMessages] = useState(0); // number of messages sent and received
  const texts = useRef([]); // tmp storage of messages

  const updateContacts = () => setContacts((contacts) => contacts + 1);
  const updateMessages = () => setMessages((messages) => messages + 1);

  
}

export default MainView;