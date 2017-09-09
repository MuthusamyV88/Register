<?php
require('db.php');
require('requests.php');

class Dashboard implements DBOperation{
    public function Insert(){
        //Not implemented
    }
    public function Modify(){
        //Not implemented
    }
    public function Delete(){
        //Not implemented
    }
    public function Get(){
        global $conn;
        $sql = "SELECT DATE_FORMAT(EntryDate, '%M %Y') `Month`, isExpense, SUM(AMOUNT) `Amount`  FROM `register` GROUP BY MONTH(EntryDate),isExpense order by EntryDate DESC";
        $result = $conn->query($sql);
        $barData = array();
        if($result->num_rows > 0) {
            while($post = $result->fetch_assoc()) {
                $barData[] = $post;
            }
        }
        $sql = "SELECT * FROM `register` WHERE EntryDate=CURDATE() ORDER BY Amount DESC";
        $result = $conn->query($sql);
        $today = array();
        if($result->num_rows > 0) {
            while($post = $result->fetch_assoc()) {
                $today[] = $post;
            }
        }
        $retVal = array();
        $retVal["barData"] = $barData;
        $retVal["today"] = $today;
        return json_encode($retVal);
    }
}

$dashboard = new Dashboard();
switch($request->mode)
{
    case "list":{
        echo $dashboard->Get();
        break;
    }
}

?>