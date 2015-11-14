var App;
(function (App) {
    var Strings;
    (function (Strings) {
        /**
        A export function string used as the app's background task name.
        */
        Strings.TaskName = "backgroundSourceCheckTask";
        /**
        A export function string used as the storage key to save and retrieve the user's Secret Key.
        */
        Strings.SecretStorageKey = "CK-Secret-Key";
        /**
        A export function string used as the storage key to retrieve the app's notification settings.
        */
        Strings.NotificationSettingsKey = "CK-Notification-Settings";
    })(Strings = App.Strings || (App.Strings = {}));
    var Utils;
    (function (Utils) {
        //#region Storage 
        var RoamingStorage;
        (function (RoamingStorage) {
            function Save(key, value) {
                Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;
                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            }
            RoamingStorage.Save = Save;
            ;
            function Retrieve(key) {
                return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
            }
            RoamingStorage.Retrieve = Retrieve;
            ;
            function Delete(key) {
                Windows.Storage.ApplicationData.current.roamingSettings.values.remove(key);
            }
            RoamingStorage.Delete = Delete;
            ;
        })(RoamingStorage = Utils.RoamingStorage || (Utils.RoamingStorage = {}));
        ;
        var LocalStorage;
        (function (LocalStorage) {
            function Save(key, value) {
                Windows.Storage.ApplicationData.current.localSettings.values[key] = value;
                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            }
            LocalStorage.Save = Save;
            ;
            function Retrieve(key) {
                return Windows.Storage.ApplicationData.current.localSettings.values[key];
            }
            LocalStorage.Retrieve = Retrieve;
            ;
            function Delete(key) {
                Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
            }
            LocalStorage.Delete = Delete;
            ;
            function SubscribeToChanges(handler) {
                Windows.Storage.ApplicationData.current.ondatachanged = handler;
            }
            LocalStorage.SubscribeToChanges = SubscribeToChanges;
            ;
        })(LocalStorage = Utils.LocalStorage || (Utils.LocalStorage = {}));
        ;
        var SessionStorage;
        (function (SessionStorage) {
            function Save(key, value) {
                sessionStorage.setItem(key, value);
            }
            SessionStorage.Save = Save;
            ;
            function Retrieve(key) {
                return sessionStorage.getItem(key);
            }
            SessionStorage.Retrieve = Retrieve;
            ;
            function Delete(key) {
                sessionStorage.removeItem(key);
            }
            SessionStorage.Delete = Delete;
            ;
        })(SessionStorage = Utils.SessionStorage || (Utils.SessionStorage = {}));
        ;
        //#endregion
        /**
        Shows a dialog with the given title and message, and optionally accepts an array of command buttons.
        */
        function ShowDialog(title, message, commands) {
            var dialog = new Windows.UI.Popups.MessageDialog(message, title);
            if (commands) {
                dialog.commands.push.apply(dialog.commands, commands);
            }
            dialog.showAsync();
        }
        Utils.ShowDialog = ShowDialog;
        ;
        /**
        Retrieves a resource string from the given resource file.
        */
        function GetResourceValue(key, resourceFile) {
            if (resourceFile === void 0) { resourceFile = "AppSettings.private"; }
            var resource = Windows.ApplicationModel.Resources.ResourceLoader.getForViewIndependentUse(resourceFile);
            return resource.getString(key);
        }
        Utils.GetResourceValue = GetResourceValue;
        /**
        Checks if the device has an internet connection. This can take several seconds to return, but executes synchronously.
        */
        function HasInternetConnection() {
            var connection = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
            var level = Windows.Networking.Connectivity.NetworkConnectivityLevel;
            return connection && (connection.getNetworkConnectivityLevel() === level.internetAccess);
        }
        Utils.HasInternetConnection = HasInternetConnection;
    })(Utils = App.Utils || (App.Utils = {}));
})(App || (App = {}));
//# sourceMappingURL=Utilities.js.map