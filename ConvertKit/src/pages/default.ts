/// <reference path="../../typings/tsd.d.ts" />

module App
{
    export class Main
    {
        /**
        Tries to get and return a background task with the given name.
        */
        static GetTask = (taskName: string) =>
        {
            var background = Windows.ApplicationModel.Background;
            var taskIterator = background.BackgroundTaskRegistration.allTasks.first();
            var taskExists = false;

            //Iterate over tasks (can't use lodash) to see if it's registered
            while (taskIterator.hasCurrent)
            {
                var task = taskIterator.current.value;

                if (task.name === taskName)
                {
                    return task;
                }

                taskIterator.moveNext();
            }

            return null;
        }

        /**
        Creates the background timer task if the given settings allow for it.
        */
        static CreateTimerTask = (settings: App.Entities.NotificationSettings) =>
        {
            return new WinJS.Promise((resolve, reject) =>
            {
                var background = Windows.ApplicationModel.Background;
                var packageInfo = Windows.ApplicationModel.Package.current.id.version;
                var appVersion = "" + packageInfo.build + "." + packageInfo.major + "." + packageInfo.minor + "." + packageInfo.revision;
                var storageKey = "AppVersion";
                var versionMismatch = App.Utils.LocalStorage.Retrieve(storageKey) !== appVersion;

                //Save latest app version
                App.Utils.LocalStorage.Save(storageKey, appVersion);

                if (settings.Enabled && !Main.GetTask(Main.TaskName))
                {
                    var handleDenied = () =>
                    {
                        var message = "Something went wrong and we could not gain access to background tasks. Please try again.";

                        // Display an error to the user telling them the app cannot give notifications. Only show this error once per app version.
                        if (versionMismatch)
                        {
                            message = "This app has been denied access to your device's lock screen and therefore cannot use background tasks. Without background tasks, the app cannot notify you of new videos or current Twitch streams. Enable background access for this application by opening the app's settings, tapping or clicking Permissions and then enabling both Notifications and Lock Screen access.";
                        }

                        reject(message);
                    };

                    var success = (result: Windows.ApplicationModel.Background.BackgroundAccessStatus) =>
                    {
                        if (result === background.BackgroundAccessStatus.denied)
                        {
                            // Windows: Background activity and updates for this app are disabled by the user.
                            // Windows Phone: The maximum number of background apps allowed across the system has been reached or background activity and updates for this app are disabled by the user
                            handleDenied();

                            return;
                        }

                        if (result === background.BackgroundAccessStatus.unspecified)
                        {
                            // The user didn't explicitly disable or enable access and updates. 
                            handleDenied();

                            return;
                        }

                        var builder = new background.BackgroundTaskBuilder();
                        var timeTrigger = new background.TimeTrigger(settings.Timer, false);
                        var conditionTrigger = new background.SystemTrigger(background.SystemTriggerType.internetAvailable, false);

                        builder.name = Main.TaskName;
                        builder.taskEntryPoint = "src\\libraries\\custom\\Tasks\\TimerTask.js";
                        builder.setTrigger(conditionTrigger);
                        builder.setTrigger(timeTrigger);

                        var task = builder.register();

                        resolve();
                    };
                    var error = () =>
                    {
                        handleDenied();
                    };

                    background.BackgroundExecutionManager.requestAccessAsync().done(success, error);

                    return;
                }

                resolve();
            });
        }

        /**
        Destroys the background timer task.
        */
        static DestroyTimerTask = () =>
        {
            var task = Main.GetTask(Main.TaskName);

            if (task)
            {
                task.unregister(true);
            }
        };

        /**
        A static string used as the app's background task name.
        */
        static TaskName = "backgroundSourceCheckTask";

        /**
        A static string used as the storage key to save and retrieve the user's Secret Key.
        */
        static SecretStorageKey = "CK-Secret-Key";

        /**
        A static string used as the storage key to retrieve the app's notification settings.
        */
        static NotificationSettingsKey = "CK-Notification-Settings";

        /**
        A boolean that switches the app to debug mode, no longer requiring a secret key.
        */
        static Debug = false;

        /**
        A private, static object used as the getter for Main.NotificationSettings.
        */
        private static _NotificationSettings: App.Entities.ObservableNotificationSettings;

        /**
        A static object representing the app's notification settings as observables. Automatically saves changes to app storage.
        */
        static get NotificationSettings()
        {
            if (!Main._NotificationSettings)
            {
                var settings: Entities.NotificationSettings = JSON.parse(Utils.LocalStorage.Retrieve(Main.NotificationSettingsKey) || "{}");

                //Set default settings if they don't exist.
                if (_.isEmpty(settings))
                {
                    settings = {
                        Enabled: true,
                        Timer: 60,
                    };

                    Utils.LocalStorage.Save(Main.NotificationSettingsKey, JSON.stringify(settings));
                };

                Main._NotificationSettings = {
                    Enabled: ko.observable(settings.Enabled),
                    Timer: ko.observable(settings.Timer),
                    ToUnobservable: function ()
                    {
                        return {
                            Enabled: this.Enabled(),
                            Timer: this.Timer(),
                        }
                    }
                };

                //Subscribe to changes that save the new values
                Main._NotificationSettings.Enabled.subscribe((newValue) =>
                {
                    var saved: Entities.NotificationSettings = {
                        Enabled: newValue,
                        Timer: Main._NotificationSettings.Timer()
                    };

                    Utils.LocalStorage.Save(Main.NotificationSettingsKey, JSON.stringify(saved));
                });

                Main._NotificationSettings.Timer.subscribe((newValue) =>
                {
                    var saved: Entities.NotificationSettings = {
                        Enabled: Main._NotificationSettings.Enabled(),
                        Timer: newValue,
                    };

                    Utils.LocalStorage.Save(Main.NotificationSettingsKey, JSON.stringify(saved));
                });
            }

            return Main._NotificationSettings;
        }

        static Start = () =>
        {
            var app = WinJS.Application;
            var activation = Windows.ApplicationModel.Activation;

            app.onactivated = function (args)
            {
                var view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
                var titleBar = view.titleBar;

                //Set the app's title bar colors
                var appColor = { r: 1, g: 93, b: 144, a: 1 };
                titleBar.backgroundColor = appColor
                titleBar.buttonBackgroundColor = appColor
                titleBar.inactiveBackgroundColor = appColor;
                titleBar.buttonInactiveBackgroundColor = appColor;
                titleBar.foregroundColor = Windows.UI.Colors.white;
                titleBar.buttonForegroundColor = Windows.UI.Colors.white;
                titleBar.inactiveForegroundColor = Windows.UI.Colors.white;
                titleBar.buttonInactiveForegroundColor = Windows.UI.Colors.white;

                //Define pages
                App.HomeController.DefinePage();
                App.LoginController.DefinePage();
                App.SettingsController.DefinePage();

                if (args.detail.kind === activation.ActivationKind.launch)
                {
                    if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated)
                    {
                        // This application has been newly launched. Initialize your application here.
                    }
                    else
                    {
                        // This application was suspended and then terminated.
                        // To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
                    }

                    var timerTaskFail = (error) =>
                    {
                        Utils.ShowDialog("Background access denied.", error);
                    };

                    //Process UI and navigate to the proper page.
                    var appFinalizationPromise = WinJS.UI.processAll()
                        .then(() => Main.CreateTimerTask(Main.NotificationSettings.ToUnobservable()))
                        .then(() =>
                        {
                            //Check if the user has entered their API key
                            if (Utils.LocalStorage.Retrieve(App.Main.SecretStorageKey) || Main.Debug)
                            {
                                return WinJS.Navigation.navigate(WinJS.Navigation.location || "ms-appx:///src/pages/home/home.html", WinJS.Navigation.state);
                            }

                            return WinJS.Navigation.navigate("ms-appx:///src/pages/login/login.html", WinJS.Navigation.state);
                        });

                    (<any>args).setPromise(appFinalizationPromise);
                };
            };

            app.oncheckpoint = function (args)
            {
                // TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
                // You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
                // If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
            };

            app.start();
        };
    }
}

App.Main.Start();