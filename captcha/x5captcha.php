<?php
include("../res/x5engine.php");
$nameList = array("3hr","ev7","cg2","e8u","jww","337","4sf","llz","ydk","52a");
$charList = array("G","Y","M","L","L","6","6","M","C","R");
$cpt = new X5Captcha($nameList, $charList);
//Check Captcha
if ($_GET["action"] == "check")
	echo $cpt->check($_GET["code"], $_GET["ans"]);
//Show Captcha chars
else if ($_GET["action"] == "show")
	echo $cpt->show($_GET['code']);
// End of file x5captcha.php
