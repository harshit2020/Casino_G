local QBCore = exports['qb-core']:GetCoreObject()
local ActiveZones = {}
local npcPed = nil
local bodyguard1 = nil
local bodyguard2 = nil

AddEventHandler('triggerzone:enter',function(name)
  TriggerServerEvent("CheckZone",name)
end)

AddEventHandler('triggerzone:exit',function(name)
  TriggerServerEvent("HandleExit",name)
end)

local function DeleteZones()
    for k in pairs(AcitveZone) do
        AcitveZone[k]:destroy()
    end
    AcitveZone = {}
end

function LoadModel(model)
    RequestModel(model)
    while not HasModelLoaded(model) do
        Wait(10)
    end
end

function LoadAnimDict(dict)
    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        Wait(10)
    end
end

function FindNearestChair(coords)
    local objectHash = GetHashKey("v_corp_offchair")
    local chair = GetClosestObjectOfType(coords.x, coords.y, coords.z, 10.0, objectHash, false, false, false)
    return chair
end

function SpawnBodyguards()
    local playerPed = PlayerPedId()
    local playerCoords = GetEntityCoords(playerPed)
    local bodyguardModel = GetHashKey("s_m_m_armoured_01")
    LoadModel(bodyguardModel)
    bodyguard1 = CreatePed(4, bodyguardModel, playerCoords.x + 1.5, playerCoords.y, playerCoords.z, 0.0, true, true)
    GiveWeaponToPed(bodyguard1, GetHashKey("WEAPON_PISTOL"), 250, false, true)
    bodyguard2 = CreatePed(4, bodyguardModel, playerCoords.x - 1.5, playerCoords.y, playerCoords.z, 0.0, true, true)
    GiveWeaponToPed(bodyguard2, GetHashKey("WEAPON_PISTOL"), 250, false, true)
    SetEntityAsMissionEntity(bodyguard1, true, true)
    SetEntityAsMissionEntity(bodyguard2, true, true)
    TaskFollowToOffsetOfEntity(bodyguard1, playerPed, 0.5, -1.0, 0.0, 1.0, -1, 5.0, 1, true)
    TaskFollowToOffsetOfEntity(bodyguard2, playerPed, -0.5, -1.0, 0.0, 1.0, -1, 5.0, 1, true)
end

function EscortPlayerOut(exitCoords,Zone)
    local playerPed = PlayerPedId()
    local escorting = true
    print(exitCoords)
    TaskGoToCoordAnyMeans(bodyguard1, exitCoords.x, exitCoords.y, exitCoords.z, 1.0, 0, 0, 786603, 0xbf800000)
    TaskGoToCoordAnyMeans(bodyguard2, exitCoords.x, exitCoords.y, exitCoords.z, 1.0, 0, 0, 786603, 0xbf800000)
    TaskGoToCoordAnyMeans(playerPed, exitCoords.x, exitCoords.y, exitCoords.z, 1.0, 0, 0, 786603, 0xbf800000)
    CreateThread(function()
        while escorting do
          print("Inside the Escorting Loop")
          local playerPos = GetEntityCoords(playerPed)
          print (exports.triggerzone:IsPointInsideZone(playerPos, Zone))
          Wait(1000)
          if not exports.triggerzone:IsPointInsideZone(playerPos, Zone) then
            DeletePed(bodyguard1)
            DeletePed(bodyguard2)
            ClearPedTasks(playerPed)
            escorting = false
            QBCore.Functions.Notify("You have been escorted out.", "success")
          end
        end
    end)
end

RegisterNetEvent("GetTheFckOut", function(exitCoords,Zone)
    QBCore.Functions.Notify("You do not possess the Right Membership, You'll now be escorted outta here!", "error")
    SpawnBodyguards()
    EscortPlayerOut(exitCoords,Zone)
end)

RegisterNetEvent("npc:spawn")
AddEventHandler("npc:spawn", function(coords, heading)
    if not npcPed then
        local npcModel = GetHashKey("a_m_y_business_01")
        LoadModel(npcModel)

        local chair = FindNearestChair(coords)
        if DoesEntityExist(chair) then
            local chairCoords = GetEntityCoords(chair)
            local chairHeading = GetEntityHeading(chair)
            
            npcPed = CreatePed(4, npcModel, chairCoords.x, chairCoords.y, chairCoords.z, chairHeading, false, true)
            LoadAnimDict("timetable@ron@ig_3_couch")
            TaskStartScenarioAtPosition(npcPed, "WORLD_HUMAN_SEAT_CHAIR_UPRIGHT", chairCoords.x, chairCoords.y, chairCoords.z, chairHeading, 0, true, true)

            SetEntityAsMissionEntity(npcPed, true, true)
            local pedNetId = NetworkGetNetworkIdFromEntity(npcPed)
            SetNetworkIdCanMigrate(pedNetId, true)
            SetNetworkIdExistsOnAllMachines(pedNetId, true)
            TriggerServerEvent("npc:registerPed", pedNetId)

            exports['qb-target']:AddBoxZone("MainReception", vector3(chairCoords.x, chairCoords.y, chairCoords.z), 0.5, 0.5, {
                name = "MainReception", 
                heading = chairHeading, 
                debugPoly = false, 
                minZ = chairCoords.z -3.0, 
                maxZ = chairCoords.z +1.0, 
              }, {
                options = { 
                  {
                    type = "client",
                    event = "", 
                    icon = "fa-solid fa-ship", 
                    label = "Open Membership Menu", 
                  },
                  {
                    type = "server",
                    event = "", 
                    icon = "fa-solid fa-fish", 
                    label = "Open Apartments Menu", 
                  },
                  {
                    type = "server",
                    event = "Rex_MoneyWash:policeMoney", 
                    icon = "fa-solid fa-hand-holding-dollar", 
                    label = "Open EMS Services", 
                    job = "police"
                  }
                },
                distance = 2.5,
              })
        else
            print("No chair found nearby.")
        end
    end
end)


exports['qb-target']:AddBoxZone("Taxi", vector3(926.38, 50.94, 81.11), 0.5, 0.5, {
    name = "Taxi", 
    heading = 58.28, 
    debugPoly = false, 
    minZ = 81.11 -3.0, 
    maxZ = 81.11 +1.0, 
  }, {
    options = { 
      {
        type = "client",
        event = "callnpc", 
        icon = "fa-solid fa-ship", 
        label = "CallLimo", 
      },
    },
    distance = 2.5,
  })

RegisterNetEvent("npc:delete")
AddEventHandler("npc:delete", function()
    if npcPed then
        DeletePed(npcPed)
        npcPed = nil
    end
end)

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
        if npcPed then
            DeletePed(npcPed)
        end
    end
end)


--sports bet
exports['qb-target']:AddBoxZone("bet", vector3(993.77, 74.53, 69.66), 0.5, 0.5, {
    name = "Bet",
    heading = 58.28,
    debugPoly = true,
    minZ = 69.66 - 3.0,
    maxZ = 69.66 + 3.0,
  }, {
    options = {
      {
        type = "client",
        event = "betinput",
        icon = "fa-solid fa-ship",
        label = "BetGame",
      },
    },
    distance = 2.5,
  })

RegisterNetEvent('betinput')
AddEventHandler('betinput', function()
    local dialog = exports['qb-input']:ShowInput({
        header = "Place Your Bet",
        submitText = "Place Bet",
        inputs = {
            {
                text = "Team Name", 
                name = "team",
                type = "text", 
                isRequired = true 
            },
            {
                text = "Bet Amount", 
                name = "amount", 
                type = "number", 
                isRequired = true
            }
        }
    })

    if dialog then
        local team = dialog.team
        local amount = tonumber(dialog.amount)
        TriggerServerEvent('betgame', team, amount)
    end
end)
--sports bet end

--party room
exports['qb-target']:AddBoxZone("PartyNPC", vector3(1013.57, 54.87, 70.86), 0.5, 0.5, {--change npc coords
    name = "PartyNPC", 
    heading = 58.28, 
    debugPoly = true, 
    minZ = 70.86 - 3.0, 
    maxZ = 70.86 + 3.0, 
  }, {
    options = { 
      {
        type = "client",
        event = "bookRoom", 
        icon = "fa-solid fa-music", 
        label = "book party room for whole Night", 
        roomType = "night"
      },
      {
        type = "client",
        event = "bookRoom", 
        icon = "fa-solid fa-clock", 
        label = "book party room for specified Time", 
        roomType = "hour"
      },
    },
    distance = 2.5,
  })

--party room end

--private poker room 
exports['qb-target']:AddBoxZone("PokerNPC", vector3(1017.3, 70.07, 69.86), 0.5, 0.5, {
    name = "PokerNPC", 
    heading = 332.29, 
    debugPoly = true, 
    minZ = 69.86 - 3.0, 
    maxZ = 69.86 + 1.0, 
  }, {
    options = { 
      {
        type = "client",
        event = "hireRoom", 
        icon = "fa-solid fa-dollar-sign", 
        label = "Hire Private Poker Room", 
      },
      {
        type = "client",
        event = "joinRoom", 
        icon = "fa-solid fa-dollar-sign", 
        label = "Joinn Private Poker Room", 
      },
    },
    distance = 2.5,
  })
--private poker room end

--boss menu
exports['qb-target']:AddBoxZone("BossMenu", vector3(926.38, 50.94, 81.11), 0.5, 0.5, {--adjust coords
  name = "BossMenu",
  heading = 58.28,
  debugPoly = false,
  minZ = 81.11 - 3.0,
  maxZ = 81.11 + 1.0,
}, {
  options = {
      {
          type = "client",
          event = "pboss",
          icon = "fa-solid fa-briefcase",
          label = "Boss Menu",
          job = "boss" 
      },
  },
  distance = 2.5,
})

RegisterNetEvent('CallNUI')
AddEventHandler('CallNUI', function (data)
  if data.balance then
    SendNUIMessage({
      playeramount = data.balance,
      action = "playerwallet"
    })
  end
end)

RegisterCommand('pboss', function()
  ShowBossMenu()
end, false)

function ShowBossMenu()
  local playerData = QBCore.Functions.GetPlayerData()
  local job = playerData.job

  if job and job.isboss then
      local elements = {
          {label = "Hire Employee", value = "hire"},
          {label = "Fire Employee", value = "fire"},
          {label = "List Employees", value = "list"},
      }

      QBCore.UI.Menu.Open('default', GetCurrentResourceName(), 'boss_menu', {
          title = "Boss Menu",
          align = 'top-left',
          elements = elements
      }, function(data, menu)
          if data.current.value == "hire" then
              TriggerEvent("hireEmployee")
          elseif data.current.value == "fire" then
              TriggerEvent("fireEmployee")
          end
      end, function(data, menu)
          menu.close()
      end)
  else
      QBCore.Functions.Notify("You are not the boss O_O", "error")
  end
end

--boss menu end
