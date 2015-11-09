/// <reference path="../../libraries/custom/utilities/utilities.ts" />

module App
{
    export class SettingsController
    {
        constructor()
        {
            this.Prepare();

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

        /**
        Attaches or reattaches certain event listeners when the controller is constructed or reattached from the WinJS.Navigation.state.
        */
        public Prepare = () =>
        {   
            //Listen for navigations away from this page
            WinJS.Navigation.onbeforenavigate = this.HandleNavigateAway;
        };

        /**
        Stores the controller itself in WinJS.Navigation.state when navigating away, which lets us 
        reattach when coming back, rather than recreating the controller.
        */
        public HandleNavigateAway = (event) =>
        {
            //Persist the current controller
            App.Main.State.SettingsController = this;

            //Remove this event listener until the controller is reattached.
            WinJS.Navigation.onbeforenavigate = null;
        };

        /**
        Handles signing out, which deletes the user's ConvertKit secret key from storage.
        */
        public HandleSignoutEvent = (context, event) =>
        {
            var confirmCommand = new Windows.UI.Popups.UICommand("Sign out", (command) =>
            {
                Utils.LocalStorage.Delete(Strings.SecretStorageKey);

                //Send the user back to the login page.
                WinJS.Navigation.navigate("ms-appx:///src/pages/login/login.html").done(() =>
                {
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

            Utils.ShowDialog(
                "Are you sure you want to sign out?",
                "Signing out will erase your secret key from this app's storage. You'll need to enter it again to use ConvertKit for Windows.",
                [confirmCommand, cancelCommand]);
        };

        //#endregion

        /**
        The page's id.
        */
        static get PageId()
        {
            return "Settings";
        };

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

                    //A previous version of the SettingsController may still be attached to the WinJS state.
                    if (App.Main.State.SettingsController)
                    {
                        client = App.Main.State.SettingsController

                        //Reattach event listeners, chiefly WinJS nav listeners that detach when navigating away.
                        client.Prepare();
                    }
                    else
                    {
                        client = new SettingsController()
                    }

                    //Track the current page
                    App.Main.CurrentPage(SettingsController.PageId);

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