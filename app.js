var myName = '';
var myProf = '';
var botovods = ['Зурис', 'Делвин', 'Полыхай', 'Умеля', 'Трогвард', 'Шабу', 'Бельверус', 'Лотта'];

// управление окошками
var wShown = 0;

function hideAllWindows() {
    for (var i = 0; i < 10; i++) {
        jmc.parse('#wshow ' + i + ' hide');
    }
    wShown = 0;
}

function showWindow(num) {
    if (wShown === num) { return; }
    hideAllWindows();
    jmc.parse('#wshow ' + num + ' show');
    wShown = num;
}

hideAllWindows();
jmc.parse('#wdock 2');
jmc.parse('#wdock 3');
jmc.SetHotkey('alt+1', '#scr hideAllWindows()');
jmc.SetHotkey('alt+2', '#scr showWindow(2)');
jmc.SetHotkey('alt+3', '#scr showWindow(3)');

jmc.showme('ALT+2 - окно болтовни');
jmc.showme('ALT+3 - окно лута');
jmc.showme('ALT+1 - закрыть окна');
// \управление окошками

// триги как в ммс
var registeredTriggers = [];

function trig(cb, rx, flags) {
    var active = !flags.match(/^\-/);
    var blocking = !flags.match(/^[^:\d]*f/);
    var colored = !!flags.match(/^[^:\d]*c/);

    var aa1 = flags.match(/:(.+)$/);
    var group = aa1 ? aa1[1] : '';

    var aa2 = flags.match(/^[^:\d]*(\d+)/)
    var priority = aa2 ? aa2[1] : 0;

    registeredTriggers.push({
        cb: cb,
        rx: rx,
        flags: flags,
        active: active,
        blocking: blocking,
        colored: colored,
        group: group,
        priority: priority
    });
}

function enable(group) {
    for (var i = 0; i < registeredTriggers.length; i++) {
        if (registeredTriggers[i].group === group) {
            registeredTriggers[i].active = enable;
        }
    }
}

function disable(group) {
    for (var i = 0; i < registeredTriggers.length; i++) {
        if (registeredTriggers[i].group === group) {
            registeredTriggers[i].active = false;
        }
    }
}

jmc.RegisterHandler('Incoming', 'onIncoming()');

function onIncoming() {
    var line = jmc.Event;
    var line1 = line.replace(/\x1B\[[01];\d{2}m/g, '');

    for (var i = 0; i < registeredTriggers.length; i++) {
        var trg = registeredTriggers[i];
        if (!trg.active) {
            continue;
        }

        var aa = trg.colored ? line1.match(trg.rx) : line.match(trg.rx);
        if (aa) {
            trg.cb(aa);
            if (trg.blocking) {
                break;
            }
        }
    }
}

jmc.RegisterHandler('Load', 'onLoad()');

function onLoad() {
    myName = '';
    myProf = '';

    registeredTriggers = registeredTriggers.sort(function (a, b) {
        return a.priority - b.priority;
    });

    updateMe();
}
// \триги как в ммс

// узнаю, кто я по профе
trig(function () {
    if (!myName || !myProf) jmc.parse('сч');
}, /^Вы поплелись /, 'f10000:WHOAMI');

trig(function () {
    if (!myName || !myProf) jmc.parse('сч');
}, /^\x1B\[1;31mМинул час\./, 'f10000:WHOAMI');

trig(function (aa) {
    myName = aa[1];
    myProf = aa[2];
    myName = myName.replace(/,.+$/, '');
    myName = myName.replace(/^.*([А-Я][а-я]+)$/, '$1');
}, /^Вы (.+) \(.+ ДНЗ\) \(Русич, .+, ([а-я]+) (\d+) уровня\)\.$/, 'f10000:WHOAMI');
// \узнаю, кто я по профе

function now() {
    return Math.floor(+new Date() / 1000);
};

function hhmm() {
    var dd = new Date();
    var hh = dd.getHours();
    var mm = dd.getMinutes();

    if (hh < 10) {
        hh = '0' + hh;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    return hh + ':' + mm;
};

function make_alias(s) {
    var alias = '';
    var wn = 0;
    var arr = s.toLowerCase().split(/[\s\-,]+/);

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].length >= 3 && wn < 2) {
            alias += alias ? '.' : '';
            alias += arr[i].substr(0, 3);
            wn++;
        }
    }

    return alias ? alias : s;
};

function in_array(arr, needle) {
    for (var i = 0; i < arr.length; i++) {
        if (needle === arr[i]) {
            return true;
        }
    }

    return false;
};

// Горячая голова Вигге, Отважный воин Игоревой рати (храбр ИР) => Вигге
function name_from_titles(s) {
    var name = s.replace(/ ?[,(].*$/, '');
    name = name.replace(/^.*([А-Я][а-я]+)$/, '$1');
    return name;
};

var layoutTalks = [
    /^[А-Я][а-я]+ дружине: .+$/,
    /^[А-Я][а-я]+ союзникам: .+$/,
    /^[А-Я][а-я\-]+ сказал.? : .+$/,
    /^[А-Я][а-я\-]+ сообщил.? группе : '.+'$/,
    /^\x1B\[1;36m[А-Я][а-я\-]+ сказал.? [А-Яа-я\-]+ :.+$/,
    /^\x1B\[1;33m[А-Я][а-я\-]+ закричал.? :.+$/,
    /^\x1B\[0;33m[А-Я][а-я\-]+ заметил.? :.+$/,
    /^\x1B\[1;33m[А-Я][а-я\-]+ заорал.? :.+$/,
    /^\x1B\[0;36m\[оффтоп\] .+$/
];

for (var i = 0; i < layoutTalks.length; i++) {
    trig(function (aa) {
        jmc.woutput(2, '[' + hhmm() + '] ' + aa[0]);
    }, layoutTalks[i], 'f10000:TALKS');
}
