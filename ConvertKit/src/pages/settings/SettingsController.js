/// <reference path="../../libraries/custom/utilities/utilities.ts" />
var App;
(function (App) {
    var SettingsController = (function () {
        function SettingsController() {
            var _this = this;
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
            this.HandleBackEvent = function (event) {
                //Hide the back button and remove the listener.
                _this.NavManager.appViewBackButtonVisibility = Windows.UI.Core.AppViewBackButtonVisibility.collapsed;
                _this.NavManager.onbackrequested = null;
                //WinJS handles the back button navigation itself, no need to do it here.
            };
            /**
            Handles signing out, which deletes the user's ConvertKit secret key from storage.
            */
            this.HandleSignoutEvent = function (context, event) {
                var confirmCommand = new Windows.UI.Popups.UICommand("Sign out", function (command) {
                    App.Utils.LocalStorage.Delete(App.Main.SecretStorageKey);
                    //Send the user back to the login page.
                    WinJS.Navigation.navigate("ms-appx:///src/pages/login/login.html", function () {
                        //Erase the back stack
                        WinJS.Navigation.history = [];
                    });
                });
                var cancelCommand = new Windows.UI.Popups.UICommand("Cancel");
                App.Utils.ShowDialog("Are you sure you want to sign out?", "Signing out will erase your secret key from this app's storage. You'll need to enter it again to use ConvertKit for Windows.", [confirmCommand, cancelCommand]);
            };
            //Show and listen to the back button.
            this.NavManager = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
            this.NavManager.appViewBackButtonVisibility = Windows.UI.Core.AppViewBackButtonVisibility.visible;
            this.NavManager.onbackrequested = this.HandleBackEvent;
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
        //#endregion
        /**
        Defines the controller's WinJS navigation functions.
        */
        SettingsController.DefinePage = function () {
            WinJS.UI.Pages.define("ms-appx:///src/pages/settings/settings.html", {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = new SettingsController();
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading SettingsController.");
                }
            });
        };
        return SettingsController;
    })();
    App.SettingsController = SettingsController;
})(App || (App = {}));
//# sourceMappingURL=SettingsController.js.map