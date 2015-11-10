var App;
(function (App) {
    var Strings = (function () {
        function Strings() {
        }
        /**
        A static string used as the app's background task name.
        */
        Strings.TaskName = "backgroundSourceCheckTask";
        /**
        A static string used as the storage key to save and retrieve the user's Secret Key.
        */
        Strings.SecretStorageKey = "CK-Secret-Key";
        /**
        A static string used as the storage key to retrieve the app's notification settings.
        */
        Strings.NotificationSettingsKey = "CK-Notification-Settings";
        return Strings;
    })();
    App.Strings = Strings;
    var Utils = (function () {
        function Utils() {
        }
        //#region Storage 
        Utils.RoamingStorage = {
            Save: function (key, value) {
                Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;
                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            },
            Retrieve: function (key) {
                return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
            },
            Delete: function (key) {
                Windows.Storage.ApplicationData.current.roamingSettings.values.remove(key);
            },
        };
        Utils.LocalStorage = {
            Save: function (key, value) {
                Windows.Storage.ApplicationData.current.localSettings.values[key] = value;
                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            },
            Retrieve: function (key) {
                return Windows.Storage.ApplicationData.current.localSettings.values[key];
            },
            Delete: function (key) {
                Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
            },
            SubscribeToChanges: function (handler) {
                Windows.Storage.ApplicationData.current.ondatachanged = handler;
            }
        };
        Utils.SessionStorage = {
            Save: function (key, value) {
                sessionStorage.setItem(key, value);
            },
            Retrieve: function (key) {
                return sessionStorage.getItem(key);
            },
            Delete: function (key) {
                sessionStorage.removeItem(key);
            }
        };
        //#endregion
        /**
        Shows a dialog with the given title and message, and optionally accepts an array of command buttons.
        */
        Utils.ShowDialog = function (title, message, commands) {
            var dialog = new Windows.UI.Popups.MessageDialog(message, title);
            if (commands) {
                dialog.commands.push.apply(dialog.commands, commands);
            }
            dialog.showAsync();
        };
        /**
        Retrieves a resource string from the given resource file.
        */
        Utils.GetResourceValue = function (key, resourceFile) {
            if (resourceFile === void 0) { resourceFile = "AppSettings.private"; }
            var resource = Windows.ApplicationModel.Resources.ResourceLoader.getForViewIndependentUse(resourceFile);
            return resource.getString(key);
        };
        /**
        Checks if the device has an internet connection. This can take several seconds to return, but executes synchronously.
        */
        Utils.HasInternetConnection = function () {
            var connection = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
            var level = Windows.Networking.Connectivity.NetworkConnectivityLevel;
            return connection && (connection.getNetworkConnectivityLevel() === level.internetAccess);
        };
        return Utils;
    })();
    App.Utils = Utils;
})(App || (App = {}));
//# sourceMappingURL=Utilities.js.map