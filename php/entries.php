<?php
require('db.php');
require('requests.php');

class Entries implements DBOperation{
    function Insert(){
        global $conn, $request;
        $sql = $conn->prepare("INSERT INTO `register` (Description,Amount,EntryDate,Source,Bank,IsExpense,UpdatedDate) VALUES(?,?,?,?,?,?, NOW())");
        $sql->bind_param('sisiii',$request->entry["Description"],$request->entry["Amount"], date("Y-m-d",strtotime($request->entry["EntryDate"])),$request->entry["Source"],$request->entry["Bank"],$request->entry["IsExpense"]);
        $sql->execute();
        $sql->close();
        return "{'data':'Success'}";
    }
    function Modify(){
        global $conn, $request;
        $sql = $conn->prepare("UPDATE `register` SET Description=?, Amount=?, EntryDate=?, Source=?, Bank=?, IsExpense=?, UpdatedDate=NOW() WHERE EntryID=?");
        $sql->bind_param('sisiiii',$request->entry["Description"],$request->entry["Amount"], date("Y-m-d",strtotime($request->entry["EntryDate"])),$request->entry["Source"],$request->entry["Bank"],$request->entry["IsExpense"],$request->entry["EntryID"]);
        $sql->execute();
        $sql->close();
        return "{'data':'Success'}";
    }
    function Delete(){
        global $conn, $request;
        $sql = $conn->prepare("DELETE FROM `register` WHERE EntryID = ?");
        $sql->bind_param('i', $request->entryId);
        $sql->execute();
        $sql->close();
        return "{'data':'Success'}";
    }
    function Get(){
        global $conn;
        $sql = "SELECT * FROM `register` order by EntryDate DESC";
        $result = $conn->query($sql);
        $posts = array();
        if($result->num_rows > 0) {
            while($post = $result->fetch_assoc()) {
                $posts[] = $post;
            }
        }
        return $posts;
    }
}
$entries = new Entries();
switch($request->mode)
{
    case "insert":{
        echo json_encode($entries->Insert());
        break;
    }
    case "update":{
        echo json_encode($entries->Modify());
        break;
    }
    case "delete":{
        echo json_encode($entries->Delete());
        break;
    }
    case "list":{
        echo json_encode($entries->Get());
        break;
    }
}

?>