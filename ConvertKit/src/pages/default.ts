﻿/// <reference path="../../typings/tsd.d.ts" />

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

                if (settings.Enabled && !Main.GetTask(Strings.TaskName))
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

                        builder.name = Strings.TaskName;
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
            var task = Main.GetTask(Strings.TaskName);

            if (task)
            {
                task.unregister(true);
            }
        };

        /**
        A boolean that switches the app to debug mode, no longer requiring a secret key.
        */
        static Debug = false;

        /**
        A private, static object used as the getter for Strings.NotificationSettings.
        */
        private static _NotificationSettings: App.Entities.ObservableNotificationSettings;

        /**
        A static object representing the app's notification settings as observables. Automatically saves changes to app storage.
        */
        static get NotificationSettings()
        {
            if (!Main._NotificationSettings)
            {
                var settings: Entities.NotificationSettings = JSON.parse(Utils.LocalStorage.Retrieve(Strings.NotificationSettingsKey) || "{}");

                //Set default settings if they don't exist.
                if (_.isEmpty(settings))
                {
                    settings = {
                        Enabled: true,
                        Timer: 60,
                    };

                    Utils.LocalStorage.Save(Strings.NotificationSettingsKey, JSON.stringify(settings));
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

                    Utils.LocalStorage.Save(Strings.NotificationSettingsKey, JSON.stringify(saved));
                });

                Main._NotificationSettings.Timer.subscribe((newValue) =>
                {
                    var saved: Entities.NotificationSettings = {
                        Enabled: Main._NotificationSettings.Enabled(),
                        Timer: newValue,
                    };

                    Utils.LocalStorage.Save(Strings.NotificationSettingsKey, JSON.stringify(saved));
                });
            }

            return Main._NotificationSettings;
        }

        /**
        A static and magical object that persists controller states when navigating. Better than WinJS.navigation.state, which only works when using .back or .forward.
        */
        static State: {
            LoginController?: App.LoginController;
            HomeController?: App.HomeController;
            FormsController?: App.FormsController;
            SettingsController?: App.SettingsController;
        } = {};

        /**
Tracks the name of the current page controller.
*/
        static CurrentPage = ko.observable<string>();

        /**
        Starts the application
        */
        static Start = () =>
        {
            var app = WinJS.Application;
            var activation = Windows.ApplicationModel.Activation;
            var state = activation.ApplicationExecutionState;

            app.onactivated = function (args)
            {
                //Get the last execution state
                var execState: Windows.ApplicationModel.Activation.ApplicationExecutionState = args.detail.previousExecutionState;

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
                _.forOwn(App, (value, key) =>
                {
                    if (_.has(value, "DefinePage"))
                    {
                        value.DefinePage();
                    }
                });
                //App.HomeController.DefinePage();
                //App.FormsController.DefinePage();
                //App.LoginController.DefinePage();
                //App.SettingsController.DefinePage();

                if (args.detail.kind === activation.ActivationKind.launch)
                {
                    //Begin processing UI.
                    var appPromise = WinJS.UI
                        .processAll()
                        .then(() => Main.CreateTimerTask(Main.NotificationSettings.ToUnobservable()));
                    
                    //Check the last execution state. Initialize the app if it was not running or closed by user. Else restore state. 
                    if (execState !== state.notRunning && execState !== state.closedByUser && execState !== state.terminated)
                    { 
                        // Application was previously running. Do not reapply KO bindings or an exception will be thrown. 
                    }
                    else
                    {
                        //Apply page-level bindings to app. Will not trump view-specific bindings thanks to the custom stopBinding binding.
                        ko.applyBindings(this);

                        if (execState === activation.ApplicationExecutionState.terminated && WinJS.Application.sessionState.Main)
                        {
                            //Restore application state
                            Main.State = JSON.parse(WinJS.Application.sessionState.Main.StateJSON);
                            Main.CurrentPage(WinJS.Application.sessionState.Main.LastPage);

                            _.forOwn(Main.State, (value, key) =>
                            {
                                try
                                {
                                    if (_.has(App[key], "MergeAndRestore"))
                                    {
                                        Main.State[key] = new App[key].MergeAndRestore(value);
                                    };
                                }
                                catch (e)
                                {
                                    //Delete the value from state. If app fails to recreate state, it can recover by creating a new controller from scratch.
                                    Main.State[key] = null;
                                }
                            });
                        }
                        else
                        {
                            //Initialize the application
                        }

                        //Navigate to the home page
                        appPromise = appPromise
                            .then(() =>
                            {
                                //Check if the user has entered their API key
                                if (Utils.LocalStorage.Retrieve(App.Strings.SecretStorageKey) || Main.Debug)
                                {
                                    //Navigate to the last known page if available, else go to home.
                                    return WinJS.Navigation.navigate(Main.CurrentPage() ? App[Main.CurrentPage()].PageAppxUrl : HomeController.PageAppxUrl, WinJS.Navigation.state);
                                }
                                
                                //Navigate to the login controller.
                                return WinJS.Navigation.navigate(LoginController.PageAppxUrl, WinJS.Navigation.state);
                            }, (error) => Utils.ShowDialog("Background access denied.", error));
                    };

                    (<any>args).setPromise(appPromise);
                };
            };

            app.oncheckpoint = function (args)
            {
                // TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
                // You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
                // If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().

                //Preserve applictaion state to restore later.
                WinJS.Application.sessionState.Main = {
                    StateJSON: ko.toJSON(Main.State),
                    LastPage: Main.CurrentPage()
                };
            };

            app.start();
        };

        /**
        Handles navigating to the subscriber page.
        */
        static HandleNavigateToSubscribers = (context, event) =>
        {
            if (Main.CurrentPage() !== App.HomeController.PageId)
            {
                WinJS.Navigation.navigate(HomeController.PageAppxUrl);
            };
        };

        /**
        Handles navigating to the forms page.
        */
        static HandleNavigateToForms = (context, event) =>
        {
            if (Main.CurrentPage() !== App.FormsController.PageId)
            {
                WinJS.Navigation.navigate(FormsController.PageAppxUrl);
            };
        };

        /**
        Handles navigating to the settings page.
        */
        static HandleNavigateToSettings = (context, event) =>
        {
            if (Main.CurrentPage() !== App.SettingsController.PageId)
            {
                WinJS.Navigation.navigate(SettingsController.PageAppxUrl);
            };
        };

        /**
        Attempts to refresh the current page by calling client.HandleRefreshEvent.
        */
        static HandleRefreshEvent = (context, event) =>
        {
            var funcName = "HandleRefreshEvent";
            var ctrl = Main.CurrentPage();

            if (_.has(App.Main.State, ctrl) && _.has(App.Main.State[ctrl], funcName))
            {
                App.Main.State[ctrl][funcName](context, event);
            }
        };
    }
}

App.Main.Start();