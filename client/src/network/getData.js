/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
const axios = require('axios');
const mockData = require('../__mock__/getData_Mock.json');

export const getMessages = async (recipientId, contactId) => {
  // TODO: implement endpoint
  console.log(recipientId, contactId);
  const res = mockData.getMessagesResp;
  if (res.status !== 200) {
    console.log('[getContacts error]', res.error);
    return null;
  }
  if (!res.data || !res.data.data) return null;
  return res.data.data;
};

export const getContacts = async () => {
  // TODO: remove mock data
  // const res = await axios.get('http://localhost:8080/users');
  const res = mockData.getContactsResp;
  // return res.data.data;
  if (res.status !== 200) {
    console.log('[getContacts error]', res.error);
    return null;
  }
  if (!res.data || !res.data.data) return null;
  console.log(res.data.data);
  return res.data.data;
};

export const joinChat = async (user) => {
  try {
    if (user.length > 0) {
      const data = `username=${user}`;
      const res = await axios.post('http://localhost:8080/login', data);
      return res.data.token;
    }
  } catch (err) {
    console.log(err);
  }
};

export const sendMessage = async (sender, receiver, content) => {
  const data = `to=${receiver}&from=${sender}&message=${content}`;
  const res = await axios.post('http://localhost:8080/message', data);
  return res.data.message;
};
