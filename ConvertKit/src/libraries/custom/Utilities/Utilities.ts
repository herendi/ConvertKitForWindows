module App
{
    export module Strings
    {
        /**
        A export function string used as the app's background task name.
        */
        export var TaskName = "backgroundSourceCheckTask";

        /**
        A export function string used as the storage key to save and retrieve the user's Secret Key.
        */
        export var SecretStorageKey = "CK-Secret-Key";

        /**
        A export function string used as the storage key to retrieve the app's notification settings.
        */
        export var NotificationSettingsKey = "CK-Notification-Settings";
    }

    export module Utils
    {
        //#region Storage 

        export module RoamingStorage 
        {
            export function Save(key: string, value: any)
            {
                Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;

                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            };

            export function Retrieve(key: string)
            {
                return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
            };

            export function Delete(key: string)
            {
                Windows.Storage.ApplicationData.current.roamingSettings.values.remove(key);
            };
        };

        export module LocalStorage 
        {
            export function Save(key: string, value: any)
            {
                Windows.Storage.ApplicationData.current.localSettings.values[key] = value;

                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            };

            export function Retrieve(key: string)
            {
                return Windows.Storage.ApplicationData.current.localSettings.values[key];
            };

            export function Delete(key: string)
            {
                Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
            };

            export function SubscribeToChanges(handler: (args: any) => void)
            {
                Windows.Storage.ApplicationData.current.ondatachanged = handler;
            };
        };

        export module SessionStorage
        {
            export function Save(key: string, value: any)
            {
                sessionStorage.setItem(key, value);
            };

            export function Retrieve(key: string)
            {
                return sessionStorage.getItem(key);
            };

            export function Delete(key: string)
            {
                sessionStorage.removeItem(key);
            };
        };

        //#endregion

        /**
        Shows a dialog with the given title and message, and optionally accepts an array of command buttons.
        */
        export function ShowDialog(title: string, message: string, commands?: Windows.UI.Popups.IUICommand[])
        {
            var dialog = new Windows.UI.Popups.MessageDialog(message, title);

            if (commands)
            {
                dialog.commands.push.apply(dialog.commands, commands);
            }

            dialog.showAsync();
        };

        /**
        Retrieves a resource string from the given resource file.
        */
        export function GetResourceValue(key: string, resourceFile: string = "AppSettings.private")
        {
            var resource: { getString: (key: string) => string } = (<any>Windows.ApplicationModel.Resources.ResourceLoader).getForViewIndependentUse(resourceFile);

            return resource.getString(key);
        }

        /**
        Checks if the device has an internet connection. This can take several seconds to return, but executes synchronously.
        */
        export function HasInternetConnection()
        {
            var connection = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
            var level = Windows.Networking.Connectivity.NetworkConnectivityLevel;

            return connection && (connection.getNetworkConnectivityLevel() === level.internetAccess);
        }
    }
}
