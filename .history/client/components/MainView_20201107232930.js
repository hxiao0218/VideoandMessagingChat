/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { getContacts, joinChat, sendMessage } from '../network/getData';
import { setupWSConnection } from '../network/notifications';
import ContactComponent from './ContactComponent';
import MessageComponent from './MessageComponent';

function MainView() {
  const [data, setData] = useState([]);
  const [contactList, setContactList] = useState([]); // contact list
  const [numContacts, setNumContacts] = useState(0); // number of contacts
  const [numMessages, setNumMessages] = useState(0); // number of messages sent and received
  const texts = useRef([]); // tmp storage of messages

  const updateContacts = () => setNumContacts((contacts) => contacts + 1);
  const updateMessages = () => setNumMessages((messages) => messages + 1);

  useEffect(() => {
    const tmpArr = contactList.map((contact) => {
      const obj = {
        key: contact.toLowerCase(),
        value: contact.toLowerCase(),
      };
      return obj;
    });
    setData(tmpArr);
  }, [contactList]);

  // update contacts component upon mounting
  useEffect(() => {
    const handleRefresh = async () => {
      const resp = await getContacts();
      if (!resp) return;
      // TODO: confirm API & make edits as necessary!
      setContactList(resp);
    };
    handleRefresh();

    const cleanup = () => {
      sessionStorage.removeItem('token'); // clean the session storage
    };
    // we need to cleanup when leaving the tab
    window.addEventListener('beforeunload', cleanup);

    return () => {
      window.removeEventListener('beforeunload', cleanup);
    };
  });

  return (
    <div className="MainView">
      <ContactComponent contactList={contactList} data={data} />
    </div>
  );
}

export default MainView;
