local visible = GetResourceKvpString('rift_hud:visible') ~= 'false'
local paused = false
local voiceMode = 2
local lastStats, lastVehicle = '', ''

local STAT_KEYS = { 'health', 'armor', 'hunger', 'thirst', 'stress', 'oxygen', 'voice', 'talking' }

local function send(action, data)
    SendNUIMessage({ action = action, data = data })
end

local function clamp(value)
    return math.floor(math.max(0, math.min(100, value)) + 0.5)
end

local function applyVisibility()
    send('visible', visible and not paused)
end

local function collectStats(ped)
    local stats = {}

    if IsEntityDead(ped) then
        stats.health = 0
    else
        local max = GetEntityMaxHealth(ped) - 100
        stats.health = clamp((GetEntityHealth(ped) - 100) / max * 100)
    end

    local armor = GetPedArmour(ped)
    if armor > 0 or not Config.HideEmptyArmor then
        stats.armor = clamp(armor)
    end

    local metadata, loading = Bridge.GetMetadata()
    if loading then return nil end

    if metadata then
        stats.hunger = metadata.hunger and clamp(metadata.hunger)
        stats.thirst = metadata.thirst and clamp(metadata.thirst)

        if Config.ShowStress and metadata.stress and metadata.stress > 0 then
            stats.stress = clamp(metadata.stress)
        end
    end

    if Config.ShowOxygen and IsPedSwimmingUnderWater(ped) then
        stats.oxygen = clamp(GetPlayerUnderwaterTimeRemaining(PlayerId()) * 10)
    end

    if Config.ShowVoice then
        stats.voice = voiceMode * 33
        stats.talking = NetworkIsPlayerTalking(PlayerId())
    end

    return stats
end

local function fingerprint(tbl, keys)
    local parts = {}
    for i = 1, #keys do
        parts[i] = tostring(tbl[keys[i]])
    end
    return table.concat(parts, '|')
end

local function collectVehicle(ped)
    local vehicle = GetVehiclePedIsIn(ped, false)
    if vehicle == 0 then return nil end

    local multiplier = Config.SpeedUnit == 'mph' and 2.236936 or 3.6
    local fuel = Entity(vehicle).state.fuel or GetVehicleFuelLevel(vehicle)

    return {
        speed = math.floor(GetEntitySpeed(vehicle) * multiplier + 0.5),
        fuel = clamp(fuel)
    }
end

RegisterNUICallback('ready', function(_, cb)
    send('config', {
        accent = Config.Accent,
        position = Config.Position,
        low = Config.LowThreshold,
        maxSpeed = Config.MaxSpeed,
        unit = Config.SpeedUnit == 'mph' and 'MPH' or 'KM/H'
    })
    lastStats, lastVehicle = '', ''
    applyVisibility()
    cb('ok')
end)

RegisterNetEvent('pma-voice:setTalkingMode', function(mode)
    voiceMode = mode or 2
end)

CreateThread(function()
    while true do
        local wait = 250
        local ped = PlayerPedId()

        local isPaused = IsPauseMenuActive()
        if isPaused ~= paused then
            paused = isPaused
            applyVisibility()
        end

        local stats = collectStats(ped)
        if stats then
            local key = fingerprint(stats, STAT_KEYS)
            if key ~= lastStats then
                lastStats = key
                send('stats', stats)
            end
        end

        if Config.ShowVehicle then
            local vehicle = collectVehicle(ped)
            local key = vehicle and (vehicle.speed .. '|' .. vehicle.fuel) or 'none'
            if key ~= lastVehicle then
                lastVehicle = key
                send('vehicle', vehicle or false)
            end
            if vehicle then wait = 100 end
        end

        Wait(wait)
    end
end)

if Config.HideDefaultHud then
    CreateThread(function()
        while true do
            for i = 1, #Config.HiddenComponents do
                HideHudComponentThisFrame(Config.HiddenComponents[i])
            end

            if Config.HideMinimap then
                DisplayRadar(false)
            end

            Wait(0)
        end
    end)
end

RegisterCommand(Config.Command, function()
    visible = not visible
    SetResourceKvp('rift_hud:visible', tostring(visible))
    applyVisibility()
end, false)

exports('setVisible', function(state)
    visible = state and true or false
    applyVisibility()
end)

exports('isVisible', function()
    return visible
end)
