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

// вооружиться
function arm1() {
    if (att1 === 'пнут') {
        jmc.parse('воор ' + myName + '.ДВУРУЧ');
    } else if (att1 === 'оглу') {
        jmc.parse('воор ' + myName + '.ДВУРУЧ');
    } else if (att1 === 'сбит') {
        jmc.parse('наде ' + myName + '.ЩИТ щит');
    }
}

// всегда на коне
var stepsUnmounted = 0;
var alwaysMounted = 0;

function setMounted(s) {
    alwaysMounted = s;
}

trig(function () {
    stepsUnmounted = 0;
}, / несет вас на своей спине\.$/, 'fc500:MOUNTED');

trig(function () {
    stepsUnmounted = 0;
}, /^Вы взобрались на спину /, 'fc500:MOUNTED');

trig(function () {
    if (alwaysMounted && stepsUnmounted > 0) {
        jmc.parse('вско');
    }
}, /^(Вороной жеребец|Лошадь) \(под седлом\) /, 'fc500:MOUNTED');

trig(function () {
    if (alwaysMounted) {
        jmc.parse('вско');
    }
}, /^У вас есть лошадь\./, 'fc500:MOUNTED');

trig(function () {
    stepsUnmounted++;
    var uslAtt = att1 !== 'сбит';

    if (alwaysMounted && uslAtt && stepsUnmounted > 5) {
        stepsUnmounted = 0;
        jmc.parse('вск');
    }
}, /^Вы поплелись /, 'fc500:MOUNTED');

// периодически бухаю
var lastDrink = 0;
var alwaysDrunk = 1;

function setAlwaysDrunk(s) {
    alwaysDrunk = s;
}

function onPromptDrunk(lines, promptLine) {
    var iFight = promptLine.indexOf(']') !== -1 ? 1 : 0;
    if (iFight) { return; }
    var lagPh = promptLine.indexOf(' Пх:0') !== -1 ? 0 : 1;

    for (var i = 0; i < lines.length; i++) {
        var line1 = lines[i];
        if (line1.substring(0, 9) === 'Аффекты: ') {
            var ts = now();

            if (line1.indexOf('под мухой') !== -1) {
                // ОК
            } else if (line1.indexOf('отходняк') !== -1) {
                if (!lagPh) {
                    jmc.parse('опохм');
                }
            } else if (alwaysDrunk && ts - lastDrink > 10) {
                jmc.parse('пить самогон');
                lastDrink = ts;
            }
        }
    }
}
