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

        /**
        Represents the response returned by ConvertKit.FormService.GetAsync.
        */
        export interface FormResponse
        {
            forms: Form[];
        }

        /**
        Represents a ConvertKit form.
        */
        export interface Form
        {
            /**
            The date the form was created.
            */
            created_at: Date

            /**
            The form's description.
            */
            description: string;

            /**
            The form's JS URL.
            */
            embed_js: string;

            /**
            The form's embedded URL.
            */
            embed_url: string;

            /**
            The form's id.
            */
            id: number;

            /**
            The form's name.
            */
            name: string;

            /**
            The form's signup button text.
            */
            sign_up_button_text: string;

            /**
            The form's success message.
            */
            success_message: string;

            /**
            The form's title.
            */
            title: string;

            /**
            The form's type. Valid values are: 'embed', 'hosted', ...
            */
            type: string;

            /**
            The form's URL.
            */
            url: string;
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