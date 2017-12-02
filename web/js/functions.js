var lastDir="/";


function notLoggedIn() {
    showOverlap("#loginForm");
}

function onLogin(res) {
        if (res.userLoggedIn) {
            $("#usernameInfo").text(res.name);
            $("#loginInfo").show();
            $("#mainMenu").show();
            showOverlap("#welcomeBlock");
        } else {
            $("#loginInfo").hide();
            $("#mainMenu").hide();
            showOverlap("#loginForm");
        }
}

function logout() {
    driver.logout(onLogin);
}

function onSubmitForm_loginForm(form) {
    var login=$("[name=username]", form).val();
    var password=$("[name=password]", form).val();
    $("[name=password]", form).val('');
    driver.login(login, password, onLogin);
}



function onMenuNews() {
    showOverlap("#welcomeBlock");
}
function onShow_welcomeBlock() {
    driver.getNews(function(html) {
        $("#news").html(html);
    });
}

var theaters, performances;

function showPerformances(byPerf) {
    showOverlap("#performancesBlock");
    if (!theaters||!performances) {
        $("#performancesContent").hide();
        $("#cantLoadPerformancesMsg").show();
        return;
    }
    $("#performancesContent").show();
    $("#cantLoadPerformancesMsg").hide();
    if (byPerf) {
    	showPerfByTheaters();
    } else {
    	showPerfByYears();
    }
}

function showPerfByYears() {
    setRadioValue("sortPerformancesMode", "sortByYears");
    if (!theaters||!performances) return;
    performances.sort(function(p1, p2) {
        if (p1.year<p2.year) return 1;
        if (p1.year>p2.year) return -1;
        if (p1.theaterName<p2.theaterName) return -1;
        if (p1.theaterName>p2.theaterName) return 1;
        if (Number(p1.id)<Number(p2.id)) return -1;
        if (Number(p1.id)>Number(p2.id)) return 1;
        return 0;
    });
    createPerformanceList("year", "theaterName");
}

function showPerfByTheaters() {
    if (!theaters||!performances) return;
    setRadioValue("sortPerformancesMode", "sortByTheaters");
    performances.sort(function(p1, p2) {
        if (p1.theaterName<p2.theaterName) return -1;
        if (p1.theaterName>p2.theaterName) return 1;
        if (p1.year<p2.year) return 1;
        if (p1.year>p2.year) return -1;
        if (Number(p1.id)<Number(p2.id)) return -1;
        if (Number(p1.id)>Number(p2.id)) return 1;
        return 0;
    });
    createPerformanceList("theaterName", "year");
}

function strcmp(a,b) {
	if (a>b) return 1;
	if (a<b) return -1;
	return 0;
}
function strcmpr(a,b) {
	if (a>b) return -1;
	if (a<b) return 1;
	return 0;
}

function createLinkToTheater(theaterName, f) {
		var l="#theaterName"+theaterName;
		var a=$("<a>");
		a.text(theaterName);
		a.attr("href",l);
		a.click(f ? f : showPerfByTheaters);
		return a;
} 
function createLinkToYear(year, f) {
		var l="#year"+year;
		var a=$("<a>");
		a.attr("href",l);
		a.text(year);
		a.click(f ? f : showPerfByYears);
		return a;
} 


function createNavPanels() {
	$("#listOfTheaters").empty();
	$("#listOfYears").empty();
    if (!theaters||!performances) return;
	var yl={}, tl={};
	for (var i in performances) {		
        yl[performances[i].year]=true;
        tl[performances[i].theaterName]=true;
    }
    var yla=[], tla=[];
    for (var i in yl) yla.push(i);
    for (var i in tl) tla.push(i);
    yla.sort(strcmpr);
    tla.sort(strcmp);
    
    $.each(tla, function(i,v) {
		var a=createLinkToTheater(v);
		$("#listOfTheaters").append(a);
		a.wrap("<p>");
    });
    $.each(yla, function(i,v) {
		var a=createLinkToYear(v);
		$("#listOfYears").append(a);
		a.wrap("<p>");
    });
}

function createPerformanceList(g1, g2) {
    if (!theaters||!performances) return;
    $("#listOfperformances").empty();

    var pn=[g1,g2];
    var gv=[];
    var ge=[];
    var level=0;
    var me=$("<ul>");me.addClass("ulLevel0");    
    $("#listOfperformances").append(me);
    var rowCnt=0;
    $.each(performances, function(i, p) {
        var t=theaters[p.theater];

        var cv=[p[g1], p[g2]];

        for (var i=0; i<level; i++) {
            if (cv[i]!=gv[i]) { level=i; break; }
        }

		var label;
		if (level==0) {
			label=pn[0]+cv[0];
		} else {
			label=undefined;
		}

        while (level<pn.length) {
            gv[level]=cv[level];
            var li=$("<li>");
            if (label!==undefined) li.attr("id",label);
            li.addClass("liLevel"+(level));
            var liSpan=$("<span>");
            li.append(liSpan);
            liSpan.text(gv[level]);
            liSpan.addClass("liSpanLevel"+(level));
            var ul=$("<ul>"); li.append(ul);
            ul.addClass("ulLevel"+(level+1));
            ge[level]=ul;
            if (level>0) ge[level-1].append(li);
            else me.append(li);
            level++;
            rowCnt=0;
        }

        var li=$("<li>");
        li.addClass("liLevel"+(level));
        li.addClass((rowCnt&1) ? "oddLine" : "evenLine");
        li.prop("performanceData", p);
        var liSpan=$("<table width=100%>");
        var tr=$("<tr>");
        var td1=$("<td width=50% class='perfName' valign=top>");
        var td2=$("<td width=50% class='perfComment' valign=top>");
        tr.append(td1).append(td2);
        liSpan.append(tr);
        var a=$("<a>"); a.attr("href", "javascript:void(0)");
        td1.append(a);
        a.html(p.name);
        a.click(function() { onClickPerformance(p); return false; });
        td2.html(p.comment);
        liSpan.addClass("liSpanLevel"+(level));
        li.append(liSpan);
        ge[level-1].append(li);

        rowCnt++;
    });
    navPanelMove();
}



function onMenuRecords(sortByPerf) {
	showOverlap("#performancesBlock");
	$("#performancesContent").hide();
	$("#cantLoadPerformancesMsg").hide();

	if (!theaters || !performances) {

		driver.dbAction("getTheaters", {}, function(t) {
			driver.dbAction("getPerformances", {}, function(p) {
				if (!t || !p) {
					theaters = performances = undefined;
				} else {
					performances = p;
					theaters = {};
					for (var i in t) {
						theaters[t[i].id] = t[i];
					}
				}
				createNavPanels();
				showPerformances(sortByPerf);
			});
		});
	} else {
		showPerformances(sortByPerf);
	}
}

var ENABLE_PHOTO=true;
var stopPlayButton, startPlayButton;

function onClickPerformance(p) {
    showOverlap("#mediaFilesBlock");
    $("#cantLoadFileList").hide();
    $("#videoBlock").hide();
    $("#photoBlock").hide();
    $("#mediaHeaderBlock").hide();
    driver.dbAction("getMovies", { performance: p.id }, function(filelist) {
    
        refreshPerfComments(p);
    
        if (filelist==undefined) {
            $("#cantLoadFileList").show();
            $("#videoBlock").hide();
            $("#photoBlock").hide();
            return;
        }
        $("#cantLoadFileList").hide();
        var photos=[];
        var videos=[];
        for (var i in filelist) {
            var f=filelist[i];
            switch (f.type) {
                case 'flv': case 'wmv': case 'mp4':
                    videos.push(f);
                    break;
                case 'jpg': case 'png':
                    photos.push(f);
                    break;
            }
        }
        photos.sort(function(a, b) { return a.playorder-b.playorder; });
        if (ENABLE_PHOTO) {
            videos.sort(function(a, b) { return a.playorder-b.playorder; });
        }

        $("#mediaPerfName").html(p.name);
        $("#mediaPerfComment").html(p.comment);
        
        var at=createLinkToTheater(p.theaterName, function() { onMenuRecords(true); return true; });
        var ay=createLinkToYear(p.year, function() { onMenuRecords(false); return true; });
        $("#mediaTheaterName").empty().append(at);
        $("#mediaYear").empty().append(ay);
        
        $("#mediaHeaderBlock").show();

        if (videos.length>0) {
            $("#videoFileList").empty();
            $.each(videos, function(i, video) {
                var img=$("<img>");
                img.attr("src", "img/playIcon.png");
                img.attr("alt", "Смотреть видео");
                img.attr("width", "32");
                img.attr("height", "32");
                img.css("vertical-align", "middle");
                img.css("border", "0");

                var a=$("<a>");
                a.attr("href", "javascript:void(0)");
                a.append(img);

                var img2=$("<img>");
                img2.attr("src", "img/stopIcon.png");
                img2.attr("alt", "Стоп");
                img2.attr("width", "32");
                img2.attr("height", "32");
                img2.css("vertical-align", "middle");
                img2.css("border", "0");

                var a2=$("<a>");
                a2.attr("href", "javascript:void(0)");
                a2.append(img2);
                a2.hide();

                a.click(function() {
                	 playVideo(video);
                	 stopPlayButton=a2; startPlayButton=a; 
                	 a.hide(); 
                	 a2.show(); 
                	 return false; 
                });
                a2.click(function() { stopVideo(); return false; });

                var p=$("<p>");
                p.text((video.name.length>0?video.name:"Смотреть запись")+": ");
                p.append(a);
                p.append(a2);
                
                $("#videoFileList").append(p);
            });
            $("#videoBlock").show();
        }
        if (ENABLE_PHOTO&&photos.length>0) {
            $("#photoFileList").empty();
            $("#photoAlbumLink").show();
            $("#photoAlbumContent").hide();
            $("#photoBlock").show();
            $("#photoFileList").prop("photos",photos);
        }
    });
}

var photoLoadQueue;

function processPhotoLoadQueue(q) {
	if (!q || q.length == 0) return;
	var photo = q.shift();
	var img = $("<img>");
	img.attr("alt", "Увеличить");
	img.attr("width", "150");
	img.attr("height", "150");
	$("#photoFileList").append(img);
	img.get(0).src = "dbop.php?op=getFile&thumb=1&id=" + photo.id;
	var a = $("<a>");
	a.attr("href", "javascript:void(0)");
	a.click(function() {
		showImage(photo);
		return false;
	});
	img.wrap(a);
	$("#photoFileList").append($("<span>").html(" \n"));
	img.load(function() { processPhotoLoadQueue(q); });
}

function showImage(photo) {
	$("#enlargedPhoto").show();
	$("#enlargedPhotoLoading").show();
	$("#enlargedPhoto img").get(0).onload=function() {
		$("#enlargedPhotoLoading").hide();
	};
	$("#enlargedPhoto img").get(0).src="dbop.php?op=getFile&id=" + photo.id;
}

function stopPhotoLoading() {
	if (photoLoadQueue) {
		while (photoLoadQueue.length>0) photoLoadQueue.pop();
		photoLoadQueue=undefined;
	};
}

function showPhotoAlbum() {
	stopPhotoLoading();
	$("#photoAlbumLink").hide();
    $("#photoAlbumContent").show();
    $("#photoFileList").empty();
	$("#enlargedPhoto").hide();
	$("#enlargedPhotoLoading").hide();
    var photos=$("#photoFileList").prop("photos");
    if (!photos) return;
    photoLoadQueue=photos;
    processPhotoLoadQueue(photoLoadQueue);
} 

function refreshPerfComments(p, msg) {
    $("#perfCommentBlock textarea").prop("perfReference", p);
    if (!msg) {
        $("#perfCommentBlock .commentTitle").hide();
        $("#perfCommentBlock").hide();
    }
    $("#perfCommentBlock .list").empty();
    driver.dbAction("getComment", { rtable: "performance", rid: p.id }, function(r) {
        $("#perfCommentBlock").show();
        if (typeof r!='object'||r.length==0) return;
        $("#perfCommentBlock .commentTitle").show();
        var ul=createCommentListDom(r);
        $("#perfCommentBlock .list").append(ul);
        if (msg) {
            $("#perfCommentBlock form").hide();
            $("#perfCommentBlock .postMsg").text(msg);
            $("#perfCommentBlock .postMsg").show();
        } else {
            $("#perfCommentBlock form").show();
            $("#perfCommentBlock .postMsg").hide();
        }
    });
}
function onSubmitPerfComment() {
    var p=$("#perfCommentBlock textarea").prop("perfReference");
    var comment=$("#perfCommentBlock textarea").val();
    if (comment.length==0) return;

    $("#perfCommentBlock form").hide();
    $("#perfCommentBlock textarea").val("");
    $("#perfCommentBlock form").hide();
    $("#perfCommentBlock .postMsg").text("Спасибо за отзыв! Отправляем...");
    $("#perfCommentBlock .postMsg").show();
    driver.dbAction(
        "postComment", { rtable: "performance", rid: p.id, comment: comment },
        function() { refreshPerfComments(p,"Спасибо за отзыв!"); }
    );
}

var flvPlayerCreated=false;


function playVideo(video) {
	stopVideo();

	switch (video.type) {
		case 'flv':
		case 'mp4':

			flvPlayerCreated = true;
			flowplayer("player", "flowplayer.swf", {
				clip : {
					provider : 'lighttpd',
					autoPlay : false,
					scaling : 'fit',
					width : 425,
					height : 300,
					autoBuffering : true
				},
				plugins : {
					controls : {
						// "stop" : true,
						"play" : true
					},
					lighttpd : {
						url : 'flowplayer.pseudostreaming.swf'
					}
				}
			});
			$f('player').play('dbop.php?op=getFile&id=' + video.id);
			$("#player").show();
			break;

		case 'wmv':
			var href = 'dbop.php?op=getFile&id=' + video.id;

			var html = 	'<OBJECT CLASSID="clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95F"' +
			 			'HEIGHT=300' + 'WIDTH=425' + 'NAME=Msshow1' +
			  			'ID=Msshow1 style="width:425px;height:300px" >' +
			   			'<PARAM NAME="FileName" VALUE="' + href + '">' + 
			   			'<PARAM NAME="url" VALUE="' + href + '">' +
			   			'<PARAM NAME="autoStart" VALUE="true">' +
			    		'<PARAM NAME="loop" VALUE="true">' + '<PARAM NAME="showControls" VALUE="true">' +
			     		'<PARAM NAME="PlayCount" VALUE="1">' + 
			     		'<embed type="application/x-mplayer2" src="' + href + '" width="425" height="300" controller="true" autostart="true"> ' +
			      		'</EMBED>' + '</OBJECT>';
			$("#wmvPlayed").html(html);
			$("#wmvPlayed").show();

			break;
		default:
	}
}



function stopVideo() {
	
	if (stopPlayButton) { stopPlayButton.hide(); stopPlayButton=undefined; } 
	if (startPlayButton) { startPlayButton.show(); startPlayButton=undefined; }
	
	if (flvPlayerCreated) {
		var p = $f('player');
		p.stop();
		p.play("nofile");
		$("#player").empty();
		flvPlayerCreated = false;
	}
	$("#wmvPlayed").empty();
	$("#wmvPlayed").hide();
}

function onHide_mediaFilesBlock() {
    stopVideo();
    stopPhotoLoading();
}

function onMenuGuesbook() {
    showOverlap("#guestbook");
}
function onShow_guestbook() {
    refreshGuestbook();
}

function createCommentListDom(r) {
    var ul=$("<div>");
    ul.addClass("ulLevel0");
    ul.css("width", "100%");
    r.sort(function(a, b) { return b.rtime-a.rtime; });
    $.each(r, function(i, ri) {
        var tbl=$("<table class=liLevel0 width=100%><tr class=liLevel1><td align=left></td>"+
            "<td align=right></td></tr><tr><td colspan=2 align=left class=liLevel2></td></tr></table>");
        $("td:eq(0)", tbl).text(ri.userName);
        $("td:eq(1)", tbl).text(
                typeof ri.visibleDate=='string'&&ri.visibleDate.length>0?ri.visibleDate:
                (new Date(Number(ri.rtime)*1000)).toLocaleString()
            );
        $("td:eq(2)", tbl).html(ri.comment);
        ul.append(tbl);
    });
    return ul;
}

function refreshGuestbook(msg) {
    $("#guestbook form").hide();
    $("#guestbook .postMsg").hide();
    $("#guestbook .errorMessageBig").hide();
    $("#guestbook .list").empty();
    driver.dbAction("getComment", { rtable: "guestbook" }, function(r) {
        if (typeof r!='object') {
            $("#guestbook .errorMessageBig").show();
            return;
        };
        var ul=createCommentListDom(r);
        $("#guestbook .list").append(ul);
        if (msg) {
            $("#guestbook form").hide();
            $("#guestbook .postMsg").text(msg);
            $("#guestbook .postMsg").show();
        } else {
            $("#guestbook form").show();
            $("#guestbook .postMsg").hide();
        }
    });
}

function onSubmitGuestbook() {
    var comment=$("#guestbook textarea").val();
    if (comment.length==0) return;

    $("#guestbook form").hide();
    $("#guestbook textarea").val("");
    $("#guestbook .postMsg").text("Спасибо за отзыв! Отправляем...");
    $("#guestbook .postMsg").show();
    driver.dbAction(
        "postComment", { rtable: "guestbook", rid: 0, comment: comment },
        function() { refreshGuestbook("Спасибо!"); }
    );
}

var currentOverlap;
function showOverlap(e) {
    $(".overlap").hide();
    if (currentOverlap) {
        var fn="onHide_"+$(currentOverlap).attr("id");
        if (typeof window[fn]=='function') window[fn]();
    }
    currentOverlap=undefined;

    $(e).show();
    currentOverlap=e;
    var fn="onShow_"+$(currentOverlap).attr("id");
    if (typeof window[fn]=='function') window[fn]();
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

function getRadioValue(name) {
    var v=undefined;
    $("[name="+name+"]").each(function() {
        if (this.checked) { v=this.value; return false; }
    });
    return v;
}
function setRadioValue(name,val) {
    $("[name="+name+"]").each(function() {
        if (this.value==val) {
            this.checked=true;
        } else {
            this.checked=false;
        }
    });
}

var navPanel;
var navPanelParent;
var body;
var navPanelTimer=undefined;

function navPanelMoveInit() {
	navPanel = $("#navPanel");
	navPanelParent = $("#navPanel").parent();
	body = $("body");
	navPanel.css('position', 'relative');
	navPanelMoving=0;
	navPanelMove();
	onscroll=navPanelMove;
	onresize=navPanelMove;
}

function navPanelMove() {
	if (navPanelTimer) {
		clearTimeout(navPanelTimer);
		navPanelTimer=undefined;
	}
	navPanelTimer=setTimeout(navPanelMoveSync,200);	
}

function navPanelMoveSync() {
	
	var w=$(window);
	var wH=w.height();
	var wS=w.scrollTop();
	
	var pH=navPanelParent.height();
	var pT=navPanelParent.offset().top;
	var pB=pT+pH;
	
	var nH=navPanel.height();
	var nT=navPanel.offset().top;
	var nB=nT+nH;
	
	var visT=wS;
	var visB=visT+wH;
	
	var minT=Math.max(pT,visT);
	var maxB=Math.min(pB,visB);
	
	var downDist=maxB-nB;
	var upDist=nT-minT;
	
	if (nH<wH && (upDist<0 || downDist<0)) {
		var y=wS+(wH-nH)/2;
		if (y+nH>pB) y=pB-nH;
		if (y<pT) y=pT;
		navPanel.offset({top : y});
	} else if (upDist>0 && downDist<0) {
		navPanel.offset({top : minT});
	} else if (upDist<0 && downDist>0) {
		navPanel.offset({top : maxB-nH});
	}
}

$(function() {
    stopVideo();
    initFormValidator();
    navPanelMoveInit();
    driver.testSession(onLogin);
});
