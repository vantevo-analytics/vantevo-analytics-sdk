# The analysis of your website, but simpler

**Vantevo Analytics** is the alternative platform to Google Analytics that respects privacy, because it does not need cookies not compliant with the GDPR. Easy to use, light and can be integrated into any website and back-end.

This is the official JavaScript client SDK for Vantevo Analytics. For more information visit the website [vantevo.io](https://vantevo.io).

## Installation

`npm install vantevo-analytics-sdk`

## Usage

To start tracking page views, events, and getting statistics, you need to initialize the client first:

| Option        | Type                 | Description                                                                                                                  |
| ------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| accessToken   | `string` (required)  | To create an api key read our [guide](https://vantevo.io/docs/account/impostazioni).                                         |
| domain        | `string` (required)  | Enter the domain you want to use to collect statistics.The domain must not include http, https, or www. Example: example.com |
| protocol      | `string` (required)  | http or https                                                                                                                |
| userAgent     | `string` (optional)  | To monitor page views and events, requests must have a `user-agent`, here you can assign a global ùser-agent`.               |
| xForwardedFor | `string` (optional)  | To monitor page views and events requests must have an `ip`, here you can assign a global` ip`.                              |
| dev           | `boolean` (optional) | Tracker will not send data to server, please check console to view request information.                                      |

```ts
const { VantevoAnalytics } = require("vantevo-analytics-sdk");

var client = new VantevoAnalytics({
  accessToken: "",
  domain: "",
  protocol: "",
  userAgent: "",
  xForwardedFor: "",
  dev: false,
});
```

## Tracking page views and events

**Parameters**

| Option        | Type                | Description                                                                                                                            |
| ------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| event         | `object` (required) | See event parameters.                                                                                                                  |
| userAgent     | `string` (optional) | To monitor page views and events, requests must have a `user-agent`, you can use this parameter if you don't have a global user-agent. |
| xForwardedFor | `string` (optional) | To monitor page views and events requests must have an `ip`, you can use this parameter if you don't have a global ip.                 |

**Event parameters**
| Option | Type | Description |
| ------------- | --------------------- | ----------------------------|
| event | `string` (required) | Event name, remember that the name `pageview` will send a pageview event. |
| url | `string` (required) | Enter url you want to save in the statistics. |
| title | `string` (optional) | You can insert a title of the page, if this field is not used vantevo will insert the pathname of the url used. |
| referrer | `string` (optional) | In this field you can enter a referrer for your request. Default: `null`. |
| width | `string` (optional) | This field is used to save the screen size. Default: `0`.|
| height | `string` (optional) | This field is used to save the screen size. Default: `0`. |
| meta | `object` (optional) | Enter the event values `meta_key` and` meta_value`, [read more how to create an event](https://vantevo.io/docs/come-creare-un-evento#evento) Default: `{}`. |

```ts
const { VantevoAnalytics } = require("vantevo-analytics-sdk");

var client = new VantevoAnalytics({....});

//without global useragent and ip
client.event({event: "pageview"},  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36", "92.16.12.2");

//with global useragent and ip
client.event({event: "pageview"});
```

### Express js

To use express js middleware make sure the script can get `useragent` and the `ip`, to get the data the script uses `req["useragent"]` and `req.headers['x-forwarded-for']`.

```ts
const express = require('express');
const { VantevoAnalytics } = require("vantevo-analytics-sdk");
const app = express();

var client = new VantevoAnalytics({....});
app.use(client.express());
```

## How to get the statistics

**Parameters**

| Option        | Type                | Description                                                                                                                              |
| ------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| event         | `object` (required) | Check out our guide to see all the parameters you can use like, [click here](https://vantevo.io/docs/api-sdk/api-statistiche#parametri). |
| userAgent     | `string` (optional) | To monitor page views and events, requests must have a `user-agent`, you can use this parameter if you don't have a global user-agent.   |
| xForwardedFor | `string` (optional) | To monitor page views and events requests must have an `ip`, you can use this parameter if you don't have a global ip.                   |

### Example Statistics

```ts
const { VantevoAnalytics } = require("vantevo-analytics-sdk");
var client = new VantevoAnalytics({....});

client.stats({source: 'pages', period: "1m", limit: 30, offset: 0, city: "Rome", ....}).then(() => {}).catch(() => {});
```

### Example Events

```ts
const { VantevoAnalytics } = require("vantevo-analytics-sdk");
var client = new VantevoAnalytics({....});

client.events({source: 'events', period: "1m", limit: 30, offset: 0, city: "Rome", ....}).then(() => {}).catch(() => {});
```

## Vantevo Analytics guide

To see all the features and settings of Vantevo Analytics we recommend that you read our complete guide [here](https://vantevo.io/docs?utm_source=npm&utm_medium=vantevo-analytics-tracker).
