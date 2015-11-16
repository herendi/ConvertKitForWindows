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
                if (!_this.SecretKey()) {
                    _this.ShowErrorDialog("You must enter a valid API key to continue.");
                    return;
                }
                if (App.Main.Debug || _this.SecretKey() === "-_DEBUG") {
                    App.Main.Debug = true;
                    WinJS.Navigation.navigate("ms-appx:///src/pages/home/home.html");
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
                    App.Utils.LocalStorage.Save(App.Strings.SecretStorageKey, _this.SecretKey());
                    //Navigate to home page, passing along the subscriber list
                    WinJS.Navigation.navigate("ms-appx:///src/pages/home/home.html", { SubscriberList: resp });
                };
                var fail = function (reason) {
                    console.log("Failed to get subscribers. Reason: ", reason);
                    _this.ShowErrorDialog("It looks like your secret key is invalid. Please try again.");
                    _this.IsLoading(false);
                };
                getSubs.done(success, fail);
            };
            this.RegisterKnockoutSubscriptions();
        }
        //#endregion
        //#region Utility functions
        LoginController.prototype.RegisterKnockoutSubscriptions = function () {
        };
        Object.defineProperty(LoginController, "PageId", {
            //#endregion
            /**
            The page's id. Must be identical to the name of the controller so it can be used from App[PageId].Method
            */
            get: function () {
                return "LoginController";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(LoginController, "PageAppxUrl", {
            /**
            The page's ms-appx URL.
            */
            get: function () {
                return "ms-appx:///src/pages/login/login.html";
            },
            enumerable: true,
            configurable: true
        });
        /**
        Defines the controller's WinJS navigation functions.
        */
        LoginController.DefinePage = function () {
            WinJS.UI.Pages.define(LoginController.PageAppxUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = App.Main.State.LoginController || new LoginController();
                    //Track the current page
                    App.Main.CurrentPage(LoginController.PageId);
                    App.Main.State.LoginController = client;
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading LoginController.");
                }
            });
        };
        /**
        A client restored from JSON does not contain observables or functions. Use this
        function to merge and restore a previous controller state. This method requires that
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        LoginController.MergeAndRestore = function (lastState) {
            var client = new LoginController();
            //Assign values from previous state.
            _.forOwn(lastState, function (value, key) {
                var clientValue = client[key];
                if (ko.isObservable(clientValue)) {
                    clientValue(value);
                    return;
                }
                ;
                client[key] = value;
            });
            return client;
        };
        return LoginController;
    })();
    App.LoginController = LoginController;
})(App || (App = {}));
//# sourceMappingURL=LoginController.js.map