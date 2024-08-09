local QBCore = exports['qb-core']:GetCoreObject()

RegisterNUICallback('getPlayerChips', function(data, cb)
    QBCore.Functions.TriggerCallback('getPlayerChips', function(result) 
    cb(result)
    end, data)    
end)