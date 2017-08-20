//Google import directive
var googleImportController = ($scope, $http, $timeout, tranSource) => { 
    $scope.message = "";
    $scope.gsheetData = [];
    $scope.importData = function () {
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
}

googleImportController.$inject = ['$scope', '$http', '$timeout', 'tranSource'];
app.controller('googleImportController', googleImportController);
app.directive('googleImportDirective', function () {
    return {
        templateUrl: 'directives/googleImportDirective.html',
        controller: 'googleImportController',
        link: function (scope, elem, attr) {
        }
    };
});