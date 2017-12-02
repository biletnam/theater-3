<?php
require_once 'config.php';
require_once "$privDir/session.php";

if (isset($_REQUEST["callback"])) echo $_REQUEST["callback"] . "(";

$result = array();

if (isset($_REQUEST["user"])) {

    $db = new PDO('sqlite:' . $dbfilename);
    if (!$db) {
        $result['error'] = 'Ошибка при выполнении операции';
        $result['login'] = $_SESSION['login'] = '';
        $result['name'] = $_SESSION['name'] = '';
        $result['userLoggedIn'] = $_SESSION['userLoggedIn'] = 0;
    } else {
        $rand = isset($_SESSION['rand']) ? $_SESSION['rand'] : '';
        $rname = isset($_REQUEST['user']) ? trim($_REQUEST['user']) : '';
        $qrname = $db -> quote($rname);
        $rmd5 = isset($_REQUEST["md5"]) ? $_REQUEST["md5"] : '';

        $q = "SELECT * FROM users WHERE login=$qrname";
        $res = $db -> query($q);
        if ($res) {
            $ares = $res -> fetch(PDO::FETCH_ASSOC);
            if ($ares) {
                $name = $ares['login'];
                $password = $ares['password'];
                $md5 = md5($name . $password . $rand);

                if ($md5 === $rmd5) {
                    $result['login'] = $_SESSION['login'] = $ares['login'];
                    $result['name'] = $_SESSION['name'] = $ares['name'];
                    $result['userLoggedIn'] = $_SESSION['userLoggedIn'] = 1;
                } else {
                    $result['error'] = 'Неправильое имя пользователя или пароль';
                    $result['login'] = $_SESSION['login'] = '';
                    $result['name'] = $_SESSION['name'] = '';
                    $result['userLoggedIn'] = $_SESSION['userLoggedIn'] = 0;
                }
            } else {
                $result['error'] = 'Неправильое имя пользователя или пароль';
                $result['login'] = $_SESSION['login'] = '';
                $result['name'] = $_SESSION['name'] = '';
                $result['userLoggedIn'] = $_SESSION['userLoggedIn'] = 0;
            }
        } else {
            $result['error'] = 'Неправильое имя пользователя или пароль';
            $result['login'] = $_SESSION['login'] = '';
            $result['name'] = $_SESSION['name'] = '';
            $result['userLoggedIn'] = $_SESSION['userLoggedIn'] = 0;
        }
    }
} else if (isset($_REQUEST["logout"])) {
    $result['login'] = $_SESSION['login'] = '';
    $result['name'] = $_SESSION['name'] = '';
    $result['userLoggedIn'] = $_SESSION['userLoggedIn'] = 0;
} else if (isset($_REQUEST["test"])) {
    $result['login'] = isset($_SESSION['login'])?$_SESSION['login']:'';
    $result['name'] = isset($_SESSION['name'])?$_SESSION['name']:'';
    $result['userLoggedIn'] = isset($_SESSION['userLoggedIn'])?$_SESSION['userLoggedIn']:0;
} else {
    $result['rand'] = $_SESSION['rand'] = rand();
}

echo json_encode($result);
logRq("login:" . $result['rand'] .','. $result['login'] .','. $result['name'] .','. $result['userLoggedIn']);

if (isset($_REQUEST["callback"])) echo ")";
