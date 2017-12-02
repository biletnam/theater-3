<?php
session_save_path ('../../../sessions');
session_start();
//header("Content-Type:text/javascript; charset=UTF-8");
function checkLogin() {
	if (!isset($_SESSION['loggedIn']) || $_SESSION['loggedIn']!=1) die('notLoggedIn()');
}
