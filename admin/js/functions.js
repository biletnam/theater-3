var lastDir="/";


function onShowTab_login() {
    $(".msg","#formLogin").text("");
}

function notLoggedIn() {
    showOverlap("login");
}

function onSubmitForm_formLogin(form) {
    var user=$("#username",form).val();
    var passw=$("#password",form).val();
    $("#password",form).val("");
    driver.login(user,passw,function(ok,msg){
        $(".msg",form).text((ok ? "OK" : "FAIL")+":"+msg);
    });
}

function onShowTab_theaters() {
    $("#listOfTheaters").empty();
    driver.dbAction("getTheaters", {}, function(res) {
        var th=createTableByData(res, editTheater, deleteTheater, function(r, hr) {
            var ct=$(hr.children().get(2)).contents();
            var a=$("<a>"); a.attr("href",'#');
            a.click(function() { showPerformancesForTheater(r); return false; });
            ct.wrap(a);
        });
        $("#listOfTheaters").append(th);
    });
}

function editTheater(r) {
    var form=$("#formEditTheater");
    writeForm(form,r);
    $("#divEditTheater").dialog("open");
}
function newTheater(r) { editTheater({}); }

function onSubmitForm_formEditTheater(form) {
    var r=readForm(form);
    $("#divEditTheater").dialog("close");
    if (r.id.length==0) {
        driver.dbAction("newTheater",r, onShowTab_theaters);
    } else {
        driver.dbAction("updateTheater",r, onShowTab_theaters);
    }
}

function deleteTheater(r) {
    var conf=confirm(r.name+"\n\nТочно удалить???!!!");
    if (!conf) return;
    driver.dbAction("deleteTheater",r, onShowTab_theaters);
}

function onShowTab_users() {
    $("#listOfUsers").empty();
    driver.dbAction("getUsers",{},function(res) {
        var th=createTableByData(res, editUser, deleteUser);
        $("#listOfUsers").append(th);
    });
}

function editUser(r) {
    var form=$("#formEditUser");
    writeForm(form, r);
    $("#divEditUser").dialog("open");
}
function newUser(r) { editUser({}); }

function onSubmitForm_formEditUser(form) {
    var r=readForm(form);
    $("#divEditUser").dialog("close");
    if (r.id.length==0) {
        driver.dbAction("newUser",r, onShowTab_users);
    } else {
        driver.dbAction("updateUser",r, onShowTab_users);
    }
}

function deleteUser(r) {
    var conf=confirm(r.name+'\n'+r.login+'\n'+r.vk+'\n'+r.fb+"\n\nТочно удалить???!!!");
    if (!conf) return;
    driver.dbAction("deleteUser",r, onShowTab_users);
}

var currentTheater;
function onShowTab_performances(r) {
    currentTheater=r;
    $("#listOfPerformances").empty();
    $("#theaterForPerformances").text(
        r ? " театра "+r.name : ""
    );
    driver.dbAction("getPerformances", { theater: (r&&r.id)||undefined }, function(res) {
        var th=createTableByData(res, editPerformance, deletePerformance, function(r, hr) {
            var ct=$(hr.children().get(2)).contents();
            var a=$("<a>"); a.attr("href",'#');
            a.click(function() { showMoviesForPerformance(r); return false; });
            ct.wrap(a);
        });
        $("#listOfPerformances").append(th);
    });
}
function showPerformancesForTheater(r) {
    showOverlap("performances",false);
    onShowTab_performances(r);
}
function editPerformance(r) {
    var form=$("#formEditPerformance");
    driver.dbAction("getTheaters", {}, function(res) {
        setSelectOptions($("[name=theater]", form), res, "id", "name", true);
        writeForm(form, r);
        $("#divEditPerformance").dialog("open");
    });
}
function newPerformance(r) { editPerformance({}); }
function onSubmitForm_formEditPerformance(form) {
    var r=readForm(form);
    $("#divEditPerformance").dialog("close");
    if (r.id.length==0) {
        driver.dbAction("newPerformance", r, function(res) { onShowTab_performances(currentTheater) });
    } else {
        driver.dbAction("updatePerformance",r, function(res) { onShowTab_performances(currentTheater) });
    }
}
function deletePerformance(r) {
    var conf=confirm(r.name+'\n'+r.theater+'\n'+r.year+"\n\nТочно удалить???!!!");
    if (!conf) return;
    driver.dbAction("deletePerformance",r, function() { onShowTab_performances(currentTheater) });
}

var currentPerformance;
var numMovies;
function showMoviesForPerformance(performance) {
    showOverlap("movies", false);
    currentPerformance=performance;
    $("#performanceForMovies").text(' для спектакля "'+performance.name+'"');
    $("#listOfMovies").empty();
    driver.dbAction("getMovies",{ "performance":performance.id },function(res) {
        numMovies=res.length;
        var th=createTableByData(res, editMovie, deleteMovie);
        $("#listOfMovies").append(th);
    });
}
function editMovie(r) {
    var form=$("#formEditMovie");
    writeForm(form, r);
    $("#divEditMovie").dialog("open");
}
function newMovie() { editMovie({ "performance":currentPerformance.id, "order":numMovies }); }

function importMediaFolder() {
    selectDir(lastDir, function(dir) {
        driver.getDir(dir, function(files) {
            var cnt=0;
            var iocnt=0;
            $.each(files, function(i, f) {
                if (!f.isDir && f.name!="notes.html") {
                    var r={};
                    r.url=f.name;
                    r.performance=currentPerformance.id;
                    r.name="Часть "+(cnt+1);
                    r.file=f.path;
                    r.playorder=cnt;
		    r.type='jpg';
                    iocnt++;
                    driver.dbAction("newMovie", r, function() {
                        if (--iocnt==0) {
                            showMoviesForPerformance(currentPerformance);
                        }
                    });
                    cnt++;
                }
            });
        });
    });
}

function selectMovieFile() {
    selectFile(lastDir, function(f) {
        $("#formEditMovie [name=file]").val(f);
    });
}

function onSubmitForm_formEditMovie(form) {
    var r=readForm(form);
    $("#divEditMovie").dialog("close");
    if (r.id.length==0) {
        driver.dbAction("newMovie", r, function() { showMoviesForPerformance(currentPerformance); });
    } else {
        driver.dbAction("updateMovie", r, function() { showMoviesForPerformance(currentPerformance); });
    }
}

function deleteMovie(r) {
    var conf=confirm(r.name+"\n\nТочно удалить???!!!");
    if (!conf) return;
    driver.dbAction("deleteMovie", r, function() { showMoviesForPerformance(currentPerformance); });
}



function showOverlap(name,refresh) {
    $("#overlaps>div").each(function() {
        var n=$(this).attr('name');
        if (n==name) {
            $(this).show();
            if (refresh==undefined||refresh) {
                var f="onShowTab_"+name;
                if (typeof window[f]=="function") {
                    window[f]();
                }
            }
        } else {
            $(this).hide();
        }
    });
}

function readForm(form) {
    var r={};
    $("input:not([type=submit],[type=button]),textarea,select", form).each(function() {
        var name=$(this).attr("name");
        r[name]=this.value;
    });
    return r;
}
function writeForm(form,r) {
    $("input:not([type=submit],[type=button]),textarea,select",form).each(function() {
        var name=$(this).attr("name");
        if (typeof r[name]=='undefined') {
            $(this).val('');
        } else {
            $(this).val(r[name]);
        }
    });
}

function setSelectOptions(e, a, nv, nt, clr) {
    e=$(e);
    if (clr) e.empty();
    for (i in a) {
        var r=a[i];
        var opt=$("<option>");
        opt.val(r[nv]);
        opt.text(r[nt]);
        e.append(opt);
    } 
}

function createTableByData(x, toEdit, toDelete, extraCols) {
    if (typeof x!="object") {
        var t=$("<table><tr><td>No data</td></tr></table>");
        return t;
    }
    var ht=$("<table width=100%>");
    var cnt=0;
    var cols=[];
    var cnt=0;
    $.each(x, function(i, r) {
        if (cnt==0) {
            var hr=$("<tr>");
            for (var j in r) {
                cols.push(j);
                var hd=$("<td>");
                hd.text(j);
                hr.append(hd);
            }
            ht.append(hr);
        }

        var hr=$("<tr>");
        for (var j in cols) {
            var hd=$("<td>");
            hd.text(r[cols[j]]);
            hr.append(hd);
        }

        if (typeof toEdit=='function') {
            var be=$("<input type=button value='edit'>");
            be.click(function() { toEdit(r); });
            var td=$("<td>");
            td.append(be);
            hr.append(td);
        }

        if (typeof toDelete=='function') {
            var bd=$("<input type=button value='delete'>");
            bd.click(function() { toDelete(r); });
            var td=$("<td>");
            td.append(bd);
            hr.append(td);
        }

        if (typeof extraCols=='function') {
            var hd=extraCols(r, hr);
            if (hd !== undefined) hr.append(hd);
        }

        hr.css("background-color", (cnt&1)?"#e0ffe0":"#e0e0ff");
        ht.append(hr);

        cnt++;
    });
    return ht;
}


function showDir(curdir, dir, callback) {
    $("#selectDirDirs").empty();
    $("#selectDirDlg_CurrDir").text(curdir);
    var l=$("<ul>");
    $("#selectDirDirs").append(l);
    $.each(dir, function(i, d) {
        if (d.isDir) {
            var a=$("<a>"); a.attr("href", '#');
            a.text(d.name);
            a.click(function() {
                selectDir(d.path, callback);
                return false;
            });
            l.append(a);
            a.wrap("<li>");
        }
    });
}

function selectDir(dir, callback) {
	lastDir=dir;
    $("#selectDirDlg").dialog("open");
    $("#selectDirForm")[0]["userCallback"]=callback;
    driver.getDir(dir, function(res) { showDir(dir, res, callback); });
}

function onSubmitForm_selectDirForm() {
    $("#selectDirDlg").dialog("close");
    $("#selectDirForm")[0]["userCallback"]( $("#selectDirDlg_CurrDir").text() );
}

function showDirFile(curdir, dir, callback) {
    $("#selectFileDirs").empty();
    $("#selectFileFiles").empty();
    $("#selectFileDlg_CurrDir").text(curdir);
    var ld=$("<ul>");
    var lf=$("<ul>");
    $("#selectFileDirs").append(ld);
    $("#selectFileFiles").append(lf);
    $.each(dir, function(i, d) {
        var a=$("<a>"); a.attr("href",'#');
        a.text(d.name);
        if (d.isDir) {
            a.click(function() {
                selectFile(d.path, callback);
                return false;
            });
            ld.append(a);
        } else {
            a.click(function() {
                $("#selectFileDlg").dialog("close");
                callback(d.path);
                return false;
            });
            lf.append(a);
        }
        a.wrap("<li>");
    });
}

function selectFile(dir, callback) {
	lastDir=dir;
    $("#selectFileDlg").dialog("open");
    driver.getDir(dir, function(res) { showDirFile(dir, res, callback); });
}


$(function() {
    $("#mainmenu").menu();
    $("#mainmenu a").each(function() {
        var name=$(this).attr('name');
        $(this).click(function() {
            showOverlap(name);
            return false;
        });
    });

    $(".dialogForm").dialog({
        autoOpen: false,
        closeOnEscape: true,
        modal: true,
        resizable: false,
        width: "auto"
    });

    $("#OperationInProgressDlg").dialog({
        autoOpen: false,
        closeOnEscape: false,
        modal: true,
        resizable: false,
        width: "auto"
    });

    initFormValidator();
    driver.testSession(function(ok) {
        if (ok) {
            showOverlap("performances");
        } else {
            showOverlap("login");
        }
    });
})
