<?php
session_save_path ('/home/az/web/sessions');
session_start();
//header("Content-Type:text/javascript; charset=UTF-8");
function checkLogin() {
	if (!isset($_SESSION['userLoggedIn']) || $_SESSION['userLoggedIn']!=1) die('notLoggedIn()');
}


function logRq($str) {

    $f=fopen('/home/az/web/sessions/log.txt', 'a');
    fwrite($f,
        date('d-M-Y H:i:s') .','. $str . "\n"
    );
    fclose($f);
}


