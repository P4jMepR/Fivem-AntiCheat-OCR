const fs = require('fs');
const os = require("os");
const crypto = require("crypto");
const https = require("https");
const net = require("net");
const debug = false

function checkForUpdates() {
    const req = https.request({
        hostname: "api.p4s4.ac",
        port: 443,
        path: "/v1/fAuth/integrity",
        headers: {
            "content-type": "application/json"
        },
        method: "GET"
    }, (res) => {
        var data = ""
        
        res.on("data", async (chunk) => {
            data += chunk
            // console.log(`[P4S4-AC] Downloading data...`) 
        })
    
        res.on("end", () => {
            const pathP4S4 = GetResourcePath("P4S4")
            const pathBasic = GetResourcePath("Screenshot-Not-So-Basic")
            const pathUpdater = GetResourcePath("P4S4-Updater")
        
            if(pathUpdater == null | pathBasic == null | pathP4S4 == null) {
                console.log("[P4S4-AC] Your anti-cheat version seems to be unstable. Please make sure you installed the resource correctly.")
            } else {
                var P4S4Files = {}
                var BasicFiles = {}
                var UpdaterFiles = {}
            
                fs.readdirSync(pathP4S4).forEach(path => {
                    if(path != "config.lua")
                        P4S4Files[path] = crypto.createHash('md5').update(fs.readFileSync(`${pathP4S4}/${path}`)).digest("hex")
                })
                
                fs.readdirSync(pathBasic).forEach(path => {
                    BasicFiles[path] = crypto.createHash('md5').update(fs.readFileSync(`${pathBasic}/${path}`)).digest("hex")
                })
            
                fs.readdirSync(pathUpdater).forEach(path => {
                    UpdaterFiles[path] = crypto.createHash('md5').update(fs.readFileSync(`${pathUpdater}/${path}`)).digest("hex")
                })
    
                const dataLocal = {
                    p4s4: P4S4Files, 
                    basic: BasicFiles,
                    updater: UpdaterFiles
                }
                
                var dataRemote = {}
                try {
                    dataRemote = JSON.parse(data)
                } catch (error) {
                    
                }
    
                const toUpdate = {}
    
                for (const key in dataRemote) {
                    if(key == "updater") {
                        for (const key1 in dataRemote[key]) {
                            if(debug) {
                                console.log("remote",key,key1,dataRemote[key][key1])
                                console.log("local",key,key1,dataLocal[key][key1])
                            }
                            if(dataRemote[key][key1] != dataLocal[key][key1]) {
                                toUpdate[key] = key1
                            }
                        }
                    }
                    if(key == "p4s4") {
                        for (const key1 in dataRemote[key]) {
                            if(debug) {
                                console.log("remote",key,key1,dataRemote[key][key1])
                                console.log("local",key,key1,dataLocal[key][key1])
                            }
                            if((dataRemote[key][key1] != dataLocal[key][key1]) & (key1 != "config.lua")) {
                                toUpdate[key] = key1
                            }
                        }
                    }
                    if(key == "basic") {
                        for (const key1 in dataRemote[key]) {
                            if(debug) {
                                console.log("remote",key,key1,dataRemote[key][key1])
                                console.log("local",key,key1,dataLocal[key][key1])
                            }
                            if(dataRemote[key][key1] != dataLocal[key][key1]) {
                                toUpdate[key] = key1
                            }
                        }
                    }
                }
    
                if(Object.entries(toUpdate).length != 0) {
                    const loaderUpdate = https.request({hostname: "api.p4s4.ac",port: 443,path: "/v1/fAuth/installation",headers: {"content-type": "application/json"}, method: "GET"}, async (res) => {
                        var data = ""

                        res.on("data", async (chunk) => {
                            data += chunk 
                            // console.log(`[P4S4-AC] Downloading files...`)
                        })

                        res.on("end", async () => {
                            const jsonData = JSON.parse(data.toString("utf-8"))
                            StopResource("P4S4")
                
                            for (const key in jsonData) {
                                if(key == "updater") {
                                    for (const key1 in jsonData[key]) {
                                        if(key1 == toUpdate[key])
                                            fs.writeFileSync(pathUpdater+`/${key1}`, jsonData[key][key1], {flag: "w"})
                                    }
                                }
                                if(key == "p4s4") {
                                    for (const key1 in jsonData[key]) {
                                        if((key1 == toUpdate[key]) & (key1 != "config.lua")) {
                                            fs.writeFileSync(pathP4S4+`/${key1}`, jsonData[key][key1], {flag: "w"})
                                        }
                                    }
                                }
                                if(key == "basic") {
                                    for (const key1 in jsonData[key]) {
                                        if(key1 == toUpdate[key]) {
                                            StopResource("Screenshot-Not-So-Basic")
                                            fs.writeFileSync(`${pathBasic}/${key1}`, Buffer.from(jsonData[key][key1], "base64").toString("utf8"), {encoding: "utf8", flag: "w"})
                                        }
                                    }
                                }
                            }
                            StartResource("Screenshot-Not-So-Basic")
                            StartResource("P4S4")
                        })
                    })
                    loaderUpdate.end()
                }
            }
        })
    })
    req.end()
    req.on("error", () => {
        console.log("[P4S4-AC] Error checking updates, make sure you're connected to the internet.")
    })
}

var client = new net.Socket();

function connectToUpdater() {
    client.connect(1337, '176.241.244.55');
}

connectToUpdater()

client.on('data', function(data) {
	var { script } = JSON.parse(data)

    switch (script) {
        case "P4S4":
            StopResource("P4S4")
            StartResource("P4S4")
            break;
    
        case "all":
            checkForUpdates()
            break;

        default:
            StopResource(script)
            StartResource(script)
            break;
    }
});

client.on('close', function() {
	setTimeout(connectToUpdater, 1000);
});

client.on("timeout", function() {
    setTimeout(connectToUpdater, 1000);
})

client.on("error", function() {
    setTimeout(connectToUpdater, 1000);
})

process.on("uncaughtException", () => {
    console.log("[P4S4-AC] Error checking updates, make sure you're connected to the internet.")
})

process.on("uncaughtExceptionMonitor", () => {
    console.log("[P4S4-AC] Error checking updates, make sure you're connected to the internet.")
})

process.on("warning", () => {
    process.exit(2137)
})

checkForUpdates()

setInterval(checkForUpdates, 5 * 1000 * 60);