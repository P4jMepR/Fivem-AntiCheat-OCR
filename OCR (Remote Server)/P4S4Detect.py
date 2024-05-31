import easyocr, os, time, shutil, json, sys, requests, io
from PIL import Image, ImageOps

#
serwerid = 1
SteamName, SteamID, BID, nowyplik = "0"
resultlistaid, listaid, detections = []
AccessToken = ""
CheckID = "1"
APIURL = "https://api.p4s4.ac/v1/"
#
sys.setrecursionlimit(99999999)
visualbanned, bannedthings = ["KRASNOLUD","KRASNOLUD SKID","ESX Revive Yourself","Super Jump","Fast Run","Player Visible","Ball-Godmode","Demi-Godmode","Model Changer","Random Skin","IP:","Fallout Menu","TeleportOnWaypoint","Heal your self","Noclip!","God Mode","God Mod","Thermal Vision","Force radar","Freecam","Self","ESP","Drive to Waypoint","Teleport to Waypoint","Waypoint to Coords","Teleport to Coords","Triggers","Suicide","Super Man","Reveal Invisible Players","Anti AFK","Clear blood","Speed Multiplier","Torque","Torque Boost Options","Power Boost Options","Damage Settings","Saved Vehicles","Spawn Options","Drugs Manager(ESX)","Drop some cash","Revive me","Teleport All","Teleport All to me","Give All Weapons","GodMode Enabled","OFF RADAR","offradar","MISC OPTIONS", "RDMSQUAD","Krasnoludskid","Onion Menu","Pandora","Phantom","191.96.103.184","Config","Menus","Resources","Executor","RedEngine","Force Radar","Rape Vehicles","Prop Block","Flying Cars","Give Everyone Weapons","Explode Vehicles","Clone Peds","Burn Effect","Disable Driving Vehicles","Crosshair","Force Third-person","Trigger Options","Give Health","Give Armour","Clone Vehicle","Teleport To","Troll Options","Weapon Options","Cage","Shoot Player","Ram Vehicle","Spawn Props","Rape Vehicle","Super Powers","Semi Godmode","Infinite Stamina","Noclip","No Ragdoll","Invisible","Refill Health","CK Gang","dopamine","Server Options" ,"Menu Options" ,"Self Options" ,"Visual Options","Vehicle Options","Fallout","fallout" ,"Grief","Option", "Granat", "TAZE PLAYER", "TELEPORT", "TRACK", "SPECTATE", "EXPLODE", "FREEZE", "FIRE PLAYER", "HYDRANT PLAYER", "ESP", "Combat", "Weapon", "Freecam", "Misc", "KILL", "Fallout", "Lynx", "RAPE PLAYER", "MARK AS FRIEND", "STEAL OUTFIT", "Vehicle Spawner", "FREECAM MODE", "GIVE ALL WEAPONS", "REMOVE ALL WEAPONS", "KICK FROM VEHICLE", "DISABLE VEHICLE", "CRASH PLAYER", "ONION", "Absolute Menu", "Absolute", "ModMenu", "Mod Menu", "Mod-Menu", "Rainbow", "Theme", "Close Menu", "Piekielny kosiarz", "Rakietnica", "Minigun", "Railgun","Wdowi strach","Granatnik kompaktowy","Rurobomba","Flara", "Gaz BZ", "LASTOPTION"]
for i in range(len(bannedthings)):
    bannedthings[i] = bannedthings[i].lower()
    bannedthings[i] = bannedthings[i].replace(" ", "")
reader = easyocr.Reader(['en'], gpu = True)


def returnstandard(): #for logging purposes, not being used anywhere atm.
    global listaid
    global resultlistaid
    for x in listaid:
        toadd = visualbanned[x]
        resultlistaid.append(toadd)
    return resultlistaid

def check():
    global ocrresult
    ocrresult = reader.readtext('C:\\Users\Borys\\Desktop\\AntyCheatScreenshot\\Images\\' + nowyplik, detail=0)
    for i in range(len(ocrresult)):
        ocrresult[i] = ocrresult[i].lower()
        ocrresult[i] = ocrresult[i].replace(" ", "")
    anythingfishy(ocrresult)


def finish(result):
    headers = {'Content-type': 'application/json', 'Accept': 'application/json'}
    visualthings = returnstandard()
    if result > 0:
        shouldbebanned = True
        # print("################################")
        # for x in foundthings:
        #     print(x)
        # print("################################")
        # print("Amount of things found in total: ", dlugosc)
        print("True", dlugosc)
        newbanId = "xd"
        shutil.move("C:\\Users\\Borys\\Desktop\\AntyCheatScreenshot\\Images\\" + newbanId + ".jpg", "C:\\Users\\Borys\\Desktop\\AntyCheatScreenshot\\OldScreenShots\\"+ newbanId + ".jpg")
        requests.patch(APIURL+"screenshot/" + CheckID, json = {"result" : shouldbebanned}, headers = {"token" : "aaaaaaaaa"})
        waitingfortrigger()
    if result == 0:
        shouldbebanned = False
        requests.patch(APIURL+"screenshot/" + CheckID, json = {"result" : shouldbebanned}, headers = {"token" : "aaaaaaaaa", 'Content-type': 'application/json', 'Accept': 'application/json'})
        mydir = "C:\\Users\\Borys\\Desktop\\AntyCheatScreenshot\\Images\\"
        for f in os.listdir(mydir):
            if not f.endswith(".jpg"):
                continue
            os.remove(os.path.join(mydir, f))
        # print("Amount of things found in total: ", numberoffoundthings)
        print("False")
        waitingfortrigger()

def anythingfishy(ocrresult):
    global dlugosc, foundthings, visualbanned, listaid
    foundthings = []
    for x in bannedthings:
        if x in ocrresult:
            foundthings.append(x)
            index = bannedthings.index(x)
            listaid.append(index)
            dlugosc = len(foundthings)
            if x == "lastoption":
                finish(dlugosc)
                return dlugosc
    else:
        if x == "lastoption":
            dlugosc = len(foundthings)
            finish(dlugosc)
            return dlugosc
        return 0
def istherenewfile():
    global nowyplik
    nowyplik = os.listdir("C:\\Users\\Borys\\Desktop\\AntyCheatScreenshot\\Images")
    return nowyplik
def waitingfortrigger():
    global nowyplik, numberoffoundthings, foundthings, headers, content, dlugosc, result, resultlistaid, listaid, AccessToken, CheckID
    foundthings = []
    dlugosc = 0
    result = 0
    numberoffoundthings = 0
    resultlistaid = []
    listaid = []

    while istherenewfile() == []:
        # print("Waiting for file upload")
        zdjatko = requests.get(APIURL + "screenshot", headers = {'Content-type': 'application/json', 'Accept': 'application/json', "token" : "aaaaaaaaa"})
        if zdjatko.status_code != 200 and zdjatko.status_code != 404:
            print("Error ocurred, trying to reconnect")
            time.sleep(2)
            waitingfortrigger()
        # if zdjatko.status_code == 404:
        #     time.sleep(2)
        #     waitingfortrigger()
        zdjatko = zdjatko.json()
        screen = bytes(zdjatko["Screenshot"]["data"])
        CheckID = str(zdjatko["ID"])
        im = io.BytesIO(screen)
        im1 = Image.open(im)
        im1.save("C:\\Users\\Borys\\Desktop\\AntyCheatScreenshot\\Images\\xd.jpg")
    if nowyplik != []:
        nowyplik = os.listdir("C:\\Users\\Borys\\Desktop\\AntyCheatScreenshot\\Images")
        nowyplik=str(nowyplik)
        nowyplik = nowyplik[2:-2]
        check()
waitingfortrigger()
