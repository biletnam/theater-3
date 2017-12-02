<?php

require_once 'config.php';
require_once "$privDir/session.php";

$app_id = "";
$app_secret = "";
$my_url = "http://andrey-zabrodin.net/theater/fbtheater.php";
$target_url = "http://andrey-zabrodin.net/theater";

function xxxhttpRequest($url) {
    $proxy = 'http://azabrodin-org.1gb.ru/utils/proxy.php';
//    $proxy = 'http://192.168.0.10:8080/utils/proxy.php';

    $url1 = $proxy . '?url=' . urlencode($url);
    return file_get_contents($url1);
}

function httpRequest($url) {

//    $req=$url;
//    $reply = file_get_contents($url);

    $req = "curl -k -L ".escapeshellarg ($url);
//    $req = "d:/utils/curl -k -L \"$url\"";
    $reply = exec($req);
//    echo "<hr>curl($req) = $reply<hr>";
    return $reply;
}


?>

<html>
    <head>
        <title>Сервер Ивана Иваныча</title>
        <META HTTP-EQUIV="Content-Type" content="text/html; charset=utf-8">
        <meta http-equiv="Content-Style-Type" content="text/css">
    </head>
    <body>
        <table cellpadding=32 align=center border=1 width=60% style="background-color:c0ffc0"><tr><td>
        
        <?php
        
        function verifyAuthorization($code) {
            global $app_id,$app_secret,$my_url,$target_url;

            echo "Подождите, выполняется авторизация через Facebook...<hr>";
            
            if (
                !isset($_SESSION['state']) || !isset($_REQUEST['state']) ||
                ($_SESSION['state'] !== $_REQUEST['state'])
            ) {
                echo "Ошибка авторизации Facebook #1\n";
                return 0;               
            }
            $token_url = "https://graph.facebook.com/oauth/access_token?" . 
                "scope=user_friends&client_id=" . $app_id . "&redirect_uri=" . urlencode($my_url) . 
                "&client_secret=" . $app_secret . "&code=" . $code;
            $response = httpRequest($token_url);
            $params=json_decode($response,true);
            if (!$params || !isset($params['access_token'])) {
                echo "Ошибка авторизации Facebook #2 ($response)";
                return 0;
            }
            $access_token=$params['access_token'];
            
            $graph_url = "https://graph.facebook.com/me?access_token=$access_token";
            $myInfo = httpRequest("https://graph.facebook.com/me?access_token=$access_token");
            $myInfo = json_decode($myInfo, true);
            if (!$myInfo || !isset($myInfo['name'])) {
                echo "Ошибка при получении сведений от Facebook #3";
                return 0;
            }
            $myName=$myInfo['name'];
            $myId=$myInfo['id'];
            if ($myId === '722504104470895') {
            $_SESSION['login'] = $myName;
            $_SESSION['name'] = "$myName (fb)";
            $_SESSION['userLoggedIn'] = 1;
                return 1;
            }

            
            $myFriends = httpRequest("https://graph.facebook.com/me/friends?access_token=$access_token");
            $myFriends = json_decode($myFriends,true);

            if (!$myFriends || empty($myFriends['data'])) {
                echo "Ошибка при получении списка друзей #4";
                return 1;
            }
            $myFriends=$myFriends['data'];
            $isMyFriend = 0;
            foreach ($myFriends as $i => $record) {
                if ($record['id'] === '722504104470895') {
                    $isMyFriend = 1;
                    break;
                }
            }
            if ($isMyFriend==0) {
                echo "Для доступа к серверу Вы должны быть другом Андрея Забродина. " . 
                    "<p>Пройдите на <a href=http://www.facebook.com/zabrodas>его страницу в Facebook</a> ".
                    "и добавьте его в друзья. " .
                    "После подтверждения дружбы Вы сможете войти на этот сервер.</p>";
                return 0;
            }
            
            $_SESSION['login'] = $myName;
            $_SESSION['name'] = "$myName (fb)";
            $_SESSION['userLoggedIn'] = 1;
            
            return 1;
        }

        $code = isset($_REQUEST["code"]) ? $_REQUEST["code"] : '';

        if (empty($code)) {
            
            $_SESSION['state'] = md5(uniqid(rand(), TRUE));
            //CSRF protection
            $dialog_url = "https://www.facebook.com/dialog/oauth?scope=user_friends&client_id=" . $app_id . "&redirect_uri=" . urlencode($my_url) . "&state=" . $_SESSION['state'];
            echo "<script> top.location.href='$dialog_url'</script>";
            
        } else  if ($_SESSION['state'] && ($_SESSION['state'] === $_REQUEST['state'])) {
        
            echo "Авторизация...<br>";

            if (verifyAuthorization($code)==1) {
                echo "Вход выполнен. Подождите, открывается главная страница сервера...<br>";
                echo "<script> top.location.href='$target_url'</script>";
            }

        } else {
//            $v1=$_SESSION['state'];
//            $v2=$_REQUEST['state'];
//            echo "$v1 , $v2";
        }
        ?>
        </td></tr></table>
    </body>
</html>
