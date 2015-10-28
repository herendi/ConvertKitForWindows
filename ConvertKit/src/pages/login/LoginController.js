/// <reference path="../../libraries/custom/utilities/utilities.ts" />
var App;
(function (App) {
    var LoginController = (function () {
        function LoginController() {
            var _this = this;
            this.IsLoading = ko.observable(false);
            this.SecretKey = ko.observable("");
            this.ShowErrorDialog = function (message) {
                var dialog = new Windows.UI.Popups.MessageDialog(message, "Error");
                dialog.showAsync();
            };
            //#endregion
            //#region Page event handlers
            this.HandleLoginEvent = function (context, event) {
                if (App.Main.Debug) {
                    WinJS.Navigation.navigate("ms-appx:///src/pages/home/home.html");
                }
                if (!_this.SecretKey()) {
                    _this.ShowErrorDialog("You must enter a valid API key to continue.");
                    return;
                }
                _this.IsLoading(true);
                if (!_this.Service) {
                    _this.Service = new ConvertKit.SubscriberService(_this.SecretKey());
                }
                //Reset the API Key
                _this.Service._SecretKey = _this.SecretKey();
                //Try to pull in subscribers. If it fails, API key was incorrect.
                var getSubs = _this.Service.GetAsync();
                var success = function (resp) {
                    //Save the key in localstorage
                    App.Utils.LocalStorage.Save(App.Main.SecretStorageKey, _this.SecretKey());
                    //Navigate to home page, passing along the subscriber list
                    WinJS.Navigation.navigate("ms-appx:///src/pages/home/home.html", { LoginResult: resp });
                };
                var fail = function (reason) {
                    console.log("Failed to get subscribers. Reason: ", reason);
                    _this.ShowErrorDialog("It looks like your secret key is invalid. Please try again.");
                    _this.IsLoading(false);
                };
                getSubs.done(success, fail);
            };
            this.RegisterPageEvents();
            this.RegisterKnockoutSubscriptions();
        }
        //#endregion
        //#region Utility functions
        LoginController.prototype.RegisterPageEvents = function () {
        };
        LoginController.prototype.RegisterKnockoutSubscriptions = function () {
        };
        //#endregion
        /**
        Defines the controller's WinJS navigation functions.
        */
        LoginController.DefinePage = function () {
            WinJS.UI.Pages.define("ms-appx:///src/pages/login/login.html", {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = new LoginController();
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading LoginController.");
                }
            });
        };
        return LoginController;
    })();
    App.LoginController = LoginController;
})(App || (App = {}));
//# sourceMappingURL=LoginController.js.map