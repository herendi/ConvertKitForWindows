module ConvertKit
{
    /**
    A generic ConvertKit service, used by all other services. You should not be using this directly.
    */
    class _Service
    {
        constructor(public _SecretKey)
        {

        }

        /**
        The base URL for all requests.
        */
        private get _BaseUrl(): string { return "https://api.convertkit.com/v3/" };

        public get _Client(): Windows.Web.Http.HttpClient { return new Windows.Web.Http.HttpClient() };

        //#region Utility functions

        /**
        Builds headers for a request, including the Content-Type header.
        */
        private BuildRequestHeaders = (message: Windows.Web.Http.HttpRequestMessage, contentType: string, extraHeaders: Object = {}) =>
        {
            var headers = message.headers;

            //Add extra headers
            _.forOwn(extraHeaders, (value, key: string) =>
            {
                headers.insert(key, value);
            });

            //Strangely, content-type header must be added to the message's content.
            message.content.headers.insert("Content-Type", contentType);

            return headers;
        };

        /**
        Creates a webrequest to the given path and appends the client's SecretKey.
        */
        public CreateRequest = (method: Windows.Web.Http.HttpMethod, path: string, data: Object = {}) =>
        {
            var message = new Windows.Web.Http.HttpRequestMessage(method, new Windows.Foundation.Uri(`${this._BaseUrl}${path}?api_secret=${this._SecretKey}`));
            message.content = new Windows.Web.Http.HttpStringContent(JSON.stringify(data));

            //Add request headers to the message
            this.BuildRequestHeaders(message, "application/json")

            return message;
        };

        //#endregion
    }

    /**
    A service for interacting with ConvertKit subscribers.
    */
    export class SubscriberService extends _Service
    {
        constructor(secretKey)
        {
            super(secretKey);
        }

        /**
        Retrieves a list of the user's ConvertKit subscribers.
        */
        public GetAsync = (page: number = 1) =>
        {
            return new WinJS.Promise<Entities.SubscriberList>((resolve, reject) =>
            {
                var message = this.CreateRequest(Windows.Web.Http.HttpMethod.get, "subscribers");
                var req = this._Client.sendRequestAsync(message);

                req.done((resp) =>
                {
                    if (resp.isSuccessStatusCode === false)
                    {
                        reject(`Response for SubscriberService.GetAsync did not indicate success. Status code: ${resp.statusCode}.`);

                        return;
                    };

                    resolve(JSON.parse(resp.content.toString()));
                }, reject);
            });
        };
    }

    /**
    A service for interacting with ConvertKit forms.
    */
    export class FormService extends _Service
    {
        constructor(secretKey)
        {
            super(secretKey);
        }

        /**
        Retrieves a list of the user's ConvertKit forms.
        */
        public GetAsync = (page: number = 1) =>
        {
            return new WinJS.Promise<Entities.FormResponse>((resolve, reject) =>
            {
                var message = this.CreateRequest(Windows.Web.Http.HttpMethod.get, "forms");
                var req = this._Client.sendRequestAsync(message);

                req.done((resp) =>
                {
                    if (resp.isSuccessStatusCode === false)
                    {
                        reject(`Response for FormService.GetAsync did not indicate success. Status code: ${resp.statusCode}.`);

                        return;
                    };

                    resolve(JSON.parse(resp.content.toString()));
                }, reject);
            });
        };
    }
}