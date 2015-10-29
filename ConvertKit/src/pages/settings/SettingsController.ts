/// <reference path="../../libraries/custom/utilities/utilities.ts" />

module App
{
    export class SettingsController
    {
        constructor()
        {
            //Show and listen to the back button.
            this.NavManager = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
            this.NavManager.appViewBackButtonVisibility = Windows.UI.Core.AppViewBackButtonVisibility.visible;
            this.NavManager.onbackrequested = this.HandleBackEvent;

            //Grab the app settings and populate the notifications values
            this.Notifications.Enabled(Main.NotificationSettings.Enabled());
            this.Notifications.Timer(Main.NotificationSettings.Timer());

            this.RegisterKnockoutSubscriptions();
        }

        //#region Variables

        private NavManager: Windows.UI.Core.SystemNavigationManager;

        public IsLoading = ko.observable(false);

        public Notifications = {
            Enabled: ko.observable(true),
            Timer: ko.observable(15),
        };

        //#endregion

        //#region Utility functions

        private RegisterKnockoutSubscriptions()
        {
            this.Notifications.Enabled.subscribe((newValue) =>
            {
                this.IsLoading(true);

                //Destroy the last timer task
                Main.DestroyTimerTask();

                //Save new settings
                Main.NotificationSettings.Enabled(newValue);

                if (newValue)
                {
                    var failed = (error) =>
                    {
                        Utils.ShowDialog("Could not change task recurrence timer.", error);
                    };

                    Main.CreateTimerTask(Main.NotificationSettings.ToUnobservable())
                        .done(() => this.IsLoading(false), failed);

                    return;
                }

                this.IsLoading(false);
            });

            this.Notifications.Timer.subscribe((newValue) =>
            {
                this.IsLoading(true);

                //Destroy the last timer task
                Main.DestroyTimerTask();

                //Save new settings
                Main.NotificationSettings.Timer(newValue);

                var failed = (error) =>
                {
                    Utils.ShowDialog("Could not change task recurrence timer.", error);
                };

                //Recreate the task with the new timer value.
                Main.CreateTimerTask(Main.NotificationSettings.ToUnobservable())
                    .done(() => this.IsLoading(false), failed);
            });
        }

        private ShowErrorDialog = (message: string) =>
        {
            var dialog = new Windows.UI.Popups.MessageDialog(message, "Error");

            dialog.showAsync();
        };

        //#endregion

        //#region Page event handlers

        public HandleBackEvent = (event) =>
        {
            //Hide the back button and remove the listener.
            this.NavManager.appViewBackButtonVisibility = Windows.UI.Core.AppViewBackButtonVisibility.collapsed;
            this.NavManager.onbackrequested = null;

            //WinJS handles the back button navigation itself, no need to do it here.
        }

        /**
        Handles signing out, which deletes the user's ConvertKit secret key from storage.
        */
        public HandleSignoutEvent = (context, event) =>
        {
            var confirmCommand = new Windows.UI.Popups.UICommand("Sign out", (command) =>
            {
                Utils.LocalStorage.Delete(Main.SecretStorageKey);

                //Send the user back to the login page.
                WinJS.Navigation.navigate("ms-appx:///src/pages/login/login.html", () =>
                {
                    //Erase the back stack
                    WinJS.Navigation.history = [];
                });
            });

            var cancelCommand = new Windows.UI.Popups.UICommand("Cancel");

            Utils.ShowDialog(
                "Are you sure you want to sign out?",
                "Signing out will erase your secret key from this app's storage. You'll need to enter it again to use ConvertKit for Windows.",
                [confirmCommand, cancelCommand]);
        };

        //#endregion

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {
            WinJS.UI.Pages.define("ms-appx:///src/pages/settings/settings.html", {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    var client = new SettingsController();

                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);

                    ko.applyBindings(client, element);
                },
                error: (err) =>
                {
                    alert("Error loading SettingsController.");
                }
            });
        }
    }
}