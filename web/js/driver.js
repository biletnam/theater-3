var driver={};

driver.db="dbop.php?callback=?";
driver.auth="login.php?callback=?";

if (hex_md5("abc")!="900150983cd24fb0d6963f7d28e17f72") alert("MD5!!!");

var OperationInProgressCnt=0;
driver.showWaitIcon=function() {
    if (OperationInProgressCnt++==0) {
        $("#inProgressSmall").show();
    };
};
driver.hideWaitIcon=function() {
    if (--OperationInProgressCnt==0) {
        $("#inProgressSmall").hide();
    }
};

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
    var cc=user+password+rand;
    var login=hex_md5(cc);
    $.getJSON(
            driver.auth,
            { "user":user, "md5": login },
            function(data, txtStatus, jqXHR) { callback(data); driver.hideWaitIcon(); }
    ).error(function() { callback(undefined); driver.hideWaitIcon(); });
};
driver.logout=function(callback) {
    driver.showWaitIcon();
    $.getJSON(
            driver.auth,
            { "logout": "" },
            function(data, txtStatus, jqXHR) { callback(data); driver.hideWaitIcon();  }
    ).error(function() { callback(undefined); driver.hideWaitIcon(); });
};

driver.login=function(user, password, callback) {
    driver.showWaitIcon();
    driver.initSession(function(res1) {
        if (typeof res1.rand=="number") {
            driver.startSession(user, password, res1.rand, function(res2) {
                callback(res2);
                driver.hideWaitIcon(); 
            });
        } else {
            callback({ error: "Ошибка инициализации сессии." }); driver.hideWaitIcon(); 
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

driver.getNews = function (callback) {
    var r={};
    driver.showWaitIcon();
    $.post(
        "news.php", r,
        function(res) { callback(res); driver.hideWaitIcon(); },
        "json"
    ).error(function() { callback(undefined); driver.hideWaitIcon(); });
}