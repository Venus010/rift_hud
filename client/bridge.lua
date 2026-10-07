Bridge = {}

local core

local function detect()
    if GetResourceState('qbx_core') == 'started' then
        return 'qbox'
    end

    if GetResourceState('qb-core') == 'started' then
        return 'qbcore'
    end
end

function Bridge.GetMetadata()
    local framework = detect()
    if not framework then return nil, false end

    local data
    if framework == 'qbox' then
        data = exports.qbx_core:GetPlayerData()
    else
        core = core or exports['qb-core']:GetCoreObject()
        data = core.Functions.GetPlayerData()
    end

    if not data or not data.metadata then return nil, true end

    return data.metadata, false
end
