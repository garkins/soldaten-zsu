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
            jmc.parse('вз боч.синим сума;пит боч.синим;поло боч.синим сума');
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
