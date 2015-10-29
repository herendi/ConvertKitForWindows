declare module App
{
    export module Entities
    {
        /**
        Represents the app's notification settings.
        */
        export interface NotificationSettings
        {
            /**
            Whether the app's background notifications are enabled.
            */
            Enabled: boolean;

            /**
            How often the app should run its background task, if notifications are enabled.
            */
            Timer: number;
        }

        /**
        Represents the app's notification settings as observables.
        */
        export interface ObservableNotificationSettings
        {
            /**
            Whether the app's background notifications are enabled.
            */
            Enabled: KnockoutObservable<boolean>;

            /**
            How often the app should run its background task, if notifications are enabled.
            */
            Timer: KnockoutObservable<number>;

            /**
            Converts the observable notification settings to unobservable, plain settings.
            */
            ToUnobservable: () => NotificationSettings;
        }
    }
}