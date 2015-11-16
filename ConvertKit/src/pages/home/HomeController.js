var App;
(function (App) {
    var HomeController = (function () {
        function HomeController(state) {
            var _this = this;
            //#region Variables
            this.Service = new ConvertKit.SubscriberService(App.Utils.LocalStorage.Retrieve(App.Strings.SecretStorageKey));
            this.SubscriberList = ko.observable({});
            this.IsLoading = ko.observable(false);
            this.HandleLoadSuccess = function (response) {
                if (_.isEqual(_this.SubscriberList(), response) === false) {
                    _this.SubscriberList(response);
                }
                //Update live tiles on each refresh
                App.Utils.LiveTiles.UpdateAllTiles(response);
                _this.IsLoading(false);
            };
            this.HandleLoadFailure = function (error) {
                _this.IsLoading(false);
                if (App.Main.Debug) {
                    var subs = [];
                    //Build a fake list of subscribers
                    for (var i = 0; i < 20; i++) {
                        var sub = {
                            created_at: new Date(),
                            email_address: "concealed-for-demo@example.com",
                            first_name: "John Doe",
                            state: "confirmed"
                        };
                        subs.push(sub);
                    }
                    var output = {
                        page: 1,
                        subscribers: subs,
                        total_subscribers: subs.length,
                        total_pages: 1
                    };
                    _this.SubscriberList(output);
                    return;
                }
                App.Utils.ShowDialog("Error", "Failed to retrieve list of subscribers.");
            };
            this.GravatarHash = function (email) {
                return md5(email.toLowerCase().trim());
            };
            //#endregion
            //#region Page event handlers
            this.HandleAppBarUpdate = function (context, element) {
                //AppBars are kind of jerky, taking a bit to show up. Wait 1 second for it to get 
                //loaded into the dom, then slide it up.
                setTimeout(function () {
                    element.style.display = null;
                    element.winControl.forceLayout();
                    WinJS.UI.Animation.slideUp(element);
                }, 900);
            };
            /**
            Handles refreshing the list of subscribers.
            */
            this.HandleRefreshEvent = function (context, event) {
                if (!_this.IsLoading()) {
                    _this.IsLoading(true);
                    if (!App.Utils.HasInternetConnection()) {
                        App.Utils.ShowDialog("No internet connection", "It looks like your device does not have an active internet connection. Please try again.");
                        _this.IsLoading(false);
                        return;
                    }
                    _this.Service.GetAsync().done(_this.HandleLoadSuccess, _this.HandleLoadFailure);
                }
            };
            this.RegisterKnockoutSubscriptions();
            if (state && state.SubscriberList) {
                this.HandleLoadSuccess(state.SubscriberList);
                return;
            }
            ;
            //Load the subscribers
            this.HandleRefreshEvent();
        }
        //#endregion        
        //#region Utility functions
        HomeController.prototype.RegisterKnockoutSubscriptions = function () {
            this.IsLoading.subscribe(function (newValue) {
                var container = document.getElementById("subscriber-container");
                WinJS.UI.Animation.enterContent(container);
            });
        };
        Object.defineProperty(HomeController, "PageId", {
            //#endregion
            /**
            The page's id. Must be identical to the name of the controller so it can be used from App[PageId].Method
            */
            get: function () {
                return "HomeController";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(HomeController, "PageAppxUrl", {
            /**
            The page's ms-appx URL.
            */
            get: function () {
                return "ms-appx:///src/pages/home/home.html";
            },
            enumerable: true,
            configurable: true
        });
        /**
        Defines the controller's WinJS navigation functions.
        */
        HomeController.DefinePage = function () {
            WinJS.UI.Pages.define(HomeController.PageAppxUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    //A previous version of the HomeController may still be attached to the WinJS state.
                    var client = App.Main.State.HomeController || new HomeController(options);
                    //Track the current page
                    App.Main.CurrentPage(HomeController.PageId);
                    App.Main.State.HomeController = client;
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading HomeController.");
                },
            });
        };
        /**
        A client restored from JSON does not contain observables or functions. Use this
        function to merge and restore a previous controller state. This method requires that
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        HomeController.MergeAndRestore = function (lastState) {
            var client = new HomeController();
            //Assign values from previous state.
            _.forOwn(lastState, function (value, key) {
                var clientValue = client[key];
                if (ko.isObservable(clientValue)) {
                    clientValue(value);
                    return;
                }
                ;
                client[key] = value;
            });
            return client;
        };
        return HomeController;
    })();
    App.HomeController = HomeController;
})(App || (App = {}));
//# sourceMappingURL=HomeController.js.map