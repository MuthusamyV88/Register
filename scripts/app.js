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
            $scope.entries = groupResult($scope.top5);
        }
        else {
            utility.loader('show');
            $http.get('registerService.php?mode=list').then(function (response) {
                $scope.entries = groupResult(response.data);
                utility.loader('hide');
            });
        }
    };

    let groupResult = (entries) => {
        var groupedResult = {};
        angular.forEach(entries, (vlu, key) => {
            if (groupedResult[vlu.EntryDate] == undefined)
                groupedResult[vlu.EntryDate] = { 'group': [], 'totalExpense': 0 };
            groupedResult[vlu.EntryDate].group.push(vlu);
            groupedResult[vlu.EntryDate].totalExpense += vlu.IsExpense == 1 ? vlu.Amount : 0;
        });
        return groupedResult;
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