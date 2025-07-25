<?php
include("../res/x5engine.php");
$nameList = array("8ej","udz","8zh","r67","4su","ypj","ras","yfw","5pw","zu8");
$charList = array("7","M","M","J","U","U","N","8","N","L");
$cpt = new X5Captcha($nameList, $charList);
//Check Captcha
if ($_GET["action"] == "check")
	echo $cpt->check($_GET["code"], $_GET["ans"]);
//Show Captcha chars
else if ($_GET["action"] == "show")
	echo $cpt->show($_GET['code']);
// End of file x5captcha.php
