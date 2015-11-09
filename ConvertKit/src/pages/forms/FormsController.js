var App;
(function (App) {
    var FormsController = (function () {
        function FormsController(state) {
            var _this = this;
            //#region Variables
            this.Service = new ConvertKit.FormService(App.Utils.LocalStorage.Retrieve(App.Strings.SecretStorageKey));
            this.IsLoading = ko.observable(true);
            this.Forms = ko.observableArray([]);
            this.HandleLoadSuccess = function (response) {
                _this.Forms.push.apply(_this.Forms, response.forms);
                _this.IsLoading(false);
            };
            this.HandleLoadFailure = function (error) {
                _this.IsLoading(false);
                App.Utils.ShowDialog("Error", "Failed to retrieve list of subscribers.");
            };
            //#endregion
            //#region Page event handlers
            /**
            Attaches or reattaches certain event listeners when the controller is constructed or reattached from the WinJS.Navigation.state.
            */
            this.Prepare = function () {
                //Listen for navigations away from this page
                WinJS.Navigation.onbeforenavigate = _this.HandleNavigateAway;
            };
            /**
            Stores the controller itself in WinJS.Navigation.state when navigating away, which lets us
            reattach when coming back, rather than recreating the controller.
            */
            this.HandleNavigateAway = function (event) {
                //Persist the current controller
                App.Main.State.FormsController = _this;
                //Remove this event listener until the controller is reattached.
                WinJS.Navigation.onbeforenavigate = null;
            };
            /**
            Handles refreshing the list of subscribers.
            */
            this.HandleRefreshEvent = function (context, event) {
                if (!_this.IsLoading()) {
                    _this.IsLoading(true);
                    _this.Service.GetAsync().done(_this.HandleLoadSuccess, _this.HandleLoadFailure);
                }
            };
            this.Prepare();
            this.RegisterKnockoutSubscriptions();
            if (state && state.FormsResponse) {
                this.HandleLoadSuccess(state.FormsResponse);
                return;
            }
            ;
            this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
        }
        //#endregion        
        //#region Utility functions
        FormsController.prototype.RegisterKnockoutSubscriptions = function () {
            this.IsLoading.subscribe(function (newValue) {
                var container = document.getElementById("subscriber-container");
                WinJS.UI.Animation.enterContent(container);
            });
        };
        Object.defineProperty(FormsController, "PageId", {
            //#endregion
            /**
            The page's id.
            */
            get: function () {
                return "Forms";
            },
            enumerable: true,
            configurable: true
        });
        ;
        /**
        Defines the controller's WinJS navigation functions.
        */
        FormsController.DefinePage = function () {
            WinJS.UI.Pages.define("ms-appx:///src/pages/forms/forms.html", {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client;
                    //A previous version of the FormsController may still be attached to the WinJS state.
                    if (App.Main.State.FormsController) {
                        client = App.Main.State.FormsController;
                        //Reattach event listeners, chiefly WinJS nav listeners that detach when navigating away.
                        client.Prepare();
                    }
                    else {
                        client = new FormsController(options);
                    }
                    //Track the current page
                    App.Main.CurrentPage(FormsController.PageId);
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading FormsController.");
                },
            });
        };
        return FormsController;
    })();
    App.FormsController = FormsController;
})(App || (App = {}));
//# sourceMappingURL=FormsController.js.map