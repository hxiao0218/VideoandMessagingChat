/* eslint-disable import/order */
// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// and set the environment variables. See http://twil.io/secure
const config = require('./config');

const accountSid = config.TWILIO_ACCOUNT_SID;
const authToken = config.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

console.log(accountSid, authToken);

client.conversations.conversations
  .create({ friendlyName: 'My First Conversation' })
  .then((conversation) => console.log(conversation.sid));

// client.conversations.conversations('CHXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
//   .fetch()
//   .then((conversation) => console.log(conversation.chatServiceSid));
