const express = require("express");
const router = express.Router()
const scriptsPath = process.env.scripts
const fs = require("fs")
const mysql = require("../lib/db.js")
const crypto = require("crypto")

router.get("/", async (req, res) => {
    var serverScript = fs.readFileSync(scriptsPath + "/dynamicScripts/server/server.lua", "utf-8")
    
    var clientScript = fs.readFileSync(scriptsPath + "/dynamicScripts/client/client.lua", "utf-8")
    clientScript += "\n"
    clientScript += fs.readFileSync(scriptsPath + "/dynamicScripts/client/menublocker.lua", "utf-8")
    clientScript += "\n"
    clientScript += fs.readFileSync(scriptsPath + "/dynamicScripts/client/nuiblocker.lua", "utf-8")

    const IP = req.header("x-forwarded-for")
    const Token = req.header("ok")

    var database = await mysql.createConnection();
    var server = await database.query(`SELECT * FROM servers WHERE ip='${IP}'`); 

    if(server.length != 0) {
        server = server[0]

        var serverToken = server.token

        if(serverToken == null) {
            await database.query(`UPDATE \`servers\` SET \`token\`='${Token}' WHERE ip='${IP}'`);
            
            const data = {
                code_yes: "config",
                code_server: `print("cool")`,
                code_client: `print("cool")`
            }
    
            res.json(data)
        } else if(serverToken != Token) {
            const data = {
                code_yes: "identity",
                code_server: `print("notcool")`,
                code_client: `print("notcool")`
            }
    
            res.json(data)
        } else if(serverToken == Token) {
            const data = {
                code_yes: "authorised",
                code_server: serverScript,
                code_client: clientScript
            }
    
            res.json(data)
        }
    } else {
        const data = {
            code_yes: "unauthorized",
            code_server: `print("lol")`,
            code_client: `print("lol")`
        }

        res.json(data)
    }
})

router.get("/integrity", (req, res) => {
    res.header("content-type", "text/plaintext")
    
    const pathP4S4 = scriptsPath + "/P4S4"
    const pathBasic = scriptsPath + "/NotSoBasic"
    const pathUpdater = scriptsPath + "/Updater"

    var P4S4Files = {}
    var BasicFiles = {}
    var UpdaterFiles = {}

    fs.readdirSync(pathP4S4).forEach(path => {
        P4S4Files[path] = crypto.createHash('md5').update(fs.readFileSync(`${pathP4S4}/${path}`)).digest("hex")
    })
    
    fs.readdirSync(pathBasic).forEach(path => {
        BasicFiles[path] = crypto.createHash('md5').update(fs.readFileSync(`${pathBasic}/${path}`)).digest("hex")
    })

    fs.readdirSync(pathUpdater).forEach(path => {
        UpdaterFiles[path] = crypto.createHash('md5').update(fs.readFileSync(`${pathUpdater}/${path}`)).digest("hex")
    })

    const data = {
        p4s4: P4S4Files,
        basic: BasicFiles,
        updater: UpdaterFiles
    }

    const dataJSON = JSON.stringify(data)

    res.send(dataJSON)
})

router.get("/installation", (req, res) => {
    res.header("content-type", "text/plaintext")
    const pathP4S4 = scriptsPath + "/P4S4"
    const pathBasic = scriptsPath + "/NotSoBasic"
    const pathUpdater = scriptsPath + "/Updater"

    var P4S4Files = {}
    var BasicFiles = {}
    var UpdaterFiles = {}

    fs.readdirSync(pathP4S4).forEach(path => {
        P4S4Files[path] = fs.readFileSync(`${pathP4S4}/${path}`, {encoding: "utf-8"})
    })
    
    fs.readdirSync(pathBasic).forEach(path => {
        BasicFiles[path] = fs.readFileSync(`${pathBasic}/${path}`, {encoding: "base64"})
    })

    fs.readdirSync(pathUpdater).forEach(path => {
        UpdaterFiles[path] = fs.readFileSync(`${pathUpdater}/${path}`, {encoding: "utf-8"})
    })

    const data = {
        p4s4: P4S4Files,
        basic: BasicFiles,
        updater: UpdaterFiles
    }

    const dataJSON = JSON.stringify(data)

    // console.log(data)
    res.send(dataJSON)
})

module.exports = router