import { NextFunction, Request, Response } from "express";
import { APIError, ConfigClient, ParamsRequestStats, VantevoEcommerce, VantevoEvent } from "./types";
export declare class VantevoAnalytics {
    private client;
    private accessToken;
    private domain;
    private protocol;
    private timeout;
    private dev;
    private userAgent;
    private xForwardedFor;
    /**
     *
     * @param config
     */
    constructor(config: ConfigClient);
    /**
     * Express middleware
     */
    express(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * send page view or event
     * @param event
     * @param retry
     * @returns OK
     */
    event(event: VantevoEvent, userAgent?: string, xForwardedFor?: string, retry?: boolean): Promise<APIError | string>;
    trackEcommerce(event: VantevoEcommerce, userAgent?: string, xForwardedFor?: string, retry?: boolean): Promise<APIError | string>;
    /**
     *
     * @param params
     * @returns query paramenters
     */
    private setURLParams;
    /**
    * Get referrer request
    * @param req
    * @param url
    * @returns null or referrer name
    */
    private getReferrer;
    /**
    *
    * @param type
    * @param filters
    * @param retry
    * @returns object containing all necessary fields.
    */
    private sendRequest;
    /**
     * get the statistics data
     *
     * @param filters
     */
    stats(filters: ParamsRequestStats): Promise<[] | APIError>;
    /**
    * get the events data
    *
    * @param filters
    */
    events(filters: ParamsRequestStats): Promise<[] | APIError>;
}
