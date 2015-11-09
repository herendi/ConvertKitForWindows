module App
{
    export class Strings
    {
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
    }

    export class Utils
    {
        //#region Storage 

        static RoamingStorage = {
            Save: (key: string, value: any) =>
            {
                Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;

                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            },
            Retrieve: (key: string) =>
            {
                return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
            },
            Delete: (key: string) =>
            {
                Windows.Storage.ApplicationData.current.roamingSettings.values.remove(key);
            },
        };

        static LocalStorage = {
            Save: (key: string, value: any) =>
            {
                Windows.Storage.ApplicationData.current.localSettings.values[key] = value;

                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            },
            Retrieve: (key: string) =>
            {
                return Windows.Storage.ApplicationData.current.localSettings.values[key];
            },
            Delete: (key: string) =>
            {
                Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
            },
            SubscribeToChanges: (handler: (args: any) => void) =>
            {
                Windows.Storage.ApplicationData.current.ondatachanged = handler;
            }
        };

        static SessionStorage = {
            Save: (key: string, value: any) =>
            {
                sessionStorage.setItem(key, value);
            },
            Retrieve: (key: string) =>
            {
                return sessionStorage.getItem(key);
            },
            Delete: (key: string) =>
            {
                sessionStorage.removeItem(key);
            }
        };

        //#endregion

        static ShowDialog = (title: string, message: string, commands?: Windows.UI.Popups.IUICommand[]) =>
        {
            var dialog = new Windows.UI.Popups.MessageDialog(message, title);

            if (commands)
            {
                dialog.commands.push.apply(dialog.commands, commands);
            }

            dialog.showAsync();
        };

        static GetResourceValue = (key: string) =>
        {
            var resource: { getString: (key: string) => string } = (<any>Windows.ApplicationModel.Resources.ResourceLoader).getForViewIndependentUse("AppSettings.private");
            
            return resource.getString(key);
        }
    }
}
