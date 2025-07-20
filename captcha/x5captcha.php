<?php
include("../res/x5engine.php");
$nameList = array("dhn","tfj","3t8","du5","tlv","6d8","s63","xt6","dze","c8n");
$charList = array("T","2","L","8","W","2","D","6","E","X");
$cpt = new X5Captcha($nameList, $charList);
//Check Captcha
if ($_GET["action"] == "check")
	echo $cpt->check($_GET["code"], $_GET["ans"]);
//Show Captcha chars
else if ($_GET["action"] == "show")
	echo $cpt->show($_GET['code']);
// End of file x5captcha.php
