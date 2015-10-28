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
                "ms-appx:///src/pages/default.js",
            ];
            for (var i = 0; i < scripts.length; i++) {
                importScripts(scripts[i]);
            }
            ;
        };
        TimerTask.GetSubscriberCount = function () {
            var key = App.Utils.LocalStorage.Retrieve(App.Main.SecretStorageKey);
            if (!key) {
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
                    // TODO: Update livetile with total subscriber count
                    var notifications = Windows.UI.Notifications;
                    var template = notifications.TileTemplateType["tileWide310x150Text03"];
                    var tileXml = notifications.TileUpdateManager.getTemplateContent(template);
                    var tileTextAttributes = tileXml.getElementsByTagName("text");
                    //Update tile text
                    tileTextAttributes[0].appendChild(tileXml.createTextNode("Total subscribers: " + resp.total_subscribers + "."));
                    //Clear current tiles
                    notifications.TileUpdateManager.createTileUpdaterForApplication().clear();
                    //Create tile
                    notifications.TileUpdateManager.createTileUpdaterForApplication().update(new notifications.TileNotification(tileXml));
                }
                ;
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