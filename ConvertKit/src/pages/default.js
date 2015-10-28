/// <reference path="../../typings/tsd.d.ts" />
var App;
(function (App) {
    var Main = (function () {
        function Main() {
        }
        Main._RegisterTimerTask = function () {
            var timerTaskName = "backgroundSourceCheckTask";
            var background = Windows.ApplicationModel.Background;
            var packageInfo = Windows.ApplicationModel.Package.current.id.version;
            var appVersion = "" + packageInfo.build + "." + packageInfo.major + "." + packageInfo.minor + "." + packageInfo.revision;
            var storageKey = "AppVersion";
            var versionMismatch = App.Utils.LocalStorage.Retrieve(storageKey) !== appVersion;
            var accessRemoved = false;
            //Save latest app version
            App.Utils.LocalStorage.Save(storageKey, appVersion);
            if (accessRemoved || !Main._TaskExists(timerTaskName)) {
                var handleDenied = function () {
                    // Display an error to the user telling them the app cannot give notifications. Only show this error once per app version.
                    if (versionMismatch) {
                        var dialog = new Windows.UI.Popups.MessageDialog("", "Background access denied.");
                        dialog.content = "This app has been denied access to your device's lock screen and therefore cannot use background tasks. Without background tasks, the app cannot notify you of new videos or current Twitch streams. Enable background access for this application by opening the app's settings, tapping or clicking Permissions and then enabling both Notifications and Lock Screen access.";
                        dialog.showAsync();
                    }
                };
                var success = function (result) {
                    if (result === background.BackgroundAccessStatus.denied) {
                        // Windows: Background activity and updates for this app are disabled by the user.
                        // Windows Phone: The maximum number of background apps allowed across the system has been reached or background activity and updates for this app are disabled by the user. 
                        handleDenied();
                    }
                    else if (result === background.BackgroundAccessStatus.unspecified) {
                        // The user didn't explicitly disable or enable access and updates. 
                        handleDenied();
                    }
                    else {
                        var builder = new background.BackgroundTaskBuilder();
                        var timeTrigger = new background.TimeTrigger(15, false);
                        var conditionTrigger = new background.SystemTrigger(background.SystemTriggerType.internetAvailable, false);
                        builder.name = timerTaskName;
                        builder.taskEntryPoint = "src\\libraries\\custom\\Tasks\\TimerTask.js";
                        builder.setTrigger(conditionTrigger);
                        builder.setTrigger(timeTrigger);
                        var task = builder.register();
                    }
                    ;
                };
                var error = function () {
                    handleDenied();
                };
                background.BackgroundExecutionManager.requestAccessAsync().done(success, error);
            }
        };
        Main._TaskExists = function (taskName) {
            var background = Windows.ApplicationModel.Background;
            var taskIterator = background.BackgroundTaskRegistration.allTasks.first();
            var taskExists = false;
            //Iterate over tasks (can't use lodash) to see if it's registered
            while (taskIterator.hasCurrent) {
                var task = taskIterator.current.value;
                if (task.name === taskName) {
                    taskExists = true;
                    break;
                }
                taskIterator.moveNext();
            }
            return taskExists;
        };
        /**
        A static string used as the storage key to save and retrieve the user's Secret Key.
        */
        Main.SecretStorageKey = "CK-Secret-Key";
        /**
        A boolean that switches the app to debug mode, no longer requiring a secret key.
        */
        Main.Debug = false;
        Main.Start = function () {
            var app = WinJS.Application;
            var activation = Windows.ApplicationModel.Activation;
            app.onactivated = function (args) {
                var view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
                var titleBar = view.titleBar;
                //Set the app's title bar colors
                var appColor = { r: 1, g: 93, b: 144, a: 1 };
                titleBar.backgroundColor = appColor;
                titleBar.buttonBackgroundColor = appColor;
                titleBar.inactiveBackgroundColor = appColor;
                titleBar.buttonInactiveBackgroundColor = appColor;
                titleBar.foregroundColor = Windows.UI.Colors.white;
                titleBar.buttonForegroundColor = Windows.UI.Colors.white;
                titleBar.inactiveForegroundColor = Windows.UI.Colors.white;
                titleBar.buttonInactiveForegroundColor = Windows.UI.Colors.white;
                //Define pages
                App.HomeController.DefinePage();
                App.LoginController.DefinePage();
                //Register tasks
                Main._RegisterTimerTask();
                if (args.detail.kind === activation.ActivationKind.launch) {
                    if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                    }
                    else {
                    }
                    //Process UI and navigate to the last location or home.
                    args.setPromise(WinJS.UI.processAll().then(function () {
                        //Check if the user has entered their API key
                        if (App.Utils.LocalStorage.Retrieve(App.Main.SecretStorageKey) || Main.Debug) {
                            return WinJS.Navigation.navigate(WinJS.Navigation.location || "ms-appx:///src/pages/home/home.html", WinJS.Navigation.state);
                        }
                        return WinJS.Navigation.navigate("ms-appx:///src/pages/login/login.html", WinJS.Navigation.state);
                    }));
                }
                ;
            };
            app.oncheckpoint = function (args) {
                // TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
                // You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
                // If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
            };
            app.start();
        };
        return Main;
    })();
    App.Main = Main;
})(App || (App = {}));
App.Main.Start();
//# sourceMappingURL=default.js.map