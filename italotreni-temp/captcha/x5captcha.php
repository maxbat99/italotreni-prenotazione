<?php
include("../res/x5engine.php");
$nameList = array("kck","mn5","yuj","j5d","4hu","85f","jch","lnl","2zw","cv2");
$charList = array("W","L","N","C","Y","2","M","F","D","G");
$cpt = new X5Captcha($nameList, $charList);
//Check Captcha
if ($_GET["action"] == "check")
	echo $cpt->check($_GET["code"], $_GET["ans"]);
//Show Captcha chars
else if ($_GET["action"] == "show")
	echo $cpt->show($_GET['code']);
// End of file x5captcha.php
