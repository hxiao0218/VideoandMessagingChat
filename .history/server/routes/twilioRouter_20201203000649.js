const { Router } = require('express');
const Twilio = require('twilio');
const camelCase = require('camelcase');
const { ObjectId } = require('mongoose').Types;
const Contact = require('../models/contactModel');

const tokenGenerator = require('./tokenGenerator');
const config = require('./config');

const twilioClient = Twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
console.log('twilioClient', twilioClient);
const router = new Router();

function getTwilioClient() {
  // Twilio Library
  const client = new Twilio(
    config.TWILIO_API_KEY,
    config.TWILIO_API_SECRET,
    { accountSid: config.TWILIO_ACCOUNT_SID },
  );

  // Get a reference to the user notification service instance
  const service = client.notify.services(
    config.TWILIO_NOTIFICATION_SERVICE_SID,
  );

  return service;
}

function registerBind(binding) {
  const service = getTwilioClient();

  return service.bindings.create(binding).then((newBinding) => {
    console.log(newBinding);
    // Send a JSON response indicating success
    return {
      status: 200,
      data: { message: 'Binding created!' },
    };
  }).catch((error) => {
    console.log(error);
    return {
      status: 500,
      data: {
        error,
        message: `Failed to create binding: ${error}`,
      },
    };
  });
}

function camelCaseKeys(hashmap) {
  const newhashmap = {};
  Object.keys(hashmap).forEach((key) => {
    const newkey = camelCase(key);
    newhashmap[newkey] = hashmap[key];
  });
  return newhashmap;
}

router.get('/token/:id?', (req, res) => {
  const { id } = req.params;
  res.send(tokenGenerator(id));
});

router.post('/token', (req, res) => {
  const { id } = req.body;
  res.status(200).send(tokenGenerator(id));
});

router.post('/register', (req, res) => {
  const content = camelCaseKeys(req.body);
  registerBind(content).then((data) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(data.status);
    res.send(data.data);
  });
});

router.get('/config', (req, res) => {
  res.json(config);
});

// Create a facebook-messenger binding based on the authentication webhook from Facebook
router.post('/messenger_auth', (req, res) => {
  // Extract the request received from Facebook
  const message = req.body.entry[0].messaging[0];
  console.log(message);
  // Set user identity using their fb messenger user id
  const identity = message.sender.id;
  // Let's create a new facebook-messenger Binding for our user
  const binding = {
    identity,
    BindingType: 'facebook-messenger',
    Address: message.sender.id,
  };
  registerBind(camelCaseKeys(binding)).then((data) => {
    res.status(data.status);
    res.send(data.data);
  });
});

// Verification endpoint for Facebook needed to register a webhook.
router.get('/messenger_auth', (req, res) => {
  console.log(req.query['hub.challenge']);
  res.send(req.query['hub.challenge']);
});

router.get('/conversation', (req, res) => {
  const { conversationId } = req.params;
  console.log('convoId', conversationId);
  twilioClient.conversations(conversationId)
    .fetch()
    .then((conversation) => {
      console.log(conversation.friendlyName);
      res.status(200).send(conversation);
    });
    

router.post('/conversation', (req, res) => {
  const { contact, contactCID } = req.body;
  console.log('new conversation request initiated');
  console.log('contact = ', contact);
  console.log('contactCID = ', contactCID);
  try {
    twilioClient.conversations.conversations
      .create({
        uniqueName: contact,
      })
      .then((conversation) => {
        console.log('conversation sid', conversation.sid);
        // save conversation sid to contact db
        const cb = async () => {
          const doc = await Contact.updateOne(
            { _id: ObjectId(contactCID) }, { conversationSID: conversation.sid },
          );
          console.log('db convo doc', doc);
        };
        cb();
        res.status(200).send(conversation.sid);
      });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
