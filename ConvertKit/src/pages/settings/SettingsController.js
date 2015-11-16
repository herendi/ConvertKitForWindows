/// <reference path="../../libraries/custom/utilities/utilities.ts" />
var App;
(function (App) {
    var SettingsController = (function () {
        function SettingsController() {
            this.IsLoading = ko.observable(false);
            this.Notifications = {
                Enabled: ko.observable(true),
                Timer: ko.observable(15),
            };
            this.ShowErrorDialog = function (message) {
                var dialog = new Windows.UI.Popups.MessageDialog(message, "Error");
                dialog.showAsync();
            };
            //#endregion
            //#region Page event handlers
            /**
            Handles signing out, which deletes the user's ConvertKit secret key from storage.
            */
            this.HandleSignoutEvent = function (context, event) {
                var confirmCommand = new Windows.UI.Popups.UICommand("Sign out", function (command) {
                    App.Utils.LocalStorage.Delete(App.Strings.SecretStorageKey);
                    //Send the user back to the login page.
                    WinJS.Navigation.navigate("ms-appx:///src/pages/login/login.html").done(function () {
                        //Erase the back stack
                        WinJS.Navigation.history = [];
                        //Destroy any persisted controllers, which retain secret keys and subscriber data.
                        App.Main.State.FormsController = null;
                        App.Main.State.HomeController = null;
                        App.Main.State.LoginController = null;
                        App.Main.State.SettingsController = null;
                    });
                });
                var cancelCommand = new Windows.UI.Popups.UICommand("Cancel");
                App.Utils.ShowDialog("Are you sure you want to sign out?", "Signing out will erase your secret key from this app's storage. You'll need to enter it again to use ConvertKit for Windows.", [confirmCommand, cancelCommand]);
            };
            //Grab the app settings and populate the notifications values
            this.Notifications.Enabled(App.Main.NotificationSettings.Enabled());
            this.Notifications.Timer(App.Main.NotificationSettings.Timer());
            this.RegisterKnockoutSubscriptions();
        }
        //#endregion
        //#region Utility functions
        SettingsController.prototype.RegisterKnockoutSubscriptions = function () {
            var _this = this;
            this.Notifications.Enabled.subscribe(function (newValue) {
                _this.IsLoading(true);
                //Destroy the last timer task
                App.Main.DestroyTimerTask();
                //Save new settings
                App.Main.NotificationSettings.Enabled(newValue);
                if (newValue) {
                    var failed = function (error) {
                        App.Utils.ShowDialog("Could not change task recurrence timer.", error);
                    };
                    App.Main.CreateTimerTask(App.Main.NotificationSettings.ToUnobservable())
                        .done(function () { return _this.IsLoading(false); }, failed);
                    return;
                }
                _this.IsLoading(false);
            });
            this.Notifications.Timer.subscribe(function (newValue) {
                _this.IsLoading(true);
                //Destroy the last timer task
                App.Main.DestroyTimerTask();
                //Save new settings
                App.Main.NotificationSettings.Timer(newValue);
                var failed = function (error) {
                    App.Utils.ShowDialog("Could not change task recurrence timer.", error);
                };
                //Recreate the task with the new timer value.
                App.Main.CreateTimerTask(App.Main.NotificationSettings.ToUnobservable())
                    .done(function () { return _this.IsLoading(false); }, failed);
            });
        };
        Object.defineProperty(SettingsController, "PageId", {
            //#endregion
            /**
            The page's id. Must be identical to the name of the controller so it can be used from App[PageId].Method
            */
            get: function () {
                return "SettingsController";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(SettingsController, "PageAppxUrl", {
            /**
            The page's ms-appx URL.
            */
            get: function () {
                return "ms-appx:///src/pages/settings/settings.html";
            },
            enumerable: true,
            configurable: true
        });
        ;
        /**
        Defines the controller's WinJS navigation functions.
        */
        SettingsController.DefinePage = function () {
            WinJS.UI.Pages.define(SettingsController.PageAppxUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    //A previous version of the SettingsController may still be attached to the WinJS state.
                    var client = App.Main.State.SettingsController || new SettingsController();
                    //Track the current page
                    App.Main.CurrentPage(SettingsController.PageId);
                    App.Main.State.SettingsController = client;
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading SettingsController.");
                }
            });
        };
        /**
        A client restored from JSON does not contain observables or functions. Use this
        function to merge and restore a previous controller state. This method requires that
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        SettingsController.MergeAndRestore = function (lastState) {
            var client = new SettingsController();
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
        return SettingsController;
    })();
    App.SettingsController = SettingsController;
})(App || (App = {}));
//# sourceMappingURL=SettingsController.js.map