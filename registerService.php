<?php
	if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false)
    {
		/***Local***/
		$servername = "localhost";
		$username = "root";
		$password = "mysql";
		$dbname = "Register";
	}
	else
	{ 
		/***biz.nf connection***/
		$servername = "fdb17.biz.nf";
		$username = "2359823_register";
		$password = "Dotnetsamy88*";
		$dbname = "2359823_register";
	}	

	$_POST = json_decode(file_get_contents("php://input"), true);
	$mode = $_POST["mode"];
	$entry = $_POST["entry"];

	//TODO: Should handle get request as well
	if(empty($mode))
	{
		$mode = $_GET["mode"];
		$entryId = $_GET["entryId"];
	}

	$conn = new mysqli($servername, $username, $password,$dbname);
	if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

	if(!empty($mode))
	{
		switch($mode)
		{
			case "insert":{
				try
				{
					$sql = $conn->prepare("INSERT INTO `register` (Description,Amount,EntryDate,Source,IsExpense,UpdatedDate) VALUES(?,?,?,?,?, NOW())");
					$sql->bind_param('sisii',$entry["Description"],$entry["Amount"], date("Y-m-d",strtotime($entry["EntryDate"])),$entry["Source"],$entry["IsExpense"]);
					$sql->execute();
					$sql->close();
					$retVal = "{'data':'Success'}";
				}
				catch(Exception $e)
				{
					$retVal = "{'data':'Failure','message':$e->getMessage()}";
				}
				break;
			}
			case "bulkInsert":{
				try
				{
					$sql = $conn->prepare("INSERT INTO `register` (Description,Amount,EntryDate,Source,IsExpense,UpdatedDate) VALUES(?,?,?,?,?,NOW())");
					$conn->query("START TRANSACTION");
					foreach ($entry as $one) {
						$sql->bind_param('sisii',$one["Description"],$one["Amount"], date("Y-m-d",strtotime($one["Date"])),$one["Mode"],$one["IsExpense"]);
						$sql->execute();
					}
					$sql->close();
					$conn->query("COMMIT");
					$retVal = "{'data':'Success'}";
				}
				catch(Exception $e)
				{
					$retVal = "{'data':'Failure','message':$e->getMessage()}";
				}
				break;
			}
			case "update":{
				$sql = $conn->prepare("UPDATE `register` SET Description=?, Amount=?, EntryDate=?, Source=?, IsExpense=?, UpdatedDate=NOW() WHERE EntryID=?");
				$sql->bind_param('sisiii',$entry["Description"],$entry["Amount"], date("Y-m-d",strtotime($entry["EntryDate"])),$entry["Source"],$entry["IsExpense"],$entry["EntryID"]);
				$sql->execute();
				$sql->close();
				$retVal = "{'data':'Success'}";
				break;
			}
			case "delete":{
				$sql = $conn->prepare("DELETE FROM `register` WHERE EntryID = ?");
				$sql->bind_param('i',$entryId);
				$sql->execute();
				$sql->close();
				$retVal = "{'data':'Success'}";
				break;
			}
			case "dashboard":{
				$sql = "SELECT DATE_FORMAT(EntryDate, '%M %Y') `Month`, isExpense, SUM(AMOUNT) `Amount`  FROM `register` GROUP BY MONTH(EntryDate),isExpense order by EntryDate DESC";
				$result = $conn->query($sql);
				$barData = array();
				if($result->num_rows > 0) {
					while($post = $result->fetch_assoc()) {
						$barData[] = $post;
					}
				}
				$sql = "SELECT * FROM `register` WHERE EntryDate=CURDATE() AND IsExpense=1 ORDER BY Amount DESC LIMIT 5";
				$result = $conn->query($sql);
				$top5 = array();
				if($result->num_rows > 0) {
					while($post = $result->fetch_assoc()) {
						$top5[] = $post;
					}
				}
				$retVal = array();
				$retVal["barData"] = $barData;
				$retVal["top5"] = $top5;
				break;
			}
			case "list":
			default:{
				$sql = "SELECT * FROM `register` order by EntryDate DESC LIMIT 100";
				$result = $conn->query($sql);
				$posts = array();
				if($result->num_rows > 0) {
					while($post = $result->fetch_assoc()) {
						$posts[] = $post;
					}
				}
				$retVal = $posts;
				break;
			}
		}
		$conn->close();
		header('content-type:application/json');
		//header('content-type:text/plain');
		echo json_encode($retVal);		
	}
?> 