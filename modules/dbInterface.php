<?php
    $parentId = $_POST['parentId'];
    $weight = $_POST['weight'];


    $link = mysql_connect('localhost', 'root', 'root');
if (!$link) {
        die('Verbindung schlug fehl: ' . mysql_error());
}
mysql_select_db('gogetit', $link); 

$query = "INSERT INTO  `gogetit`.`Circle` (`id` ,`username` ,`parentId` ,`name` ,`weight` ,`health`)VALUES (NULL ,  'denis',  '$parentId',  'New Button',  '$weight',  '0.5');";
$result = mysql_query($query);

echo mysql_insert_id();
mysql_close($link);

?>
