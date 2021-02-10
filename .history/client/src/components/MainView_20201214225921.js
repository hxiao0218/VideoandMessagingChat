/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-unused-vars */
import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import ReactNotification, { store } from 'react-notifications-component';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  getContacts, joinChat, sendMessage, getMessagesByConversation,
  deleteTwilioMessage, getAllUsers, getFriendList,
} from '../network/getData';
import { setupWSConnection } from '../network/notifications';
import ContactComponent from './ContactComponent';
import MessageComponent from './MessageComponent';
import SearchComponent from './SearchComponent';
import SearchSideBar from './searchSidebar';

import mockData from '../__mock__/getData_Mock.json';
import UserContext from '../context/UserContext';
import useInterval from './utils';
import './MainView.css';
import 'react-notifications-component/dist/theme.css';

function MainView({ user }) {
  const [data, setData] = useState([]);
  const [allUserdata, setAllUserdata] = useState([]);
  const [contactList, setContactList] = useState([]); // contact list
  const [allUserslist, setAllUsersList] = useState([]); // all users list
  const [conversations, setConversations] = useState([]); // twilio conversations
  const [numContacts, setNumContacts] = useState(0); // number of contacts
  const [numMessages, setNumMessages] = useState(0); // number of messages sent and received
  const [conversationIDArr, setConversationIDArr] = useState([]);
  const [notificationArr, setNotificationArr] = useState([]);
  const texts = useRef([]); // tmp storage of messages
  const { userData } = useContext(UserContext);
  const setConversationArrWrapper = (newItem) => {
    if (conversationIDArr.includes(newItem)) return;
    setConversationIDArr((arr) => [...arr, newItem]);
  };

  const handleRefresh = async () => {
    const resp = await getContacts(userData.user.id);
    if (!resp) return;
    // filter out self to prevent sending or call self
    const checkForSelf = (val) => val.username !== userData.user.username;
    const validContacts = resp.filter(checkForSelf);
    // console.log(validContacts);
    setContactList(validContacts);
    const tmpArr = validContacts.map((contact) => {
      if (contact.sid) {
        setConversationArrWrapper(contact.sid);
      }
      const obj = {
        key: contact.id,
        value: contact.username,
      };
      return obj;
    });
    setData(tmpArr);
    // monitor all video message notifications from contacts
    console.log('conversationIDArr', conversationIDArr);
    if (!conversationIDArr) return;
    let curMessageArr = await Promise.all((conversationIDArr).map(async (cid) => {
      const curResp = await getMessagesByConversation(cid, userData.user.id);
      console.log('curResp', curResp);
      let filteredResp = curResp.filter((msg) => msg.body === 'video_call');
      filteredResp = filteredResp.filter((msg) => msg.author !== userData.user.id);
      console.log('filteredResp', filteredResp);
      return filteredResp;
    }));
    curMessageArr = [].concat(...curMessageArr);
    console.log('curMessageArr', curMessageArr);
    setNotificationArr(curMessageArr);
    // delete cur notification to avoid repetitive alert
    const deleteResp = await Promise.all((curMessageArr).map(async (curMsg) => {
      const curResp = await deleteTwilioMessage(curMsg.conversationSID, curMsg.msgSID);
      return curResp;
    }));
    console.log('deleteResp', deleteResp);
    // get friendlist, username only
    const friendlist = await getFriendList(userData.user.id);
    // fetch all user list --------->
    console.log('get all users front end success main view');
    const respAlluser = await getAllUsers(userData.user.id);
    if (!respAlluser) return;
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

  // update contacts component upon mounting
  useEffect(() => {
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

  useInterval(() => {
    handleRefresh();
  }, 10000);

  useEffect(() => {
    console.log('noficationArr', notificationArr);
    notificationArr.forEach((notification) => {
      const { conversationSID } = notification;
      // console.log('conversationSID', conversationSID);
      // console.log('contactList', contactList);
      const authorList = contactList.filter((elem) => elem.sid === conversationSID);
      // console.log('authorList', authorList);
      if (!authorList) return;
      const authorName = authorList[0].username;
      // console.log('authorName', authorName);
      store.addNotification({
        title: 'New Video Call!',
        message: authorName,
        type: 'success',
        insert: 'top',
        container: 'top-right',
        animationIn: ['animate__animated', 'animate__fadeIn'],
        animationOut: ['animate__animated', 'animate__fadeOut'],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
    });
  }, [notificationArr]);

  return (
    <Router>
      <div className="MainView" id="MainView">
        <ReactNotification />
        <ContactComponent contactList={contactList} data={data} currentUserId={userData.user.id} />
        <MessageComponent user={user || mockData.mockUser} contactList={contactList} />
        <SearchSideBar
          contactList={allUserslist}
          data={allUserdata}
          currentUserId={userData.user.id}
        />
      </div>
    </Router>
  );
}

export default MainView;
