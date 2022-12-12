"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VantevoAnalytics = void 0;
const axios_1 = __importDefault(require("axios"));
const DEFAULT_BASE_URL = "https://api.vantevo.io";
const SEND_EVENT_API = DEFAULT_BASE_URL + "/v1/event";
const SEND_EVENT_ECOMMERCE_API = DEFAULT_BASE_URL + "/v1/event-ecommerce";
const STATS_API = DEFAULT_BASE_URL + "/v1";
const REFERRER_PARAMS = [
    "ref",
    "referrer",
    "source",
    "utm_source"
];
class VantevoAnalytics {
    /**
     *
     * @param config
     */
    constructor(config) {
        this.accessToken = "";
        this.domain = "";
        this.protocol = "http";
        this.timeout = 30 * 1000;
        this.dev = false;
        this.userAgent = "";
        this.xForwardedFor = "";
        if (!config.timeout) {
            this.timeout = config.timeout;
        }
        if (config.accessToken) {
            this.accessToken = config.accessToken;
        }
        if (config.protocol) {
            this.protocol = config.protocol;
        }
        if (config.userAgent) {
            this.userAgent = config.userAgent;
        }
        if (config.xForwardedFor) {
            this.xForwardedFor = config.xForwardedFor;
        }
        this.client = axios_1.default.create({
            baseURL: DEFAULT_BASE_URL,
            timeout: this.timeout,
        });
        this.domain = config.domain;
        this.dev = config.dev || false;
    }
    /**
     * Express middleware
     */
    express() {
        var _dev = this.dev;
        var _client = this.client;
        var _userAgent = this.userAgent;
        var _xForwardedFor = this.xForwardedFor;
        var _protocol = this.protocol;
        var _domain = this.domain;
        var _getReferrer = this.getReferrer;
        return function expressParse(req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const url = new URL(req.url || "", `${_protocol}://${_domain}`);
                var ref = _getReferrer(req, url);
                let fullUrl = `${_protocol}://${_domain}${req.originalUrl}`;
                let hit = { event: "pageview", url: fullUrl, title: url.pathname, referrer: ref, width: 0, height: 0, meta: {} };
                if (_dev) {
                    console.log("HIT:", hit);
                    next();
                    return;
                }
                next();
                try {
                    yield _client.post(SEND_EVENT_API, hit, {
                        headers: {
                            "Content-Type": "application/json",
                            "User-Agent": req["useragent"] || _userAgent,
                            "X-Forwarded-For": req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].toString() : _xForwardedFor,
                        }
                    });
                }
                catch (e) {
                    if (e.response && e.response.status) {
                        console.log("Errore HIT:", {
                            status: e.response.status,
                            error: e.response.data
                        });
                        return;
                    }
                    console.log("Errore request: ", e);
                }
            });
        };
    }
    /**
     * send page view or event
     * @param event
     * @param retry
     * @returns OK
     */
    event(event, userAgent = null, xForwardedFor = null, retry = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let hit = Object.assign({ title: null, referrer: null, width: 0, height: 0, meta: {} }, event);
            if (this.dev) {
                console.log("HIT:", hit);
                return;
            }
            try {
                yield this.client.post(SEND_EVENT_API, hit, {
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": userAgent || this.userAgent,
                        "X-Forwarded-For": xForwardedFor || this.xForwardedFor
                    }
                });
                return Promise.resolve("OK");
            }
            catch (e) {
                if (e.response && e.response.status) {
                    if (retry) {
                        try {
                            return this.event(event, userAgent, xForwardedFor, false);
                        }
                        catch (e) {
                            return Promise.reject(e);
                        }
                    }
                    return Promise.reject({
                        status: e.response.status,
                        error: e.response.data
                    });
                }
                return Promise.reject(e);
            }
        });
    }
    trackEcommerce(event, userAgent = null, xForwardedFor = null, retry = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let hit = Object.assign({ title: null, referrer: null, width: 0, height: 0 }, event);
            if (this.dev) {
                console.log("HIT:", hit);
                return;
            }
            try {
                yield this.client.post(SEND_EVENT_ECOMMERCE_API, hit, {
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": userAgent || this.userAgent,
                        "X-Forwarded-For": xForwardedFor || this.xForwardedFor
                    }
                });
                return Promise.resolve("OK");
            }
            catch (e) {
                if (e.response && e.response.status) {
                    if (retry) {
                        try {
                            return this.trackEcommerce(event, userAgent, xForwardedFor, false);
                        }
                        catch (e) {
                            return Promise.reject(e);
                        }
                    }
                    return Promise.reject({
                        status: e.response.status,
                        error: e.response.data
                    });
                }
                return Promise.reject(e);
            }
        });
    }
    /**
     *
     * @param params
     * @returns query paramenters
     */
    setURLParams(params) {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => searchParams.append(key, params[key]));
        return searchParams.toString();
    }
    /**
    * Get referrer request
    * @param req
    * @param url
    * @returns null or referrer name
    */
    getReferrer(req, url) {
        let referrer = req.headers["referer"] || null;
        if (!referrer) {
            for (let ref of REFERRER_PARAMS) {
                const param = url.searchParams.get(ref);
                if (param && param !== "") {
                    return param;
                }
            }
        }
        return referrer;
    }
    /**
    *
    * @param type
    * @param filters
    * @param retry
    * @returns object containing all necessary fields.
    */
    sendRequest(type, filters, retry = true) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.accessToken) {
                    return Promise.reject({
                        status: 401,
                        error: "Missing token access."
                    });
                }
                var queryParams = this.setURLParams(filters);
                const response = yield this.client.get(STATS_API + "/" + type + "?" + queryParams, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.accessToken}`
                    }
                });
                return Promise.resolve(response.data);
            }
            catch (e) {
                if (e.response) {
                    if (e.response.status === 401 && retry) {
                        try {
                            return this.sendRequest(type, filters, false);
                        }
                        catch (e) {
                            return Promise.reject(e);
                        }
                    }
                    return Promise.reject({
                        status: e.response.status,
                        error: e.response.data
                    });
                }
                return Promise.reject(e);
            }
        });
    }
    /**
     * get the statistics data
     *
     * @param filters
     */
    stats(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sendRequest('stats', Object.assign(Object.assign({}, filters), { domain: this.domain }), true);
        });
    }
    /**
    * get the events data
    *
    * @param filters
    */
    events(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sendRequest('events', Object.assign(Object.assign({}, filters), { domain: this.domain }), true);
        });
    }
}
exports.VantevoAnalytics = VantevoAnalytics;
