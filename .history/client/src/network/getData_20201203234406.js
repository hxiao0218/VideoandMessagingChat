/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
const axios = require('axios');
// const mockData = require('../__mock__/getData_Mock.json');

const auth = {
  username: 'AC9eb25c66af41aae40b9be69660922a5d',
  password: 'fc6e0c4916cf4f33d087fc67cde3df43',
};

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

export const createConversation = async (contact, contactCID) => {
  const res = await axios.post('http://localhost:5000/messages/conversation', {
    contact,
    contactCID,
  });
  console.log(res);
  if (res.status !== 200) {
    console.log('[createConversation error]', res.error);
    return null;
  }
  return res.data;
};

export const fetchConversation = async (conversationId) => {
  const res = await axios.get('http://localhost:5000/messages/conversation', {
    params: {
      conversationId,
    },
  });
  if (res.status !== 200) {
    console.log('[getContacts error]', res.error);
    return null;
  }
  if (!res.data) return null;
  // console.log(res.data);
  return res.data;
};

// export const postFile = async (file, conversationId) => {
//   const bodyFormData = new FormData();
//   bodyFormData.append('file', file);
//   const res = await axios.post('http://localhost:5000/messages/message', {
//     conversationId,
//   }, {
//     data: bodyFormData,
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   if (res.status !== 200) {
//     console.log('[getContacts error]', res.error);
//     return null;
//   }
//   if (!res.data) return null;
//   // console.log(res.data);
//   return res.data;
// };

export const twilioMediaAuth = async () => {
  const res = await axios.get('https://mcs.us1.twilio.com/v1/Services', {
    auth: {
      username: 'AC9eb25c66af41aae40b9be69660922a5d',
      password: 'fc6e0c4916cf4f33d087fc67cde3df43',
    },
  });
  console.log(res);
  return res;
};

export const twilioMediaUpload = async (fileBlob) => {
  const binArr = await fileBlob.arrayBuffer();
  console.log('binArr', binArr);
  const res = await axios.post('https://mcs.us1.twilio.com/v1/Services/IS960c89f737814fd7baa53c4cf10a34b8/Media',
    {
      data: binArr,
    },
    {
      auth,
      headers: { 'Content-Type': fileBlob.type },
    });
  console.log('[twilio media upload res]: ', res);
  return res.data.sid;
};

export const sendTwilioMessage = async (senderID, mediaSID, conversationId) => {
  const res = await axios.post('http://localhost:5000/messages/message', {
    senderID, mediaSID, conversationId,
  });
  console.log(res);
  if (res.status !== 200) {
    console.log('[createConversation error]', res.error);
    return null;
  }
  return res.data;
};
