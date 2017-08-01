<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Offline saver</title>
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
    <link rel="stylesheet" type="text/css" href="styles/basic.css" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.min.js"></script>
    <script src="scripts/angular-chart.min.js"></script>
    <script src="scripts/app.js"></script>
    <script src="scripts/googlesheet.js"></script>
    <script src="scripts/utility.js"></script>
</head>

<body ng-app="app" ng-controller="home">
    <div class="navbar navbar-default">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" ng-bind="name" href="index.php"></a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
            <li><a href="#" ng-click="template.name='addEntry'" >Register</a></li>
            <li><a href="#" ng-click="template.name='viewEntries'" >View</a></li>
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">System <span class="caret"></span></a>
              <ul class="dropdown-menu" role="menu">				          
                <li><a href="#" ng-click="template.name='googleImport'">Google import</a></li>
                <li><a href="#">Download register</a></li>
                <li><a href="#">Customize</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="container" role="main">
        <div ng-switch="template.name">
          <dashboard-directive ng-switch-when="dashboard"></dashboard-directive>
          <register-entry-directive ng-switch-when="addEntry" ></register-entry-directive>
          <view-entries-directive ng-switch-when="viewEntries" ></view-entries-directive>
          <google-import-directive ng-switch-when="googleImport" ></google-import-directive>
        </div>
        <br/>
    </div>
    <div class="modal" id="confirmModal" role="dialog">
      <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-body">
              <p id="msg"></p>
            </div>
            <div class="modal-footer">
              <button type="button" id="btn_yes" class="btn btn-danger">Yes</button>
              <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
            </div>
          </div>
      </div>
    </div>
    <div style="display:none;" class="loader"></div>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script async defer src="https://apis.google.com/js/api.js"></script>
</body>

</html>