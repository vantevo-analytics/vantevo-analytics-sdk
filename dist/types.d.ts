/**
 * config client
 */
export interface ConfigClient {
    accessToken?: string;
    domain: string;
    protocol: string;
    timeout?: number;
    dev?: boolean;
    userAgent?: string;
    xForwardedFor?: string;
}
/**
 * error api
 */
export interface APIError {
    status: string;
    error: string;
}
/**
 * Meta Value for Event
 */
export interface VantevoMeta {
    duration?: number;
    [key: string]: string | string[] | number;
}
/**
 * send hit event
 */
export interface VantevoEvent {
    event: string;
    url: string;
    title?: string;
    referrer?: string;
    width?: number;
    height?: number;
    meta?: VantevoMeta;
}
/**
 * filter for statistics
 */
export interface ParamsRequestStats {
    period: string;
    domain: string;
    source: string;
    start?: string;
    end?: string;
    offset?: number;
    limit?: number;
}
