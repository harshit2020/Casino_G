
local diamond = exports["Diamond"]:getgame()
local diamond = exports["Diamond"]:getDiamond()
local spawnedPed = nil
local createdObj = {}
local bets = {}
local winners = {}
local reservations = {
    night = nil,
    hour = {}
}
local pokerRooms = {}
local hiredEmployees = {}

local filenames = exports.triggerzone:GetZoneFilenames()
for _, filename in ipairs(filenames) do
    exports.triggerzone:Load(filename)
end

RegisterServerEvent("CheckZone", function(Zone)
    local src = source
    print(Zone)
    if Zone == 'diamondstandardinterior' then
        if createdObj[src] == nil then
            createdObj[src] = diamond:new(src)
        end
        TriggerClientEvent('QBCore:Notify', src, "You Have Entered The Standard Casino Zone", "success")
    elseif Zone == 'diamondpremiuminterior' then
        if createdObj[src] == nil then
            createdObj[src] = diamond:new(src)
            if createdObj[src].membership1 then
                TriggerClientEvent('QBCore:Notify', src, "Welcome to Premium Zone. Enjoy!", "success")
            else
                TriggerClientEvent("GetTheFckOut", src, Config.ExitP, Zone)
            end
        else
            if createdObj[src].membership1 then
                TriggerClientEvent('QBCore:Notify', src, "Welcome to Premium Zone. Enjoy!", "success")
            else
                TriggerClientEvent("GetTheFckOut", src, Config.ExitP, Zone)
            end
        end
    elseif Zone == 'diamondvipinterior' then
        if createdObj[src] == nil then
            createdObj[src] = diamond:new(src)
            if createdObj[src].membershipPremium then
                -- Notify All good (you might want to add a notification here as well)
            else
                TriggerClientEvent("GetTheFckOut", src, Config.ExitV, Zone)
            end
        else
            if createdObj[src].membershipPremium then
                -- Notify All good (you might want to add a notification here as well)
            else
                TriggerClientEvent("GetTheFckOut", src, Config.ExitV, Zone)
            end
        end
    elseif Zone == "DiamondStandard" then
        TriggerClientEvent('QBCore:Notify', src, "Welcome to the Diamond Complex! WIN IT ALL !!", "success")
    end
end)
RegisterServerEvent("HandleExit", function(Zone)
    if Zone == "DiamondStandard" then
        TriggerClientEvent('QBCore:Notify', src, "You have exited the fine establishment. We look forward to seeing you again!", "success")
        if createdObj[src] ~= nil then
            createdObj[src] = diamond:leavecasino()
        end
    end
end)

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    local chairCoords = vector3(953.22, 21.47, 70.9) 
    local chairHeading = 0.0 
    if not spawnedPed then
        TriggerClientEvent("npc:spawn", -1, chairCoords, chairHeading)
    end
end)

RegisterServerEvent("npc:registerPed")
AddEventHandler("npc:registerPed", function(pedNetId)
    spawnedPed = pedNetId
end)

RegisterServerEvent("npc:deletePed")
AddEventHandler("npc:deletePed", function()
    TriggerClientEvent("npc:delete", -1)
    spawnedPed = nil
end)
AddEventHandler('onResourceStart', function(resource)
    if resource == GetCurrentResourceName() then
        local chairCoords = vector3(953.22, 21.47, 70.9) 
        local chairHeading = 0.0 
        TriggerClientEvent("npc:spawn", -1, chairCoords, chairHeading)    
    end
end)

--bet on game
RegisterNetEvent('betgame')
AddEventHandler('betgame', function(playerid,team, amount)
    local playerName = GetPlayerName(playerid)
    if not team or not amount then
        print("oka bro ")
        return
    end

    if not bets[playerId] then
        bets[playerId] = {}
    end

    table.insert(bets[playerId], {team = team, amount = amount})
    print( amount .. ' on team ' .. team )
end)

local function betWinner(playerid)--inserting winners in the table
    table.insert(winners,playerid)
end

local function distMoney(playerid)--distribute money to the winners (logic pending)
    if not playerid then
        print('No player won .')
        return
    end
    local totalBetAmount = 0
    for playerId, bet in pairs(bets) do
        totalBetAmount = totalBetAmount + bet.amount
    end
    local winner = #winners
    local money = totalBetAmount/winner
    --function to add money to each players account
    bets = {}
end

RegisterNetEvent('gameEnded')
AddEventHandler('gameEnded', function(playerid)
    betWinner(playerid)
end)

RegisterCommand('showBets', function()
    print('Current Bets:')
    for playerId, bet in pairs(bets) do
        local playerName = bet.playerName
        print(playerName .. 'has placed the following bet:')
        print('Team: ' .. bet.team .. 'Amount: ' .. bet.amount)
    end
end, false)
RegisterCommand('cleantasks', function()
    local src = source
    local playerPed = GetPlayerPed(src)
    ClearPedTasks(playerPed)
end, false)
--bet on game end here

--party room 
RegisterNetEvent('bookRoom')
AddEventHandler('bookRoom', function(data)
    local roomType = data.roomType
    local player = GetPlayerServerId(PlayerId())

    if roomType == "night" then
        reserveRoom(player, "night")
    elseif roomType == "hour" then
        -- write the input function 
        reserveRoom(player, "hour", duration)
    end
end)


local function reserveRoom(player, roomType, duration)
    if roomType == "night" then
        if reservations.night then
            print('Room is already booked for the night' )
        else
            reservations.night = player
            print('Room booked for the night')
        end
    elseif roomType == "hour" then
        local currenttime = os.time()
        for i, j in pairs(reservations.hour) do
            if j.endtime > currenttime then
                print('Room is already booked during this time')
                return
            end
        end
        table.insert(reservations.hour, { player = player, endtime = currenttime + (duration * 3600) })
    end
end

local function playerDroppedParty()
    local player = source
    if reservations.night == player then
        reservations.night = nil
    end
    for i, j in pairs(reservations.hour) do
        if j.player == player then
            table.remove(reservations.hour, i)
        end
    end
end
--party room ends

--poker room 
local roomLimit = 4 --limit to be decided may be according to owner or according to us ?? dont know peace :)
RegisterNetEvent('hireRoom')
AddEventHandler('hireRoom', function()
    local player = GetPlayerServerId(PlayerId())
    reserveRoom(player, roomLimit)
end)

local function reserveRoom(player, roomLimit)
    local roomId = #pokerRooms + 1
    local room = {
        owner = player,
        limit = roomLimit,
        players = {}
    }
    table.insert(pokerRooms, room)
    print('You have successfully reserved a poker room with ID: ' .. roomId .. ' and player limit: ' .. roomLimit)
end

RegisterNetEvent('joinRoom')
AddEventHandler('joinRoom', function(player, roomId)
    local room = pokerRooms[roomId]
    if room then
        if #room.players < room.limit then
            table.insert(room.players, player)
            print('You have joined the poker room with ID: ' .. roomId)
        else
            print('The poker room with ID: ' .. roomId .. ' is full.')
        end
    else
        print('The poker room with ID: ' .. roomId .. ' does not exist.')
    end
end)

function playerDroppedPoker()
    local player = source
    for roomId, room in pairs(pokerRooms) do
        if room.owner == player then
            pokerRooms[roomId] = nil
            print('Poker room with ID: ' .. roomId .. ' has been closed because the owner has left.')
        else
            for i, p in ipairs(room.players) do
                if p == player then
                    table.remove(room.players, i)
                    break
                end
            end
        end
    end
end
--poker room ends

--eye of horus
RegisterNetEvent("playEyeOfHorus")--call this event to activate index.html
AddEventHandler("playEyeOfHorus", function()
    LoadEyeOfHorus()
end)

RegisterNetEvent("deactivateEyeOfHorus")--call this event to deactivate index.html
AddEventHandler("deactivateEyeOfHorus", function()
    DeactivateEyeOfHorus()
end)

function LoadEyeOfHorus()
    Citizen.CreateThread(function()--check if thread is required or not
        local eyeOfHorusHTML = LoadResourceFile(GetCurrentResourceName(), 'web/eye_of_horus/index.html')
        SendNUIMessage({
            type = 'onEyeOfHorusLoaded',
            html = eyeOfHorusHTML
        })
    end)
end 

function DeactivateEyeOfHorus()
    SendNUIMessage({
        type = 'onEyeOfHorusDeactivated'
    })
end

--eye of horus end

--boss menu
--sql table structure
--id INT autoincrement
--identifier VARCHAR(50) 
--name VARCHAR(50) 
--job VARCHAR(50)

RegisterNetEvent('hireEmployee')
AddEventHandler('hireEmployee', function()
  local player, distance = QBCore.Functions.GetClosestPlayer()
  if player ~= -1 and distance < 2.5 then
      local playerId = GetPlayerServerId(player)
      local playerData = QBCore.Functions.GetPlayerData()
      hiredEmployees[playerId] = {
          name = GetPlayerName(player),
          identifier = playerData.identifier,
          job = playerData.job
      }
      oxmysql:insert('INSERT INTO hired_employees (identifier, name, job) VALUES (?, ?, ?)', {
        employeeData.identifier,
        employeeData.name,
        employeeData.job.name
    }, function(rowsChanged)
        if rowsChanged > 0 then
            QBCore.Functions.Notify("hired!!DSA aata hai bhai ko ", "success")
        else
            QBCore.Functions.Notify("No player nearby to hire", "error")
        end
    end)     
  end
end)

RegisterNetEvent('fireEmployee')
AddEventHandler('fireEmployee', function()
  local player, distance = QBCore.Functions.GetClosestPlayer()
  if player ~= -1 and distance < 2.5 then
      local playerId = GetPlayerServerId(player)
      if hiredEmployees[playerId] then
          hiredEmployees[playerId] = nil
          QBCore.Functions.Notify("fired!! production server pe delete query chala di", "success")
          oxmysql:execute('DELETE FROM hired_employees WHERE identifier = ?', {
            employeeData.identifier
        }, function(rowsChanged)
            if rowsChanged > 0 then
                QBCore.Functions.Notify("This player is not an employee", "error")
            else
                QBCore.Functions.Notify("No player nearby to fire", "error")
            end
        end)
      end 
  end
end)

function ListEmployees()--check this part 
  local elements = {}
  for playerId, info in pairs(hiredEmployees) do
      table.insert(elements, {label = info.name .. " (" .. info.job.name .. ")", value = playerId})
  end
  QBCore.UI.Menu.Open('default', GetCurrentResourceName(), 'list_employees', {
      title = "Hired Employees",
      align = 'top-left',
      elements = elements
  }, nil, function(data, menu)
      menu.close()
  end)
end
--boss menu end
