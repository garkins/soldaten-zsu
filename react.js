var imHungry = [
    '^Вы голодны.',
    '^Вас мучает жажда.',
    '^Вы очень голодны.',
    '^Вы готовы сожрать быка.',
    '^Вас сильно мучает жажда.',
    '^Вам хочется выпить озеро.'
];

var lastEat = 0;
for (var i = 0; i < imHungry.length; i++) {
    trig(function () {
        var ts = now();
        if (ts - lastEat > 5) {
            jmc.parse('вз боч.синим сума;пит боч.синим;поло боч.синим сума');
            lastEat = ts;
        }
    }, new RegExp(imHungry[i]), 'f1000:HUNGRY');
}

var imSitting = [
    '^Нет... Вы слишком расслаблены...',
    '^Пожалуй, вам лучше встать на ноги.',
    '^Вам лучше встать на ноги!',
    '^Вы попытались подсечь .*, но упали сами...$',
    '^Похоже, в этой позе Вы много не наколдуете.$',
    '^Вас повалило на землю.',
    '^Вы полетели на землю от мощного удара ',
    ' завалил.? вас на землю. Поднимайтесь!$',
    ' ловко подсек.?.? вас, усадив на попу\.$'
];

for (var i = 0; i < imSitting.length; i++) {
    trig(function () {
        jmc.parse('вста');
    }, new RegExp(imSitting[i]), 'f1000:SITTING');
}

// слушаемся лидера
trig(function (aa) {
    if (in_array(botovods, aa[1]) && aa[2] === myName) cmd(aa[3]);
}, /^([А-Я][а-я]+) сообщила? группе : '([А-Я][а-я]+) (.+)'/, 'f10:BOTOVOD');

trig(function (aa) {
    if (in_array(botovods, aa[1])) cmd(aa[2]);
}, /^([А-Я][а-я]+) сообщила? группе : '!(.+)'/, 'f10:BOTOVOD');

trig(function (aa) {
    if (in_array(botovods, aa[1]) && aa[2] === myName) cmd(aa[3]);
}, /^\x1B\[1;30m([А-Я][а-я]+) сообщила? группе : '([А-Я][а-я]+) (.+)'/, 'f10:BOTOVOD');

trig(function (aa) {
    if (in_array(botovods, aa[1])) cmd(aa[2]);
}, /^\x1B\[1;30m([А-Я][а-я]+) сообщила? группе : '!(.+)'/, 'f10:BOTOVOD');

function cmd(s) {
    jmc.parse(s);
}
