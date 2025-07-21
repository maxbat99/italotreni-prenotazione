<?php
include("../res/x5engine.php");
$nameList = array("zuu","v7p","w87","afl","msf","pkg","xfr","wmc","l4x","swv");
$charList = array("D","H","8","E","6","A","T","H","A","3");
$cpt = new X5Captcha($nameList, $charList);
//Check Captcha
if ($_GET["action"] == "check")
	echo $cpt->check($_GET["code"], $_GET["ans"]);
//Show Captcha chars
else if ($_GET["action"] == "show")
	echo $cpt->show($_GET['code']);
// End of file x5captcha.php
