<?php

require_once 'config.php';
require_once "$privDir/session.php";

checkLogin();

if (isset($_REQUEST["callback"]))
	echo $_REQUEST["callback"] . "(";

$db = new PDO('sqlite:' . $dbfilename);

function gp($p) {
	global $db;
	if (!isset($_REQUEST[$p]))
		return null;
	return $db -> quote(trim($_REQUEST[$p]));
}

function ap($w, $op1, $op2, $n, $cmp, $v) {
	if ($v) {
		if ($w == '')
			return "$op1 $n $cmp $v";
		else
			return "$w $op2 $n $cmp $v";
	} else {
		return $w;
	}
}

function wep($w, $n, $p) {
	return ap($w, "WHERE", "AND", $n, '=', $p);
}

function wer($w, $n) {
	return ap($w, "WHERE", "AND", $n, '=', gp($n));
}

if (!$db) {
	echo '"Open database failed"';
} else {
	$cmd = isset($_REQUEST['op']) ? $_REQUEST['op'] : 'nop';

	switch ($cmd) {
		case 'getTheaters' :
			$w = '';
			$w = wer($w, 'id');
			$w = wer($w, 'url');
			$w = wer($w, 'name');
			$q = "SELECT * FROM theater $w ";
			break;
		case 'getPerformances' :
			$w = '';
			$w = wer($w, 'id');
			$w = wer($w, 'url');
			$w = wer($w, 'name');
			$w = wer($w, 'theater');
			$w = wer($w, 'year');
			$q = "SELECT performance.id,performance.url,performance.name,performance.theater," . " theater.url as theaterUrl, theater.name as theaterName, performance.year, performance.comment" . " FROM performance inner join theater on performance.theater=theater.id $w ";
			break;
		case 'getMovies' :
			$w = '';
			$w = wer($w, 'id');
			$w = wer($w, 'url');
			$w = wer($w, 'name');
			$w = wer($w, 'performance');
			$w = wer($w, 'playorder');
			$w = wer($w, 'type');
			$q = "SELECT id,url,name,performance,playorder,type FROM movie $w ";
			break;
		case 'getFile' :
			$w = '';
			$w = wer($w, 'id');
			$w = wer($w, 'url');
			$w = wer($w, 'name');
			$w = wer($w, 'performance');
			$w = wer($w, 'playorder');
			$w = wer($w, 'type');
			$q = "SELECT file,url,type FROM movie $w ";
			break;
		case 'getComment' :
			$w = '';
			$w = wer($w, 'id');
			$w = wer($w, 'rtable');
			$w = wer($w, 'rid');
			$w = wer($w, 'userName');
			$w = wer($w, 'userId');
			$q = "SELECT id,rtable,rid,userName,userId,rtime,comment,visibleDate FROM comments $w ";
			break;
		case 'postComment' :
			$rtable = gp('rtable');
			$rid = gp('rid');
			$userName = $db -> quote(isset($_SESSION['name']) ? $_SESSION['name'] : isset($_SESSION['login']) ? $_SESSION['login'] : "Guest");
			$rtime = $db -> quote(time());

			$comment = isset($_REQUEST['comment']) ? trim($_REQUEST['comment']) : '';
			$comment = htmlentities($comment, ENT_NOQUOTES, "UTF-8");
			$comment = str_replace("\n", "<br>\n", $comment);
			$comment = $db -> quote($comment);

			$q = "INSERT INTO comments (rtable,rid,userName,rtime,comment) VALUES ($rtable,$rid,$userName,$rtime,$comment)";
			break;

		default :
			$q = '';
			break;
	};

	if ($q == '') {
		echo 'undefined';
	} else {

		/*
		 if ($cmd!='getFile') {
		 echo "\n// $q\n";
		 }
		 */
		logRq($_SESSION['name'] . ",$q");

		$res = $db -> query($q);

		if ($res) {

			if ($cmd == 'getFile') {
				$ares = $res -> fetch(PDO::FETCH_ASSOC);
				if (isset($ares['file'])) {
					
					require_once "$privDir/downloadFile.php";
					require_once "$privDir/mime_content_type.php";


					$filename=$ares['file'];
					
					if (isset($_REQUEST["thumb"]) && $_REQUEST["thumb"]==1) {
						$filename_parts = pathinfo($filename);
						$thumbFilename=$filename_parts['dirname'].'/thumb/'.$filename_parts['basename'];
						if (is_file(toFsCoding($thumbFilename))) $filename=$thumbFilename;
						$thumbFilename=$filename_parts['dirname'].'/thumb/'.$filename_parts['filename'].'.'.strtolower($filename_parts['extension']);
						if (is_file(toFsCoding($thumbFilename))) $filename=$thumbFilename;
					}
					
					$url = isset($ares['url']) ? $ares['url'] : "video";
					$speedLimit=filesize(toFsCoding($filename))>5000000;
					$res=null; $db = null;
					logRq($_SERVER["HTTP_HOST"] . ":" . $_SERVER["REQUEST_URI"] .','. $filename);
					downloadFile($filename, $url, az_mime_content_type($filename), $speedLimit);
				} else {
					echo "Can't open file";
				}
			} else {
				$ares = $res -> fetchAll(PDO::FETCH_ASSOC);
				echo json_encode($ares);
			}

		} else {
			echo false;
		}
	}
}

if (isset($_REQUEST["callback"]))
	echo ")";
