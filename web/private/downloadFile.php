<?php

function toFsCoding($x) {
	global $mediaPrefix, $fileNamesEncoding;
	if ($fileNamesEncoding == 'UTF-8') return $mediaPrefix . $x;
	return mb_convert_encoding($mediaPrefix . $x, $fileNamesEncoding, "UTF-8");
}

function logDownload($filename, $from, $to, $fsize, $tstart, $tstop, $tsize) {

    $dur=$tstop-$tstart;
    if ($dur<10) return;

    $f=fopen('../sessions/log.txt', 'a');
    $bps=$dur>10 ? $tsize/$dur : 0;
    
    fwrite($f,
        date('d-M-Y H:i:s', $tstart) .','.
        memory_get_usage() .','.
        $_SESSION['user'] .','.
        $_SERVER['REMOTE_ADDR'] .','.
        $filename .','.
        $from .','.
        $to .','.
        $fsize .','.
        $tsize .','.
        $dur .','.
        $bps ."\n"
    );

    fclose($f);
}

$gbl_filename=null;
$gbl_from=null;
$gbl_to=null;
$gbl_fsize=null;
$gbl_tstart=null;
$gbl_tsize=null;

function onUserAbort() {
    global $gbl_filename, $gbl_from, $gbl_to, $gbl_fsize, $gbl_tstart, $gbl_tsize;
    logRq( 'onUserAbort');
    logDownload($gbl_filename, $gbl_from, $gbl_to, $gbl_fsize, $gbl_tstart, time(), $gbl_tsize);
}


function downloadFile($filename, $dispFileName, $mimetype='application/octet-stream', $speedLimit) {
	$filenameFsc=toFsCoding($filename);

        if (!file_exists($filenameFsc)) die('Файл не найден');

        

        $fsize=filesize($filenameFsc);

        $from=0;
        $to=$fsize-1;
        $cr=NULL;

        $flash_stream=0;

        if (isset($_SERVER['HTTP_RANGE'])) {

                $n = sscanf($_SERVER['HTTP_RANGE'], " bytes = %d - %d", $from, $to);

                if ($from<0) $from=0;
                if ($from>$fsize) $from=$fsize;
                if ($to<$from) $to=$from-1;
                if ($to>=$fsize) $to=fsize-1;

                header('HTTP/1.1 206 Partial Content');
                $cr='Content-Range: bytes ' . $from .'-'. $to .'/'. $fsize;

        } else if (isset($_GET['start'])) {

                $from=$_GET['start'];

                if ($from<0) $from=0;
                if ($from>$fsize) $from=$fsize;
                if ($to<$from) $to=$from-1;
                if ($to>=$fsize) $to=fsize-1;

                header('HTTP/1.1 200 Ok');
                $flash_stream=1;
        
        } else  {
                header('HTTP/1.1 200 Ok');
        }

        $psize=$to-$from+1;

        header('Accept-Ranges: bytes');
        header('Content-Length: ' . $psize);

        if ($flash_stream==1) {
            print('FLV');
            print(pack('C', 1));
            print(pack('C', 1));
            print(pack('N', 9));
            print(pack('N', 9));
        }

        if ($cr) header($cr);

        header('Connection: close');
        header('Content-Type: ' . $mimetype);
        header('Last-Modified: ' . gmdate('r', filemtime($filenameFsc)));
        header('Content-Disposition: attachment; filename="' . urlencode($dispFileName) . '";');

        $f=fopen($filenameFsc, 'r');
        fseek($f, $from, SEEK_SET);

        set_time_limit(0);
//        ignore_user_abort(true);

        global $gbl_filename, $gbl_from, $gbl_to, $gbl_fsize, $gbl_tstart, $gbl_tsize;
        $gbl_filename=$filename;
        $gbl_from=$from;
        $gbl_to=$to;
        $gbl_fsize=$fsize;
        $gbl_tstart=time();
        $gbl_tsize=0;

        $firstLog=false;

//        register_shutdown_function(onUserAbort);
//        ob_end_flush();
	flush();



//        try {

            set_time_limit(0);
	    $t1=microtime(true);
	    $logCnt=0;

            while(!feof($f) and !connection_status() and $psize>0) {

                $rsize=50000;
                if ($rsize>$psize) $rsize=$psize;

                echo fread($f, $rsize);
		flush();

                $psize-=$rsize;
                $gbl_tsize+=$rsize;
		$logCnt+=$rsize;

                if (!$firstLog && time()-$gbl_tstart>=30) {
		// if ($logCnt>=1000000) {
                    logDownload($gbl_filename, $gbl_from, $gbl_to, $gbl_fsize, $gbl_tstart, time(), $gbl_tsize);
                    $firstLog=true;
	            $logCnt=0;
                }

	    	$t2=microtime(true);
	    	if ($speedLimit) {
	    		$tdur=$t2-$t1;
	    		$tdurEst=$rsize*8.0/2000000.0; // 2Mibs
	    		if ($tdurEst>$tdur) {
		    		$delay=$tdurEst-$tdur;
		    		usleep($delay*1000000);
	          	}
	    	}
	    	$t1=$t2;

            }
//        } catch (Exception $e) {
//	    logRq( 'Caught exception: '.  $e->getMessage() );
//        }

        fclose($f);

        logDownload($gbl_filename, $gbl_from, $gbl_to, $gbl_fsize, $gbl_tstart, time(), $gbl_tsize);
}
