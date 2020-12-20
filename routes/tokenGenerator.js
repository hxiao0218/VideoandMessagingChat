/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable consistent-return */
const { AccessToken } = require("twilio").jwt;

const { VideoGrant } = AccessToken;
const config = require("./config");

// general tokens
const twilioAccountSid = config.TWILIO_ACCOUNT_SID;
const twilioApiKey = config.TWILIO_API_KEY;
const twilioApiSecret = config.TWILIO_API_SECRET;

// chat tokens
// const serviceSid = config.TWILIO_CHAT_SERVICE_SID;

const tokenGenerator = (identity, room) => {
  if (!identity || !room) return;
  const videoGrant = new VideoGrant({ room });
  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
  );
  token.identity = identity;
  token.addGrant(videoGrant);
  return {
    identity: token.identity,
    token: token.toJwt(),
  };
};

module.exports = tokenGenerator;
