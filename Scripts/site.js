//Message Div Id

var messageDivId = "#Message";

ko.bindingHandlers.selectedSearchOption = {
    init: function (element, valueAccessor, allBindings, data, context) {
        var $buttons, $element, observable, bindingContext;
        observable = valueAccessor();
        bindingContext = context;
        if(!ko.isWriteableObservable(observable)) {
            throw "you must pass an observable or writeable computed";
        }
        $element = $(element);
        $buttons = $(".btn", $element);

        $buttons.each(function() {
            var $btn, btn, btnValue;
            btn = this;
            $btn = $(btn);
            btnValue = $btn.attr("data-value");

            $btn.on("click", function () {
                observable(ko.utils.unwrapObservable(btnValue));
                bindingContext.$parent.currentPage(1);
                bindingContext.$parent.getData();
            });

            return ko.computed({
                disposeWhenNodeIsRemoved: btn,
                read: function () {
                    $btn.toggleClass("active", observable() === ko.utils.unwrapObservable(btnValue));
                }
            });
        });
    }
};

var SearchUI = function SearchUIF(defaultSelected) {

    var self = this;

    self.selected = ko.observable(defaultSelected);
    self.SearchTerm = ko.observable();
    
};

var GridUI = function GridUIF(config)
{
    var self = this;

    self.searchUI = ko.observable(new SearchUI(config.defaultSelected));
    self.rows = ko.observableArray([]);
    self.pages = ko.observableArray([]);
    self.currentPage = ko.observable(1);

    self.goToFirstPage = function() {
        self.currentPage(1);
        self.getData();
    };

    self.goToLastPage = function() {
        self.currentPage(self.pages().length);
        self.getData();
    };

    self.goToPrevPage = function() {
        if (self.currentPage() > 1) {
            self.currentPage(self.currentPage() - 1);
            self.getData();
        }
    };

    self.goToNextPage = function () {
        
        if(self.currentPage() < self.pages().length) {
            self.currentPage(self.currentPage() + 1);
            self.getData();
        }
        
    };

    self.goToPage = function (pageNumber) {
        self.currentPage(pageNumber);
        self.getData();
    };

    self.getData = function() {

        var filters = config.searchCriteria( self.searchUI().selected(), self.searchUI().SearchTerm(), self.currentPage());
        
        $.ajax({
            url: config.hostUrl,
            type: 'POST',
            data: ko.toJSON({ searchCriteria: filters }),
            contentType: 'application/json',
            success: function (result) {
                console.log(result);
                if(result.Success) {
                    var rowsArray = $.map(result.Data, function (data) {
                        return config.createRow(data);
                    });
                    self.rows(rowsArray);
                    if(result.TotalPages >= 1) {
                        self.pages.removeAll();
                        for (var i = 1; i <= result.TotalPages; i++) {
                            self.pages.push({ page: i });
                        }
                    }
                }else {
                    self.rows.removeAll();
                    self.pages.removeAll();
                }
            }
        });
    };

    self.getData();
};


var UpdateUI = function UpdateUIF(config) {
    
    var self = this;

    self.getSuccessMessage = function(message) {
       var userMessage =  message == ""
            ? ""
            : "<div class='alert alert-success'>" + message + "<button type='button' class='close' data-dismiss='alert'>x</button></div>";
        $(messageDivId).html(userMessage);
    };

    self.getErrorMessage = function(message) {
        var userMessage = message == ""
            ? ""
            : "<div class='alert alert-error'>" + message + "<button type='button' class='close' data-dismiss='alert'>x</button></div>";
        $(messageDivId).html(userMessage);
    };

    self.updateData = function() {
        console.log(config);
        $.ajax({
            url: config.hostUrl,
            type: 'POST',
            data: ko.toJSON({ model: config.params }),
            contentType: 'application/json',
            success: function (result) {
                console.log(result);
                result != null && result.Success
                    ? self.getSuccessMessage(result.SuccessMessage)
                    : self.getErrorMessage(result.FailureMessage);
                }
        });
    };

    self.updateData();
};


