var driver={};

driver.db="dbop.php?callback=?";
driver.auth="login.php?callback=?";
driver.dir="dir.php?callback=?";
driver.domain="InavIvanovitch";

if (hex_md5("abc")!="900150983cd24fb0d6963f7d28e17f72") alert("MD5!!!");

var OperationInProgressCnt=0;
driver.showWaitIcon=function() {
    if (OperationInProgressCnt++==0) {
        $("#OperationInProgressDlg").dialog("open");
    };
}
driver.hideWaitIcon=function() {
    if (--OperationInProgressCnt==0) {
        $("#OperationInProgressDlg").dialog("close");
    }
}

driver.initSession=function(callback) {
    driver.showWaitIcon();
    $.getJSON(
            driver.auth,
            {},
            function(data, txtStatus, jqXHR) { callback(data); driver.hideWaitIcon(); }
    ).error(function() { callback(undefined); driver.hideWaitIcon();  });
};
driver.testSession=function(callback) {
    driver.showWaitIcon();
    $.getJSON(
            driver.auth,
            { "test": "" },
            function(data, txtStatus, jqXHR) { callback(data); driver.hideWaitIcon();  }
    ).error(function() { callback(undefined); driver.hideWaitIcon(); });
};
driver.startSession=function(user, password, rand, callback) {
    driver.showWaitIcon();
    var cc=driver.domain+user+password+rand;
    var login=hex_md5(cc);
    $.getJSON(
            driver.auth,
            { "login": login },
            function(data, txtStatus, jqXHR) { callback(data); driver.hideWaitIcon(); }
    ).error(function() { callback(undefined); driver.hideWaitIcon(); });
};

driver.login=function(user, password, callback) {
    driver.showWaitIcon();
    driver.initSession(function(rand) {
        if (typeof rand=="number") {
            driver.startSession(user, password, rand, function(ok) {
                callback(ok, ok?"Вход выполнен":"Неверный логин/пароль");
                driver.hideWaitIcon(); 
            });
        } else {
            callback(0, "Ошибка инициализации сессии."); driver.hideWaitIcon(); 
        }
    });
};

driver.dbAction = function (action, data, callback) {
    var r={};
    r.op=action;
    $.extend(r,data);
    driver.showWaitIcon();
    $.post(
        driver.db, r,
        function(res) { callback(res); driver.hideWaitIcon(); },
        "json"
    ).error(function() { callback(undefined); driver.hideWaitIcon(); });
}

driver.getDir=function(path, callback) {
    var r={};
    r.op='dir';
    r.dir=path;
    driver.showWaitIcon();
    $.post(
        driver.dir, r,
        function(res) { callback(res); driver.hideWaitIcon(); },
        "json"
    ).error(function() { callback(undefined); driver.hideWaitIcon(); });
}
