const ICONS = {
    health: '<path d="M12 20.5s-7.5-4.6-9.4-9.4A5.3 5.3 0 0 1 12 6.2a5.3 5.3 0 0 1 9.4 4.9c-1.9 4.8-9.4 9.4-9.4 9.4z"/>',
    armor: '<path d="M12 3l8 3v6c0 4.8-3.3 8-8 9-4.7-1-8-4.2-8-9V6l8-3z"/>',
    hunger: '<path d="M6 3v5a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2 1.4-3 4-3 7v3h3"/>',
    thirst: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    stress: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    oxygen: '<circle cx="9" cy="14.5" r="5"/><circle cx="17" cy="7" r="3"/>',
    voice: '<path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v4"/>'
};

const BARS = [
    { id: 'health', color: '#ff4d6d', warn: 'low', size: 'big' },
    { id: 'armor', color: '#6aa8ff', size: 'thin' }
];

const CHIPS = [
    { id: 'hunger', color: '#ffa24a', warn: 'low', number: true },
    { id: 'thirst', color: '#3fc1ff', warn: 'low', number: true },
    { id: 'stress', color: '#c58bff', warn: 'high', number: true },
    { id: 'oxygen', color: '#5eead4', warn: 'low', number: true },
    { id: 'voice', color: '#9a97b3' }
];

const IDLE_VOICE = '#9a97b3';

const hud = document.getElementById('hud');
const barsRoot = document.getElementById('bars');
const chipsRoot = document.getElementById('chips');
const vehicle = document.getElementById('vehicle');
const speedEl = document.getElementById('speed');
const unitEl = document.getElementById('unit');
const speedBar = document.getElementById('speedBar');
const fuelBar = document.getElementById('fuelBar');
const fuelNum = document.getElementById('fuelNum');
const fuelWrap = vehicle.querySelector('.fuel');

const config = { accent: '#8b5cf6', low: 20, maxSpeed: 260 };
const bars = {};
const chips = {};

BARS.forEach((def) => {
    const row = document.createElement('div');
    row.className = 'row off' + (def.size === 'thin' ? ' thin' : '');
    row.style.setProperty('--c', def.color);
    row.innerHTML =
        '<svg viewBox="0 0 24 24">' + ICONS[def.id] + '</svg>' +
        '<div class="bar-wrap"><div class="track ' + def.size + '"><i></i></div></div>' +
        '<b></b>';
    barsRoot.appendChild(row);
    bars[def.id] = { def, row, fill: row.querySelector('i'), num: row.querySelector('b') };
});

CHIPS.forEach((def) => {
    const el = document.createElement('div');
    el.className = 'chip off';
    el.style.setProperty('--c', def.color);
    el.innerHTML =
        '<div class="glyph">' +
        '<svg class="base" viewBox="0 0 24 24">' + ICONS[def.id] + '</svg>' +
        '<svg class="lit" viewBox="0 0 24 24">' + ICONS[def.id] + '</svg>' +
        '</div><small></small>';
    chipsRoot.appendChild(el);
    chips[def.id] = { def, el, lit: el.querySelector('.lit'), num: el.querySelector('small') };
});

function isWarn(kind, value) {
    return (kind === 'low' && value <= config.low) || (kind === 'high' && value >= 100 - config.low);
}

function setBar(id, value) {
    const node = bars[id];
    if (typeof value !== 'number') {
        node.row.classList.add('off');
        return;
    }

    node.row.classList.remove('off');
    node.fill.style.width = value + '%';
    node.num.textContent = value;
    node.row.classList.toggle('warn', isWarn(node.def.warn, value));
}

function setChip(id, value) {
    const node = chips[id];
    if (typeof value !== 'number') {
        node.el.classList.add('off');
        return;
    }

    node.el.classList.remove('off');
    node.lit.style.clipPath = 'inset(' + (100 - value) + '% 0 0 0)';
    if (node.def.number) node.num.textContent = value;
    node.el.classList.toggle('warn', isWarn(node.def.warn, value));
}

function setSpeed(value) {
    const padded = String(value).padStart(3, '0');
    const lead = padded.match(/^0*/)[0].length;
    const split = Math.min(lead, 2);
    speedEl.innerHTML = '<span class="dim">' + padded.slice(0, split) + '</span>' + padded.slice(split);
}

const handlers = {
    config(data) {
        Object.assign(config, data);
        document.documentElement.style.setProperty('--accent', data.accent);
        hud.className = hud.className.replace(/pos-\w+/g, '').trim();
        hud.classList.add('pos-' + data.position);
        unitEl.textContent = data.unit;
    },

    visible(state) {
        hud.classList.toggle('off', !state);
    },

    stats(data) {
        BARS.forEach(({ id }) => setBar(id, data[id]));
        CHIPS.forEach(({ id }) => setChip(id, data[id]));

        const voice = chips.voice;
        voice.el.classList.toggle('talking', !!data.talking);
        voice.el.style.setProperty('--c', data.talking ? config.accent : IDLE_VOICE);
    },

    vehicle(data) {
        if (!data) {
            vehicle.classList.add('off');
            return;
        }

        vehicle.classList.remove('off');
        setSpeed(data.speed);
        speedBar.style.width = Math.min(100, data.speed / config.maxSpeed * 100) + '%';
        fuelBar.style.width = data.fuel + '%';
        fuelNum.textContent = data.fuel;
        fuelWrap.classList.toggle('low', data.fuel <= config.low);
    }
};

window.addEventListener('message', (event) => {
    const { action, data } = event.data;
    if (handlers[action]) handlers[action](data);
});

fetch('https://' + GetParentResourceName() + '/ready', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
});
