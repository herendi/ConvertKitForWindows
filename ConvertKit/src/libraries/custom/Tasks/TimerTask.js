var App;
(function (App) {
    var TimerTask = (function () {
        function TimerTask() {
        }
        TimerTask.Start = function () {
            var context = TimerTask;
            context.ImportScripts();
            context.GetSubscriberCount();
        };
        TimerTask.ImportScripts = function () {
            var scripts = [
                "ms-appx:///src/libraries/winjs/js/base.js",
                "ms-appx:///src/libraries/yeahtoast/yeahtoast.js",
                "ms-appx:///src/libraries/lodash/lodash.min.js",
                "ms-appx:///src/libraries/custom/convertkit/convertkit.js",
                "ms-appx:///src/libraries/custom/Utilities/Utilities.js",
                "ms-appx:///src/libraries/custom/LiveTiles/LiveTiles.js"
            ];
            for (var i = 0; i < scripts.length; i++) {
                importScripts(scripts[i]);
            }
            ;
        };
        TimerTask.GetSubscriberCount = function () {
            var settings = JSON.parse(App.Utils.LocalStorage.Retrieve(App.Strings.NotificationSettingsKey) || "{}");
            var key = App.Utils.LocalStorage.Retrieve(App.Strings.SecretStorageKey);
            if (!key || !settings || !settings.Enabled) {
                close();
                return;
            }
            var service = new ConvertKit.SubscriberService(key);
            var req = service.GetAsync();
            var success = (function (resp) {
                var lastTotalCount = parseInt(App.Utils.RoamingStorage.Retrieve("LastTotalCount") || "0");
                if (resp.total_subscribers > lastTotalCount) {
                    //New subscribers. Store new count and show alert.
                    App.Utils.RoamingStorage.Save("LastTotalCount", resp.total_subscribers);
                    YeahToast.show({
                        title: (resp.total_subscribers - lastTotalCount) + " new ConvertKit subscriber" + (resp.total_subscribers - lastTotalCount > 1 ? "s" : "") + ".",
                    });
                }
                ;
                App.Utils.LiveTiles.UpdateAllTiles(resp);
                close();
            });
            var fail = (function (error) {
                console.log("Background timer task failed to pull in subscribers.", error);
                close();
            });
            req.done(success, fail);
        };
        return TimerTask;
    })();
    App.TimerTask = TimerTask;
})(App || (App = {}));
App.TimerTask.Start();
//# sourceMappingURL=TimerTask.js.map