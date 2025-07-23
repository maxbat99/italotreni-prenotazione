<?php
include("../res/x5engine.php");
$nameList = array("hcm","lty","fxa","647","sf7","rsf","zst","k7w","ypl","sff");
$charList = array("7","Z","P","G","5","2","W","P","D","S");
$cpt = new X5Captcha($nameList, $charList);
//Check Captcha
if ($_GET["action"] == "check")
	echo $cpt->check($_GET["code"], $_GET["ans"]);
//Show Captcha chars
else if ($_GET["action"] == "show")
	echo $cpt->show($_GET['code']);
// End of file x5captcha.php
