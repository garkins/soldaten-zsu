var friends = [];
var friendsIme = [];
var friendsRod = [];
var friendsDat = [];
var friendsVin = [];
var friendsTvo = [];
var allIme = allRod = allDat = allVin = allTvo = [];

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

var rxImeIme = [
    /^(.+) подгорел.? в нескольких местах, когда (.+) дыхнул.? на не..? огнем\./
];

var rxImeDat = [
    /^(.+) попытал.?с. нанести (.+) удар в спину, но ...? заметили\.$/
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

var rxRodRod = [
    /^Удар (.+) прошел мимо (.+)\.$/,
    /^Доспехи (.+) полностью поглотили удар (.+)\.$/,
    /^Мощный пинок (.+) не достиг (.+)$/,
    /^Магический кокон вокруг (.+) полностью поглотил удар (.+)\.$/
];

var rxRodVin = [
    /^Точное попадение (.*) вывело (.*) из строя\.$/,
    /^Вы избежали попытки (.*) хлестнуть (.*)\.$/
];

var lastOtst = 0;
trig(function () {
    lastOtst = now();
}, /^/, 'f100:AUTOPOM');

trig(function (aa) {
    var ime = aa[1];
    var tvo = aa[2];
    ime = name_from_titles(ime);

    if (friendsIme[ime] && tvo !== 'вами' && tvo !== 'ВАМИ') {
        allTvo.push(tvo);
    } else if (friendsTvo[tvo] && ime !== 'вы' && ime !== 'Вы') {
        allIme.push(ime);
    }
}, rxIme2Tvo, 'fc100:AUTOPOM');

trig(function (aa) {
    var ime = aa[1];
    var vin = aa[4];

    if (friendsIme[ime] && vin !== 'вас' && vin !== 'Вас') {
        allVin.push(vin);
    } else if (friendsVin[vin] && ime !== 'вы' && ime !== 'Вы') {
        allIme.push(ime);
    }
}, rxFight1, 'fc100:AUTOPOM');


jmc.RegisterHandler('Prompt', 'onPrompt()');
function onPrompt() {
    var lines = jmc.Event;
    var arr = lines.split('\r?\n');
    var promptLine = arr[arr.length - 1].replace(/\x1B\[[01];\d{2}m/g, '');

    if (promptLine.substring(promptLine.length - 2) !== '> ') {
        return;
    }

    var iFight = promptLine.indexOf(']') !== -1 ? 1 : 0;

    var trg = '';
    if (!trg && !!allIme.length) { trg = make_alias(allIme[0]) }
    if (!trg && !!allVin.length) { trg = make_alias(allVin[0]) }
    if (!trg && !!allTvo.length) { trg = make_alias(allTvo[0]) }
    if (!trg && !!allRod.length) { trg = make_alias(allRod[0]) }
    if (!trg && !!allDat.length) { trg = make_alias(allDat[0]) }
    allIme = allRod = allDat = allVin = allTvo = [];

    if (trg && !iFight) {
        jmc.parse('пн ' + trg);
    }
}

trig(function () {
    // jmc.showme('TARGET');
}, /^:.+@/, 'f100:TARGET1');
