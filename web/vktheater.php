<?php

require_once 'config.php';
require_once "$privDir/session.php";

   $app_id = "";
   $app_secret = "";
   $my_url = "http://andrey-zabrodin.net/theater/vktheater.php";
   $target_url = "http://andrey-zabrodin.net/theater";

function xxxhttpRequest($url) {
    $proxy = 'http://azabrodin-org.1gb.ru/utils/proxy.php';
//    $proxy = 'http://192.168.0.10:8080/utils/proxy.php';

    $url1 = $proxy . '?url=' . urlencode($url);
//    echo "<hr>file_get_contents: $url1<hr>";
    $res=file_get_contents($url1);
//    echo "<hr>file_get_contents: $res<hr>";
    return $res;
}

function httpRequest($url) {
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

            echo "Подождите, выполняется авторизация через ВКонтакте...<hr>";
            
            if (
                !isset($_SESSION['state']) || !isset($_REQUEST['state']) ||
                ($_SESSION['state'] !== $_REQUEST['state'])
            ) {
                echo "Ошибка авторизации ВКонтакте #1\n";
                return 0;               
            }

        $myUrlEncoded=urlencode($my_url.'?state='.$_SESSION['state']);
            $token_url = "https://oauth.vk.com/access_token?client_id=$app_id&client_secret=$app_secret&code=$code&redirect_uri=$myUrlEncoded";

            $myInfo = httpRequest($token_url);

//            echo "<hr>myInfo: $myInfo<hr>";

            $myInfo = json_decode($myInfo, true);

            if (!$myInfo || !isset($myInfo['access_token'])) {
                echo "Ошибка авторизации ВКонтакте #2";
                return 0;
            }
            $access_token=$myInfo['access_token'];
            $myId=$myInfo['user_id'];

            $myInfo1=httpRequest("https://api.vk.com/method/users.get?uids=$myId&access_token=$access_token");

//            echo "<hr>...$myInfo1...<hr>";

            $myInfo1 = json_decode($myInfo1, true);
            if (!$myInfo1 || !isset($myInfo1['response']) || !isset($myInfo1['response'][0])) {
                echo "Ошибка при получении сведений от ВКонтакте #3";
                return 0;
            }
            $myInfo1=$myInfo1['response'][0];
            $myName=$myInfo1['first_name'].' '.$myInfo1['last_name'];

            if ($myId == '79836121') {
            $_SESSION['login'] = $myName;
            $_SESSION['name'] = "$myName (vk)";
            $_SESSION['userLoggedIn'] = 1;
                return 1;
            }
            
            $myFriends = httpRequest("https://api.vk.com/method/friends.get?uid=$myId&access_token=$access_token");
            $myFriends = json_decode($myFriends,true);

            if (!$myFriends || !isset($myFriends['response'])) {
                echo "Ошибка при получении списка друзей #4";
                return 1;
            }
            $myFriends=$myFriends['response'];

            $isMyFriend = 0;
            foreach ($myFriends as $i => $record) {
                if ($record == '79836121') {
                    $isMyFriend = 1;
                    break;
                }
            }
            if ($isMyFriend==0) {
                echo "Для доступа к серверу Вы должны быть другом Ивана Ивановича. " . 
                    "<p>Пройдите на <a href=http://vk.com/id79836121>его страницу в ВКонтакте</a> ".
                    "и добавьте его в друзья. " .
                    "После подтверждения дружбы Вы сможете войти на этот сервер.</p>";
                return 0;
            }
            
            $_SESSION['login'] = $myName;
            $_SESSION['name'] = "$myName (vk)";
            $_SESSION['userLoggedIn'] = 1;
            
            return 1;
        }

        $code = isset($_REQUEST["code"]) ? $_REQUEST["code"] : '';

        if (empty($code)) {

            $_SESSION['state'] = md5(uniqid(rand(), TRUE)); //CSRF protection
            $myUrlEncoded=urlencode($my_url.'?state='.$_SESSION['state']);
            $dialog_url =
                "http://oauth.vk.com/authorize?client_id=$app_id&scope=friends&redirect_uri=$myUrlEncoded&response_type=code";

            echo("<script> top.location.href='" . $dialog_url . "'</script>");

            
        } else  if ($_SESSION['state'] && ($_SESSION['state'] === $_REQUEST['state'])) {
        
            if (verifyAuthorization($code)==1) {
                echo "Вход выполнен. Подождите, открывается главная страница сервера...<br>";
                echo "<script> top.location.href='$target_url'</script>";
            }

        }
        ?>
        </td></tr></table>
    </body>
</html>

