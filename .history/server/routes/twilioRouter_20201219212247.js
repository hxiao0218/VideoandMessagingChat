/* eslint-disable comma-dangle */
/* eslint-disable quotes */
const { Router } = require("express");
const Twilio = require("twilio");
const camelCase = require("camelcase");
const axios = require('axios');
// const bodyParser = require('body-parser');
const { ObjectId } = require("mongoose").Types;
const Contact = require("../models/contactModel");

const tokenGenerator = require("./tokenGenerator");
const config = require("./config");

const twilioClient = Twilio(
  config.TWILIO_ACCOUNT_SID,
  config.TWILIO_AUTH_TOKEN
);
// console.log('twilioClient', twilioClient);
const router = new Router();

// const baseTwilioMediaURL = 'https://mcs.us1.twilio.com/v1/Services/IS960c89f737814fd7baa53c4cf10a34b8/Media/';

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

router.get('/token', (req, res) => {
  const { identity, room } = req.query;
  res.status(200).send(tokenGenerator(identity, room));
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
router.get("/messenger_auth", (req, res) => {
  console.log(req.query["hub.challenge"]);
  res.send(req.query["hub.challenge"]);
});

router.get("/conversation", (req, res) => {
  // const { conversationId } = req.params;
  const { conversationId } = req.query;
  console.log("convoId", conversationId);
  twilioClient.conversations
    .conversations(conversationId)
    .fetch()
    .then((conversation) => {
      console.log(conversation);
      res.status(200).send(conversation);
    });
});

router.post("/conversation", (req, res) => {
  const { contact, contactCID } = req.body;
  console.log("new conversation request initiated");
  console.log("contact = ", contact);
  console.log("contactCID = ", contactCID);
  try {
    twilioClient.conversations.conversations
      .create({
        uniqueName: contact,
      })
      .then((conversation) => {
        console.log("conversation sid", conversation.sid);
        // save conversation sid to contact db
        const cb = async () => {
          const doc = await Contact.updateOne(
            { _id: ObjectId(contactCID) },
            { conversationSID: conversation.sid }
          );
          console.log("db convo doc", doc);
        };
        cb();
        res.status(200).send(conversation.sid);
      });
  } catch (error) {
    console.log(error);
  }
});

router.post('/message', (req, res) => {
  const { senderID, mediaSID, conversationId } = req.body;
  const attributesObj = {
    read: false,
    delivered: false,
  };
  console.log("senderID, mediaSID", senderID, mediaSID, conversationId);
  if (!mediaSID) {
    twilioClient.conversations
      .conversations(conversationId)
      .messages.create({
        author: senderID,
        body: "video_call",
        attributes: JSON.stringify(attributesObj),
      })
      .then((message) => {
        console.log(message);
        res.status(200).send(message);
      });
  } else {
    twilioClient.conversations
      .conversations(conversationId)
      .messages.create({ author: senderID, mediaSid: mediaSID })
      .then((message) => {
        console.log(message);
        res.status(200).send(message);
      });
  }
});

router.delete("/message", (req, res) => {
  const { conversationID, messageSID } = req.body;
  console.log("conversationID, messageSID", conversationID, messageSID);
  twilioClient.conversations
    .conversations(conversationID)
    .messages(messageSID)
    .remove()
    .then((resp) => {
      console.log(resp);
      res.status(200).send(resp);
    });
});

router.get('/messages', (req, res) => {
  const { conversationId, userId, readUpdate } = req.query;
  const attributesObj = {
    read: true,
    delivered: true,
  };
  twilioClient.conversations
    .conversations(conversationId)
    .messages.list()
    .then(async (messages) => {
      console.log("[twilio messages]", messages);
      if (!messages) return;
      // update read reciepts
      if (readUpdate) {
        try {
          Promise.all(
            messages.forEach(async (msg) => {
              if (msg.author === userId) {
                console.log("author === userId", userId);
                return;
              }
              twilioClient.conversations
                .conversations(conversationId)
                .messages(msg.sid)
                .update({
                  attributes: JSON.stringify(attributesObj),
                })
                .then((resp) => console.log("[readReciepts]", resp));
            })
          );
        } catch (error) {
          console.log(error);
        }
      }
      res.status(200).send(messages);
    });
});

router.get('/auth', async (req, res) => {
  const resp = await axios.get('https://mcs.us1.twilio.com/v1/Services', {
    auth: {
      username: 'AC9eb25c66af41aae40b9be69660922a5d',
      password: 'fc6e0c4916cf4f33d087fc67cde3df43',
    },
  });
  console.log('[auth res]', res);
  res.status(200).send(resp);
});

// router.delete('/conversation', (req, res) => {
//   // const { conversationId } = req.params;
//   const { conversationId } = req.query;
//   console.log('delete convoId!!!!!!', conversationId);
//   twilioClient.conversations.conversations(conversationId)
//     .delete()
//     .then((conversation) => {
//       console.log('conversation deleted');
//       res.status(200).send(conversation);
//     });
// });

router.get("/onemessage", (req, res) => {
  // const { conversationId } = req.params;
  const { conversationId, messageId } = req.query;
  console.log(
    "delete media message inside back end!!!!!!",
    conversationId,
    messageId
  );
  twilioClient.conversations
    .conversations(conversationId)
    .messages(messageId)
    .remove()
    .then((conversation) => {
      console.log("media message deleted backend ", conversation);
      res.status(200).send(conversation);
    });
});

router.get("/deleteconversation", (req, res) => {
  // const { conversationId } = req.params;
  const { conversationId } = req.query;
  console.log(
    "delete media conversation inside back end!!!!!!",
    conversationId
  );
  twilioClient.conversations
    .conversations(conversationId)
    .remove()
    .then((conversation) => {
      console.log("media conversation deleted backend ", conversation);
      res.status(200).send(conversation);
    });
});

// router.get("/twilioMedia", (req, res) => {
//   const { mediaSID } = req.query;
//   const mediaURL = baseTwilioMediaURL + mediaSID;
//   const mediaResp = await axios.get()
// });

module.exports = router;
