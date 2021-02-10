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
} from '../network/getData';
import { setupWSConnection } from '../network/notifications';
import ContactComponent from './ContactComponent';
import MessageComponent from './MessageComponent';
import mockData from '../__mock__/getData_Mock.json';
import UserContext from '../context/UserContext';
import useInterval from './utils';
import './MainView.css';
import 'react-notifications-component/dist/theme.css';

function MainView({ user }) {
  const [data, setData] = useState([]);
  const [contactList, setContactList] = useState([]); // contact list
  const [conversations, setConversations] = useState([]); // twilio conversations
  const [numContacts, setNumContacts] = useState(0); // number of contacts
  const [numMessages, setNumMessages] = useState(0); // number of messages sent and received
  const [conversationIDArr, setConversationIDArr] = useState([]);
  const [notificationArr, setNotificationArr] = useState([]);
  const texts = useRef([]); // tmp storage of messages
  const { userData } = useContext(UserContext);
  // console.log(userData);
  // const updateContacts = () => setNumContacts((contacts) => contacts + 1);
  // const updateMessages = () => setNumMessages((messages) => messages + 1);
  // const updateContactList = (arr) => setContactList(arr);
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
    const curMessageArr = await Promise.all((conversationIDArr).map(async (cid) => {
      const curResp = await getMessagesByConversation(cid);
      console.log('curResp', curResp);
      const filteredResp = curResp.filter((msg) => msg.body === 'video_call');
      console.log('filteredResp', filteredResp);
      return filteredResp;
    }));
    console.log('curMessageArr', curMessageArr);
    setNotificationArr(curMessageArr);
    // delete cur notification to avoid repetitive alert
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
    notificationArr.forEach((notification) => {
      const { author } = notification;
      console.log(contactList);
      const authorList = contactList.filter((elem) => elem.id === author);
      console.log('authorList', authorList);
      if (!authorList) return;
      const authorName = authorList[0].username;
      console.log('authorName', authorName);
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
        <ContactComponent contactList={contactList} data={data} />
        <MessageComponent user={user || mockData.mockUser} contactList={contactList} />
      </div>
    </Router>
  );
}

export default MainView;
