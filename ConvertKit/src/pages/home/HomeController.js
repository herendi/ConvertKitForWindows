var App;
(function (App) {
    var HomeController = (function () {
        function HomeController(state) {
            var _this = this;
            //#region Variables
            this.Service = new ConvertKit.SubscriberService(App.Utils.LocalStorage.Retrieve(App.Main.SecretStorageKey));
            this.TotalSubscribers = ko.observable(0);
            this.Subscribers = ko.observableArray([]);
            this.IsLoading = ko.observable(false);
            this.HandleLoadSuccess = function (response) {
                _.forEach(response.subscribers, function (x) {
                    x.email_address = "concealed-for-demo@example.com";
                });
                _this.TotalSubscribers(response.total_subscribers);
                _this.Subscribers.push.apply(_this.Subscribers, response.subscribers);
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
                    _this.Subscribers.push.apply(_this.Subscribers, subs);
                    _this.TotalSubscribers(subs.length);
                    return;
                }
                _this.ShowDialog("Error", "Failed to retrieve list of subscribers.");
            };
            this.ShowDialog = function (title, message, commands) {
                var dialog = new Windows.UI.Popups.MessageDialog(message, title);
                if (commands) {
                    dialog.commands.push.apply(dialog.commands, commands);
                }
                dialog.showAsync();
            };
            this.GravatarHash = function (email) {
                return md5(email.toLowerCase().trim());
            };
            //#endregion
            //#region Page event handlers
            this.HandleRefreshEvent = function (context, event) {
                if (!_this.IsLoading()) {
                    _this.IsLoading(true);
                    //Empty subscribers
                    _this.Subscribers([]);
                    _this.Service.GetAsync().done(_this.HandleLoadSuccess, _this.HandleLoadFailure);
                }
            };
            this.HandleSignoutEvent = function (context, event) {
                var confirmCommand = new Windows.UI.Popups.UICommand("Sign out", function (command) {
                    App.Utils.LocalStorage.Delete(App.Main.SecretStorageKey);
                    //Send the user back to the login page.
                    WinJS.Navigation.navigate("ms-appx:///src/pages/login/login.html");
                });
                var cancelCommand = new Windows.UI.Popups.UICommand("Cancel");
                _this.ShowDialog("Are you sure you want to sign out?", "Signing out will erase your secret key from this app's storage. You'll need to enter it again to use ConvertKit for Windows.", [confirmCommand, cancelCommand]);
            };
            this.RegisterKnockoutSubscriptions();
            if (state && state.LoginResult) {
                this.HandleLoadSuccess(state.LoginResult);
                return;
            }
            ;
            this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
        }
        //#endregion        
        //#region Utility functions
        HomeController.prototype.RegisterKnockoutSubscriptions = function () {
            this.IsLoading.subscribe(function (newValue) {
                var container = document.getElementById("subscriber-container");
                WinJS.UI.Animation.enterContent(container);
            });
        };
        //#endregion
        /**
        Defines the controller's WinJS navigation functions.
        */
        HomeController.DefinePage = function () {
            WinJS.UI.Pages.define("ms-appx:///src/pages/home/home.html", {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = new HomeController();
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading HomeController.");
                },
            });
        };
        return HomeController;
    })();
    App.HomeController = HomeController;
})(App || (App = {}));
//# sourceMappingURL=HomeController.js.map