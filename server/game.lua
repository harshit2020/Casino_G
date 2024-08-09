local diamond = exports["Diamond"]:getDiamond()
---@module "game"

---@class game
game = {} 
game.__index = game
game.store_instances = {}
game.instance_count = 0 

exports("getgame", function()
    return game
end)

function game:newpoker(gameid, playerData, chipsR, chipsB, chipsG)--poker game object creation
    if game.instance_count < 4  then
        local instance = {}
        setmetatable(instance, game)
        instance.gameid = gameid
        instance.playerData = playerData
        instance.chipsR = chipsR
        instance.chipsB = chipsB
        instance.chipsG = chipsG
        instance.betchipsR = 0
        instance.betchipsB = 0
        instance.betchipsG = 0
        game.instance_count = game.instance_count + 1
        table.insert(game.store_instances, instance)
        return instance
    else
        error("!!!Currently no vacant seat.")
    end
end

function game:newjackpot(gameid, playerData, chipsR, chipsB, chipsG)--jackpot game object creation
    if game.instance_count < 1  then
        local instance = {}
        setmetatable(instance, game)
        instance.gameid = gameid
        instance.playerData = playerData
        instance.chipsR = chipsR
        instance.chipsB = chipsB
        instance.chipsG = chipsG
        game.instance_count = game.instance_count + 1
        table.insert(game.store_instances, instance)
        return instance
    else
        error("!!!Currently no vacant seat.")
    end
end

function game:bet(chipsR,chipsB,chipsG)--funtion to set bet amount
    self.betchipsR = chipsR
    self.betchipsB = chipsB
    self.betchipsG = chipsG
end
function game:win()--update the final chips amount of the winner
    local diamondwon = diamond:new(self.playerData)
    for _, instance in ipairs(game.store_instances) do
        if instance.playerData ~= self.playerData   then
            diamondwon.chipsR = diamondwon.chipsR + instance.betchipsR
            diamondwon.chipsB = diamondwon.chipsB + instance.betchipsB
            diamondwon.chipsG = diamondwon.chipsG + instance.betchipsG
        end
    end
end
function game:loser()--update the final chips amount of the player who lose
    local diamondlost = diamond:new(self.playerData)
    diamondlost.chipsR = diamondlost.chipsR - self.betchipsR
    diamondlost.chipsB = diamondlost.chipsB - self.betchipsB
    diamondlost.chipsG = diamondlost.chipsG - self.betchipsG
end

function game:leaveGame()--delete object and any other specific condition
    for i, instance in ipairs(game.store_instances) do
        if instance == self then
            table.remove(game.store_instances, i)
            break
        end
    end
    game.instance_count = game.instance_count - 1
    self.gameid = nil
    self.playerData = nil
    self.chipsR = nil
    self.chipsB = nil
    self.chipsG = nil
    self.betchipsR = nil
    self.betchipsB = nil
    self.betchipsG = nil
end

return game


