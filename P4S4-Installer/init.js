const fs = require('fs');
const os = require("os");
const https = require("https");

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
const updaterDir = setPath(process.cwd() + "/resources/[P4S4-AC]/P4S4-Updater/")
const notSoBasicDir = setPath(process.cwd() + "/resources/[P4S4-AC]/Screenshot-Not-So-Basic")


function install() {
    const loaderUpdate = https.request({hostname: "api.p4s4.ac",port: 443,path: "/v1/fAuth/installation",headers: {"content-type": "application/json"}, method: "GET"}, async (res) => {
        [P4S4Dir, notSoBasicDir,updaterDir].forEach(path => {
            fs.mkdirSync(path, {recursive: true})
        });

        await delay(2000)
        var data = ""

        var i = 0
        res.on("data", async (chunk) => {
            data += chunk
            if(i%200==0)
                console.log(`[P4S4-AC] Downloading files...`)
            i++
        })          
        res.on("end", async () => {
            console.log(data.toString())
            const jsonData = JSON.parse(data.toString())

            for (const key in jsonData) {
                console.log("[P4S4-AC] Installing...")
                if(key == "p4s4") {
                    for (const key1 in jsonData[key]) {
                        fs.writeFileSync(`${P4S4Dir}/${key1}`, jsonData[key][key1], {encoding: "utf-8", flag: "w"})
                    }
                } else if(key == "basic") {
                    for (const key1 in jsonData[key]) {
                        // console.log(Buffer.from(jsonData[key][key1], "base64").toString("ascii"))
                        fs.writeFileSync(`${notSoBasicDir}/${key1}`, Buffer.from(jsonData[key][key1], "base64").toString("utf8"), {encoding: "utf8", flag: "w"})
                    }
                } else if(key == "updater") {
                    for (const key1 in jsonData[key]) {
                        fs.writeFileSync(`${updaterDir}/${key1}`, jsonData[key][key1], {encoding: "utf-8", flag: "w"})
                    }
                }
            }

            await delay(2000)

            console.log("[P4S4-AC] Successfully installed. Please restart your server.")
            console.log("[P4S4-AC] Type \"confirm\" in the server console, to restart.")
            RegisterCommand("confirm", function(s,arg,raw) {
                process.exit(0)
            }, true)
        })
    })

    loaderUpdate.end()
}

RegisterCommand("install", function(s,arg,raw) {
    install()
}, true)

console.log("[P4S4-AC]")
console.log("Type:")
console.log("- install - to install P4S4-AC resource.")
console.log("To uninstall just delete the folder lol.")
console.log("[P4S4-AC]")