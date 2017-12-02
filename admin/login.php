<?php

$user="";
$password="";
$domain="InavIvanovitch";

require_once 'session.php';

if (isset($_REQUEST["callback"])) echo $_REQUEST["callback"]."(";

if (isset($_REQUEST["login"])) {
    $rlogin=$_REQUEST["login"];
    $rand=$_SESSION['rand'];
    $cc=$domain.$user.$password.$rand;
    $login=md5($cc);
    $ok = $login === $rlogin ? 1 : 0;
    $_SESSION['loggedIn']=$ok;
    echo $ok;
} else if (isset($_REQUEST["test"])) {
    echo $_SESSION['loggedIn'];
} else {
    $rand=rand();
    $_SESSION['rand']=$rand;
    echo $rand;    
}

if (isset($_REQUEST["callback"])) echo ")";

?>
