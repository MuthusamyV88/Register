<?php

class Request{
    public static $entity;
    public static $mode;
    public static $entry;
    public static $entryId;
}

$request = new Request();

$_POST = json_decode(file_get_contents("php://input"), true);
$request->mode = $_POST["mode"];
$request->entry = $_POST["entry"];

//TODO: Should handle get request as well
if(empty($mode))
{
    $request->mode = $_GET["mode"];
    $request->entryId = $_GET["entryId"];
}

?>