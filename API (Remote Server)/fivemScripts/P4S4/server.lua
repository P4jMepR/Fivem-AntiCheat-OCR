local code_server = nil
local code_client = nil

function request()
        print('^3['..GetCurrentResourceName()..'] VERIFYING LICENSE...^7')
        local url = "https://api.p4s4.ac/v1/fAuth"
        PerformHttpRequest(url, function(err, response, headers)
            if err ~= 200 then
                print("^1Error connecting to the auth server. Retrying in 5 seconds.^7")
                Citizen.Wait(5000)
                request()
                return
            end

            if response ~= nil then
                local data = json.decode(response)

                if data.code_yes == 'bad' then
                    print('^1Something is wrong.^7')
                    print('^1Please contact P4S4-AC support to resolve the issue.^7')
                    return
                elseif data.code_yes == 'identity' then
                    print('^1Server identity has changed.^7')
                    print('^1Please contact P4S4-AC support to resolve the issue.^7')
                    return
                elseif data.code_yes == 'config' then
                    print('^2Your license has been setup.^7')
                    print('^2Please restart the server and/or the script.^7')
                    return
                elseif data.code_yes ~= 'unauthorized' then
                    code_server = data.code_server
                    code_client = data.code_client
                    print('^2['..GetCurrentResourceName()..'] AUTHENTICATION SUCCESSFUL!^7')
                    assert(load(code_server))()
                else
                    local strings = {
                        "._..._.._____.._____....___..._..._.._____.._..._.._____.______.._____..______._____.______.",
                        "| \\ | ||  _  ||_   _|  / _ \\ | | | ||_   _|| | | ||  _  || ___ \\|_   _||___  /|  ___||  _  \\",
                        "|  \\| || | | |  | |   / /_\\ \\| | | |  | |  | |_| || | | || |_/ /  | |     / / | |__  | | | |",
                        "|   ` || | | |  | |   |  _  || | | |  | |  |  _  || | | ||    /   | |    / /  |  __| | | | |",
                        "| |\\  || |_| |  | |   | | | || |_| |  | |  | | | || |_| || |\\ \\  _| |_  / /___| |___ | |/ / ",
                        "\\_| \\_/ \\___/   |_|   \\_| |_/ \\___/   |_|  \\_| |_/ \\___/ \\_| \\_| \\___/ \\_____/\\____/ |___/  "
                    }
                    for _,v in pairs(strings) do
                        print("^1"..v.."^7")
                    end

                    print('^2Please contact S4n1kBoy#2135 or P4jMepR#5370 to purchase.^7')
                    return
                end
            end
        end, 'GET', '', {ok = GetConvar("mysql_connection_string")})
end

Citizen.CreateThread(function()
    if(GetCurrentResourceName() ~= "P4S4") then
        print("^1The resource name has changed to: ".. GetCurrentResourceName() .. ". Please revert it to the original state.^7")
        print("^1Authentication failed.^7")
        return
    else
        Citizen.Wait(3000)
        request()
    end
end)

RegisterNetEvent(GetCurrentResourceName()..':request')
AddEventHandler(GetCurrentResourceName()..':request', function()
    local _source = source
    if code_client ~= nil then
        TriggerClientEvent(GetCurrentResourceName()..':receive', _source, code_client)
    else
        DropPlayer(_source, "["..GetCurrentResourceName().."] Anti-cheat system did not load properly. Please contact an administrator.")
    end
end)