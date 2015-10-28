module App
{
    export class HomeController
    {
        constructor(state?: { LoginResult: ConvertKit.Entities.SubscriberList })
        {
            this.RegisterKnockoutSubscriptions();

            if (state && state.LoginResult)
            {
                this.HandleLoadSuccess(state.LoginResult);

                return;
            };

            this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
        }

        //#region Variables

        private Service = new ConvertKit.SubscriberService(Utils.LocalStorage.Retrieve(Main.SecretStorageKey));

        private KeyboardRect: Windows.Foundation.Rect;

        public TotalSubscribers = ko.observable(0);

        public Subscribers = ko.observableArray<ConvertKit.Entities.Subscriber>([]);

        public IsLoading = ko.observable(false);

        //#endregion        

        //#region Utility functions

        private RegisterKnockoutSubscriptions()
        {
            this.IsLoading.subscribe((newValue) =>
            {
                var container = document.getElementById("subscriber-container");
                WinJS.UI.Animation.enterContent(container);
            });
        }

        private HandleLoadSuccess = (response: ConvertKit.Entities.SubscriberList) =>
        {
            _.forEach(response.subscribers, x =>
            {
                x.email_address = "concealed-for-demo@example.com"
            });

            this.TotalSubscribers(response.total_subscribers);
            this.Subscribers.push.apply(this.Subscribers, response.subscribers);
            this.IsLoading(false);
        };

        private HandleLoadFailure = (error) =>
        {
            this.IsLoading(false);

            if (Main.Debug)
            {
                var subs: ConvertKit.Entities.Subscriber[] = [];

                //Build a fake list of subscribers
                for (var i = 0; i < 20; i++)
                {
                    var sub: ConvertKit.Entities.Subscriber = {
                        created_at: new Date(),
                        email_address: "concealed-for-demo@example.com",
                        first_name: "John Doe",
                        state: "confirmed"
                    };

                    subs.push(sub);
                }

                this.Subscribers.push.apply(this.Subscribers, subs);
                this.TotalSubscribers(subs.length);

                return;
            }

            this.ShowDialog("Error", "Failed to retrieve list of subscribers.");
        };

        private ShowDialog = (title: string, message: string, commands?: Windows.UI.Popups.IUICommand[]) =>
        {
            var dialog = new Windows.UI.Popups.MessageDialog(message, title);

            if (commands)
            {
                dialog.commands.push.apply(dialog.commands, commands);
            }

            dialog.showAsync();
        };

        public GravatarHash = (email: string) =>
        {
            return md5(email.toLowerCase().trim());
        };

        //#endregion

        //#region Page event handlers

        public HandleRefreshEvent = (context, event) =>
        {
            if (!this.IsLoading())
            {
                this.IsLoading(true);

                //Empty subscribers
                this.Subscribers([]);

                this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
            }
        };

        public HandleSignoutEvent = (context, event) =>
        {
            var confirmCommand = new Windows.UI.Popups.UICommand("Sign out", (command) =>
            {
                Utils.LocalStorage.Delete(Main.SecretStorageKey);

                //Send the user back to the login page.
                WinJS.Navigation.navigate("ms-appx:///src/pages/login/login.html");
            });

            var cancelCommand = new Windows.UI.Popups.UICommand("Cancel");

            this.ShowDialog(
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
            WinJS.UI.Pages.define("ms-appx:///src/pages/home/home.html", {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    var client = new HomeController();

                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);

                    ko.applyBindings(client, element);
                },
                error: (err) =>
                {
                    alert("Error loading HomeController.");
                },
            });
        }
    }
}