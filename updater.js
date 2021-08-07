var remoteBase = 'https://raw.githubusercontent.com/yuraigle/soldaten-js/main/';
var localVersion;
var remoteVersion;
var files2upd = [
    '_friends.txt', '_version.txt',
    'app.js', 'pom.js', 'react.js', 'updater.js', 'util.js',
    'common.set', 'vityaz.set'
];

function getLocalVersion() {
    var fis = new ActiveXObject('Scripting.FileSystemObject')
        .GetFile('soldaten/_version.txt')
        .OpenAsTextStream(1, 0);
    var line = fis.ReadLine();
    fis.Close();
    return parseFloat(line);
}

function getRemoteVersion() {
    var req = new ActiveXObject("Microsoft.XMLHTTP");
    req.open("GET", remoteBase + '_version.txt?ts=' + now(), false);
    req.send();
    return parseFloat(req.responseText);
}

function downloadFile(fn) {
    var remoteFn = remoteBase + fn + '?ts=' + now();
    var localFn = 'soldaten/' + fn;

    var http = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
    http.open("GET", remoteFn, false);
    http.send();

    if (http.Status == 200) {
        var fos = new ActiveXObject("ADODB.Stream");
        fos.Open();
        fos.Type = 1; // binary
        fos.Write(http.ResponseBody);
        fos.Position = 0;

        var fs = new ActiveXObject("Scripting.FileSystemObject");
        if (fs.FileExists(localFn)) {
            fs.DeleteFile(localFn);
        }

        fos.SaveToFile(localFn);
        fos.Close();
        jmc.showme('OK: ' + fn);
    } else {
        jmc.showme('FAIL: ' + fn);
    }
}

function updateMe() {
    localVersion = getLocalVersion();
    remoteVersion = getRemoteVersion();
    jmc.showme('\x1B\[0;33m' +
        'Current version: ' + localVersion + '. ' +
        'Remote version: ' + remoteVersion
    );

    if (remoteVersion - localVersion > 0.00001) {
        jmc.showme('Updating...');

        for (var i = 0; i < files2upd.length; i++) {
            downloadFile(files2upd[i]);
        }

        jmc.showme('Done.');
    }
}
