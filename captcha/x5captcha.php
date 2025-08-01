<?php
include("../res/x5engine.php");
$nameList = array("yjn","lgr","54l","kcj","25l","hud","f5k","phj","278","jag");
$charList = array("D","N","K","U","C","6","T","Y","Y","H");
$cpt = new X5Captcha($nameList, $charList);
//Check Captcha
if ($_GET["action"] == "check")
	echo $cpt->check($_GET["code"], $_GET["ans"]);
//Show Captcha chars
else if ($_GET["action"] == "show")
	echo $cpt->show($_GET['code']);
// End of file x5captcha.php
