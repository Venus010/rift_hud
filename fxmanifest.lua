fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'rift_hud'
author 'Rift Studios'
description 'Clean HUD for Qbox and QBCore'
version '1.0.0'

shared_script 'config.lua'

client_scripts {
    'client/bridge.lua',
    'client/main.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js'
}

