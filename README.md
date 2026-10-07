# Rift HUD

A clean, lightweight HUD for **Qbox** with full **QBCore** compatibility.

Health, armor, hunger, thirst, stress, oxygen and voice indicators, plus a vehicle panel with speed and fuel. Segmented skewed bars, liquid-fill icons and a purple accent glow, with almost no resource usage.

## Features

- Works on Qbox and QBCore without extra configuration
- Replaces the default GTA HUD and minimap
- Armor, stress and oxygen show only when they matter
- Low value warning pulse on health, hunger, thirst and oxygen
- Voice indicator with pma-voice talking state
- Vehicle panel with speed (KM/H or MPH) and fuel, supports `ox_fuel` and native fuel levels
- Hides in the pause menu
- `/hud` command to toggle, saved per player
- Left or right position, vehicle panel on the opposite side
- Resolution independent layout

## Installation

1. Download and place the `rift_hud` folder in your `resources` directory.
2. Add `ensure rift_hud` to your `server.cfg` after your framework and voice resource.
3. Restart the server.

## Configuration

Everything is in `config.lua`.

| Option | Description |
| --- | --- |
| `Config.Command` | Command used to toggle the HUD |
| `Config.Position` | `left` or `right` |
| `Config.Accent` | Accent color in hex |
| `Config.LowThreshold` | Percentage where warning pulse starts |
| `Config.ShowStress` | Show stress indicator |
| `Config.ShowOxygen` | Show oxygen while underwater |
| `Config.ShowVoice` | Show voice indicator |
| `Config.ShowVehicle` | Show vehicle panel |
| `Config.HideEmptyArmor` | Hide armor ring when armor is zero |
| `Config.SpeedUnit` | `kmh` or `mph` |
| `Config.MaxSpeed` | Speed that fills the speed bar |
| `Config.HideDefaultHud` | Hide the default GTA HUD components |
| `Config.HideMinimap` | Hide the minimap and its health bars |
| `Config.HiddenComponents` | List of default HUD component ids to hide |

## Exports

```lua
exports.rift_hud:setVisible(true)
exports.rift_hud:isVisible()
```

## License

Free to use on your server. Selling, leaking and redistributing are not allowed. See `LICENSE` for the full terms.

## Support

Join the Discord: https://discord.gg/9AxUva6kTR
