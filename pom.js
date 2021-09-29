var friends = [];
var friendsIme = [];
var friendsRod = [];
var friendsDat = [];
var friendsVin = [];
var friendsTvo = [];
var strangers = {};
var specmobs = {};

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
    var a = fis.ReadLine().split(':');
    specmobs[a[0]] = a[1];
}
fis.Close();

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

var lastKick = 0;

function onPromptKick(promptLine) {
    var lagOz = promptLine.indexOf(' ОЗ:0') !== -1 ? 0 : 1;
    var lagPn = promptLine.indexOf(' Пн:') !== -1 ? 1 : 0;
    var lagMo = promptLine.indexOf(' Мо:') !== -1 ? 1 : 0;
    var lagOg = promptLine.indexOf(' Ог:') !== -1 ? 1 : 0;
    var iFight = promptLine.indexOf(']') !== -1 ? 1 : 0;

    if (!iFight) { return; }

    var enemy = promptLine.substring(promptLine.lastIndexOf('['));
    enemy = enemy.substring(1, enemy.indexOf(':'));

    var noglush = specmobs[enemy] === '!глуш';
    if (att1 === 'оглу' && noglush) {
        jmc.showme('помечен как !глуш');
    }

    var ts = now();
    if (att1 === 'пнут' && !lagOz && !lagPn && ts - lastKick > 0) {
        jmc.parse('пнут');
        lastKick = ts;
    } else if (att1 === 'оглу' && !lagOz && !lagOg && ts - lastKick > 0 && !noglush) {
        jmc.parse('оглу');
        lastKick = ts;
    } else if (att1 === 'оглу' && !lagOz && !lagPn && ts - lastKick > 0) {
        jmc.parse('пнут');
        lastKick = ts;
    } else if (att1 === 'моло' && !lagOz && !lagMo && ts - lastKick > 0) {
        jmc.parse('моло');
        lastKick = ts;
    }
}

function onPromptAssist(lines, promptLine) {
    var lagOz = promptLine.indexOf(' ОЗ:0') !== -1 ? 0 : 1;
    var lagPn = promptLine.indexOf(' Пн:') !== -1 ? 1 : 0;
    var lagMo = promptLine.indexOf(' Мо:') !== -1 ? 1 : 0;
    var lagOg = promptLine.indexOf(' Ог:') !== -1 ? 1 : 0;
    var lagPz = promptLine.indexOf(' Пз:0') !== -1 ? 0 : 1;
    var iFight = promptLine.indexOf(']') !== -1 ? 1 : 0;

    if (iFight) { return; }
    if (now() - lastOtst < 5) { return; }

    var trg0 = targetFromLines(lines);

    if (trg0) {
        if (!lagPz) {
            jmc.parse('опозн ' + trg0); // прокач опознания
        }

        if (att1 === 'пнут' && !lagPn && !lagOz) {
            jmc.parse(att1 + ' ' + trg0);
        } else if (att1 === 'оглу' && !lagOg && !lagOz) {
            jmc.parse(att1 + ' ' + trg0);
        } else if (att1 === 'моло' && !lagMo && !lagOz) {
            jmc.parse(att1 + ' ' + trg0);
        } else if (att1 === 'сбит' && !lagOz) {
            jmc.parse(att1 + ' ' + trg0);
        } else if (att1 === 'вихр' && !lagOz) {
            jmc.parse(att1 + ' ' + trg0);
        } else {
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
var att1 = 'пнут';

function setAttack1(s) {
    att1 = s;
}

function setTarget1(s) {
    target1 = s;
    target1 = target1.replace(/^\.+/, '');
    target0 = target1.match(/^[А-Я]/) ? '.' + target1 : target1;
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

trig(function () {
    if (target0) {
        jmc.parse(att1 + ' ' + target0);
    }
}, /^:.+@/, 'f100:TARGET1');

trig(function (aa) {
    if (target0 && target1 === aa[1]) {
        jmc.parse(att1 + ' ' + target0);
    }
}, /^([А-Я][а-я]+) при.+ с.+\.$/, 'f100:TARGET1');

trig(function (aa) {
    if (target0 && target1 === aa[1]) {
        jmc.parse(att1 + ' ' + target0);
    }
}, /^([А-Я][а-я]+) появил.?с. из пентаграммы\.$/, 'f100:TARGET1');

trig(function (aa) {
    if (target0 && target1 === aa[1]) {
        jmc.parse(att1 + ' ' + target0);
    }
}, /^([А-Я][а-я]+) прибыл.? по вызову\.$/, 'f100:TARGET1');

trig(function (aa) {
    if (havePkTarget() && target1 === aa[1]) {
        jmc.parse(att1 + ' ' + target0);
    }
}, /^([А-Я][а-я]+) $/, 'f200:TARGET1');

trig(function (aa) {
    if (target0 && target1 === aa[1]) {
        jmc.parse(att1 + ' ' + target0);
    }

    if (inArray(relocaterDanger, aa[1])) {
        jmc.parse('~;отст');
        jmc.parse(att1 + ' .' + aa[1]);
        jmc.parse('убит .' + aa[1]);
    }
}, /^([А-Я][а-я]+) медленно появил.?с. откуда-то\.$/, 'f100:TARGET1');

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
