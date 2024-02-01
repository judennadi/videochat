const path = require("path");
require("dotenv").config();
const express = require("express")
const app = express()
const server = require("http").createServer(app);
const cors = require("cors");


const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "prod") {
  app.use(express.static("client/site"));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/site/index.html"));
  });
} else {
  app.get('/', (req, res) => {
		res.send('Running');
	});
}


io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
