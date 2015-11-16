/// <reference path="../../libraries/custom/utilities/utilities.ts" />

module App
{
    export class SettingsController
    {
        constructor()
        {
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

        /**
        A client restored from JSON does not contain observables or functions. Use this 
        function to merge and restore a previous controller state. This method requires that 
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        static MergeAndRestore = (lastState) =>
        {
            var client = new SettingsController();
 
            //Assign values from previous state.
            _.forOwn(lastState, (value, key) =>
            {
                var clientValue = client[key];

                if (ko.isObservable(clientValue))
                {
                    clientValue(value);

                    return;
                };

                client[key] = value;
            });

            return client;
        };

        //#endregion

        //#region Page event handlers

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
        The page's id. Must be identical to the name of the controller so it can be used from App[PageId].Method
        */
        static get PageId()
        {
            return "SettingsController";
        };

        /**
        The page's ms-appx URL.
        */
        static get PageAppxUrl()
        {
            return "ms-appx:///src/pages/settings/settings.html";
        };

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {
            WinJS.UI.Pages.define(SettingsController.PageAppxUrl, {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    //A previous version of the SettingsController may still be attached to the WinJS state.
                    var client = App.Main.State.SettingsController || new SettingsController();

                    //Track the current page
                    App.Main.CurrentPage(SettingsController.PageId);
                    App.Main.State.SettingsController = client;

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