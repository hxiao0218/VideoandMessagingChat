/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { getContacts, joinChat, sendMessage } from '../network/getData';
import { setupWSConnection } from '../network/notifications';
import ContactComponent from './ContactComponent';
import MessageComponent from './MessageComponent';
import mockData from '../__mock__/getData_Mock.json';

function MainView({ user }) {
  const [data, setData] = useState([]);
  const [contactList, setContactList] = useState([]); // contact list
  const [numContacts, setNumContacts] = useState(0); // number of contacts
  const [numMessages, setNumMessages] = useState(0); // number of messages sent and received
  const texts = useRef([]); // tmp storage of messages

  const updateContacts = () => setNumContacts((contacts) => contacts + 1);
  const updateMessages = () => setNumMessages((messages) => messages + 1);
  const updateContactList = (arr) => setContactList(arr);

  // useEffect(() => {
  //   const tmpArr = contactList.map((contact) => {
  //     const obj = {
  //       key: contact.username.toLowerCase(),
  //       value: contact.username.toLowerCase(),
  //     };
  //     return obj;
  //   });
  //   setData(tmpArr);
  // }, [contactList]);

  // update contacts component upon mounting
  useEffect(() => {
    const handleRefresh = async () => {
      const resp = await getContacts();
      if (!resp) return;
      // TODO: confirm API & make edits as necessary!
      updateContactList([...resp]);
      const tmpArr = resp.map((contact) => {
        const obj = {
          key: contact.username.toLowerCase(),
          value: contact.username.toLowerCase(),
        };
        return obj;
      });
      setData(tmpArr);
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
    <Router>
      <div className="MainView">
        <ContactComponent contactList={contactList} data={data} />
        <MessageComponent user={user || mockData.mockUser} />
      </div>
    </Router>
  );
}

export default MainView;
