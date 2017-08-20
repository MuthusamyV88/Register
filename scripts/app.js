$(document).ready(function () {
    $('.nav a:not(".dropdown-toggle")').click(function () {
        $('.navbar-toggle:visible').click();
    });
    $('body').on('click', function (e) {
        if (e.target.nodeName != 'IMG' && e.target.className.indexOf('selected') < 0)
            $('.bankSelector .lister').hide();
    });
});

function toggleDetail(status, caller) {
    var thisParent = $(caller).parent();
    var hiddenCols = thisParent.parent().parent().find('td.lHide');
    if (status == 'show') {
        hiddenCols.removeClass('hide');
        thisParent.find('i.fa-eye-slash').show();
    }
    else {
        hiddenCols.addClass('hide');
        thisParent.find('i.fa-eye').show();
    }
    $(caller).hide();
}

var app = angular.module('app', ['chart.js']);
app.controller('home', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
    $scope.name = "My Register";
    $scope.template = { "name": "dashboard" };
}]);
app.constant('tranSource', [
    { 'key': '1', 'value': 'Cash', 'icon': 'fa-inr', 'isDefault': true },
    { 'key': '2', 'value': 'Credit card', 'icon': 'fa-cc-mastercard' },
    { 'key': '3', 'value': 'Debit card', 'icon': 'fa-cc-visa' },
    { 'key': '4', 'value': 'Net banking', 'icon': 'fa-laptop' },
    { 'key': '1', 'value': 'HDFC', 'icon': 'images/hdfc.png', 'parentKey': ['2', '3', '4'] },
    { 'key': '2', 'value': 'ICICI', 'icon': 'images/icici.png', 'parentKey': ['2', '3', '4'], 'isDefault': true },
    { 'key': '3', 'value': 'SBI', 'icon': 'images/sbi.png', 'parentKey': ['2'] },
    { 'key': '4', 'value': 'IOB', 'icon': 'images/iob.png', 'parentKey': ['3', '4'] }
]);

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
            if ($scope.entries != undefined && $scope.editedId != undefined) {
                $scope.entries[$scope.editedKey][$scope.type][$scope.editedId] = $scope.entry;
                $scope.entries[$scope.editedKey].calculateTotal();
            }
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
            'CCsource': '1',
            'IsExpense': true,
            'Bank': undefined
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
app.filter('searchOn', () => {
    return (items, searchOn) => {
        if (searchOn == undefined || searchOn.trim() == '' || searchOn.length < 3) return items;
        var filtered = {};
        angular.forEach(items, (vlu, ky) => {
            var found = false;
            if (vlu.expense != undefined && vlu.expense.length)
                for (var i = 0; i < vlu.expense.length; i++) {
                    if (vlu.expense[i].Description.toLowerCase().indexOf(searchOn.toLowerCase()) >= 0) {
                        filtered[ky] = vlu;
                        found = true;
                        break;
                    }
                }
            if (vlu.income != undefined && vlu.income.length)
                for (var i = 0; i < vlu.income.length > 0 && !found; i++) {
                    if (vlu.income[i].Description.toLowerCase().indexOf(searchOn.toLowerCase()) >= 0) {
                        filtered[ky] = vlu;
                        break;
                    }
                }
        });
        return filtered;
    };
});
app.controller('viewEntriesController', ['$scope', '$http', 'tranSource', 'utility', '$timeout', function ($scope, $http, tranSource, utility, $timeout) {
    $scope.source = tranSource;
    let msg_del_confirm = "Are you sure to delete this record?";
    let getList = () => {
        if (angular.isDefined($scope.top5)) {
            $scope.showSearch = false;
            $scope.entries = groupResult($scope.top5);
        }
        else {
            utility.loader('show');
            $http.get('registerService.php?mode=list').then(function (response) {
                $scope.showSearch = response.data.length > 0;
                $scope.entries = groupResult(response.data);
                utility.loader('hide');
            });
        }
    };

    var calculateTotal = (groupedEntry) => {
        var totIncome = 0, totExpense = 0;
        angular.forEach(groupedEntry.expense, (val, key) => {
            totExpense += parseInt(val.Amount);
        });
        angular.forEach(groupedEntry.income, (val, key) => {
            totIncome += parseInt(val.Amount);
        });
        groupedEntry.totalExpense = totExpense;
        groupedEntry.totalIncome = totIncome;
    }

    let groupResult = (entries) => {
        var groupedResult = {};
        angular.forEach(entries, (vlu, key) => {
            if (groupedResult[vlu.EntryDate] == undefined)
                groupedResult[vlu.EntryDate] = {
                    'income': [],
                    'totalIncome': 0,
                    'expense': [],
                    'totalExpense': 0,
                    'key': key,
                    'date': vlu.EntryDate,
                    'calculateTotal': function () { calculateTotal(this); }
                };
            if (vlu.IsExpense == '1') {
                groupedResult[vlu.EntryDate].expense.push(vlu);
                groupedResult[vlu.EntryDate].totalExpense += parseInt(vlu.Amount);
            }
            else {
                groupedResult[vlu.EntryDate].income.push(vlu);
                groupedResult[vlu.EntryDate].totalIncome += parseInt(vlu.Amount);
            }
        });
        return groupedResult;
    };
    let deleteEntry = (key, index, type, id) => {
        $http.get('registerService.php?mode=delete&entryId=' + id).then(function (response) {
            $scope.entries[key][type].splice(index, 1);
            $scope.entries[key].calculateTotal();
            utility.closeModal();
        });
    };
    $scope.utility = utility;
    $scope.edit = (entry, key, index, type) => {
        $scope.showCancel = true;
        $scope.entry = {
            Description: entry.Description,
            Amount: eval(entry.Amount),
            EntryDate: new Date(entry.EntryDate),
            IsExpense: entry.IsExpense == '1',
            Source: entry.Source,
            Bank: entry.Bank,
            EntryID: entry.EntryID
        };
        $scope.editedId = index;
        $scope.editedKey = key;
        $scope.type = type;
        $('#modalEdit').modal('show');
    }
    $scope.quickAdd = () => {
        $scope.$parent.template.name = 'addEntry';
    };
    $scope.delete = (key, index, type, id) => {
        utility.confirm(msg_del_confirm, () => { deleteEntry(key, index, type, id); });
    }
    getList();
}]);

//Bank name selector directive
app.directive('ccBank', function () {
    return {
        scope: {
            'mode': '=mode',
            'selectedBank': '=?selectedBank'
        },
        templateUrl: 'directives/ccBankSelector.html',
        controller: 'ccBank',
        link: function ($scope, $elem, $attr) {
            $scope.thisElem = $elem[0];
            $scope.$watch('mode', function (val) {
                $scope.imgdata = $scope.tranSource.filter((elem) => { return elem.parentKey && elem.parentKey.indexOf($scope.mode) >= 0; });
                if ($scope.imgdata != undefined && $scope.imgdata.length > 0) {
                    var selected = $scope.selectedBank == undefined ? $scope.imgdata.filter((r) => { return r.isDefault == true; }) : [{ 'key': $scope.selectedBank }];
                    $scope.selected = selected != undefined && selected.length ? selected[0].key : $scope.imgdata[0].key;
                }
                else {
                    $scope.selected = $scope.selectedBank = undefined;
                }
            });
        }
    }
});
app.controller('ccBank', ['$scope', 'tranSource', function ($scope, tranSource) {
    $scope.tranSource = tranSource;
    $scope.toggleList = () => {
        var elem = angular.element($scope.thisElem.querySelector('#list'));
        var disProp = elem.css('display') == 'none' ? 'block' : 'none';
        elem.css('display', disProp);
    }
    $scope.selectBank = (key) => {
        $scope.selected = $scope.selectedBank = key;
        $scope.toggleList();
    }
}]);