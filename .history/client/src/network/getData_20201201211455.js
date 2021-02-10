/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
const axios = require('axios');
// const mockData = require('../__mock__/getData_Mock.json');

export const getMessages = async (recipientId, contactId) => {
  // TODO: implement endpoint
  console.log('2 ids', recipientId, contactId);
  const token = localStorage.getItem('auth-token');
  // const params = `username=${contactId}&contactname=${recipientId}`;
  const res = await axios.get(
    'http://localhost:5000/users/messages', {
      headers: { 'x-auth-token': token },
      params: {
        username: contactId,
        contactname: recipientId,
      },
    },
  );
  // const res = mockData.getMessagesResp;
  console.log(res);
  if (res.status !== 200) {
    console.log('[getContacts error]', res.error);
    return null;
  }
  if (!res || !res.data) return null;
  return res.data;
};

export const validateAuth = async () => {
  const token = localStorage.getItem('auth-token');
  console.log(token);
  if (!token) return false;
  const resp = await axios.post(
    'http://localhost:5000/users/tokenIsValid',
    null,
    { headers: { 'x-auth-token': token } },
  );
  console.log(resp);
  if (resp.data) return true;
  return false;
};

export const getContacts = async (username) => {
  // TODO: remove mock data
  const token = localStorage.getItem('auth-token');
  const res = await axios.get('http://localhost:5000/users/contacts', {
    headers: { 'x-auth-token': token },
    params: {
      username,
    },
  });
  // console.log(res);
  // const res = mockData.getContactsResp;
  // return res.data.data;
  if (res.status !== 200) {
    console.log('[getContacts error]', res.error);
    return null;
  }
  if (!res.data) return null;
  // console.log(res.data);
  return res.data;
};

export const joinChat = async (user) => {
  try {
    if (user.length > 0) {
      const data = `username=${user}`;
      const res = await axios.post('http://localhost:5000/login', data);
      return res.data.token;
    }
  } catch (err) {
    console.log(err);
  }
};

export const sendMessage = async (sender, receiver, content) => {
  // const data = `to=${receiver}&from=${sender}&message=${content}`;
  const token = localStorage.getItem('auth-token');
  console.log('token = ', token);
  const res = await axios.post('http://localhost:5000/users/message', {
    to: receiver,
    from: sender,
    message: content,
  }, {
    headers: { 'x-auth-token': token },
  });
  if (res.status !== 200) {
    console.log('[sendMessage error]', res.error);
    return null;
  }
  return res.data.message;
};

export const retrieveToken = async (id) => {
  const token = localStorage.getItem('auth-token');
  console.log('token = ', token);
  const res = await axios.post('http://localhost:5000/messages/token', {
    id,
  }, {
    headers: { 'x-auth-token': token },
  });
  console.log(res);
  if (res.status !== 200) {
    console.log('[sendMessage error]', res.error);
    return null;
  }
  return res.data;
};

export const createConversation = async (contact) => {
  console.log('contact sent', contact);
  const res = await axios.post('http://localhost:5000/messages/conversation', {
    contact,
  });
  console.log(res);
  if (res.status !== 200) {
    console.log('[createConversation error]', res.error);
    return null;
  }
  return res.data;
};
