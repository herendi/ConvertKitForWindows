var App;
(function (App) {
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
        Utils.GetAppSetting = function (key) {
            var resource = Windows.ApplicationModel.Resources.ResourceLoader.getForViewIndependentUse("AppSettings.private");
            return resource.getString(key);
        };
        return Utils;
    })();
    App.Utils = Utils;
})(App || (App = {}));
//# sourceMappingURL=Utilities.js.map