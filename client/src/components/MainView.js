/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-unused-vars */
import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  getContacts, joinChat, sendMessage, getAllUsers, getFriendList,
} from '../network/getData';
import { setupWSConnection } from '../network/notifications';
import ContactComponent from './ContactComponent';
import MessageComponent from './MessageComponent';
import SearchComponent from './SearchComponent';
import SearchSideBar from './searchSidebar';

import mockData from '../__mock__/getData_Mock.json';
import UserContext from '../context/UserContext';
import './MainView.css';

function MainView({ user }) {
  const [data, setData] = useState([]);
  const [allUserdata, setAllUserdata] = useState([]);
  const [contactList, setContactList] = useState([]); // contact list
  const [allUserslist, setAllUsersList] = useState([]); // all users list
  const [conversations, setConversations] = useState([]); // twilio conversations
  const [numContacts, setNumContacts] = useState(0); // number of contacts
  const [numMessages, setNumMessages] = useState(0); // number of messages sent and received
  const texts = useRef([]); // tmp storage of messages
  const { userData } = useContext(UserContext);
  // console.log(userData);

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
      const resp = await getContacts(userData.user.id);
      if (!resp) return;
      // TODO: confirm API & make edits as necessary!
      // filter out self to prevent sending or call self
      const checkForSelf = (val) => val.username !== userData.user.username;
      const validContacts = resp.filter(checkForSelf);
      // console.log(validContacts);
      setContactList(validContacts);
      const tmpArr = validContacts.map((contact) => {
        const obj = {
          key: contact.id,
          value: contact.username,
        };
        return obj;
      });
      setData(tmpArr);

      // get friendlist, username only
      const friendlist = await getFriendList(userData.user.id);
      // fetch all user list --------->
      console.log('get all users front end success main view');
      const respAlluser = await getAllUsers(userData.user.id);
      if (!respAlluser) return;
      // TODO: confirm API & make edits as necessary!
      // filter out self to prevent sending or call self
      const checkForFriends = (val) => !friendlist.includes(val.username);
      const NonFriendContacts = respAlluser.filter(checkForFriends);
      // const NonFriendContacts = respAlluser;
      // console.log(validContacts);
      setAllUsersList(NonFriendContacts);
      const allUserTemp = NonFriendContacts.map((contact) => {
        const obj = {
          key: contact.id,
          value: contact.username,
        };
        return obj;
      });
      setAllUserdata(allUserTemp);
    };

    const cleanup = () => {
      sessionStorage.removeItem('token'); // clean the session storage
    };
    // we need to cleanup when leaving the tab
    window.addEventListener('beforeunload', cleanup);

    handleRefresh();
    return () => {
      window.removeEventListener('beforeunload', cleanup);
    };
  }, []);

  return (
    <Router>
      <div className="MainView" id="MainView">
        <ContactComponent contactList={contactList} data={data} currentUserId={userData.user.id} />
        <MessageComponent user={user || mockData.mockUser} contactList={contactList} />
        <SearchSideBar contactList={allUserslist} data={allUserdata} currentUserId={userData.user.id} />
      </div>
    </Router>
  );
}

export default MainView;
