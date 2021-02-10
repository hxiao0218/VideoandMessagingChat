// /* eslint-disable consistent-return */
// /* eslint-disable no-console */
// /* eslint-disable import/prefer-default-export */
const axios = require('axios');
// const blobUtil = require('blob-util');
// const mockData = require('../__mock__/getData_Mock.json');

const auth = {
  username: 'AC9eb25c66af41aae40b9be69660922a5d',
  password: 'fc6e0c4916cf4f33d087fc67cde3df43',
};
const baseTwilioMediaURL = 'https://mcs.us1.twilio.com/v1/Services/IS960c89f737814fd7baa53c4cf10a34b8/Media/';
const herokuBaseURL = 'https://server2-heroku-new.herokuapp.com/';

export const getMessages = async (recipientId, contactId) => {
  (function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
  })();
  console.log('2 ids', recipientId, contactId);
  const token = localStorage.getItem('auth-token');
  // const params = `username=${contactId}&contactname=${recipientId}`;
  const res = await axios.get(
    `${herokuBaseURL}users/messages`, {
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
      read: msg.read,
      delivered: msg.delivered,
    };
    return retObj;
  });
  console.log('[read test]', finalObj);
  return finalObj;
};

export const validateAuth = async () => {
  const token = localStorage.getItem('auth-token');
  // console.log(token);
  if (!token) return false;
  const resp = await axios.post(
    `${herokuBaseURL}users/tokenIsValid`,
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
  const res = await axios.get(`${herokuBaseURL}users/contacts`, {
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
      const res = await axios.post(`${herokuBaseURL}login`, data);
      return res.data.token;
    }
  } catch (err) {
    console.log(err);
  }
};

export const sendMessage = async (sender, receiver, content, contactUID) => {
  // const data = `to=${receiver}&from=${sender}&message=${content}`;
  const token = localStorage.getItem('auth-token');
  // console.log('token = ', token);
  const res = await axios.post(`${herokuBaseURL}users/message`, {
    to: receiver,
    from: sender,
    message: content,
    id: contactUID,
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
  const res = await axios.post(`${herokuBaseURL}messages/token`, {
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
  const res = await axios.post(`${herokuBaseURL}messages/conversation`, {
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
  (function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
  })();
  const res = await axios.get(`${herokuBaseURL}messages/conversation`, {
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
  (function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
  })();
  console.log('get data ->>>>>> delete conversation');
  const res = await axios.delete(`${herokuBaseURL}messages/conversation`, {
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

export const twilioMediaAuth = async () => {
  (function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
  })();
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
  (function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
  })();
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
  (function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
  })();
  const res = await axios.post(`${herokuBaseURL}messages/message`, {
    senderID, mediaSID, conversationId,
  });
  // console.log(res);
  if (res.status !== 200) {
    console.log('[createConversation error]', res.error);
    return null;
  }
  return res.data;
};

export const deleteTwilioMessage = async (conversationID, messageSID) => {
  (function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
  })();
  const res = await axios.delete(`${herokuBaseURL}messages/message`, {
    data: {
      conversationID, messageSID,
    },
  });
  console.log(res);
  if (res.status !== 200) {
    console.log('[deleteTwilioMessage error]', res.error);
    return null;
  }
  return res.data;
};

export const getMessagesByConversation = async (conversationId, userId, readUpdate = false) => {
  (function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
  })();
  
  const res = await axios.get(`${herokuBaseURL}messages/messages`, {
    params: {
      conversationId, userId, readUpdate,
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
    if (!msg.media) {
      const noMediaMsg = {
        author: msg.author,
        body: msg.body,
        dateCreated: msg.dateCreated,
        conversationSID: msg.conversationSid,
        msgSID: msg.sid,
      };
      return noMediaMsg;
    }
    const msgMediaURL = baseTwilioMediaURL + msg.media[0].sid;
    // console.log('msgMediaURL', msgMediaURL);
    const mediaResp = await axios.get(msgMediaURL, {
      auth,
    });
    const attribObj = JSON.parse(msg.attributes);
    // console.log('mediaResp', mediaResp);
    const finalObj = {
      content_type: msg.media[0].content_type,
      mediaURL: mediaResp.data.links.content_direct_temporary,
      sender: msg.author,
      timestamp: msg.dateCreated,
      message_type: 'media',
      read: attribObj.read,
      delivered: attribObj.delivered,
    };
    // console.log('finalObj', finalObj);
    return finalObj;
  }));
  console.log('[read test]', finalObjArr);
  return finalObjArr;
};

export const getVideoRoomToken = async (identity, room) => {
  const res = await axios.get(`${herokuBaseURL}messages/token`, {
    params: {
      identity, room,
    },
  });
  if (res.status !== 200) {
    console.log('[getVideoRoomToken error]', res.error);
    return null;
  }
  if (!res.data) return null;
  console.log('[getVideoRoomToken] ', res.data);
  return res.data;
};

export const deleteConversation = async (recipientId, contactId) => {
  console.log('2 ids', recipientId, contactId);
  const token = localStorage.getItem('auth-token');
  // const params = `username=${contactId}&contactname=${recipientId}`;
  const res = await axios.delete(
    `${herokuBaseURL}users/conversation`, {
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

// delete contact
export const deleteContact = async (recipientId, contactId) => {
  console.log('2 ids', recipientId, contactId);
  const token = localStorage.getItem('auth-token');
  // const params = `username=${contactId}&contactname=${recipientId}`;
  const res = await axios.delete(
    `${herokuBaseURL}users/unfriend`, {
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
    `${herokuBaseURL}users/onemessage`, {
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
    `${herokuBaseURL}users/addfriend`, {
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
  const res = await axios.get(`${herokuBaseURL}users/getAllUsers`, {
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
  const res = await axios.get(`${herokuBaseURL}users/friendlist`, {
    headers: { 'x-auth-token': token },
    params: {
      username,
    },
  });
  if (res.status !== 200) {
    console.log('[getContacts error]', res.error);
    return null;
  }
  if (!res.data) return null;
  console.log('[getVideoRoomToken] ', res.data);
  return res.data;
};

export const deleteMediaMessage = async (conversationId, messageId) => {
  console.log('delete media message inside front end get data', conversationId, messageId);
  const res = await axios.get(`${herokuBaseURL}messages/onemessage`, {
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
  const res = await axios.get(`${herokuBaseURL}messages/deleteconversation`, {
    params: {
      conversationId,
    },
  });
  // console.log(res);
  if (res.status !== 200) {
    console.log('[delete media conversation error]', res.error);
    return null;
  }
  const res1 = await axios.get(`${herokuBaseURL}users/setconversationidnull`, {
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
