<?php

require_once 'conf.php';
require_once 'session.php';
checkLogin();

if (isset($_REQUEST["callback"])) echo $_REQUEST["callback"]."(";

$db = new PDO('sqlite:'.$dbfilename);

function gp($p) {
    global $db;
    if (!isset($_REQUEST[$p])) return null;
    return $db->quote(trim($_REQUEST[$p]));
}
function ap($w, $op1, $op2, $n, $cmp, $v) {
    if ($v) {
        if ($w == '') return "$op1 $n $cmp $v";
        else return "$w $op2 $n $cmp $v";
    } else {
        return $w;
    }
}
function wep($w, $n, $p) {
    return ap($w,"WHERE","AND",$n,'=',$p);
}
function wer($w,$n) {
    return ap($w,"WHERE","AND",$n,'=',gp($n));
}

if (!$db) {
    echo '"Open database failed"';
} else {

  switch (isset($_REQUEST['op']) ? $_REQUEST['op'] : 'nop') {
    case 'getTheaters':
      $w='';
      $w=wer($w, 'id');
      $w=wer($w, 'url');
      $w=wer($w, 'name');
      $q = "SELECT * FROM theater $w ";
      break;
    case 'newTheater':
      $url=gp('url');
      $name=gp('name');
      $q = "INSERT INTO theater (url,name) VALUES ($url,$name)";
      break;
    case 'updateTheater':
      $id=gp('id');
      $url=gp('url');
      $name=gp('name');
      $q="UPDATE theater SET url=$url, name=$name WHERE id=$id";
      break;
    case 'deleteTheater':
      $id=gp('id');
      $url=gp('url');
      $name=gp('name');
      $q="DELETE FROM theater WHERE id=$id and url=$url and name=$name";
      break;
    case 'getUsers':
      $w='';
      $w=wer($w,'id');
      $w=wer($w,'url');
      $w=wer($w,'name');
      $w=wer($w,'login');
      $w=wer($w,'password');
      $w=wer($w,'vk');
      $w=wer($w,'fb');
      $w=wer($w,'comment');
      $q = "SELECT * FROM users $w ";
      break;
    case 'newUser':
      $url=gp('url');
      $name=gp('name');
      $login=gp('login');
      $password=gp('password');
      $vk=gp('vk');
      $fb=gp('fb');
      $comment=gp('comment');
      $q = "INSERT INTO users (url,name,login,password,vk,fb,comment) VALUES ($url,$name,$login,$password,$vk,$fb,$comment)";
      break;
    case 'updateUser':
      $id=gp('id');
      $url=gp('url');
      $name=gp('name');
      $login=gp('login');
      $password=gp('password');
      $vk=gp('vk');
      $fb=gp('fb');
      $comment=gp('comment');
      $q="UPDATE users SET url=$url, name=$name, login=$login, password=$password, vk=$vk, fb=$fb, comment=$comment WHERE id=$id";
      break;
    case 'deleteUser':
      $id=gp('id');
      $url=gp('url');
      $login=gp('login');
      $q="DELETE FROM users WHERE id=$id and url=$url and login=$login";
      break;
    case 'getPerformances':
      $w='';
      $w=wer($w,'id');
      $w=wer($w,'url');
      $w=wer($w,'name');
      $w=wer($w,'theater');
      $w=wer($w,'year');
      $q = "SELECT performance.id,performance.url,performance.name,performance.theater,".
           " theater.url as theaterUrl, theater.name as theaterName, performance.year, performance.comment".
           " FROM performance inner join theater on performance.theater=theater.id $w ";
      break;
    case 'newPerformance':
      $url=gp('url');
      $name=gp('name');
      $theater=gp('theater');
      $year=gp('year');
      $comment=gp('comment');
      $q = "INSERT INTO performance (url,name,theater,year,comment) VALUES ($url,$name,$theater,$year,$comment)";
      break;
    case 'updatePerformance':
      $id=gp('id');
      $url=gp('url');
      $name=gp('name');
      $theater=gp('theater');
      $year=gp('year');
      $comment=gp('comment');
      $q="UPDATE performance SET url=$url, name=$name, theater=$theater, year=$year, comment=$comment WHERE id=$id";
      break;
    case 'deletePerformance':
      $id=gp('id');
      $url=gp('url');
      $theater=gp('theater');
      $year=gp('year');
      $q="DELETE FROM performance WHERE id=$id and url=$url and theater=$theater and year=$year";
      break;
    case 'getMovies':
      $w='';
      $w=wer($w,'id');
      $w=wer($w,'url');
      $w=wer($w,'name');
      $w=wer($w,'performance');
      $w=wer($w,'file');
      $w=wer($w,'playorder');
      $w=wer($w,'type');
      $q = "SELECT * FROM movie $w ";
      break;
    case 'newMovie':
      $url=gp('url');
      $name=gp('name');
      $performance=gp('performance');
      $file=gp('file');
      $playorder=gp('playorder');
      $type=gp('type');
      $q = "INSERT INTO movie (url,name,performance,file,'playorder',type) VALUES ($url,$name,$performance,$file,$playorder,$type)";
      break;
    case 'updateMovie':
      $id=gp('id');
      $url=gp('url');
      $name=gp('name');
      $performance=gp('performance');
      $file=gp('file');
      $playorder=gp('playorder');
      $type=gp('type');
      $q="UPDATE movie SET url=$url, name=$name, performance=$performance, file=$file, 'playorder'=$playorder, type=$type WHERE id=$id";
      break;
    case 'deleteMovie':
      $id=gp('id');
      $url=gp('url');
      $performance=gp('performance');
      $type=gp('type');
      $q="DELETE FROM movie WHERE id=$id and url=$url and performance=$performance and type=$type";
      break;
      
    default:
      $q='';
      break;
  };

  if ($q=='') {
      echo 'undefined';
  } else {
          
      echo "\n// $q\n";
      $res=$db->query($q);

      if ($res) {

          $ares=$res->fetchAll(PDO::FETCH_ASSOC);
          echo json_encode($ares);

      } else {
          echo false;
      }
  }
}

if (isset($_REQUEST["callback"])) echo ")";

?>
