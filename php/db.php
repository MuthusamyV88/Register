<?php
require('connection.php');

interface DBOperation{
    public function Insert();
    public function Modify();
    public function Delete();
    public function Get();
}

?>