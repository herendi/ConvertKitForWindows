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
                App.Main.State.SettingsController = _this;
                //Remove this event listener until the controller is reattached.
                WinJS.Navigation.onbeforenavigate = null;
            };
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
            this.Prepare();
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
            The page's id.
            */
            get: function () {
                return "Settings";
            },
            enumerable: true,
            configurable: true
        });
        ;
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
                    //A previous version of the SettingsController may still be attached to the WinJS state.
                    if (App.Main.State.SettingsController) {
                        client = App.Main.State.SettingsController;
                        //Reattach event listeners, chiefly WinJS nav listeners that detach when navigating away.
                        client.Prepare();
                    }
                    else {
                        client = new SettingsController();
                    }
                    //Track the current page
                    App.Main.CurrentPage(SettingsController.PageId);
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