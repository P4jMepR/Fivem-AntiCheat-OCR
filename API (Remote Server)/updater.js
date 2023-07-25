var net = require("net");

process.on("message", (msg, handle) => {
    var script = msg.script
    switch (script) {
        case "lua":
            var data = {
                script: "P4S4"
            }
            var jsonData = JSON.stringify(data)
            var dataSerialized = Buffer.from(jsonData)
            broadcast(dataSerialized)
            break;
    
        case "all":
            var data = {
                script: "all"
            }
            var jsonData = JSON.stringify(data)
            var dataSerialized = Buffer.from(jsonData)
            broadcast(dataSerialized)
            break;

        default:
            break;
    }
})

var sockets = []

const broadcast = (msg) => { 
    //Loop through the active clients object
    sockets.forEach((client) => {
        client.write(msg);
    });
};

var server = net.createServer(socket => {
    console.log('CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);
    sockets.push(socket);
    socket.on('end', () => {
        console.log('DISCONNECTED: '+ socket.remoteAddress + ":" + socket.remotePort);
        // remove the client for list
        let index = sockets.indexOf(socket);
        if (index !== -1) {
            sockets.splice(index, 1);
        }
    });
    socket.on("error", (err) => {
        console.log("error happened " + err.message)
    })
})


server.listen(1337, () => {
    console.log("Updater server started at 1337")
})