"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailValidatorApi = void 0;
class EmailValidatorApi {
    constructor() {
        this.name = 'emailValidatorApi';
        this.displayName = 'Email Validator API';
        this.documentationUrl = 'https://mailvalidator.octalchip.com/docs';
        // @ts-ignore - icon property may not be in type definition but is supported by n8n
        this.icon = 'file:icon.svg';
        this.properties = [
            {
                displayName: 'Authentication Type',
                name: 'authType',
                type: 'options',
                options: [
                    {
                        name: 'JWT Bearer Token',
                        value: 'bearer',
                    },
                    {
                        name: 'API Key',
                        value: 'apikey',
                    },
                ],
                default: 'bearer',
                description: 'Choose authentication method: Bearer token (JWT) or API Key',
                required: true,
            },
            {
                displayName: 'JWT Bearer Token',
                name: 'bearerToken',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                description: 'Your JWT authentication token from Supabase Auth. Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                displayOptions: {
                    show: {
                        authType: ['bearer'],
                    },
                },
                placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                description: 'Your API key for authentication. Format: evapi_...',
                displayOptions: {
                    show: {
                        authType: ['apikey'],
                    },
                },
                placeholder: 'evapi_...',
            },
        ];
    }
}
exports.EmailValidatorApi = EmailValidatorApi;
