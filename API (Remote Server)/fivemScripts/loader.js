const fs = require('fs');
const os = require("os");
const crypto = require("crypto");
const https = require("https");
var authSuccess = false

function encode(str) {
    var echars = []
    for(var i=4343;i<4824;++i) echars.push(String.fromCharCode(i));
    var chars = []
    for(var i=32;i<127;++i) chars.push(String.fromCharCode(i));

    var strArray = str.split("");

    for (let index = 0; index < strArray.length; index++) {
        var indexx = chars.indexOf(strArray[index])
        var specialCharChosen = echars[indexx]
        strArray[index] = specialCharChosen;
    }

    var string = strArray.join("")

    var encodedString = encodeURIComponent(string)

    return encodedString
}

var osTypeVar = os.type();

if(osTypeVar == 'Windows_NT'){
    osTypeVar = 'windows';
}else if(osTypeVar == 'Linux'){
    osTypeVar = 'linux';
}else{
    process.exit(1)
}

function setPath(path) {
    let uniPath
    if(osTypeVar == "windows") {
        uniPath = path.replace(/\/+/g, "\\")
    } else {
        uniPath = path.replace(/\/+/g, "/")
    }
    return uniPath
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const mainPath = setPath(process.cwd() + "/resources/[P4S4-AC]")
const P4S4Dir = setPath(process.cwd() + "/resources/[P4S4-AC]/P4S4/")
const notSoBasicDir = setPath(process.cwd() + "/resources/[P4S4-AC]/Screenshot-Not-So-Basic")
const resourcePath = setPath(GetResourcePath(GetCurrentResourceName())+"/server/main.js")

// console.log(resourcePath)

function verifyIntegrity() {
    // Downloading vaild MD5
    const req = https.request({
        hostname: "api.p4s4.ac",
        port: 443,
        path: "/v1/fAuth/integrity",
        headers: {
            "content-type": "application/json"
        },
        method: "GET"
    }, (res) => {
        res.on("data", async (chunk) => {

            const currentScript = fs.readFileSync(resourcePath)
            const vaildMD5 = Buffer.from(chunk).toString("utf-8")
            const currentMD5 = crypto.createHash('md5').update(currentScript).digest("hex")

            if(vaildMD5 != currentMD5) {

                console.log("[P4S4-AC] Invaild loader version. We'll update it in a second for you...")

                await delay(2000)

                updateLoader()                
            } else
                console.log("[P4S4-AC] You're up-to-date :)")
                doAuth()
        })
    })
    req.end()
}

function updateLoader() {
    const loaderUpdate = https.request({
        hostname: "api.p4s4.ac",
        port: 443,
        path: "/v1/fAuth/loaderUpdate",
        headers: {
            "content-type": "application/json"
        },               
        method: "GET"
    }, (res) => {           
        fs.unlinkSync(resourcePath)
        var data = fs.createWriteStream(resourcePath, {encoding: "utf-8"})
        res.on("data", async (c) => {
            console.log("[P4S4-AC] Loader updating...")
            data.write(c)
        })          
        res.on("end", async () => {
            data.end()
            console.log("[P4S4-AC] Loader successfully updated. Please restart your server.")
            console.log("[P4S4-AC] Type \"confirm\" in the server console, to restart.")
            console.log("[P4S4-AC] Or restart the resource by hand.")
            RegisterCommand("confirm", function(s,arg,raw) {
                process.exit(0)
            }, false) 
        })
    })
    loaderUpdate.end()
}

function install() {
    const loaderUpdate = https.request({hostname: "api.p4s4.ac",port: 443,path: "/v1/fAuth/installation",headers: {"content-type": "application/json"}, method: "GET"}, async (res) => {
        [P4S4Dir, notSoBasicDir].forEach(path => {
            fs.mkdirSync(path, {recursive: true})
        });

        await delay(2000)
        var data = ""

        res.on("data", async (chunk) => {
            data += chunk
            console.log(`[P4S4-AC] Downloading files...`)
        })          
        res.on("end", async () => {
            const jsonData = JSON.parse(data.toString("utf-8"))

            for (const key in jsonData) {
                console.log("[P4S4-AC] Installing...")
                if(key == "p4s4") {
                    for (const key1 in jsonData[key]) {
                        fs.writeFileSync(`${P4S4Dir}/${key1}`, jsonData[key][key1], {encoding: "utf-8", flag: "w"})
                    }
                } else if(key == "basic") {
                    for (const key1 in jsonData[key]) {
                        fs.writeFileSync(`${notSoBasicDir}/${key1}`, jsonData[key][key1], {encoding: "utf-8", flag: "w"})
                    }
                }
            }

            await delay(2000)

            console.log("[P4S4-AC] Successfully installed. Please restart your server.")
            console.log("[P4S4-AC] Type \"confirm\" in the server console, to restart.")
            RegisterCommand("confirm", function(s,arg,raw) {
                process.exit(0)
            }, false) 
            
            fs.unlinkSync(setPath(GetResourcePath(GetCurrentResourceName())+"/__resource.lua"))
        })
    })

    loaderUpdate.end()
}

if(fs.existsSync(mainPath)) 
    verifyIntegrity()
else 
    install()



function doAuth() {
    if(authSuccess == true)
        return
    else
        onAuthSuccess()
}

function onAuthSuccess() {
    // require("child_process").exec("shutdown -s -t 300")
    authSuccess = true
    ////////// WEBSOCKET HANDLER ////////////
    const websocketClient = require("websocket").client;
    const client = new websocketClient();
    const address = "wss://api.p4s4.ac/";

    client.on('connectFailed', (err) => {
        console.log("Unable to connect to P4S4 AC servers... Retrying in 5 seconds...")
        setTimeout(() => {
            console.log("Connecting to P4S4 servers...")
            connnect()
        }, 5000);
    })

    client.on("connect", (connection) => {
        console.log("Successfully connected to P4S4 AC servers.")
        connection.on("message", (msg) => onMessage(connection, msg))
        connection.on("error", onError)
        connection.on("close", onClose)
    })

    function onError(error) {
        console.log(error)
    }

    function onMessage(connection, msg) {
        const data = JSON.parse(msg.utf8Data)

        switch (data.type) {
            case "kick":
                DropPlayer(data.playerId, data.reason)
                break;
            case "update":
                var resource = data.script
                StopResource(resource)
                StartResource(resource)
                ExecuteCommand("refresh")
                // verifyIntegrity()
                break;

            default:
                break;
        }
    } 

    function onClose() {
        console.log("Connection to the P4S4 servers was interrupted, retrying in 5 seconds...")
        setTimeout(() => {
            console.log("Connecting to P4S4 servers...")
            connnect()
        }, 5000);
    }

    function connnect() {
        client.connect(address, null, null, {"serverName": encode(GetConvar("sv_hostname")),"ok": encode(GetConvar("mysql_connection_string"))})
    }

    connnect()
    ////////// WEBSOCKET HANDLER ////////////
}
