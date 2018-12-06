const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const uid2 = require("uid2");

const app = express();

app.use(function(req, res) {
  res.send({ msg: "hello" });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws, req) {
  ws.on("message", function incoming(message) {
    try {
      const dataJSON = JSON.parse(message);
      console.log(dataJSON);

      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          if (dataJSON.text && dataJSON.name) {
            client.send(
              JSON.stringify({
                _id: uid2(10),
                text: dataJSON.text,
                user: { name: dataJSON.name }
              })
            );
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
