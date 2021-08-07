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

function makeAlias(s) {
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

function inArray(arr, needle) {
    for (var i = 0; i < arr.length; i++) {
        if (needle === arr[i]) {
            return true;
        }
    }

    return false;
};

// Горячая голова Вигге, Отважный воин Игоревой рати (храбр ИР) => Вигге
function nameFromTitles(s) {
    var name = s.replace(/ ?[,(].*$/, '');
    name = name.replace(/^.*([А-Я][а-я]+)$/, '$1');
    return name;
};
