import { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
export declare function googleApiRequest(this: IExecuteFunctions, method: IHttpRequestMethods, endpoint: string, body?: any, qs?: any): Promise<any>;
export declare function googleApiRequestAllItems(this: IExecuteFunctions, propertyName: string, method: IHttpRequestMethods, endpoint: string, body?: any, qs?: any): Promise<any>;
