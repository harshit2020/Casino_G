local QBCore = exports['qb-core']:GetCoreObject()

QBCore.Functions.CreateCallback('getPlayerChips', function(source, cb)
    local src = source
    local player = QBCore.Functions.GetPlayer(src)

    local result = {}
    if QBCore.Functions.GetItemByName('redchips') ~= nil then
        local amount = QBCore.Functions.GetItemByName('redchips').amount
        result["red"] = amount
    end
    if QBCore.Functions.GetItemByName('blackchips') ~= nil then
        local amount = QBCore.Functions.GetItemByName('blackchips').amount
        result["black"] = amount
    end
    if QBCore.Functions.GetItemByName('goldchips') ~= nil then
        local amount = QBCore.Functions.GetItemByName('goldchips').amount
        result["gold"] = amount
    end
    cb(result)
end)