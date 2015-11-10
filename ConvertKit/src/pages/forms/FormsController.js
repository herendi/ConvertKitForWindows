var App;
(function (App) {
    var FormsController = (function () {
        function FormsController(state) {
            var _this = this;
            //#region Variables
            this.Service = new ConvertKit.FormService(App.Utils.LocalStorage.Retrieve(App.Strings.SecretStorageKey));
            this.IsLoading = ko.observable(true);
            this.Forms = ko.observableArray([]);
            this.HandleLoadSuccess = function (response) {
                _this.Forms.push.apply(_this.Forms, response.forms);
                _this.IsLoading(false);
            };
            this.HandleLoadFailure = function (error) {
                _this.IsLoading(false);
                if (App.Main.Debug) {
                    var forms = JSON.parse("[{\"id\":3772,\"name\":\"Home => SDH => Shopify Billing 101\",\"created_at\":\"2015-09-15T18:23:14Z\",\"type\":\"embed\",\"url\":\"https://app.convertkit.com/landing_pages/3772\",\"embed_js\":\"https://api.convertkit.com/v3/forms/3772.js\",\"embed_url\":\"https://api.convertkit.com/v3/forms/3772.html\",\"title\":\"Be one of the first to master Shopify development.\",\"description\":\"<p><strong>The Shopify Development Handbook isn't quite ready yet</strong>. While you wait, I put together this quick guide to help you get started with using the Shopify billing API to get paid for your apps.</p><p>All you need to do is enter your email and it'll pop straight into your inbox. <strong>You'll also be the first to know when the Shopify Development Handbook is ready.</strong></p>\",\"sign_up_button_text\":\"Send me the free guide!\",\"success_message\":\"Success! Please check your email for your free guide to the Shopify billing API.\"},{\"id\":3987,\"name\":\"Blog => SDH => Shopify Billing 101\",\"created_at\":\"2015-09-23T15:36:40Z\",\"type\":\"embed\",\"url\":\"https://app.convertkit.com/landing_pages/3987\",\"embed_js\":\"https://api.convertkit.com/v3/forms/3987.js\",\"embed_url\":\"https://api.convertkit.com/v3/forms/3987.html\",\"title\":\"Learn how to build rock solid Shopify apps with C# and ASP.NET!\",\"description\":\"<p>Did you enjoy this article? <strong>I'm writing a course for C# and ASP.NET developers, and it's all about building rock-solid Shopify apps from day one</strong>. </p><p>It's not quite ready yet, but if you enter your email here I'll send you this free guide to help you get started with using the Shopify billing API to get paid for your apps.</p><p><strong>You'll also be the first to know when the Shopify Development Handbook is ready.</strong></p>\",\"sign_up_button_text\":\"Send me the free guide!\",\"success_message\":\"Success! Now check your email to confirm your subscription. We'll send you your free guide to the Shopify billing API as soon as you're confirmed.\"},{\"id\":4377,\"name\":\"Embedded Landing => Shopify Billing 101\",\"created_at\":\"2015-10-05T14:08:29Z\",\"type\":\"embed\",\"url\":\"https://app.convertkit.com/landing_pages/4377\",\"embed_js\":\"https://api.convertkit.com/v3/forms/4377.js\",\"embed_url\":\"https://api.convertkit.com/v3/forms/4377.html\",\"title\":\"Enter your email address to get a free copy!\",\"description\":\"<p>Get your free copy of <strong>Shopify Billing 101: A Developer's Guide To Getting Paid.</strong></p><p>You'll also be the first to know when the Shopify Development Handbook is ready.</p>\",\"sign_up_button_text\":\"Send me the free guide!\",\"success_message\":\"Success! Now check your email to confirm your subscription. We'll send you your free guide to the Shopify billing API as soon as you're confirmed.\"},{\"id\":6735,\"name\":\"Home => SDH => SDH\",\"created_at\":\"2015-10-30T20:02:12Z\",\"type\":\"embed\",\"url\":\"https://app.convertkit.com/landing_pages/6735\",\"embed_js\":\"https://api.convertkit.com/v3/forms/6735.js\",\"embed_url\":\"https://api.convertkit.com/v3/forms/6735.html\",\"title\":\"Get a FREE sample chapter, including a production-ready ASP.NET project.\",\"description\":\"<p><strong>Enter your email address and I'll send you a free chapter from The Shopify Development Handbook. </strong></p><p>It'll walk you through the entire process of integrating your users' Shopify stores with your web app. </p><p>You'll also learn how to accept subscription payments from them through Shopify's billing API, without having to ask for a credit card.</p>\",\"sign_up_button_text\":\"Send me the free chapter!\",\"success_message\":\"Success! Please check your email for your free guide to the Shopify billing API.\"}]");
                    _this.Forms(forms);
                    return;
                }
                App.Utils.ShowDialog("Error", "Failed to retrieve list of subscribers.");
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
                App.Main.State.FormsController = _this;
                //Remove this event listener until the controller is reattached.
                WinJS.Navigation.onbeforenavigate = null;
            };
            /**
            Handles refreshing the list of subscribers.
            */
            this.HandleRefreshEvent = function (context, event) {
                if (!_this.IsLoading()) {
                    _this.IsLoading(true);
                    _this.Service.GetAsync().done(_this.HandleLoadSuccess, _this.HandleLoadFailure);
                }
            };
            this.Prepare();
            this.RegisterKnockoutSubscriptions();
            if (state && state.FormsResponse) {
                this.HandleLoadSuccess(state.FormsResponse);
                return;
            }
            ;
            this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
        }
        //#endregion        
        //#region Utility functions
        FormsController.prototype.RegisterKnockoutSubscriptions = function () {
            this.IsLoading.subscribe(function (newValue) {
                var container = document.getElementById("subscriber-container");
                WinJS.UI.Animation.enterContent(container);
            });
        };
        Object.defineProperty(FormsController, "PageId", {
            //#endregion
            /**
            The page's id.
            */
            get: function () {
                return "Forms";
            },
            enumerable: true,
            configurable: true
        });
        ;
        /**
        Defines the controller's WinJS navigation functions.
        */
        FormsController.DefinePage = function () {
            WinJS.UI.Pages.define("ms-appx:///src/pages/forms/forms.html", {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client;
                    //A previous version of the FormsController may still be attached to the WinJS state.
                    if (App.Main.State.FormsController) {
                        client = App.Main.State.FormsController;
                        //Reattach event listeners, chiefly WinJS nav listeners that detach when navigating away.
                        client.Prepare();
                    }
                    else {
                        client = new FormsController(options);
                    }
                    //Track the current page
                    App.Main.CurrentPage(FormsController.PageId);
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading FormsController.");
                },
            });
        };
        return FormsController;
    })();
    App.FormsController = FormsController;
})(App || (App = {}));
//# sourceMappingURL=FormsController.js.map