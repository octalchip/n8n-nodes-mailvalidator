"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleApiRequest = googleApiRequest;
exports.googleApiRequestAllItems = googleApiRequestAllItems;
async function googleApiRequest(method, endpoint, body = {}, qs = {}) {
    const url = `https://sheets.googleapis.com${endpoint}`;
    const queryString = Object.keys(qs).length > 0
        ? `?${new URLSearchParams(qs).toString()}`
        : '';
    // Get OAuth2 credentials
    const credentials = await this.getCredentials('googleSheetsOAuth2Api');
    // Check for access_token in various possible locations
    let accessToken;
    // Try different possible credential structures
    if (credentials.access_token) {
        accessToken = credentials.access_token;
    }
    else if (credentials.oauthTokenData?.access_token) {
        accessToken = credentials.oauthTokenData.access_token;
    }
    else if (credentials.token) {
        accessToken = credentials.token;
    }
    else if (credentials.accessToken) {
        accessToken = credentials.accessToken;
    }
    if (!accessToken) {
        // Log available credential keys for debugging
        this.logger?.error(`Google Sheets credentials structure: ${JSON.stringify(Object.keys(credentials))}`);
        throw new Error('Google Sheets OAuth2 token is missing. Please re-authenticate your Google Sheets OAuth2 credentials in n8n. Available credential keys: ' + Object.keys(credentials).join(', '));
    }
    const options = {
        method,
        url: `${url}${queryString}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: Object.keys(body).length > 0 ? body : undefined,
        json: true,
    };
    try {
        return await this.helpers.request(options);
    }
    catch (error) {
        // If it's a 401 error, provide helpful message
        if (error.statusCode === 401 || error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED')) {
            throw new Error('Google Sheets authentication failed. The OAuth token may have expired. Please go to n8n Credentials and re-authenticate your Google Sheets OAuth2 credentials.');
        }
        // If it's a credential error, provide helpful message
        if (error.message?.includes('credentials') || error.message?.includes('OAuth')) {
            throw new Error('Google Sheets OAuth2 credentials are missing or invalid. Please configure your Google Sheets OAuth2 credentials in n8n.');
        }
        throw error;
    }
}
async function googleApiRequestAllItems(propertyName, method, endpoint, body = {}, qs = {}) {
    const returnData = [];
    let responseData;
    do {
        responseData = await googleApiRequest.call(this, method, endpoint, body, qs);
        returnData.push.apply(returnData, responseData[propertyName]);
    } while (responseData.nextPageToken !== undefined);
    return returnData;
}
