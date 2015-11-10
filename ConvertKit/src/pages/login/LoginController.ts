/// <reference path="../../libraries/custom/utilities/utilities.ts" />

module App
{
    export class LoginController
    {
        constructor()
        {
            this.RegisterKnockoutSubscriptions();
        }

        //#region Variables

        private KeyboardRect: Windows.Foundation.Rect;

        public IsLoading = ko.observable(false);

        public SecretKey = ko.observable("");

        private Service: ConvertKit.SubscriberService;

        //#endregion

        //#region Utility functions

        private RegisterKnockoutSubscriptions()
        {

        }

        private ShowErrorDialog = (message: string) =>
        {
            var dialog = new Windows.UI.Popups.MessageDialog(message, "Error");

            dialog.showAsync();
        };

        //#endregion

        //#region Page event handlers

        public HandleLoginEvent = (context, event) =>
        {
            if (!this.SecretKey())
            {
                this.ShowErrorDialog("You must enter a valid API key to continue.");

                return;
            }

            if (Main.Debug || this.SecretKey() === "-_DEBUG")
            {
                Main.Debug = true;

                WinJS.Navigation.navigate("ms-appx:///src/pages/home/home.html");

                return;
            }

            this.IsLoading(true);

            if (!this.Service)
            {
                this.Service = new ConvertKit.SubscriberService(this.SecretKey());
            }

            //Reset the API Key
            this.Service._SecretKey = this.SecretKey();

            //Try to pull in subscribers. If it fails, API key was incorrect.
            var getSubs = this.Service.GetAsync();

            var success = (resp: ConvertKit.Entities.SubscriberList) =>
            {
                //Save the key in localstorage
                App.Utils.LocalStorage.Save(Strings.SecretStorageKey, this.SecretKey());

                //Navigate to home page, passing along the subscriber list
                WinJS.Navigation.navigate("ms-appx:///src/pages/home/home.html", { SubscriberList: resp });
            };

            var fail = (reason) =>
            {
                console.log("Failed to get subscribers. Reason: ", reason);

                this.ShowErrorDialog("It looks like your secret key is invalid. Please try again.");
                this.IsLoading(false);
            };

            getSubs.done(success, fail);
        };

        //#endregion

        /**
        The page's id.
        */
        static get PageId()
        {
            return "Login";
        };

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {
            WinJS.UI.Pages.define("ms-appx:///src/pages/login/login.html", {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    var client = new LoginController();

                    //Track the current page
                    App.Main.CurrentPage(LoginController.PageId);

                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);

                    ko.applyBindings(client, element);
                },
                error: (err) =>
                {
                    alert("Error loading LoginController.");
                }
            });
        }
    }
}