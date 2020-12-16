/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
const axios = require('axios');
// const blobUtil = require('blob-util');
// const mockData = require('../__mock__/getData_Mock.json');

const auth = {
  username: 'AC9eb25c66af41aae40b9be69660922a5d',
  password: 'fc6e0c4916cf4f33d087fc67cde3df43',
};
const baseTwilioMediaURL = 'https://mcs.us1.twilio.com/v1/Services/IS960c89f737814fd7baa53c4cf10a34b8/Media/';

export const getMessages = async (recipientId, contactId) => {
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
  // console.log(res);
  if (res.status !== 200) {
    console.log('[getContacts error]', res.error);
    return null;
  }
  if (!res || !res.data) return [];
  const finalObj = res.data.map((msg) => {
    const retObj = {
      message_type: 'text',
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.created_at,
    };
    return retObj;
  });
  return finalObj;
};

export const validateAuth = async () => {
  const token = localStorage.getItem('auth-token');
  // console.log(token);
  if (!token) return false;
  const resp = await axios.post(
    'http://localhost:5000/users/tokenIsValid',
    null,
    { headers: { 'x-auth-token': token } },
  );
  // console.log(resp);
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
  // console.log('token = ', token);
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
  // console.log('token = ', token);
  const res = await axios.post('http://localhost:5000/messages/token', {
    id,
  }, {
    headers: { 'x-auth-token': token },
  });
  // console.log(res);
  if (res.status !== 200) {
    console.log('[sendMessage error]', res.error);
    return null;
  }
  return res.data;
};

export const createConversation = async (contact, contactCID) => {
  console.log('create conversation front end get data inside', 'contact', contact, 'contactcid', contactCID);
  const res = await axios.post('http://localhost:5000/messages/conversation', {
    contact,
    contactCID,
  });
  // console.log(res);
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

export const twilioDeleteConversation = async (conversationId) => {
  console.log('get data ->>>>>> delete conversation');
  const res = await axios.delete('http://localhost:5000/messages/conversation', {
    params: {
      conversationId,
    },
  });
  if (res.status !== 200) {
    console.log('[delete conversation error]', res.error);
    return null;
  }
  if (!res.data) return null;
  // console.log(res.data);
  return null;
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

export const twilioMediaUpload = async (binStr, imageType) => {
  const res = await axios({
    method: 'post',
    url: 'https://mcs.us1.twilio.com/v1/Services/IS960c89f737814fd7baa53c4cf10a34b8/Media',
    data: binStr,
    headers: { 'Content-Type': imageType },
    auth,
  });
  console.log('[twilio media upload res]: ', res);
  return res.data.sid;
};

export const sendTwilioMessage = async (senderID, mediaSID, conversationId) => {
  const res = await axios.post('http://localhost:5000/messages/message', {
    senderID, mediaSID, conversationId,
  });
  // console.log(res);
  if (res.status !== 200) {
    console.log('[createConversation error]', res.error);
    return null;
  }
  return res.data;
};

export const getMessagesByConversation = async (conversationId) => {
  const res = await axios.get('http://localhost:5000/messages/messages', {
    params: {
      conversationId,
    },
  });
  if (res.status !== 200) {
    console.log('[getMessagesByConversation error]', res.error);
    return [];
  }
  if (!res.data) return [];
  const messages = res.data;
  // console.log('[getMessagesByConversation - messages]', messages);
  const finalObjArr = await Promise.all((messages).map(async (msg) => {
    const messageId = msg.sid;
    const msgMediaURL = baseTwilioMediaURL + msg.media[0].sid;
    // console.log('msgMediaURL', msgMediaURL);
    const mediaResp = await axios.get(msgMediaURL, {
      auth,
    });
    // console.log('mediaResp', mediaResp);
    const finalObj = {
      content_type: msg.media[0].content_type,
      mediaURL: mediaResp.data.links.content_direct_temporary,
      sender: msg.author,
      timestamp: msg.dateCreated,
      message_type: 'media',
      message_id: messageId,
    };
    // console.log('finalObj', finalObj);
    return finalObj;
  }));
  // console.log('finalObjArr', finalObjArr);
  return finalObjArr;
};

export const deleteConversation = async (recipientId, contactId) => {
  console.log('2 ids', recipientId, contactId);
  const token = localStorage.getItem('auth-token');
  // const params = `username=${contactId}&contactname=${recipientId}`;
  const res = await axios.delete(
    'http://localhost:5000/users/conversation', {
      headers: { 'x-auth-token': token },
      params: {
        username: contactId,
        contactname: recipientId,
      },
    },
  );
  if (res.status !== 200) {
    console.log('[delete conversation error]', res.error);
    return null;
  }
  console.log('delete conversation success');
  return null;
};

// export const getAllUsers = async () => {
//   // TODO: remove mock data
//   const res = await axios.get('http://localhost:5000/users/allusers');
//   // console.log(res);
//   // const res = mockData.getContactsResp;
//   // return res.data.data;
//   console.log('get all users ->>>>>>', res);
//   if (res.status !== 200) {
//     console.log('[getallusers error]', res.error);
//     return null;
//   }
//   if (!res) return null;
//   // console.log(res.data);
//   return res;
// };

// delete contact
export const deleteContact = async (recipientId, contactId) => {
  console.log('2 ids', recipientId, contactId);
  const token = localStorage.getItem('auth-token');
  // const params = `username=${contactId}&contactname=${recipientId}`;
  const res = await axios.delete(
    'http://localhost:5000/users/unfriend', {
      headers: { 'x-auth-token': token },
      params: {
        username: contactId,
        contactname: recipientId,
      },
    },
  );
  if (res.status !== 200) {
    console.log('[delete contact error]', res.error);
    return null;
  }
  console.log('delete contact success');
  return null;
};

export const deleteOneMesssage = async (recipientId, contactId, messageContent) => {
  console.log('2 ids', recipientId, contactId);
  const token = localStorage.getItem('auth-token');
  // const params = `username=${contactId}&contactname=${recipientId}`;
  const res = await axios.delete(
    'http://localhost:5000/users/onemessage', {
      headers: { 'x-auth-token': token },
      params: {
        username: contactId,
        contactname: recipientId,
        messagecontent: messageContent,
      },
    },
  );
  if (res.status !== 200) {
    console.log('[delete conversation error]', res.error);
    return null;
  }
  console.log('delete conversation success');
  return null;
};

export const addContact = async (recipientId, contactId) => {
  console.log('2 ids', recipientId, contactId);
  const token = localStorage.getItem('auth-token');
  // const params = `username=${contactId}&contactname=${recipientId}`;
  console.log('getData back end add contact');
  const res = await axios.get(
    'http://localhost:5000/users/addfriend', {
      headers: { 'x-auth-token': token },
      params: {
        username: contactId,
        contactname: recipientId,
      },
    },
  );
  if (res.status !== 200) {
    console.log('[add contact error]', res.error);
    return null;
  }
  console.log('front end add contact success');
  return null;
};

export const getAllUsers = async (username) => {
  // TODO: remove mock data
  console.log('get all users get data front end inside');
  const token = localStorage.getItem('auth-token');
  const res = await axios.get('http://localhost:5000/users/getAllUsers', {
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

export const getFriendList = async (username) => {
  // TODO: remove mock data
  console.log('get friendlist get data front end inside');
  const token = localStorage.getItem('auth-token');
  const res = await axios.get('http://localhost:5000/users/friendlist', {
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

export const deleteMediaMessage = async (conversationId, messageId) => {
  console.log('delete media message inside front end get data', conversationId, messageId);
  const res = await axios.get('http://localhost:5000/messages/onemessage', {
    params: {
      conversationId,
      messageId,
    },
  });
  // console.log(res);
  if (res.status !== 200) {
    console.log('[delete media message error]', res.error);
    return null;
  }
  return res.data;
};

export const deleteMediaConversation = async (conversationId, contactcid) => {
  console.log('delete media message inside front end get data', conversationId);
  const res = await axios.get('http://localhost:5000/messages/deleteconversation', {
    params: {
      conversationId,
    },
  });
  // console.log(res);
  if (res.status !== 200) {
    console.log('[delete media conversation error]', res.error);
    return null;
  }
  const res1 = await axios.get('http://localhost:5000/users/setconversationidnull', {
    params: {
      contactcid,
    },
  });

  if (res1.status !== 200) {
    console.log('[delete media conversation error]', res1.error);
    return null;
  }
  return res1.data;
};
