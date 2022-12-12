/**
 * config client
 */
export interface ConfigClient {
    "accessToken"?: string,
    "domain": string,
    "protocol": string,
    "timeout"?: number
    "dev"?: boolean;
    "userAgent"?: string;
    "xForwardedFor"?: string;
}

/**
 * error api
 */
export interface APIError {
    "status": string,
    "error": string
}

/**
 * Meta Value for Event
 */
export interface VantevoMeta {
    "duration"?: number,
    [key: string]: string | string[] | number;
};

/**
 * send hit event
 */
export interface VantevoEvent {
    "event": string,
    "url": string,
    "title"?: string,
    "referrer"?: string,
    "width"?: number,
    "height"?: number,
    "meta"?: VantevoMeta
}

/**
 * filter for statistics
 */
export interface ParamsRequestStats {
    "period": string,
    "domain": string,
    "source": string,
    "start"?: string,
    "end"?: string,
    "offset"?: number
    "limit"?: number
}

/*
*   Params items ecommerce
*/
export interface VantevoEcommerceItems {
    "item_id": string;
    "item_name": string;
    "currency"?: string;
    "quantity"?: number;
    "price"?: number;
    "discount"?: number;
    "position"?: number;
    "brand"?: string;
    "category_1"?: string;
    "category_2"?: string;
    "category_3"?: string;
    "category_4"?: string;
    "category_5"?: string;
    "variant_1"?: string;
    "variant_2"?: string;
    "variant_3"?: string;
};

/*
*   Event params ecommerce request
*/
export interface VantevoEcommerce {
    "event": string,
    "url": string,
    "title"?: string,
    "referrer"?: string,
    "width"?: number,
    "height"?: number,
    "total"?: number,
    "coupon"?: string,
    "coupon_value"?: number,
    "payment_type"?: number,
    "shipping_method"?: string,
    "items": VantevoEcommerceItems
    callback?: () => void
}
