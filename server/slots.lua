local QBCore = exports['qb-core']:GetCoreObject()


Citizen.CreateThread(function()
	local tSlots = {}
	while not closetoSlots do
		Citizen.Wait(1000)
	end
	for k,v in pairs(Config.Casino.SlotBets) do
		local playerPed = PlayerPedId()
		local objects = GetGamePool('CObject')
		local closestDistance, closestObject = -1, -1
		local filter, coords = k, Config.Casino.Center
		if type(filter) == 'string' then
			if filter ~= '' then
				filter = {filter}
			end
		end
		for i=1, #objects, 1 do
			local foundObject = false
			if filter == nil or (type(filter) == 'table' and #filter == 0) then
				foundObject = true
			else
				local objectModel = GetEntityModel(objects[i])
				for j=1, #filter, 1 do
					if objectModel == GetHashKey(filter[j]) then
						local data = {
							pos = GetEntityCoords(objects[i]),
							bet = v.bet,
							prop = k,
							prop1 = v.prop1,
							prop2 = v.prop2,
						}
						table.insert(tSlots, data)
					end
				end
			end
		end
	end
	table.sort(tSlots, function(a,b) return a.pos.x < b.pos.x end)
	table.sort(tSlots, function(a,b) return a.pos.y < b.pos.y end)
	table.sort(tSlots, function(a,b) return a.pos.z < b.pos.z end)
	for k,v in pairs(tSlots) do
		createSlots(k, v)
	end
end)

createSlots = function(index, data)
	local self = {}
	
    self.index = index
    self.data = data
	self.betData = {}
	self.rulettCam = nil
	
	self.spin1 = nil
	self.spin2 = nil
	self.spin3 = nil
	
	self.spin1b = nil
	self.spin2b = nil
	self.spin3b = nil
	
	self.running = false
	self.cameraMode = 1
	self.tableObject = GetClosestObjectOfType(data.pos,0.8,GetHashKey(self.data.prop),0,0,0)
	
	self.data.rot = GetEntityHeading(self.tableObject)
	self.data.position = GetEntityCoords(self.tableObject)
	
	self.offset = GetObjectOffsetFromCoords(GetEntityCoords(self.tableObject), GetEntityHeading(self.tableObject),0.0, 0.05, 0.0)
	
	self.changeKameraMode = function()
		local rot = CURRENT_CHAIR_DATA.rotation + vector3(0.0, 0.0, -90.0)
		if self.cameraMode == 1 then
			self.cameraMode = 2
			local CamOffset = GetObjectOffsetFromCoords(GetEntityCoords(self.tableObject), GetEntityHeading(self.tableObject), 0.50, -0.60, 0.54)
			self.rulettCam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', CamOffset.x, CamOffset.y, CamOffset.z+0.8, rot.x-25.0, rot.y, rot.z+35.0, 80.0, true, 2)SetCamActive(self.rulettCam, true)
			RenderScriptCams(true, 900, 900, true, false)
			ShakeCam(self.rulettCam, 'HAND_SHAKE', 0.3)
			SendNUIMessage({
				state = 'start',
				type = 'slots',
				camMode = '1',
			})
		elseif self.cameraMode == 2 then
			self.cameraMode = 3
			if DoesCamExist(self.rulettCam) then
				DestroyCam(self.rulettCam, false)
			end			
			RenderScriptCams(false, 900, 900, true, false)
			SendNUIMessage({
				state = 'start',
				type = 'slots',
				camMode = '2',
			})
		elseif self.cameraMode == 3 then
			self.cameraMode = 1
			local CamOffset = GetObjectOffsetFromCoords(GetEntityCoords(self.tableObject), GetEntityHeading(self.tableObject), 0.0, -0.5, 0.6)
			self.rulettCam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', CamOffset.x, CamOffset.y, CamOffset.z+0.8, rot.x-25.0, rot.y, rot.z, 85.0, true, 2)SetCamActive(self.rulettCam, true)
			RenderScriptCams(true, 900, 900, true, false)
			ShakeCam(self.rulettCam, 'HAND_SHAKE', 0.3)
			SendNUIMessage({
				state = 'start',
				type = 'slots',
				camMode = '3',
			})
		end
    end
end



