module App
{
    export class HomeController
    {
        constructor(state?: { SubscriberList: ConvertKit.Entities.SubscriberList })
        {
            this.Prepare();
            this.RegisterKnockoutSubscriptions();

            if (state && state.SubscriberList)
            {
                this.HandleLoadSuccess(state.SubscriberList);

                return;
            };

            this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
        }

        //#region Variables

        private Service = new ConvertKit.SubscriberService(Utils.LocalStorage.Retrieve(Main.SecretStorageKey));

        private KeyboardRect: Windows.Foundation.Rect;

        public SubscriberList = ko.observable<ConvertKit.Entities.SubscriberList>((<any>{}));

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
            this.SubscriberList(response);
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

                var output: ConvertKit.Entities.SubscriberList = {
                    page: 1,
                    subscribers: subs,
                    total_subscribers: subs.length,
                    total_pages: 1
                };

                this.SubscriberList(output);

                return;
            }

            Utils.ShowDialog("Error", "Failed to retrieve list of subscribers.");
        };

        public GravatarHash = (email: string) =>
        {
            return md5(email.toLowerCase().trim());
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
            //Extend the nav state to store the current sub list
            WinJS.Navigation.state = _.extend({}, WinJS.Navigation.state, { SubscriberList: this.SubscriberList(), HomeController: this });

            //Remove this event listener until the controller is reattached.
            WinJS.Navigation.onbeforenavigate = null;
        };

        public HandleAppBarUpdate = (context, element: HTMLElement) =>
        {
            //AppBars are kind of jerky, taking a bit to show up. Wait 1 second for it to get 
            //loaded into the dom, then slide it up.
            setTimeout(() =>
            {
                element.style.display = null;
                element.winControl.forceLayout();
                WinJS.UI.Animation.slideUp(element);
            }, 900);
        };

        /**
        Handles refreshing the list of subscribers.
        */
        public HandleRefreshEvent = (context, event) =>
        {
            if (!this.IsLoading())
            {
                this.IsLoading(true);

                this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
            }
        };

        /**
        Navigates the user to the settingspage.
        */
        public HandleNavigateToSettingsEvent = (context, event) =>
        {
            WinJS.Navigation.navigate("ms-appx:///src/pages/settings/settings.html");
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
                    var client: HomeController;

                    //A previous version of the HomeController may still be attached to the WinJS state.
                    if (WinJS.Navigation.state && WinJS.Navigation.state.HomeController)
                    {
                        client = WinJS.Navigation.state.HomeController

                        //Reattach event listeners, chiefly WinJS nav listeners that detach when navigating away.
                        client.Prepare();
                    }
                    else
                    {
                        client = new HomeController(options || WinJS.Navigation.state)
                    }
                    
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