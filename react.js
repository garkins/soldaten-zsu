var imHungry = [
    /^Вы голодны\./,
    /^Вас мучает жажда\./,
    /^Вы очень голодны\./,
    /^Вы готовы сожрать быка\./,
    /^Вас сильно мучает жажда\./,
    /^Вам хочется выпить озеро\./
];

var lastEat = 0;
for (var i = 0; i < imHungry.length; i++) {
    trig(function () {
        var ts = now();
        if (ts - lastEat > 5) {
            jmc.parse('пит боч.синим');
            lastEat = ts;
        }
    }, imHungry[i], 'f1000:HUNGRY');
}

// слушаемся лидера
trig(function (aa) {
    if (inArray(botovods, aa[1]) && aa[1] !== myName && aa[2] === myName) cmd(aa[3]);
}, /^([А-Я][а-я]+) сообщила? группе : '([А-Я][а-я]+) (.+)'/, 'fc10:BOTOVOD');

trig(function (aa) {
    if (inArray(botovods, aa[1]) && aa[1] !== myName) cmd(aa[2]);
}, /^([А-Я][а-я]+) сообщила? группе : '!(.+)'/, 'fc10:BOTOVOD');

function cmd(s) {
    s = s.replace(/^\s+/, '').replace(/\s+$/, '');
    jmc.parse(s);
}

// впадаем в ярость, если умеем
var lastRage = 0;
function onPromptRage(promptLine) {
    if (promptLine.indexOf(' Яр:0') !== -1) {
        var ts = now();
        if (ts - lastRage > 1) {
            jmc.parse('ярос');
            lastRage = ts;
        }
    }
}

// всегда на коне
var stepsWithoutMount = 0;

trig(function () {
    stepsWithoutMount = 0;
}, / несет вас на своей спине\.$/, 'fc100:MOUNTED');

trig(function () {
    stepsWithoutMount = 0;
}, /^Вы взобрались на спину /, 'fc100:MOUNTED');

trig(function () {
    if (stepsWithoutMount > 0) {
        jmc.parse('вско');
    }
}, /^Вороной жеребец \(под седлом\) /, 'fc100:MOUNTED');

trig(function () {
    stepsWithoutMount++;

    var uslProf = myProf === 'кузнец' || myProf === 'витязь' || myProf === 'охотник';
    var uslAtt = att1 !== 'сбит';

    if (uslProf && uslAtt && stepsWithoutMount > 5) {
        stepsWithoutMount = 0;
        jmc.parse('вск');
    }
}, /^Вы поплелись /, 'fc100:MOUNTED');

trig(function () {
    stepsWithoutMount = -100;
}, /^У вас нет ничего похожего на 'сап.шпор'./, 'fc100:MOUNTED');
