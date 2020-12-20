/* eslint-disable quotes */
/* eslint-disable no-console */
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const multer = require("multer");
const path = require('path');

// const upload = multer();
const cors = require("cors");
require("dotenv").config();

// set up express
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static('public'));

// heroku enabled/assigned port variable or local host 5000
const PORT = process.env.PORT || 5000;
const MONGO_CONN = process.env.MONGODB_CONNECTION_STRING || 'mongodb+srv://proj557:dbPassword@cluster0.f7g1w.mongodb.net/chatdb?retryWrites=true&w=majority';

app.listen(PORT, () => {
  console.log(`Serving your app now on ${PORT}`);
});

// set up mongoose
mongoose
  .connect(MONGO_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN");
  })
  .catch((err) => {
    console.log("MONGO CONNECTION ERROR");
    console.log(err);
  });

app.use(express.static('client/build'));

// set up routes
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../client/build/index.html')); });
app.use("/users", require("./routes/userRouter"));
app.use("/posts", require("./routes/postRouter"));
app.use("/messages", require("./routes/twilioRouter"));

// If no API routes are hit, send the React app

