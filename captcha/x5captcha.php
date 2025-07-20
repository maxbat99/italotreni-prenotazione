<?php
include("../res/x5engine.php");
$nameList = array("m42","hwj","wtx","75l","fu7","gnn","gd2","gkd","nce","vrz");
$charList = array("P","G","3","Z","W","2","G","R","D","V");
$cpt = new X5Captcha($nameList, $charList);
//Check Captcha
if ($_GET["action"] == "check")
	echo $cpt->check($_GET["code"], $_GET["ans"]);
//Show Captcha chars
else if ($_GET["action"] == "show")
	echo $cpt->show($_GET['code']);
// End of file x5captcha.php
