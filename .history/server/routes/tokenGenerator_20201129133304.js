/* eslint-disable consistent-return */
const { AccessToken } = require('twilio').jwt;

const { ChatGrant, VideoGrant } = AccessToken;
const config = require('./config');

// general tokens
const twilioAccountSid = config.TWILIO_ACCOUNT_SID;
const twilioApiKey = config.TWILIO_API_KEY;
const twilioApiSecret = config.TWILIO_API_SECRET;

// chat tokens
const serviceSid = config.TWILIO_CHAT_SERVICE_SID;

const tokenGenerator = (identity) => {
  if (!identity) return;
  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
  );
  token.identity = identity;
  const chatGrant = new ChatGrant({
    serviceSid,
  });
  token.addGrant(chatGrant);
  const videoGrant = new VideoGrant();
  token.addGrant(videoGrant);
  return {
    identity: token.identity,
    toekn: token.toJwt(),
  };
};
