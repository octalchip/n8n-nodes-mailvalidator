"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailValidator = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
const EmailValidation_1 = require("./EmailValidation");
class EmailValidator {
    constructor() {
        this.description = {
            displayName: 'Email Validator',
            name: 'emailValidator',
            icon: 'file:icon.svg',
            group: ['transform'],
            version: 1.1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Validate emails from Google Sheets and update status',
            defaults: {
                name: 'Email Validator',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'emailValidatorApi',
                    required: true,
                },
                {
                    name: 'googleSheetsOAuth2Api',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Google Sheet ID/URL',
                    name: 'sheetId',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'The ID of the Google Sheet to read from and update',
                },
                {
                    displayName: 'Sheet Name',
                    name: 'sheetName',
                    type: 'string',
                    required: true,
                    default: 'Sheet1',
                    description: 'The name of the sheet tab',
                },
                {
                    displayName: 'Email Column',
                    name: 'emailColumn',
                    type: 'string',
                    required: true,
                    default: 'email',
                    description: 'Column name containing email addresses',
                },
                {
                    displayName: 'Status Column',
                    name: 'statusColumn',
                    type: 'string',
                    required: true,
                    default: 'status',
                    description: 'Column name for validation status',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        // Fixed API Base URL
        const baseUrl = 'https://api.octalchip.com';
        // Get credentials for API validation
        const credentials = await this.getCredentials('emailValidatorApi');
        const authType = credentials.authType || 'bearer';
        const bearerToken = credentials.bearerToken;
        const apiKey = credentials.apiKey;
        // Determine authorization header based on auth type
        // Supports both formats: "Bearer <token>" and "ApiKey <key>"
        let authHeader = '';
        if (authType === 'apikey') {
            if (!apiKey || apiKey.trim() === '') {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'API Key is required when using API Key authentication. Please provide your API key in the Email Validator API credentials.');
            }
            authHeader = `ApiKey ${apiKey.trim()}`;
            this.logger?.info('Using API Key authentication');
        }
        else {
            if (!bearerToken || bearerToken.trim() === '') {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'JWT Bearer Token is required when using Bearer token authentication. Please provide your JWT token in the Email Validator API credentials.');
            }
            authHeader = `Bearer ${bearerToken.trim()}`;
            this.logger?.info('Using JWT Bearer Token authentication');
        }
        // Log auth header format (first 30 chars only for security)
        this.logger?.debug(`Auth header format: ${authHeader.substring(0, 30)}...`);
        // Get node parameters
        let sheetId = this.getNodeParameter('sheetId', 0);
        const sheetName = this.getNodeParameter('sheetName', 0);
        const emailColumn = this.getNodeParameter('emailColumn', 0);
        const statusColumn = this.getNodeParameter('statusColumn', 0);
        // Extract sheet ID from URL if full URL is provided
        // Format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit...
        if (sheetId.includes('docs.google.com') || sheetId.includes('/')) {
            const match = sheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            if (match && match[1]) {
                sheetId = match[1];
                this.logger?.info(`Extracted sheet ID: ${sheetId}`);
            }
            else {
                // Try to extract from any URL format
                const urlParts = sheetId.split('/');
                const idPart = urlParts.find(part => part.length > 20 && /^[a-zA-Z0-9-_]+$/.test(part));
                if (idPart) {
                    sheetId = idPart.split('?')[0];
                    this.logger?.info(`Extracted sheet ID from URL: ${sheetId}`);
                }
                else {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Invalid Google Sheets URL. Could not extract sheet ID. Please provide just the sheet ID (e.g., 1dyiCnsqgqsp7MqWzo2kPzdL8usLEv6w1z3Y-y1Gabso)');
                }
            }
        }
        // Fixed values for batch processing
        const batchSize = 5;
        const delaySeconds = 5;
        const apiEndpoint = 'emailvalidator';
        // Collect all emails from input items
        const emails = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const email = item.json[emailColumn] || item.json.email;
            if (email && typeof email === 'string' && email.trim()) {
                emails.push({
                    email: email.toLowerCase().trim(),
                    rowIndex: i,
                    originalData: item.json,
                });
            }
        }
        if (emails.length === 0) {
            this.logger?.warn('No valid emails found in input items');
            return [returnData];
        }
        this.logger?.info(`Processing ${emails.length} emails in batches of ${batchSize}`);
        // Process emails in batches
        const allResults = [];
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            const batchResults = [];
            // Validate batch
            for (const emailData of batch) {
                try {
                    this.logger?.info(`Validating email: ${emailData.email}`);
                    // Mark as processing in sheet
                    await updateSheetRow.call(this, sheetId, sheetName, emailData.rowIndex + 2, // +2 because row 1 is header, and rowIndex is 0-based
                    {
                        [statusColumn]: 'processing',
                    });
                    // Validate email via API
                    this.logger?.info(`Validating email via API: ${emailData.email}`);
                    const validationResult = await (0, EmailValidation_1.validateEmail)(emailData.email);
                    this.logger?.info(`API validation completed for ${emailData.email}: ${validationResult.status}`);
                    // Get status from validation result
                    const status = validationResult.status || 'unknown';
                    this.logger?.info(`Final status for ${emailData.email}: ${status}`);
                    // Update sheet with result
                    await updateSheetRow.call(this, sheetId, sheetName, emailData.rowIndex + 2, {
                        [statusColumn]: status,
                    });
                    // Store result
                    batchResults.push({
                        email: emailData.email,
                        status,
                        originalData: emailData.originalData,
                        validationResult: {
                            success: true,
                            data: validationResult
                        },
                    });
                }
                catch (error) {
                    // Update sheet with error
                    await updateSheetRow.call(this, sheetId, sheetName, emailData.rowIndex + 2, {
                        [statusColumn]: 'error',
                    });
                    batchResults.push({
                        email: emailData.email,
                        status: 'error',
                        originalData: emailData.originalData,
                        error: error.message,
                    });
                }
            }
            allResults.push(...batchResults);
            // Wait before next batch (except for the last batch)
            if (i + batchSize < emails.length) {
                await sleep(delaySeconds * 1000);
            }
        }
        // Process validation results and update credit information
        let creditInfo = null;
        if (allResults.length > 0) {
            try {
                this.logger?.info(`Processing validation results for ${allResults.length} emails`);
                const emailsToProcess = allResults.map(r => r.email);
                const creditResponse = await processValidation.call(this, baseUrl, authHeader, emailsToProcess);
                creditInfo = creditResponse;
                this.logger?.info(`Successfully processed ${allResults.length} email validations`);
            }
            catch (error) {
                this.logger?.error(`Failed to process validation results: ${error.message}`);
                // Don't throw - validation is complete, processing failure shouldn't stop the workflow
                // The validation results are already saved to the sheet
            }
        }
        // Return results
        for (const result of allResults) {
            // Extract originalData but ensure status from validation takes precedence
            const { status: originalStatus, ...restOriginalData } = result.originalData || {};
            returnData.push({
                json: {
                    email: result.email,
                    status: result.status, // Use status from API validation, not from originalData
                    ...restOriginalData,
                    validationDetails: result.validationResult,
                },
            });
        }
        // Add credit details only once at the end of the response
        if (creditInfo) {
            returnData.push({
                json: {
                    credits: {
                        creditsUsed: creditInfo.creditsUsed || 0,
                        creditsRemaining: creditInfo.creditsRemaining || 0,
                        creditsTotal: creditInfo.creditsTotal || 0,
                        creditsUsedTotal: creditInfo.creditsUsedTotal || creditInfo.creditsUsed || 0,
                    },
                },
            });
        }
        return [returnData];
    }
}
exports.EmailValidator = EmailValidator;
// Helper function to process validation results via API
async function processValidation(baseUrl, authHeader, emails) {
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const url = `${cleanBaseUrl}/emailvalidator`;
    const requestBody = {
        emails: emails,
        validationType: 'bulk'
    };
    this.logger?.info(`Processing validation results via API: ${url}`);
    this.logger?.debug(`Request body: ${JSON.stringify({ ...requestBody, emails: `[${emails.length} emails]` })}`);
    this.logger?.debug(`Auth header format: ${authHeader.substring(0, 30)}...`);
    const options = {
        method: 'POST',
        url: url,
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        },
        body: requestBody,
        json: true,
    };
    try {
        const result = await this.helpers.request(options);
        this.logger?.info(`Validation processing completed. Credits remaining: ${result.creditsRemaining || 'unknown'}`);
        // Return credit details from the response
        return {
            creditsUsed: result.creditsUsed || 0,
            creditsRemaining: result.creditsRemaining || 0,
            creditsTotal: result.creditsTotal || 0,
            creditsUsedTotal: result.creditsUsedTotal || result.creditsUsed || 0,
        };
    }
    catch (error) {
        this.logger?.error(`Validation processing failed: ${error.message}`);
        throw error;
    }
}
async function updateSheetRow(sheetId, sheetName, rowIndex, updates) {
    try {
        // Ensure sheetId doesn't contain URL parts
        const cleanSheetId = sheetId.split('/').pop()?.split('?')[0] || sheetId;
        // Get first row to find column indices
        const headerRange = `${sheetName}!1:1`;
        const headerResponse = await GenericFunctions_1.googleApiRequest.call(this, 'GET', `/v4/spreadsheets/${cleanSheetId}/values/${encodeURIComponent(headerRange)}`, {});
        const headers = headerResponse.values?.[0] || [];
        const columnIndices = {};
        headers.forEach((header, index) => {
            columnIndices[header] = index;
        });
        // Get current row values to preserve existing data (especially email column)
        const currentRowRange = `${sheetName}!${rowIndex}:${rowIndex}`;
        const currentRowResponse = await GenericFunctions_1.googleApiRequest.call(this, 'GET', `/v4/spreadsheets/${cleanSheetId}/values/${encodeURIComponent(currentRowRange)}`, {});
        // Start with current row values (or empty array if row doesn't exist)
        const currentRowValues = currentRowResponse.values?.[0] || [];
        const rowValues = [...currentRowValues];
        // Ensure rowValues array has enough elements for all columns
        while (rowValues.length < headers.length) {
            rowValues.push('');
        }
        // Update only the specified columns, preserving all other values (including email)
        Object.keys(updates).forEach((columnName) => {
            const colIndex = columnIndices[columnName];
            if (colIndex !== undefined) {
                rowValues[colIndex] = updates[columnName];
            }
        });
        // Update the entire row (but now with preserved values)
        const updateRange = `${sheetName}!${rowIndex}:${rowIndex}`;
        await GenericFunctions_1.googleApiRequest.call(this, 'PUT', `/v4/spreadsheets/${cleanSheetId}/values/${encodeURIComponent(updateRange)}`, {
            values: [rowValues],
        }, {
            valueInputOption: 'USER_ENTERED',
        });
    }
    catch (error) {
        // If update fails, log but don't throw to allow processing to continue
        const errorMessage = error.message || JSON.stringify(error);
        this.logger?.error(`Failed to update sheet row ${rowIndex}: ${errorMessage}`);
        // Check if it's an authentication error
        if (errorMessage.includes('401') || errorMessage.includes('UNAUTHENTICATED')) {
            this.logger?.warn('Google Sheets authentication failed. Please re-authenticate your Google Sheets OAuth2 credentials in n8n.');
        }
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
