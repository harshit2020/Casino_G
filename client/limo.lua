function loadModel(model)
    RequestModel(model)
    while not HasModelLoaded(model) do
        Wait(1)
    end
end



function spawnNPCAndVehicle(npcModel, vehicleModel)
    loadModel(npcModel)
    loadModel(vehicleModel)
    
    local playerPed = PlayerPedId()
    local playerCoords = GetEntityCoords(playerPed)
    local vehicle = CreateVehicle(vehicleModel, 923.75, -19.01, 78.76, 320.67, true, false)
    local npc = CreatePed(4, npcModel, 925.75, -17.01, 80.76, 322.67, true, false)
    
    exports["ps-fuel"]:SetFuel(vehicle, 100.0)
    TaskWarpPedIntoVehicle(npc, vehicle, -1)
    taskNPCToPlayer(npc,vehicle)
    while not IsPedInVehicle(playerPed, vehicle, false) do Wait(0) end
    return npc, vehicle
end
function taskNPCToPlayer(npc, vehicle)
    local speed = 100.0  
    --local drivingStyle = 786603
    local drivingStyle = 262144  
    local stoppingRange = 0.5  
    TaskVehicleDriveToCoordLongrange(npc, vehicle, 920.15, 51.99, 80.9, speed, drivingStyle, stoppingRange)
end

function taskNPCToDrive(npc, vehicle, coords)
    local speed = 100.0  
    --local drivingStyle = 786603
    local drivingStyle = 262144  
    local stoppingRange = 5.0
    -- TaskWarpPedIntoVehicle(playerPed, vehicle, 2)  
    TaskVehicleDriveToCoordLongrange(npc, vehicle, coords.x, coords.y, coords.z, speed, drivingStyle, stoppingRange)
end

RegisterNetEvent('callnpc', function(source, args)
    local npcModel = "s_m_m_armoured_01"
    local vehicleModel = "stretch"
    local coords = vector3(407.68,-1033.95,29.35)

    -- local dialog = exports['qb-input']:ShowInput({
    --     header = "Where To?",
    --     submitText = "Let's Drive!",
    --     inputs = {
    --         text = "Possible Destinations", 
    --         name = "Select Among These", 
    --         type = "radio", 
    --         options = { 
    --             { value = vector3(149.03, -919.53, 29.97) , text = "Legion Square" }, 
    --             { value = vector3(-1594.02, -942.89, 13.86), text = "Vespucci Pier"}, 
    --             -- { value = "other2", text = "Other2" }, 
    --             -- { value = "other3", text = "Other3" }, 
    --             -- { value = "other4", text = "Other4" }, 
    --             -- { value = "other5", text = "Other5" }, 
    --             -- { value = "other6", text = "Other6" }, 
    --         },
    --     },
    -- })
    local dialog = exports['qb-input']:ShowInput({
        header = "Taxi Menu",
        submitText = "Drive",
        inputs = {
            {
                text = "Possible Destinations", -- text you want to be displayed as a input header
                name = "coords", -- name of the input should be unique otherwise it might override
                type = "radio", -- type of the input - Radio is useful for "or" options e.g; billtype = Cash OR Bill OR bank
                options = Config.LimoOptions
                -- default = "cash", -- Default radio option, must match a value from above, this is optional
            },
        },
    })
    local coords = vector3(dialog.coords.x, dialog.coords.y, dialog.coords.z)
    print(coords)
    local npc, vehicle = spawnNPCAndVehicle(npcModel, vehicleModel)
    taskNPCToDrive(npc, vehicle, coords)
end, false)
