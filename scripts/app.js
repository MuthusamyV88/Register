$(document).ready(function () {
    $('.nav a:not(".dropdown-toggle")').click(function () {
        $('.navbar-toggle:visible').click();
    });
});

var app = angular.module('app', ['chart.js']);
app.controller('home', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
    $scope.name = "My Register";
    $scope.template = { "name": "dashboard" };
}]);
app.constant('tranSource', [
    { 'key': '1', 'value': 'Cash', 'icon': 'fa-inr' },
    { 'key': '2', 'value': 'Credit card', 'icon': 'fa-cc-mastercard' },
    { 'key': '3', 'value': 'Debit card', 'icon': 'fa-cc-visa' },
    { 'key': '4', 'value': 'Net banking', 'icon': 'fa-laptop' }]);

//Dashboard directive
app.directive('dashboardDirective', function () {
    return {
        templateUrl: 'directives/dashboard.html',
        controller: 'dashboardController'
    };
});
app.controller('dashboardController', ['$scope', '$http', 'tranSource', '$filter', function ($scope, $http, tranSource, $filter) {
    $scope.top5 = [];
    $scope.series = ['Income', 'Expense'];
    $scope.options = {
        scales: { yAxes: [{ display: false }] },
        responsive: false,
        colors: ['#75cc8c', '#f18880'],
        tooltips: {
            callbacks: {
                label: function (tooltipItems, data) {
                    return $filter('number')(tooltipItems.yLabel);
                }
            }
        }
    };
    $scope.quickAdd = () => {
        $scope.$parent.template.name = 'addEntry';
    };
    $http.get('registerService.php?mode=dashboard').then(function (response) {
        var scopeData = [], income = [], expense = [], labels = [];
        var barData = response.data.barData;
        angular.forEach(barData, function (v, k) {
            if (labels.indexOf(v.Month) < 0) {
                labels.push(v.Month);
                let exp = barData.filter((r) => r.isExpense == '1' && r.Month == v.Month);
                let inc = barData.filter((r) => r.isExpense == '0' && r.Month == v.Month);
                income.push(inc.length ? inc[0].Amount : 0);
                expense.push(exp.length ? exp[0].Amount : 0);
            }
        });
        $scope.labels = labels;
        $scope.data = [income, expense];
        $scope.barWidth = labels.length * 125;
        $scope.top5 = response.data.top5;
    });
}]);

//Register entry directive
app.directive('registerEntryDirective', function () {
    return {
        templateUrl: 'directives/registerEntryDirective.html',
        controller: 'registerEntryController'
    };
});
app.controller('registerEntryController', ['$scope', '$http', 'tranSource', function ($scope, $http, tranSource) {
    $scope.Source = tranSource;
    $scope.showCancel = false;
    $scope.saveEntry = function (entryId) {
        $scope.entry.EntryID = entryId;
        $http.post('registerService.php', { 'mode': $scope.showCancel == true ? 'update' : 'insert', 'entry': $scope.entry });
        if ($scope.showCancel) {
            $('#modalEdit').modal('hide');
            if ($scope.entries != undefined && $scope.editedId != undefined)
                $scope.entries[$scope.editedId] = $scope.entry
        }
        else {
            $scope.resetEntry();
            $('textarea').focus();
        }
    };
    $scope.resetEntry = function () {
        $scope.entry = {
            'EntryID': undefined,
            'Description': '',
            'Amount': undefined,
            'EntryDate': new Date(),
            'Source': '1',
            'IsExpense': true
        };
    }
    $scope.resetEntry();
}]);

//Register view directive
app.directive('viewEntriesDirective', function () {
    return {
        scope: {
            top5: '='
        },
        templateUrl: 'directives/viewEntriesDirective.html',
        controller: 'viewEntriesController'
    };
});
app.controller('viewEntriesController', ['$scope', '$http', 'tranSource', 'utility', '$timeout', function ($scope, $http, tranSource, utility, $timeout) {
    $scope.source = tranSource;
    let msg_del_confirm = "Are you sure to delete this record?";
    let getList = () => {
        if (angular.isDefined($scope.top5)) {
            $scope.entries = $scope.top5;
        }
        else {
            utility.loader('show');
            $http.get('registerService.php?mode=list').then(function (response) {
                $scope.entries = response.data;
                utility.loader('hide');
            });
        }
    };
    let deleteEntry = (entryId) => {
        $http.get('registerService.php?mode=delete&entryId=' + entryId).then(function (response) {
            $('#div' + entryId).remove();
            utility.closeModal();
        });
    };
    $scope.utility = utility;
    $scope.edit = (entry, index) => {
        $scope.showCancel = true;
        $scope.entry = {
            Description: entry.Description,
            Amount: eval(entry.Amount),
            EntryDate: new Date(entry.EntryDate),
            IsExpense: entry.IsExpense == '1',
            Source: entry.Source,
            EntryID: entry.EntryID
        };
        $scope.editedId = index;
        $('#modalEdit').modal('show');
    }
    $scope.quickAdd = () => {
        $scope.$parent.template.name = 'addEntry';
    };
    $scope.delete = (entryId) => {
        utility.confirm(msg_del_confirm, () => { deleteEntry(entryId); });
    }
    getList();
}]);

//Google import directive
app.directive('googleImportDirective', function () {
    return {
        templateUrl: 'directives/googleImportDirective.html',
        controller: 'googleImportController',
        link: function (scope, elem, attr) {
            //angular.element('<script src="../scripts/googlesheet.js"></script>').appendTo(elem);
        }
    };
});
app.controller('googleImportController', ['$scope', '$http', '$timeout', 'tranSource', function ($scope, $http, $timeout, tranSource) {
    $scope.message = "";
    $scope.gsheetData = [];
    $scope.importData = function () {
        debugger;
        var postData = [];
        var test = tranSource;
        $(':checkbox:checked').map(function () {
            var vlu = $scope.gsheetData[this.value];
            vlu.Mode = tranSource.filter(function (a) { return a.value.toLowerCase() == vlu.Mode })[0] | 1;
            postData.push(vlu);
        });
        $http.post('registerService.php', { 'mode': 'bulkInsert', 'entry': postData }).then(function (response) {
            setMessage("Import succeeded");
        });
    }

    var CLIENT_ID = '514289995274-7lu2meok547opdhobk1ltsd9c1dmdrtb.apps.googleusercontent.com';
    var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
    var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

    var authorizeButton = document.getElementById('authorize-button');
    var signoutButton = document.getElementById('signout-button');

    handleClientLoad();
    function handleClientLoad() {
        setMessage("Connecting to google sheets");
        gapi.load('client:auth2', initClient);
    }

    function initClient() {
        gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: CLIENT_ID,
            scope: SCOPES
        }).then(function () {
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        });
    }

    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            setMessage("Signed-in in google sheets");
            $('#signIn').hide();
            $('#signOut').show();
            fetchSheetData();
        } else {
            $('#signIn').show();
            $('#signOut').hide();
            setMessage("Please sign-in to import data");
        }
    }
    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }
    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
        $scope.gsheetData = [];
    }
    function appendPre(message) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
    }
    function setMessage(message) {
        $timeout(function () {
            $scope.$apply(function () {
                $scope.message = message;
            });
        }, 10);
    }
    function getEntryJSON(description, amount, date, mode) {
        return {
            'Date': date,
            'Amount': amount,
            'Mode': mode,
            'Description': description,
            'IsExpense': true
        };
    };
    function getRegister(range) {
        return getSheetWithRange(range).then(function (response) {
            if (response.result.values.length > 0) {
                var parsedEnties = [];
                for (i = 0; i < response.result.values.length; i++) {
                    var row = response.result.values[i];
                    parsedEnties.push(getEntryJSON(row[0], row[1], row[2], row[3]));
                }
                $scope.gsheetData = parsedEnties;
                setMessage("Entries found : " + parsedEnties.length);
                $scope.$apply();
            } else {
                setMessage("Sheets is blank. No data to load");
            }
        }, function (response) {
            setMessage("Connection failed: " + response.result.error.message);
        });
    }
    function getSheetWithRange(range) {
        if (gapi == undefined) setMessage('Unable to connect to Google API');
        return gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1S9ngRN7jWHbgClBnJ-JBwGU3EVhXwyUB2Om9NfPUaqk',
            range: range
        });
    }
    var fetchSheetData = function () {
        setMessage("Trying to fetch data from google sheet");
        var range = 'May 2017!H2:K';
        return getRegister(range);
    }
}]);