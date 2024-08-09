-- local game = require("game.lua")
local QBCore = exports['qb-core']:GetCoreObject()
---@module "core"

---@class diamond
diamond = {} 
diamond.__index = diamond
diamond.allplayerlist = {}

exports("getDiamond", function()
    return diamond
end)
function diamond:new(src)--when a player enters an object will be created.
    local newObj = {}
    self.__index = self
    setmetatable(newObj, self)
    newObj.playerData = QBCore.Functions.GetPlayer(src)
    if newObj.playerData.Functions.GetItemByName('redchips') then
        newObj.chipsR = newObj.playerData.Functions.GetItemByName('redchips').amount
    else
        newObj.chipsR = 0
    end
    if newObj.playerData.Functions.GetItemByName('blackchips') then
        newObj.chipsB = newObj.playerData.Functions.GetItemByName('blackchips').amount
    else
        newObj.chipsG = 0
    end
    if newObj.playerData.Functions.GetItemByName('blackchips') then
        newObj.chipsG = newObj.playerData.Functions.GetItemByName('goldchips').amount
    else
        newObj.chipsG = 0
    end
    newObj.membership1 = true
    newObj.membershipPremium = true
    newObj.isowner = false   -- Support for player owning thingy
    table.insert(diamond.allplayerlist,newObj) 
    return newObj
end

function diamond:addChips(chipsR, chipsB, chipsG)--to add chips
    self.chipsR = self.chipsR + chipsR
    self.chipsB = self.chipsB + chipsB
    self.chipsG = self.chipsG + chipsG
end

function diamond:addMembership(membership1, membershipPremium)--to buy membership
    self.membership1 = true
    self.membershipPremium = true
    if self.isowner == "true" then  -- Owner = All permissions so compatibility check
        self.membership1 = true
        self.membershipPremium = true
    end
end

-- function diamond:join(gameid)--call to join a game according to the game id
--     local gameobj = game:newjackpot(gameid,self.playerData,self.chipsR,self.chipsB,self.chipsG)
-- end

function diamond:leavecasino()--delete object
    for i, player in ipairs(diamond.allplayerlist) do
        if player == self then
            table.remove(diamond.allplayerlist, i)
            break
        end
    end
    self.playerData = nil
    self.chipsR = nil
    self.chipsB = nil
    self.chipsG = nil
    self.membership1 = nil
    self.membershipPremium = nil
end
return diamond 
