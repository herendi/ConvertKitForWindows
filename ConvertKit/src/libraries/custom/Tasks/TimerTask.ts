declare var YeahToast: any;

module App
{
    export class TimerTask
    {
        static Start = () =>
        {
            var context = TimerTask;

            context.ImportScripts();
            context.GetSubscriberCount();
        };

        static ImportScripts = () =>
        {
            var scripts = [
                "ms-appx:///src/libraries/winjs/js/base.js",
                "ms-appx:///src/libraries/yeahtoast/yeahtoast.js",
                "ms-appx:///src/libraries/lodash/lodash.min.js",
                "ms-appx:///src/libraries/custom/convertkit/convertkit.js",
                "ms-appx:///src/libraries/custom/Utilities/Utilities.js",
                "ms-appx:///src/libraries/custom/LiveTiles/LiveTiles.js"
            ];

            for (var i = 0; i < scripts.length; i++)
            {
                importScripts(scripts[i]);
            };
        };

        static GetSubscriberCount = () =>
        {
            var settings: Entities.NotificationSettings = JSON.parse(Utils.LocalStorage.Retrieve(Strings.NotificationSettingsKey) || "{}");
            var key = Utils.LocalStorage.Retrieve(Strings.SecretStorageKey);

            if (!key || !settings || !settings.Enabled)
            {
                close();

                return;
            }

            var service = new ConvertKit.SubscriberService(key);
            var req = service.GetAsync();

            var success = ((resp: ConvertKit.Entities.SubscriberList) =>
            {
                var lastTotalCount: number = parseInt(App.Utils.RoamingStorage.Retrieve("LastTotalCount") || "0");

                if (resp.total_subscribers > lastTotalCount)
                {
                    //New subscribers. Store new count and show alert.
                    App.Utils.RoamingStorage.Save("LastTotalCount", resp.total_subscribers);

                    YeahToast.show({
                        title: `${resp.total_subscribers - lastTotalCount} new ConvertKit subscriber${resp.total_subscribers - lastTotalCount > 1 ? "s" : ""}.`,
                    });
                };

                App.Utils.LiveTiles.UpdateAllTiles(resp);
                
                close();
            });

            var fail = ((error) =>
            {
                console.log("Background timer task failed to pull in subscribers.", error);

                close();
            });

            req.done(success, fail);
        };
    }
}

App.TimerTask.Start();