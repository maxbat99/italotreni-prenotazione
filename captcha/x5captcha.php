<?php
include("../res/x5engine.php");
$nameList = array("mh5","w5d","ktt","tzf","hyc","v8p","ml8","vm7","4zx","vv7");
$charList = array("8","F","3","Y","X","H","A","5","J","X");
$cpt = new X5Captcha($nameList, $charList);
//Check Captcha
if ($_GET["action"] == "check")
	echo $cpt->check($_GET["code"], $_GET["ans"]);
//Show Captcha chars
else if ($_GET["action"] == "show")
	echo $cpt->show($_GET['code']);
// End of file x5captcha.php
