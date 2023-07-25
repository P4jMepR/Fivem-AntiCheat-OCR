// SET PROCESS WIDE VARS
process.env.scripts = __dirname + "/fivemScripts"

// Import libraries
const express = require("express");
const app = express();
const httpServer = require("http");
const httpsServer = require("https");
const cookieParser = require("cookie-parser");
const child_process = require("child_process")
const fs = require("fs")
const prompt = require("prompt")

// Socket init
const Websocket = require("./v1/lib/clientServerComm.js");
const server = httpsServer.createServer({
    cert: fs.readFileSync("/home/mikel2422/authApi/cert.pem"),
    key: fs.readFileSync("/home/mikel2422/authApi/key.pem")
}, app)

// const server = httpServer.createServer(app)

const sockets = new Websocket(server);
socketServer = sockets.createSocketServer();

// Accept JSON body encoding
app.use(express.json({limit: "100mb", extended: true}));

// Import Routes
const v1Route = require("./v1/routes/api.js");

// Routing to APIv1
app.use('/v1', v1Route);

// Read cookies
app.use(cookieParser())

// Respond welcome
app.all("*", (req, res) => {
    res.json({
        "status": "Welcome, to P4S4 API!"
    })
})

// Start listening
server.listen(6969, () => {
    console.log("API server started at 6969")
})

// Start Updater Server
var updater = child_process.fork("./updater.js")

prompt.start()

function listen() {
    prompt.get("command", (e, r) => {
        var cmdArray = r.command.split(/ +/g)
        var cmd = cmdArray[0]
        var args = cmdArray.slice(1)
        switch (cmd) {
            case "update":
                var data = {
                    script: args[0]
                }
                updater.send(data)
                console.log("Sent update notification")
                break;

            default:
                break;
        }
        listen()
    })
}

listen()