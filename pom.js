var friends = [];
var friendsIme = [];
var friendsRod = [];
var friendsDat = [];
var friendsVin = [];
var friendsTvo = [];
var strangers = {};
var botovods = [];

var zones = {};
var specmobs = {};
var currZoneN = 0;

var iniStream = new ActiveXObject("Scripting.FileSystemObject").GetFile("settings/fighter.ini").OpenAsTextStream(1);

var iniMode = '';
while (!iniStream.AtEndOfStream) {
    var line = iniStream.ReadLine();
    if (line === '' || line.substring(0, 1) === ';') continue;

    if (line.substring(0, 1) === '[') {
        iniMode = line.substring(1, line.length - 1);
        continue;
    }

    if (iniMode === 'СЛУШАЮСЬ') {
        botovods.push(line);
    }
}
iniStream.Close();


var fis = new ActiveXObject('Scripting.FileSystemObject')
    .GetFile('soldaten/_friends.txt').OpenAsTextStream(1, -1);
while (!fis.AtEndOfStream) {
    var a = fis.ReadLine().split(':');
    friends.push({ ime: a[0], rod: a[1], dat: a[2], vin: a[3], tvo: a[4] });
    friendsIme[a[0]] = 1;
    friendsRod[a[1]] = 1;
    friendsDat[a[2]] = 1;
    friendsVin[a[3]] = 1;
    friendsTvo[a[4]] = 1;
}
fis.Close();

fis = new ActiveXObject('Scripting.FileSystemObject')
    .GetFile('soldaten/_strangers.txt').OpenAsTextStream(1, -1);
while (!fis.AtEndOfStream) {
    var a = fis.ReadLine().split(':');
    strangers[a[1]] = a[0];
}
fis.Close();

fis = new ActiveXObject('Scripting.FileSystemObject')
    .GetFile('soldaten/_specmobs.txt').OpenAsTextStream(1, -1);
while (!fis.AtEndOfStream) {
    var line = fis.ReadLine();
    if (line.indexOf('#') === 0) {
        var zoneNum = line.substring(1, line.indexOf(' '));
        var zoneName = line.substring(line.indexOf(' ') + 1);
        zones[zoneName] = zoneNum;
        specmobs[zoneNum] = {};
    } else {
        var a = line.split(':');
        specmobs[zoneNum][a[0]] = a[1];
    }
}
fis.Close();

function setupZone(s) {
    if (zones[s]) {
        currZoneN = zones[s];
        jmc.showme("\x1B\[1;35mЗона №" + currZoneN);
    }
}

var attackWeight = [
    'легонько', 'слегка', 'сильно', 'очень сильно', 'чрезвычайно сильно',
    'БОЛЬНО', 'ОЧЕНЬ БОЛЬНО', 'НЕВЫНОСИМО БОЛЬНО', 'ЧРЕЗВЫЧАЙНО БОЛЬНО',
    'УЖАСНО', 'ЖЕСТОКО', 'УБИЙСТВЕННО', 'СМЕРТЕЛЬНО', 'ИЗУВЕРСКИ'
];

var attackType = [
    'боднул[аои]?', 'клюнул[аои]?', 'лягнул[аои]?',
    'ободрал[аои]?', 'огрел[аои]?', 'оцарапал[аои]?',
    'пырнул[аои]?', 'резанул[аои]?', 'рубанул[аои]?',
    'уколол[аои]?', 'сокрушил[аои]?', 'ткнул[аои]?',
    'ударил[аои]?', 'ужалил[аои]?', 'укусил[аои]?',
    'хлестнул[аои]?', 'подстрелил[аои]?'
];

var rxFight1 = new RegExp('^(.*?) ' +
    '(' + attackWeight.join('|') + ')? ?' +
    '(' + attackType.join('|') + ') ' +
    '(.*?)\.( [(][*]+[)])?$'
);

var rxIme2Tvo = /^(.+) сражается с (.*?)(, сидя верхом на .+)?! (\([а-я]+ аура\) )?$/;

var rxImeRod = [
    /^(.+) уклонил.?с. от атаки (.+)$/,
    /^(.+) сумел.? избежать удара (.+)\.$/,
    /^(.+) избежал.? попытки (.+) завалить ...?\.$/,
    /^(.+) полностью отклонил атаку (.+)/,
    /^(.+) не попал.? своим оружием в спину (.+)\.$/,
    /^(.+) нанес.?.? удар своим оружием в спину (.+)\.( \(\*+\))?$/,
    /^(.+) воткнул.? свое оружие в спину (.+)\. Ща начнется убивство\.( \(\*+\))?$/,
    /^(.+) медленно покрывается льдом, после морозного дыхания (.+)\.( \(\*+\))?$/,
    /^(.+) бьется в судорогах от кислотного дыхания (.+)\.( \(\*+\))?$/,
    /^(.+) ослеплен.? дыханием (.+)\.( \(\*+\))?$/,
    /^(.+) содрогнулся от богатырского удара (.+)\.( \(\*+\))?$/,
    /^(.+) пошатнулся от богатырского удара (.+)\.( \(\*+\))?$/
];

var rxImeVin = [
    /^(.+) промазал.?, когда хотел.? ударить (.*)\.$/,
    /^(.+) попытал.?с. [а-я]+ (.*), но .*\.$/,
    /^(.+) попытал.?с. ободрать (.*) \- неудачно\.$/,
    /^(.+) не смог.?.? ободрать (.*) \- он.? просто промазал.?\.$/,
    /^Одним ударом (.+) повалил.? (.*) на землю\.( \(\*+\))?$/,
    /^(.+) завалил.? (.+) на землю мощным ударом\.( \(\*+\))?$/,
    /^(.+) попытал.?с. пнуть (.+)\. Займите же ...? ловкости\.$/,
    /^(.*?) .+пнул.? (.+)\. Морда .+ искривилась в гримасе боли\.( \(\*+\))?$/,
    /^(.*?) .+пнул.? (.+)\. Теперь .+ дико враща.т глазами от боли\.( \(\*+\))?$/,
    /^(.+) ловко подсек.?.? (.+), уронив ...? на землю\.$/
];

var rxImeIme = [
    /^(.+) подгорел.? в нескольких местах, когда (.+) дыхнул.? на не..? огнем\./
];

var rxImeDat = [
    /^(.+) попытал.?с. нанести (.+) удар в спину, но ...? заметили\.$/
];

var rxRodRod = [
    /^Удар (.+) прошел мимо (.+)\.$/,
    /^Доспехи (.+) полностью поглотили удар (.+)\.$/,
    /^Мощный пинок (.+) не достиг (.+)$/,
    /^Магический кокон вокруг (.+) полностью поглотил удар (.+)\.$/
];

var rxRodVin = [
    /^Точное попадение (.*) вывело (.*) из строя\.$/
];

var lastOtst = 0;
trig(function () {
    lastOtst = now();
}, /^Вы отступили из битвы/, 'f100:AUTOPOM');

var lastTryKick = 0;
trig(function () {
    lastTryKick = now();
}, /^Вы попытаетесь оглушить /, 'f100:AUTOPOM');

trig(function () {
    lastTryKick = now();
}, /^Невозможно. Вы пытаетесь сбить /, 'f100:AUTOPOM');

var lastKick = 0;

function parsePromptLine(prompt) {
    var result = {};

    result.hp = prompt.substring(0, prompt.indexOf('H'));
    result.mov = prompt.substring(prompt.indexOf(' ') + 1, prompt.indexOf('M'));
    result.iFight = prompt.indexOf(']') !== -1 ? 1 : 0;
    result.lagOz = prompt.indexOf(' ОЗ:0') !== -1 ? 0 : 1;
    result.lagPn = prompt.indexOf(' Пн:') !== -1 ? 1 : 0;
    result.lagMo = prompt.indexOf(' Мо:') !== -1 ? 1 : 0;
    result.lagOg = prompt.indexOf(' Ог:') !== -1 ? 1 : 0;
    result.lagPz = prompt.indexOf(' Пз:0') !== -1 ? 0 : 1;

    if (result.iFight) {
        var enemy = prompt.substring(prompt.lastIndexOf('['));
        enemy = enemy.substring(1, enemy.indexOf(':'));
        result.enemy = enemy;
    }

    return result;
}

var spamGlush = jmc.getVar('spamGlush');

function onPromptKick(promptLine) {
    var prompt = parsePromptLine(promptLine);
    if (!prompt.iFight) { return; }

    var noglush = specmobs[currZoneN] && specmobs[currZoneN][prompt.enemy] === '!глуш';
    if (att1 === 'оглу' && noglush) {
        jmc.showme('помечен как !глуш');
    }

    var ts = now();

    if (att1 === 'сбит' && lastTryKick < ts) {
        jmc.parse('сбит ' + target1);
        jmc.parse('сбит');
    }

    // попробуем заспамить глуш
    if (att1 === 'оглу' && spamGlush !== '0') {
        if (!noglush && lastTryKick < ts
            && (!prompt.lagOg || promptLine.indexOf(' Ог:1') > 0)
            && (!prompt.lagOz || promptLine.indexOf(' ОЗ:1') > 0)
        ) {
            jmc.parse('оглу');
            lastKick = ts;
            return;
        }
    }

    if (prompt.lagOz) { return; }
    if (ts - lastKick == 0) { return; }

    if (att1 === 'пнут' && !prompt.lagPn) {
        jmc.parse('пнут');
        lastKick = ts;
    } else if (att1 === 'моло' && !prompt.lagMo) {
        jmc.parse('моло');
        lastKick = ts;
    } else if (att1 === 'вихр' && !prompt.lagPn) {
        jmc.parse('пнут');
        lastKick = ts;
    } else if (att1 === 'оглу') {
        if (!prompt.lagOg && !noglush) {
            jmc.parse('оглу');
            lastKick = ts;
        } else if (!prompt.lagPn && noglush) {
            jmc.parse('пнут');
            lastKick = ts;
        } else if (!prompt.lagPn && promptLine.indexOf(' Ог:1') === -1) {
            jmc.parse('пнут');
            lastKick = ts;
        }
    }
}

var lastFresh = 0; // когда пил красное

function onPromptAssist(lines, promptLine) {
    var prompt = parsePromptLine(promptLine);
    if (prompt.iFight) { return; }

    var ts = now();
    if (ts - lastOtst < 5) { return; }

    if (att1 === 'вихр' && ts - lastFresh > 20) {
        if (prompt.mov < 90) {
            jmc.parse('пить мех.красн');
            lastFresh = ts;
        }
    }

    var trg0 = targetFromLines(lines);
    if (trg0) {
        if (!prompt.lagPz) {
            jmc.parse('опозн ' + trg0); // прокач опознания
        }

        if (att1 === 'пнут' && !prompt.lagPn && !prompt.lagOz) {
            jmc.parse(att1 + ' ' + trg0);
        } else if (att1 === 'оглу' && !prompt.lagOg && !prompt.lagOz) {
            jmc.parse(att1 + ' ' + trg0);
        } else if (att1 === 'моло' && !prompt.lagMo && !prompt.lagOz) {
            jmc.parse(att1 + ' ' + trg0);
        } else if (att1 === 'сбит' && !prompt.lagOz) {
            jmc.parse(att1 + ' ' + trg0);
        } else if (att1 === 'вихр' && !prompt.lagOz) {
            jmc.parse(att1 + ' ' + trg0);
        } else if (!prompt.lagOz) {
            jmc.parse('уб ' + trg0);
        }
    }
}

function targetFromLines(lines) {
    var allIme = allRod = allDat = allVin = allTvo = [];
    for (var i = 0; i < lines.length; i++) {
        var line1 = lines[i];
        var aa;

        if (aa = line1.match(rxIme2Tvo)) {
            var ime = aa[1];
            var tvo = aa[2];
            ime = nameFromTitles(ime);

            if (friendsTvo[tvo] && ime !== 'вы' && ime !== 'Вы' && !target0) {
                allIme.push(ime);
            } else if (friendsIme[ime] && tvo !== 'вами' && tvo !== 'ВАМИ' && !target0) {
                allTvo.push(tvo);
            }
        }

        if (aa = line1.match(rxFight1)) {
            var ime = aa[1];
            var vin = aa[4];

            if (friendsVin[vin] && ime !== 'вы' && ime !== 'Вы') {
                allIme.push(ime);
            } else if (friendsIme[ime] && vin !== 'вас' && vin !== 'Вас') {
                allVin.push(vin);
            }
        }

        for (var j = 0; j < rxImeRod.length; j++) {
            if (aa = line1.match(rxImeRod[j])) {
                var ime = aa[1];
                var rod = aa[2];

                if (friendsRod[rod] && ime !== 'вы' && ime !== 'Вы') {
                    allIme.push(ime);
                } else if (friendsIme[ime] && rod !== 'вас' && rod !== 'Вас') {
                    allRod.push(rod);
                }
            }
        }

        for (var j = 0; j < rxImeVin.length; j++) {
            if (aa = line1.match(rxImeVin[j])) {
                var ime = aa[1];
                var vin = aa[2];

                if (friendsVin[vin] && ime !== 'вы' && ime !== 'Вы') {
                    allIme.push(ime);
                } else if (friendsIme[ime] && vin !== 'вас' && vin !== 'Вас') {
                    allVin.push(vin);
                }
            }
        }

        for (var j = 0; j < rxImeIme.length; j++) {
            if (aa = line1.match(rxImeIme[j])) {
                var ime = aa[1];
                var ime2 = aa[2];

                if (friendsIme[ime2] && ime !== 'вы' && ime !== 'Вы') {
                    allIme.push(ime);
                } else if (friendsIme[ime] && ime2 !== 'вы' && ime2 !== 'Вы') {
                    allIme.push(ime2);
                }
            }
        }

        for (var j = 0; j < rxImeDat.length; j++) {
            if (aa = line1.match(rxImeDat[j])) {
                var ime = aa[1];
                var dat = aa[2];

                if (friendsDat[dat] && ime !== 'вы' && ime !== 'Вы') {
                    allIme.push(ime);
                } else if (friendsIme[ime] && dat !== 'вам' && dat !== 'Вам') {
                    allDat.push(dat);
                }
            }
        }

        for (var j = 0; j < rxRodRod.length; j++) {
            if (aa = line1.match(rxRodRod[j])) {
                var rod = aa[1];
                var rod2 = aa[2];

                if (friendsRod[rod] && rod2 !== 'вас' && rod2 !== 'Вас') {
                    allRod.push(rod2);
                } else if (friendsRod[rod2] && rod !== 'вас' && rod !== 'Вас') {
                    allRod.push(rod);
                }
            }
        }

        for (var j = 0; j < rxRodVin.length; j++) {
            if (aa = line1.match(rxRodVin[j])) {
                var rod = aa[1];
                var vin = aa[2];

                if (friendsVin[vin] && rod !== 'вас' && rod !== 'Вас') {
                    allRod.push(rod);
                } else if (friendsRod[rod] && vin !== 'вас' && vin !== 'Вас') {
                    allVin.push(vin);
                }
            }
        }
    }

    if (!!allIme.length) { return makeAlias(allIme[0]) }
    if (!!allVin.length) { return makeAlias(allVin[0]) }
    if (!!allTvo.length) { return makeAlias(allTvo[0]) }
    if (!!allRod.length) { return makeAlias(allRod[0]) }
    if (!!allDat.length) { return makeAlias(allDat[0]) }
    return '';
}

var target0;
var target1;
var target1Ts = 0;
var att1 = 'пнут';

function setAttack1(s) {
    att1 = s;
}

function setTarget1(s) {
    target1 = s;
    target1 = target1.replace(/^\.+/, '');
    target0 = target1.match(/^[А-Я]/) ? '.' + target1 : target1;
    target1Ts = now();

    if (havePkTarget()) {
        jmc.setVar('PK_TRG', target1);
    } else {
        jmc.setVar('PK_TRG', 'PKTARGETNOTSET');
    }
}

function sayTarget1() {
    if (havePkTarget()) {
        jmc.parse('гг моя цель: ' + target0 + ' (игрок), использую ' + att1);
    } else if (target0) {
        jmc.parse('гг моя цель: ' + target0 + ', использую ' + att1);
    } else {
        jmc.parse('гг нет цели! помогаю танку, использую ' + att1);
    }
}

function havePkTarget() {
    return target0 && target0.substring(0, 1) === '.';
}

function processPk() {
    jmc.parse(att1 + ' ' + target0);
}

trig(function () {
    if (target0) {
        jmc.parse(att1 + ' ' + target0);

        // ц1 дали и забыли, >5мин назад
        if (!havePkTarget() && now() - target1Ts > 300) {
            setTarget1('');
            sayTarget1();
        }
    }
}, /^:.+@/, 'f100:TARGET1');

// нас атакуют, а мне не дали ПК цель
trig(function (aa) {
    if (!havePkTarget()) {
        var nameIme = strangers[aa[2]];
        if (nameIme) {
            setTarget1(nameIme);
            jmc.parse('~');
            sayTarget1();
            jmc.parse(att1 + ' .' + nameIme);
            jmc.parse(att1 + ' .' + nameIme);
            jmc.parse(att1 + ' .' + nameIme);
        }
    }
}, /^Вы получили право (отомстить|клановой мести) ([А-Я][а-я]+)!/, 'f200:TARGET1');
