module App
{
    export class FormsController
    {
        constructor(state?: { FormsResponse: ConvertKit.Entities.FormResponse })
        {
            this.Prepare();
            this.RegisterKnockoutSubscriptions();

            if (state && state.FormsResponse)
            {
                this.HandleLoadSuccess(state.FormsResponse);

                return;
            };

            this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
        }

        //#region Variables

        private Service = new ConvertKit.FormService(Utils.LocalStorage.Retrieve(Strings.SecretStorageKey));

        public IsLoading = ko.observable(true);

        public Forms = ko.observableArray<ConvertKit.Entities.Form>([]);

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

        private HandleLoadSuccess = (response: ConvertKit.Entities.FormResponse) =>
        {
            this.Forms.push.apply(this.Forms, response.forms);

            this.IsLoading(false);
        };

        private HandleLoadFailure = (error) =>
        {
            this.IsLoading(false);

            Utils.ShowDialog("Error", "Failed to retrieve list of subscribers.");
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
            App.Main.State.FormsController = this;

            //Remove this event listener until the controller is reattached.
            WinJS.Navigation.onbeforenavigate = null;
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

        //#endregion

        /**
        The page's id.
        */
        static get PageId()
        {
            return "Forms";
        };

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {
            WinJS.UI.Pages.define("ms-appx:///src/pages/forms/forms.html", {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    var client: FormsController;

                    //A previous version of the FormsController may still be attached to the WinJS state.
                    if (App.Main.State.FormsController)
                    {
                        client = App.Main.State.FormsController;

                        //Reattach event listeners, chiefly WinJS nav listeners that detach when navigating away.
                        client.Prepare();
                    }
                    else
                    {
                        client = new FormsController(options)
                    }

                    //Track the current page
                    App.Main.CurrentPage(FormsController.PageId);
                    
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);

                    ko.applyBindings(client, element);
                },
                error: (err) =>
                {
                    alert("Error loading FormsController.");
                },
            });
        }
    }
}