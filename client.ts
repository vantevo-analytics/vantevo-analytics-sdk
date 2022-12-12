import axios, { AxiosInstance } from "axios";
import { NextFunction, Request, Response } from "express";
import { APIError, ConfigClient, ParamsRequestStats, VantevoEcommerce, VantevoEvent } from "./types";



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

export class VantevoAnalytics {
    private client: AxiosInstance;
    private accessToken: string = "";
    private domain: string = "";
    private protocol: string = "http";
    private timeout: number = 30 * 1000;
    private dev: boolean = false;
    private userAgent: string = "";
    private xForwardedFor: string = "";

    /**
     * 
     * @param config 
     */
    constructor(config: ConfigClient) {

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
        this.client = axios.create({
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

        return async function expressParse(req: Request, res: Response, next: NextFunction) {
            const url = new URL(req.url || "", `${_protocol}://${_domain}`);
            var ref = _getReferrer(req, url);
            let fullUrl = `${_protocol}://${_domain}${req.originalUrl}`;

            let hit: VantevoEvent = { event: "pageview", url: fullUrl, title: url.pathname, referrer: ref, width: 0, height: 0, meta: {} };

            if (_dev) {
                console.log("HIT:", hit);
                next();
                return;
            }
            next();

            try {
                await _client.post(SEND_EVENT_API, hit, {
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": req["useragent"] || _userAgent,
                        "X-Forwarded-For": req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].toString() : _xForwardedFor,
                    }
                });
            } catch (e: any) {
                if (e.response && e.response.status) {
                    console.log("Errore HIT:", {
                        status: e.response.status,
                        error: e.response.data
                    });
                    return;
                }
                console.log("Errore request: ", e);
            }
        }
    }


    /**
     * send page view or event
     * @param event 
     * @param retry 
     * @returns OK 
     */
    async event(event: VantevoEvent, userAgent: string = null, xForwardedFor: string = null, retry: boolean = true): Promise<APIError | string> {

        let hit: VantevoEvent = { title: null, referrer: null, width: 0, height: 0, meta: {}, ...event };

        if (this.dev) {
            console.log("HIT:", hit);
            return;
        }

        try {
            await this.client.post(SEND_EVENT_API, hit, {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": userAgent || this.userAgent,
                    "X-Forwarded-For": xForwardedFor || this.xForwardedFor
                }
            });
            return Promise.resolve<string>("OK");
        } catch (e: any) {
            if (e.response && e.response.status) {
                if (retry) {
                    try {
                        return this.event(event, userAgent, xForwardedFor, false);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }

                return Promise.reject<APIError>({
                    status: e.response.status,
                    error: e.response.data
                });
            }

            return Promise.reject(e);
        }
    }

    async trackEcommerce(event: VantevoEcommerce, userAgent: string = null, xForwardedFor: string = null, retry: boolean = true): Promise<APIError | string> {
        let hit: VantevoEcommerce = { title: null, referrer: null, width: 0, height: 0, ...event };

        if (this.dev) {
            console.log("HIT:", hit);
            return;
        }

        try {
            await this.client.post(SEND_EVENT_ECOMMERCE_API, hit, {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": userAgent || this.userAgent,
                    "X-Forwarded-For": xForwardedFor || this.xForwardedFor
                }
            });
            return Promise.resolve<string>("OK");
        } catch (e: any) {
            if (e.response && e.response.status) {
                if (retry) {
                    try {
                        return this.trackEcommerce(event, userAgent, xForwardedFor, false);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }

                return Promise.reject<APIError>({
                    status: e.response.status,
                    error: e.response.data
                });
            }

            return Promise.reject(e);
        }
    }

    /**
     * 
     * @param params 
     * @returns query paramenters
     */
    private setURLParams(params: ParamsRequestStats) {
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
    private getReferrer(req: Request, url: URL): string {
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
    private async sendRequest<T>(type: string, filters: ParamsRequestStats, retry: boolean = true): Promise<T | APIError> {
        try {
            if (!this.accessToken) {
                return Promise.reject<APIError>({
                    status: 401,
                    error: "Missing token access."
                });
            }
            var queryParams = this.setURLParams(filters);
            const response = await this.client.get(STATS_API + "/" + type + "?" + queryParams, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.accessToken}`
                }
            });

            return Promise.resolve<T>(response.data);

        } catch (e: any) {
            if (e.response) {
                if (e.response.status === 401 && retry) {
                    try {
                        return this.sendRequest<T>(type, filters, false);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }
                return Promise.reject<APIError>({
                    status: e.response.status,
                    error: e.response.data
                });
            }
            return Promise.reject(e);
        }
    }



    /**
     * get the statistics data
     *
     * @param filters
     */
    async stats(filters: ParamsRequestStats): Promise<[] | APIError> {
        return await this.sendRequest<[]>('stats', { ...filters, domain: this.domain }, true);
    }

    /**
    * get the events data
    *
    * @param filters
    */
    async events(filters: ParamsRequestStats): Promise<[] | APIError> {
        return await this.sendRequest<[]>('events', { ...filters, domain: this.domain }, true);
    }
}