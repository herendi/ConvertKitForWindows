module App
{
    export class FormsController
    {
        constructor(state?: { FormsResponse: ConvertKit.Entities.FormResponse })
        {
            this.RegisterKnockoutSubscriptions();

            if (state && state.FormsResponse)
            {
                this.HandleLoadSuccess(state.FormsResponse);

                return;
            };

            //Load the forms
            this.HandleRefreshEvent();
        }

        //#region Variables

        private Service = new ConvertKit.FormService(Utils.LocalStorage.Retrieve(Strings.SecretStorageKey));

        public Forms = ko.observableArray<ConvertKit.Entities.Form>([]);

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

        private HandleLoadSuccess = (response: ConvertKit.Entities.FormResponse) =>
        {
            this.Forms([]);
            this.Forms.push.apply(this.Forms, response.forms);

            this.IsLoading(false);
        };

        private HandleLoadFailure = (error) =>
        {
            this.IsLoading(false);

            if (Main.Debug)
            {
                var forms: ConvertKit.Entities.Form[] = JSON.parse("[{\"id\":3772,\"name\":\"Home => SDH => Shopify Billing 101\",\"created_at\":\"2015-09-15T18:23:14Z\",\"type\":\"embed\",\"url\":\"https://app.convertkit.com/landing_pages/3772\",\"embed_js\":\"https://api.convertkit.com/v3/forms/3772.js\",\"embed_url\":\"https://api.convertkit.com/v3/forms/3772.html\",\"title\":\"Be one of the first to master Shopify development.\",\"description\":\"<p><strong>The Shopify Development Handbook isn't quite ready yet</strong>. While you wait, I put together this quick guide to help you get started with using the Shopify billing API to get paid for your apps.</p><p>All you need to do is enter your email and it'll pop straight into your inbox. <strong>You'll also be the first to know when the Shopify Development Handbook is ready.</strong></p>\",\"sign_up_button_text\":\"Send me the free guide!\",\"success_message\":\"Success! Please check your email for your free guide to the Shopify billing API.\"},{\"id\":3987,\"name\":\"Blog => SDH => Shopify Billing 101\",\"created_at\":\"2015-09-23T15:36:40Z\",\"type\":\"embed\",\"url\":\"https://app.convertkit.com/landing_pages/3987\",\"embed_js\":\"https://api.convertkit.com/v3/forms/3987.js\",\"embed_url\":\"https://api.convertkit.com/v3/forms/3987.html\",\"title\":\"Learn how to build rock solid Shopify apps with C# and ASP.NET!\",\"description\":\"<p>Did you enjoy this article? <strong>I'm writing a course for C# and ASP.NET developers, and it's all about building rock-solid Shopify apps from day one</strong>. </p><p>It's not quite ready yet, but if you enter your email here I'll send you this free guide to help you get started with using the Shopify billing API to get paid for your apps.</p><p><strong>You'll also be the first to know when the Shopify Development Handbook is ready.</strong></p>\",\"sign_up_button_text\":\"Send me the free guide!\",\"success_message\":\"Success! Now check your email to confirm your subscription. We'll send you your free guide to the Shopify billing API as soon as you're confirmed.\"},{\"id\":4377,\"name\":\"Embedded Landing => Shopify Billing 101\",\"created_at\":\"2015-10-05T14:08:29Z\",\"type\":\"embed\",\"url\":\"https://app.convertkit.com/landing_pages/4377\",\"embed_js\":\"https://api.convertkit.com/v3/forms/4377.js\",\"embed_url\":\"https://api.convertkit.com/v3/forms/4377.html\",\"title\":\"Enter your email address to get a free copy!\",\"description\":\"<p>Get your free copy of <strong>Shopify Billing 101: A Developer's Guide To Getting Paid.</strong></p><p>You'll also be the first to know when the Shopify Development Handbook is ready.</p>\",\"sign_up_button_text\":\"Send me the free guide!\",\"success_message\":\"Success! Now check your email to confirm your subscription. We'll send you your free guide to the Shopify billing API as soon as you're confirmed.\"},{\"id\":6735,\"name\":\"Home => SDH => SDH\",\"created_at\":\"2015-10-30T20:02:12Z\",\"type\":\"embed\",\"url\":\"https://app.convertkit.com/landing_pages/6735\",\"embed_js\":\"https://api.convertkit.com/v3/forms/6735.js\",\"embed_url\":\"https://api.convertkit.com/v3/forms/6735.html\",\"title\":\"Get a FREE sample chapter, including a production-ready ASP.NET project.\",\"description\":\"<p><strong>Enter your email address and I'll send you a free chapter from The Shopify Development Handbook. </strong></p><p>It'll walk you through the entire process of integrating your users' Shopify stores with your web app. </p><p>You'll also learn how to accept subscription payments from them through Shopify's billing API, without having to ask for a credit card.</p>\",\"sign_up_button_text\":\"Send me the free chapter!\",\"success_message\":\"Success! Please check your email for your free guide to the Shopify billing API.\"}]");

                this.Forms(forms);

                return;
            }

            Utils.ShowDialog("Error", "Failed to retrieve list of subscribers.");
        };

        /**
        A client restored from JSON does not contain observables or functions. Use this 
        function to merge and restore a previous controller state. This method requires that 
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        static MergeAndRestore = (lastState) =>
        {
            var client = new FormsController();
 
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
        Handles refreshing the list of forms.
        */
        public HandleRefreshEvent = (context?, event?) =>
        {
            if (!this.IsLoading())
            {
                this.IsLoading(true);

                if (!Utils.HasInternetConnection())
                {
                    Utils.ShowDialog("No internet connection", "It looks like your device does not have an active internet connection. Please try again.");

                    this.IsLoading(false);

                    return;
                }

                this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
            }
        };

        //#endregion

        /**
        The page's id. Must be identical to the name of the controller so it can be used from App[PageId].Method
        */
        static get PageId()
        {
            return "FormsController";
        };

        /**
        The page's ms-appx URL.
        */
        static get PageAppxUrl()
        {
            return "ms-appx:///src/pages/forms/forms.html";
        };

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {
            WinJS.UI.Pages.define(FormsController.PageAppxUrl, {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    //A previous version of the FormsController may still be attached to the WinJS state.
                    var client = App.Main.State.FormsController || new FormsController(options);

                    //Track the current page
                    App.Main.CurrentPage(FormsController.PageId);
                    App.Main.State.FormsController = client;
                    
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