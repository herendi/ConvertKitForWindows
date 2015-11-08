var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ConvertKit;
(function (ConvertKit) {
    /**
    A generic ConvertKit service, used by all other services. You should not be using this directly.
    */
    var _Service = (function () {
        function _Service(_SecretKey) {
            var _this = this;
            this._SecretKey = _SecretKey;
            //#region Utility functions
            /**
            Builds headers for a request, including the Content-Type header.
            */
            this.BuildRequestHeaders = function (message, contentType, extraHeaders) {
                if (extraHeaders === void 0) { extraHeaders = {}; }
                var headers = message.headers;
                //Add extra headers
                _.forOwn(extraHeaders, function (value, key) {
                    headers.insert(key, value);
                });
                //Strangely, content-type header must be added to the message's content.
                message.content.headers.insert("Content-Type", contentType);
                return headers;
            };
            /**
            Creates a webrequest to the given path and appends the client's SecretKey.
            */
            this.CreateRequest = function (method, path, data) {
                if (data === void 0) { data = {}; }
                var message = new Windows.Web.Http.HttpRequestMessage(method, new Windows.Foundation.Uri("" + _this._BaseUrl + path + "?api_secret=" + _this._SecretKey));
                message.content = new Windows.Web.Http.HttpStringContent(JSON.stringify(data));
                //Add request headers to the message
                _this.BuildRequestHeaders(message, "application/json");
                return message;
            };
        }
        Object.defineProperty(_Service.prototype, "_BaseUrl", {
            /**
            The base URL for all requests.
            */
            get: function () { return "https://api.convertkit.com/v3/"; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(_Service.prototype, "_Client", {
            get: function () { return new Windows.Web.Http.HttpClient(); },
            enumerable: true,
            configurable: true
        });
        ;
        return _Service;
    })();
    /**
    A service for interacting with ConvertKit subscribers.
    */
    var SubscriberService = (function (_super) {
        __extends(SubscriberService, _super);
        function SubscriberService(secretKey) {
            var _this = this;
            _super.call(this, secretKey);
            /**
            Retrieves a list of the user's ConvertKit subscribers.
            */
            this.GetAsync = function (page) {
                if (page === void 0) { page = 1; }
                return new WinJS.Promise(function (resolve, reject) {
                    var message = _this.CreateRequest(Windows.Web.Http.HttpMethod.get, "subscribers");
                    var req = _this._Client.sendRequestAsync(message);
                    req.done(function (resp) {
                        if (resp.isSuccessStatusCode === false) {
                            reject("Response for SubscriberService.GetAsync did not indicate success. Status code: " + resp.statusCode + ".");
                            return;
                        }
                        ;
                        resolve(JSON.parse(resp.content.toString()));
                    }, reject);
                });
            };
        }
        return SubscriberService;
    })(_Service);
    ConvertKit.SubscriberService = SubscriberService;
    /**
    A service for interacting with ConvertKit forms.
    */
    var FormService = (function (_super) {
        __extends(FormService, _super);
        function FormService(secretKey) {
            var _this = this;
            _super.call(this, secretKey);
            /**
            Retrieves a list of the user's ConvertKit forms.
            */
            this.GetAsync = function (page) {
                if (page === void 0) { page = 1; }
                return new WinJS.Promise(function (resolve, reject) {
                    var message = _this.CreateRequest(Windows.Web.Http.HttpMethod.get, "forms");
                    var req = _this._Client.sendRequestAsync(message);
                    req.done(function (resp) {
                        if (resp.isSuccessStatusCode === false) {
                            reject("Response for FormService.GetAsync did not indicate success. Status code: " + resp.statusCode + ".");
                            return;
                        }
                        ;
                        resolve(JSON.parse(resp.content.toString()));
                    }, reject);
                });
            };
        }
        return FormService;
    })(_Service);
    ConvertKit.FormService = FormService;
})(ConvertKit || (ConvertKit = {}));
//# sourceMappingURL=ConvertKit.js.map