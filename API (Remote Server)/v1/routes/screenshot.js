// Import libraries
const express = require("express");
const router = express.Router()
const db = require("../lib/db.js")
const FiveM = require("../utils/FiveM.js")
const fs = require("fs");
const MySql = require("mysql")

// Saving screenshot to database
router.post("/", async (req, res) => {
    var ServerIP    = req.header("x-forwarded-for")
    var IP          = req.header("a")
    var PID         = req.header("b")
    var DiscordID   = req.header("c")
    var SteamID     = req.header("d")
    var Live        = req.header("e")
    var RLicense    = req.header("f")
    var XbLive      = req.header("g")
    var ServerToken = req.header("h")
    var Tokens      = JSON.parse(req.header("i"))
    var Screenshot  = req.body["j"]

    var TokensJSON = {}

    for (let index = 0; index < Tokens.length; index++) {
        const element = Tokens[index];
        
        TokensJSON[index] = element
    }

    var dbconn = await db.createConnection();

    if(Screenshot == "nil") {
        await dbconn.query(`INSERT INTO \`bans\` (\`IP\`, \`ServerIP\`, \`ServerToken\`, \`Screenshot\`, \`DiscordID\`, \`SteamID\`, \`Live\`, \`RLicense\`, \`XbLive\`) VALUES ("${IP}", "${ServerIP}", "${ServerToken}", "nigga", "${DiscordID}", "${SteamID}", "${Live}", "${RLicense}", "${XbLive}")`)
        new FiveM(PID, ServerToken).kickPlayer("Nice try cunt")
        res.json({status: "Fuck you"})
        return
    }

    // await dbconn.query(`INSERT INTO \`bans\` (\`IP\`, \`ServerIP\`, \`ServerToken\`, \`Screenshot\`, \`DiscordID\`, \`SteamID\`, \`Live\`, \`RLicense\`, \`XbLive\`, \`Tokens\`) VALUES ("${IP}", "${ServerIP}", "${ServerToken}", "nigga", "${DiscordID}", "${SteamID}", "${Live}", "${RLicense}", "${XbLive}", ${MySql.escape(JSON.stringify(TokensJSON))})`)

    var result = await dbconn.query(`SELECT \`screen\` FROM \`screens\` WHERE \`id\`=${Screenshot}`);

    if(result.length == 0) {
        await dbconn.query(`INSERT INTO \`bans\` (\`IP\`, \`ServerIP\`, \`ServerToken\`, \`Screenshot\`, \`DiscordID\`, \`SteamID\`, \`Live\`, \`RLicense\`, \`XbLive\`) VALUES ("${IP}", "${ServerIP}", "${ServerToken}", "nigga", "${DiscordID}", "${SteamID}", "${Live}", "${RLicense}", "${XbLive}")`)
        new FiveM(PID, ServerToken).kickPlayer("Nice try cunt")
        res.json({status: "Fuck you"})
        return
    }

    var screen = Buffer.from(result[0].screen)

    await dbconn.query(`DELETE FROM \`screens\` WHERE \`id\`=${Screenshot}`);

    var insert = await dbconn.query(`INSERT INTO \`queue\`(\`IP\`, \`PID\`, \`ServerIP\`, \`ServerToken\`, \`Screenshot\`, \`DiscordID\`, \`SteamID\`, \`Live\`, \`RLicense\`, \`XbLive\`, \`Tokens\`) VALUES ("${IP}", ${PID}, "${ServerIP}", "${ServerToken}", BINARY(0x${screen.toString("hex")}), "${DiscordID}", "${SteamID}", "${Live}", "${RLicense}", "${XbLive}", ${MySql.escape(JSON.stringify(TokensJSON))})`)
    await dbconn.close()

    res.json(
        {
            status: "Success",
            taskId: insert.insertId
        }
    )
})

router.patch("/:id", async (req, res) => {
    var sID = req.params.id
    var data = req.body

    var result = data.result

    var dbconn = await db.createConnection();

    var { 
        ID,
        IP,
        PID,
        ServerIP,
        ServerToken,
        Screenshot,
        DiscordID,
        SteamID,
        Live,
        RLicense,
        XbLive
    } = (await dbconn.query(`SELECT * FROM \`queue\` WHERE ID=?`, sID))[0]

    if(result == true) {
        const ban = await dbconn.query(`INSERT INTO \`bans\` (\`IP\`, \`ServerIP\`, \`Screenshot\`, \`ServerToken\`, \`DiscordID\`, \`SteamID\`, \`Live\`, \`RLicense\`, \`XbLive\`, \`Tokens\`) SELECT \`IP\`, \`ServerIP\`, \`Screenshot\`, \`ServerToken\`, \`DiscordID\`, \`SteamID\`, \`Live\`, \`RLicense\`, \`XbLive\`, \`Tokens\` FROM \`queue\` WHERE \`ID\`="${ID}"`)
        await dbconn.query(`DELETE FROM \`queue\` WHERE (\`RLicense\`='${RLicense}' OR \`SteamID\`='${SteamID}' OR \`IP\`='${IP}' OR \`DiscordID\`='${DiscordID == "null" ? "bekazcb" : DiscordID}' OR \`Live\`='${Live == "null" ? "bekazcb" : Live}' OR \`XbLive\`='${XbLive == "null" ? "bekazcb" : XbLive}') AND \`ServerIP\`="${ServerIP}"`)

        const result = new FiveM(PID, ServerToken).kickPlayer("Banned for cheating.\nHave fun: https://api.p4s4.ac/v1/screenshot/gallery/"+ban.insertId)

        //////////////////////
    } else {
        await dbconn.query(`INSERT INTO \`checked\` (\`IP\`, \`ServerIP\`, \`ServerToken\`, \`Screenshot\`, \`DiscordID\`, \`SteamID\`, \`Live\`, \`RLicense\`, \`XbLive\`) SELECT \`IP\`, \`ServerIP\`, \`ServerToken\`, \`Screenshot\`, \`DiscordID\`, \`SteamID\`, \`Live\`, \`RLicense\`, \`XbLive\` FROM \`queue\` WHERE \`ID\`="${ID}"`)
        await dbconn.query(`DELETE FROM \`queue\` WHERE \`ID\`=${ID}`)
        // await dbconn.query(`DELETE FROM \`queue\` WHERE (\`RLicense\`='${RLicense}' OR \`SteamID\`='${SteamID}' OR \`IP\`='${IP}' OR \`DiscordID\`='${DiscordID == "null" ? "bekazcb" : DiscordID}' OR \`Live\`='${Live == "null" ? "bekazcb" : Live}' OR \`XbLive\`='${XbLive == "null" ? "bekazcb" : XbLive}') AND \`ServerIP\`="${ServerIP}"`)
    }

    await dbconn.close()

    res.json(
        {
            status: "ok"
        }
    )
})

router.get("/", async (req, res) => {
    var dbconn = await db.createConnection();
    var results = await dbconn.query(`SELECT * FROM \`queue\``)

    if(results.length != 0) {
        var randomQueue = results[Math.floor(Math.random() * results.length)]

        res.json(randomQueue)
    } else {
        res.status(404).json(
            {
                "status": "No screenshots in queue."
            }
        )
    }

    await dbconn.close()
})

router.get("/gallery", async (req, res) => {
    var dbconn = await db.createConnection();
    var IP = req.header("x-forwarded-for")
    var results = await dbconn.query(`SELECT \`ID\` FROM \`bans\` WHERE \`IP\`="ip:${IP}"`)

    if(results.length != 0) {
        var xd =    `
                <html>
                    <body>
            `
            results.forEach(element => {
                xd += "<a href='https://api.p4s4.ac/v1/screenshot/gallery/" + element.ID + "'>ID: " + element.ID + "</a></br>" 
            })

        xd += `</body>
        </html>`
        res.send(xd)
    } else {
        res.status(404).json(
            {
                "status": "This IP has not been banned yet."
            }
        )
    }

    await dbconn.close()
})

router.get("/gallery/:id", async (req, res) => {
    var id = req.params.id
    var IP = req.header("x-forwarded-for")
    var dbconn = await db.createConnection();
    var results = await dbconn.query(`SELECT \`Screenshot\` FROM \`bans\` WHERE \`ID\`=${id} AND \`IP\`="ip:${IP}"`)

    if(results.length != 0) {
        var asciiBuffer = 'data:image/jpeg;base64,' + Buffer.from(results[0].Screenshot).toString("ascii")


        let random = Math.floor(Math.random() * 10000000)

        fs.writeFileSync(__dirname + random + ".jpg", results[0].Screenshot)

        var l = fs.createReadStream(__dirname + random + ".jpg")

        l.on("open", function() {
            res.set("content-type", "image/jpeg")
            l.pipe(res)
        })

        l.on("error", function() {
            res.set("content-type", "text/plain")
            res.status(404).end("An error ocurred. Please refresh this page.")
        })

        fs.unlinkSync(__dirname + random + ".jpg")
    } else {
        res.status(404).json(
            {
                "status": "No such ban."
            }
        )
    }

    await dbconn.close()
})

router.use(express.json({limit: "100mb", extended: true}))

router.post("/lol", async (req, res) => {
    try { var baseStr = req.body["screen"].split(',')[1]; } catch (error) {
        return res.status(401).json(
            {
                "status": "Invaild data provided."
            }
        )
    }

    if(baseStr.length < 10000) {
        return res.status(666).json(
            {
                status: "Success",
                lol: "nt :)"
            }
        )
    }

    var buffer = new Buffer.from(baseStr, "base64")

    var dbconn = await db.createConnection();
    var insert = await dbconn.query(`INSERT INTO \`screens\`(\`screen\`) VALUES (BINARY(0x${buffer.toString("hex")}))`)
    await dbconn.close()

    res.json(
        {
            status: "Success",
            taskId: insert.insertId
        }
    )
})


// Export route
module.exports = router