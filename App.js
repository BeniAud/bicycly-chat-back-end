const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const uid2 = require("uid2");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect(
  "mongodb://localhost:27017/chat-bicycly",
  {
    useNewUrlParser: true
  },
  function(err) {
    if (err) console.error("Could not connect to mongodb.");
  }
);
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// app.use(function(req, res) {
//   res.send({ msg: "hello" });
// });

const UserModel = mongoose.model("User", {
  name: String,
  messages: [
    {

      _idReceiver: String,

      createdAt: { type: Date, default: Date.now },
      text: String,
      user: {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      }
    }
  ]
});

app.post("/sign_up", function(req, res) {
  const newUser = new UserModel(req.body);
  newUser.save(function(err, createdUser) {
    if (err) {
      res.json({ error: err.message });
    } else {
      res.json(createdUser);
    }
  });

});

app.post("/sign_up", function(req, res) {
  const newUser = new UserModel(req.body);
  newUser.save(function(err, createdUser) {
    if (err) {
      res.json({ error: err.message });
    } else {
      res.json(createdUser);
    }
  });
});
app.get("/historyMessages", function(req, res) {
  UserModel.findOne({ _id: "5c0a54c7295c351171deae9f" }).exec(function(
    err,
    myAccount
  ) {
    console.log("findOne result", myAccount);
    res.json({ list: myAccount.messages });
  });
});
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on("connection", function connection(ws, req) {
  console.log("incoming connexion");
  ws.on("message", function incoming(message) {

    // console.log("incoming message");
    try {
      const dataJSON = JSON.parse(message);
      // console.log("dataJSON", dataJSON);
      // Save message for senderId and receiverId here
      UserModel.findOne({ _id: dataJSON._id }).exec(function(err, res) {
        // UserModel.findOne({ _id: dataJSON.user._id })
        if (err) {
          return res.json({ error: err.message });
        } else {
          // console.log("user", res);
          // console.log(res.messages);
          // console.log("message pushé", dataJSON);
          res.messages.push(dataJSON);
          res.save(function(err, savedMessage) {
            // console.log("message sauvegardé", savedMessage);
          });
        }
      });
      UserModel.findOne({ _id: dataJSON.user._id }).exec(function(
        err,
        userFound
      ) {
        // UserModel.findOne({ _id: dataJSON.user._id })
        if (err) {
          return res.json({ error: err.message });
        } else {
          // console.log("user", res);
          // console.log(res.messages);
          // console.log("message pushé", dataJSON);
          userFound.messages.push(dataJSON);
          userFound.save(function(err, savedMessage) {
            // console.log("message sauvegardé", savedMessage);

          });
        }
      });
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          if (dataJSON.text && dataJSON._id) {
            client.send(
              /* JSON.stringify({

                 _id: uid2(10),
                 text: dataJSON.text,
                 user: { name: dataJSON.name }
               }) */
              JSON.stringify({
                text: dataJSON.text,

                _id: dataJSON._id,
                user: {
                  _id: dataJSON.user._id
                }
              })
            );
          } else {
            // console.log("oops");
          }
        }
      });
    } catch (e) {
      console.error(e.message);
    }
  });
});

server.listen(process.env.PORT || 5001, function listening() {
  console.log("Listening on %d", server.address().port);
});
