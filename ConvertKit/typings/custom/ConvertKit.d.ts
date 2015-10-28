declare module ConvertKit
{
    export module Entities
    {
        /**
        Represents the response returned by ConvertKit.SubscriberService.GetAsync.
        */
        export interface SubscriberList
        {
            /**
            The current page of results.
            */
            page: number;

            /**
            The total number of pages.
            */
            total_pages: number;
            
            /**
            The total number of subscribers.
            */
            total_subscribers: number;

            /**
            An array of Subscribers for the current page.
            */
            subscribers: Subscriber[];
        }

        /**
        Represents a ConvertKit subscriber.
        */
        export interface Subscriber
        {
            /**
            The subscriber's first name.
            */
            first_name: string;

            /**
            The subscriber's email address.
            */
            email_address: string;

            /**
            The subscriber's state.
            */
            state: any;

            /**
            The date the subscriber was created.
            */
            created_at: Date;
        }

        export interface DefaultResultFields
        {
            /**
            A base-64 string representing the user's unique account image.
            */
            authenticatorImage: string;

            /**
            The result code for the preceding action. Will be "SUCCESS" if successful.
            */
            resultCode: string;
        }
    }
}