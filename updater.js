var remoteBase = 'https://raw.githubusercontent.com/garkins/soldaten-zsu/zsu/';
var localVersion;
var remoteVersion;

function sayLocalVersion() {
    jmc.showme('\x1B\[0;33mCurrent version: soldaten-jmc ' + localVersion);
    jmc.parse('гг soldaten-jmc ' + localVersion);
}

function getLocalVersion() {
    var fis = new ActiveXObject('Scripting.FileSystemObject')
        .GetFile('soldaten/_version.txt')
        .OpenAsTextStream(1, 0);
    var line = fis.ReadLine();
    fis.Close();
    return parseFloat(line);
}

function getRemoteVersion() {
    var tmp = 'soldaten/_tmp.txt';
    var url = remoteBase + '_version.txt?ts=' + now();
    downloadFile(url, tmp);

    var fso = new ActiveXObject('Scripting.FileSystemObject');
    var ver = null;

    if (fso.FileExists(tmp)) {
        var fis = fso.GetFile(tmp).OpenAsTextStream(1, 0);
        var line = fis.ReadLine();
        ver = parseFloat(line);
        fis.Close();
        fso.DeleteFile(tmp);
    }

    return ver;
}

function getRemoteIndex() {
    var tmp = 'soldaten/_tmp.txt';
    var url = remoteBase + 'index.txt?ts=' + now();
    downloadFile(url, tmp);

    var fso = new ActiveXObject('Scripting.FileSystemObject');
    var files = [];

    if (fso.FileExists(tmp)) {
        var fis = fso.GetFile(tmp).OpenAsTextStream(1, 0);
        while (!fis.AtEndOfStream) {
            var line = fis.ReadLine();
            files.push(line);
        }
        fis.Close();
        fso.DeleteFile(tmp);
    }

    return files;
}

function downloadFile(url, localFn) {
    var xr = null;

    try {
        xr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    catch (e) {
    }

    try {
        if (!xr)
            xr = new ActiveXObject("Msxml2.XMLHTTP");
    }
    catch (e) {
    }

    if (xr) {
        xr.open("GET", url, false);
        xr.send();

        if (xr.Status == 200) {
            var fos = new ActiveXObject("ADODB.Stream");
            fos.Open();
            fos.Type = 1; // binary
            fos.Write(xr.ResponseBody);
            fos.Position = 0;

            var fs = new ActiveXObject("Scripting.FileSystemObject");
            if (fs.FileExists(localFn)) {
                fs.DeleteFile(localFn);
            }

            fos.SaveToFile(localFn);
            fos.Close();
            jmc.showme('OK: ' + localFn);
            return;
        }
    }

    jmc.showme('\x1B\[0;33mCANT DOWNLOAD FILE: ' + url);
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
        var files2upd = getRemoteIndex();
        for (var i = 0; i < files2upd.length; i++) {
            var url = remoteBase + files2upd[i] + '?ts=' + now();
            downloadFile(url, 'soldaten/' + files2upd[i]);
        }
        jmc.showme('Done.');
    }
}
