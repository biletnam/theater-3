<?php

require_once 'conf.php';
require_once 'session.php';
checkLogin();

if (isset($_REQUEST["callback"])) echo $_REQUEST["callback"]."(";


switch (isset($_REQUEST['op']) ? $_REQUEST['op'] : 'nop') {
	
	case "dir":
		$dir=realpath($_REQUEST['dir']);
		$res=array();
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					if ($file != '.') {
						$rec = array ();
				echo "// $file\n";
						$rec ['name'] =  ($file);
						$rp=realpath ($dir . '/' . $file);
						$rec ['path'] = ($rp);
						$rec ['isDir'] = is_dir ( $rp ) ? 1 : 0;
						if (! $rec ['isDir']) $rec ['size'] = filesize ( $rp );
						$res [] = $rec;
					}
				}
				closedir($dh);
			}
		}
		echo json_encode($res);
		break;
		
	default:
		echo 'false';
		break;
	
}

if (isset($_REQUEST["callback"])) echo ")";

?>