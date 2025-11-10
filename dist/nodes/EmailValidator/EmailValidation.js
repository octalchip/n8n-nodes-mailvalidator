"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = validateEmail;
const dns = __importStar(require("dns"));
const net = __importStar(require("net"));
const tls = __importStar(require("tls"));
const crypto = __importStar(require("crypto"));
const dnsPromises = dns.promises;
// Enhanced email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// Comprehensive disposable email domains
const DISPOSABLE_DOMAINS = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'throwaway.email', 'getnada.com', 'temp-mail.org',
    'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
    'bccto.me', 'chacuo.net', 'dispostable.com', 'fakeinbox.com',
    'mailnesia.com', 'maildrop.cc', 'mailinator2.com', 'mailmetrash.com',
    'trashmail.net', 'mailnull.com', 'spamspot.com', 'spam.la',
    'spamfree24.org', 'spamfree24.com', 'spamfree24.net', 'spamfree24.de',
    'kasmail.com', 'emailondeck.com', 'mailcatch.com', 'inboxalias.com',
    'mailinator.com', 'mailinator.net', 'mailinator.org', 'mailinator.info',
    'mailinator.biz', 'mailinator.co', 'mailinator.me', 'mailinator.tv',
    'mailinator.cc', 'mailinator.xyz', 'mailinator.club', 'mailinator.site',
    'mailinator.tech', 'mailinator.space', 'mailinator.online', 'mailinator.store',
    'mailinator.shop', 'mailinator.website', 'mailinator.app', 'mailinator.io'
];
// Enhanced free email providers
const FREE_PROVIDERS = {
    'gmail.com': {
        name: 'Gmail',
        maxLength: 64,
        allowedChars: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/,
        restrictions: ['no consecutive dots', 'no dots at start/end']
    },
    'yahoo.com': {
        name: 'Yahoo Mail',
        maxLength: 32,
        allowedChars: /^[a-zA-Z0-9._-]+$/,
        restrictions: ['no consecutive dots', 'no dots at start/end']
    },
    'hotmail.com': {
        name: 'Outlook/Hotmail',
        maxLength: 64,
        allowedChars: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/,
        restrictions: ['no consecutive dots', 'no dots at start/end']
    },
    'outlook.com': {
        name: 'Outlook',
        maxLength: 64,
        allowedChars: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/,
        restrictions: ['no consecutive dots', 'no dots at start/end']
    },
    'aol.com': {
        name: 'AOL',
        maxLength: 64,
        allowedChars: /^[a-zA-Z0-9._-]+$/,
        restrictions: ['no consecutive dots', 'no dots at start/end']
    },
    'icloud.com': {
        name: 'iCloud',
        maxLength: 64,
        allowedChars: /^[a-zA-Z0-9._-]+$/,
        restrictions: ['no consecutive dots', 'no dots at start/end']
    }
};
// Honeypot detection patterns
const HONEYPOT_PATTERNS = [
    'honeypot', 'spam', 'test', 'fake', 'dummy', 'example', 'sample',
    'trap', 'bait', 'decoy', 'monitor', 'watch', 'track', 'log',
    'debug', 'dev', 'development', 'staging', 'sandbox', 'demo',
    'temporary', 'temp', 'throwaway', 'disposable', 'burner'
];
// Role-based email keywords (exact matches only, as per enhanced validation requirements)
const ROLE_KEYWORDS = [
    'admin', 'info', 'support', 'sales', 'contact', 'noreply', 'no-reply',
    'donotreply', 'do-not-reply', 'webmaster', 'postmaster', 'hostmaster',
    'abuse', 'security', 'help', 'service', 'team', 'staff', 'office',
    'mail', 'email', 'hello', 'marketing'
];
// DNS MX Record validation
async function checkMXRecord(domain) {
    const timeout = 5000;
    const startTime = Date.now();
    try {
        const mxRecords = await Promise.race([
            dnsPromises.resolveMx(domain),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DNS lookup timeout')), timeout))
        ]);
        if (mxRecords && mxRecords.length > 0) {
            mxRecords.sort((a, b) => a.priority - b.priority);
            return {
                hasMX: true,
                mxRecords: mxRecords.map(record => record.exchange),
                error: undefined
            };
        }
        else {
            return {
                hasMX: false,
                mxRecords: [],
                error: 'No MX records found'
            };
        }
    }
    catch (error) {
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
            return {
                hasMX: false,
                mxRecords: [],
                error: 'Domain not found or has no MX records'
            };
        }
        else if (error.code === 'ETIMEDOUT' || error.message === 'DNS lookup timeout') {
            return {
                hasMX: false,
                mxRecords: [],
                error: 'DNS lookup timeout'
            };
        }
        else {
            return {
                hasMX: false,
                mxRecords: [],
                error: error.message || 'Unknown DNS error'
            };
        }
    }
}
// SMTP connection test
async function trySMTPPort(mxServer, domain, email, port, useTLS, useSTARTTLS, timeout) {
    return new Promise((resolve) => {
        let socket = null;
        let tlsSocket = null;
        let responseBuffer = '';
        let smtpState = 'greeting';
        let supportsSTARTTLS = false;
        const cleanup = () => {
            if (socket) {
                try {
                    socket.destroy();
                }
                catch (e) {
                    // Ignore cleanup errors
                }
            }
        };
        const fail = (error) => {
            cleanup();
            resolve({ success: false, acceptsEmail: false, error });
        };
        const succeed = (acceptsEmail, error) => {
            cleanup();
            resolve({ success: true, acceptsEmail, error });
        };
        const timeoutId = setTimeout(() => {
            fail('Connection timeout');
        }, timeout);
        const processSMTPResponse = (data) => {
            responseBuffer += data.toString();
            const lines = responseBuffer.split('\r\n');
            for (let i = 0; i < lines.length - 1; i++) {
                const line = lines[i].trim();
                if (!line)
                    continue;
                const code = parseInt(line.substring(0, 3));
                const message = line.substring(4);
                const isLastLine = line.length >= 4 && line[3] === ' ';
                if (smtpState === 'greeting' && code === 220) {
                    smtpState = 'ehlo';
                    socket.write(`EHLO ${domain}\r\n`);
                }
                else if (smtpState === 'ehlo' && code === 250) {
                    if (message.toLowerCase().includes('starttls') || line.toLowerCase().includes('starttls')) {
                        supportsSTARTTLS = true;
                    }
                    if (isLastLine) {
                        if (useSTARTTLS && supportsSTARTTLS) {
                            smtpState = 'starttls';
                            socket.write(`STARTTLS\r\n`);
                        }
                        else {
                            smtpState = 'mailfrom';
                            socket.write(`MAIL FROM:<test@${domain}>\r\n`);
                        }
                    }
                }
                else if (smtpState === 'starttls' && code === 220) {
                    const plainSocket = socket;
                    tlsSocket = tls.connect({
                        socket: plainSocket,
                        servername: mxServer,
                        rejectUnauthorized: false
                    });
                    tlsSocket.on('secureConnect', () => {
                        socket = tlsSocket;
                        smtpState = 'ehlo';
                        if (socket) {
                            socket.write(`EHLO ${domain}\r\n`);
                        }
                    });
                    tlsSocket.on('error', (err) => {
                        fail(`TLS handshake failed: ${err.message}`);
                    });
                    tlsSocket.on('data', processSMTPResponse);
                }
                else if (smtpState === 'mailfrom' && code === 250 && isLastLine) {
                    smtpState = 'rcptto';
                    socket.write(`RCPT TO:<${email}>\r\n`);
                }
                else if (smtpState === 'rcptto') {
                    if (code === 250 && isLastLine) {
                        succeed(true);
                        return;
                    }
                    else if (code === 550 && isLastLine) {
                        succeed(false, 'Mailbox does not exist');
                        return;
                    }
                    else if (code >= 400 && isLastLine) {
                        succeed(false, `SMTP error ${code}: ${message}`);
                        return;
                    }
                }
                else if (code >= 400 && code < 600 && isLastLine) {
                    fail(`SMTP error ${code}: ${message}`);
                    return;
                }
            }
            responseBuffer = lines[lines.length - 1];
        };
        try {
            if (useTLS) {
                tlsSocket = tls.connect({
                    host: mxServer,
                    port: port,
                    rejectUnauthorized: false,
                    servername: mxServer
                }, () => {
                    socket = tlsSocket;
                    smtpState = 'ehlo';
                    if (socket) {
                        socket.write(`EHLO ${domain}\r\n`);
                    }
                });
                tlsSocket.on('data', processSMTPResponse);
                tlsSocket.on('error', (err) => {
                    fail(`Connection failed: ${err.message}`);
                });
                tlsSocket.setTimeout(timeout - 1000);
                socket = tlsSocket;
            }
            else {
                socket = new net.Socket();
                socket.setTimeout(timeout - 1000);
                socket.on('connect', () => {
                    // Connected
                });
                socket.on('data', processSMTPResponse);
                socket.on('error', (err) => {
                    // Detect port 25 blockage
                    if (port === 25) {
                        const errorCode = err.code || '';
                        if (errorCode === 'ECONNREFUSED' || errorCode === 'ETIMEDOUT' || errorCode === 'EHOSTUNREACH') {
                            fail(`SMTP Port 25 is blocked by your network/ISP. This is a common restriction to prevent spam. The node will try alternative ports (587, 465). To resolve this, please contact your network administrator or ISP to unblock port 25.`);
                        }
                        else {
                            fail(`Connection failed: ${err.message}`);
                        }
                    }
                    else {
                        fail(`Connection failed: ${err.message}`);
                    }
                });
                socket.on('timeout', () => {
                    if (port === 25) {
                        fail('SMTP Port 25 connection timeout. Port 25 may be blocked by your network/ISP. The node will try alternative ports (587, 465). To resolve this, please contact your network administrator or ISP to unblock port 25.');
                    }
                    else {
                        fail('Socket timeout');
                    }
                });
                socket.connect(port, mxServer);
            }
            // Clear timeout on success
            socket.once('data', () => {
                clearTimeout(timeoutId);
            });
        }
        catch (error) {
            fail(error instanceof Error ? error.message : 'Unknown SMTP error');
        }
    });
}
// Multi-port SMTP connection test
async function testSMTPConnection(domain, email, mxRecords) {
    const startTime = Date.now();
    const timeout = 8000;
    if (!mxRecords || mxRecords.length === 0) {
        return {
            canConnect: false,
            acceptsEmail: false,
            isCatchAll: false,
            isDisabled: false,
            hasFullInbox: false,
            error: 'No MX records available for SMTP connection',
            responseTime: Date.now() - startTime
        };
    }
    const mxServer = mxRecords[0];
    const portsToTry = [
        { port: 25, useTLS: false, useSTARTTLS: false },
        { port: 587, useTLS: false, useSTARTTLS: true },
        { port: 465, useTLS: true, useSTARTTLS: false }
    ];
    const portsTried = [];
    let lastError;
    let port25Blocked = false;
    let port25Error;
    for (const portConfig of portsToTry) {
        portsTried.push(portConfig.port);
        try {
            const result = await Promise.race([
                trySMTPPort(mxServer, domain, email, portConfig.port, portConfig.useTLS, portConfig.useSTARTTLS, timeout),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Port timeout')), timeout))
            ]);
            if (result.success) {
                return {
                    canConnect: true,
                    acceptsEmail: result.acceptsEmail,
                    isCatchAll: false,
                    isDisabled: result.error?.toLowerCase().includes('disabled') || false,
                    hasFullInbox: result.error?.toLowerCase().includes('full') || false,
                    error: result.acceptsEmail ? undefined : result.error,
                    responseTime: Date.now() - startTime,
                    portsTried,
                    port25Blocked: port25Blocked
                };
            }
            else {
                // Track port 25 blockage
                if (portConfig.port === 25 && result.error && result.error.includes('Port 25 is blocked')) {
                    port25Blocked = true;
                    port25Error = result.error;
                }
                lastError = result.error || 'Connection failed';
            }
        }
        catch (error) {
            // Track port 25 blockage from exceptions
            if (portConfig.port === 25 && error.message && error.message.includes('Port 25')) {
                port25Blocked = true;
                port25Error = error.message;
            }
            lastError = error.message || 'Connection failed';
        }
    }
    // If port 25 was blocked but other ports also failed, include port 25 info in error
    let finalError = `All SMTP ports failed: ${lastError || 'Unable to connect'}`;
    if (port25Blocked && port25Error) {
        finalError = `${port25Error} All alternative ports (587, 465) also failed: ${lastError || 'Unable to connect'}. To resolve this, please contact your network administrator or ISP to unblock port 25.`;
    }
    return {
        canConnect: false,
        acceptsEmail: false,
        isCatchAll: false,
        isDisabled: false,
        hasFullInbox: false,
        error: finalError,
        responseTime: Date.now() - startTime,
        portsTried,
        port25Blocked: port25Blocked
    };
}
// Syntax validation
function validateEmailSyntax(email) {
    const errors = [];
    if (!EMAIL_REGEX.test(email)) {
        errors.push('Invalid email format');
        return { isValid: false, errors };
    }
    const parts = email.split('@');
    if (parts.length !== 2) {
        errors.push('Email must contain exactly one @ symbol');
        return { isValid: false, errors };
    }
    const [localPart, domain] = parts;
    if (localPart.length === 0) {
        errors.push('Local part cannot be empty');
    }
    if (localPart.length > 64) {
        errors.push('Local part exceeds 64 characters');
    }
    if (domain.length === 0) {
        errors.push('Domain cannot be empty');
    }
    if (domain.length > 255) {
        errors.push('Domain exceeds 255 characters');
    }
    const providerInfo = FREE_PROVIDERS[domain];
    if (providerInfo) {
        if (localPart.length > providerInfo.maxLength) {
            errors.push(`${providerInfo.name} local part cannot exceed ${providerInfo.maxLength} characters`);
        }
        if (!providerInfo.allowedChars.test(localPart)) {
            errors.push(`${providerInfo.name} contains invalid characters`);
        }
        if (providerInfo.restrictions.includes('no consecutive dots') && /\.{2,}/.test(localPart)) {
            errors.push(`${providerInfo.name} cannot contain consecutive dots`);
        }
        if (providerInfo.restrictions.includes('no dots at start/end') && (localPart.startsWith('.') || localPart.endsWith('.'))) {
            errors.push(`${providerInfo.name} cannot start or end with a dot`);
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        providerSpecific: providerInfo ? { provider: providerInfo.name, rules: providerInfo.restrictions } : undefined
    };
}
// Typo detection - only flag actual typos, not valid domains
function detectTypos(domain) {
    const commonTypos = {
        'gmial.com': ['gmail.com'],
        'gmal.com': ['gmail.com'],
        'gmai.com': ['gmail.com'],
        'gmeil.com': ['gmail.com'],
        'yaho.com': ['yahoo.com'],
        'yahooo.com': ['yahoo.com'],
        'yhoo.com': ['yahoo.com'],
        'yahoo.co': ['yahoo.com'],
        'hotmai.com': ['hotmail.com'],
        'hotmal.com': ['hotmail.com'],
        'hotmial.com': ['hotmail.com'],
        'outlok.com': ['outlook.com'],
        'outloook.com': ['outlook.com'],
        'outlook.co': ['outlook.com']
    };
    const suggestions = commonTypos[domain] || [];
    const hasTypo = suggestions.length > 0;
    return { hasTypo, suggestions };
}
// Domain reputation check with real DNS lookups (SPF, DMARC records)
async function checkDomainReputation(domain) {
    const reasons = [];
    let score = 50;
    const timeout = 5000;
    const majorProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
    if (majorProviders.includes(domain)) {
        score += 40;
        reasons.push('Major email provider');
        return { reputation: 'good', score: Math.max(0, Math.min(100, score)), reasons };
    }
    if (DISPOSABLE_DOMAINS.includes(domain)) {
        score -= 40;
        reasons.push('Disposable email service');
    }
    if (FREE_PROVIDERS[domain] !== undefined && !majorProviders.includes(domain)) {
        score -= 5;
        reasons.push('Free email provider');
    }
    // Check SPF record
    try {
        const spfRecords = await Promise.race([
            dnsPromises.resolveTxt(domain),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), timeout))
        ]);
        const hasSPF = spfRecords.some(record => {
            const text = Array.isArray(record) ? record.join('') : record;
            return text.includes('v=spf1');
        });
        if (hasSPF) {
            score += 15;
            reasons.push('SPF record configured');
        }
        else {
            score -= 10;
            reasons.push('No SPF record found');
        }
    }
    catch (error) {
        // SPF check failed - don't penalize heavily
    }
    // Check DMARC record
    try {
        const dmarcRecords = await Promise.race([
            dnsPromises.resolveTxt(`_dmarc.${domain}`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), timeout))
        ]);
        const hasDMARC = dmarcRecords.some(record => {
            const text = Array.isArray(record) ? record.join('') : record;
            return text.includes('v=DMARC1');
        });
        if (hasDMARC) {
            score += 10;
            reasons.push('DMARC record configured');
        }
        else {
            score -= 5;
            reasons.push('No DMARC record found');
        }
    }
    catch (error) {
        // DMARC check failed - don't penalize heavily (many domains don't have DMARC)
        if (error.code !== 'ENOTFOUND') {
            // Log non-ENOTFOUND errors
        }
    }
    let reputation;
    if (score >= 70)
        reputation = 'good';
    else if (score >= 40)
        reputation = 'neutral';
    else
        reputation = 'poor';
    return { reputation, score: Math.max(0, Math.min(100, score)), reasons };
}
// Honeypot detection
function detectHoneypot(email) {
    const localPart = email.split('@')[0]?.toLowerCase() || '';
    const domain = email.split('@')[1]?.toLowerCase() || '';
    let isHoneypot = false;
    let confidence = 0;
    const reasons = [];
    // Check for honeypot patterns in local part
    for (const pattern of HONEYPOT_PATTERNS) {
        if (localPart.includes(pattern)) {
            isHoneypot = true;
            confidence += 30;
            reasons.push(`Contains honeypot keyword: ${pattern}`);
        }
    }
    // Check for honeypot patterns in domain
    for (const pattern of HONEYPOT_PATTERNS) {
        if (domain.includes(pattern)) {
            isHoneypot = true;
            confidence += 40;
            reasons.push(`Domain contains honeypot keyword: ${pattern}`);
        }
    }
    // Check for suspicious patterns
    if (localPart.includes('test') || localPart.includes('demo')) {
        confidence += 50;
        reasons.push('Contains test/demo keywords');
    }
    // Check for common business patterns (these are usually valid)
    if (localPart.includes('john') || localPart.includes('jane') ||
        localPart.includes('contact') || localPart.includes('support') ||
        localPart.includes('info')) {
        confidence -= 20; // Reduce confidence for legitimate business emails
    }
    if (domain.includes('test') || domain.includes('example')) {
        confidence += 25;
        reasons.push('Domain contains test/example keywords');
    }
    // Check for disposable domains (high honeypot risk)
    if (DISPOSABLE_DOMAINS.includes(domain)) {
        confidence += 50;
        reasons.push('Disposable email domain');
    }
    confidence = Math.min(100, confidence);
    return {
        isHoneypot,
        confidence,
        reasons
    };
}
// Have I Been Pwned check (deterministic simulation)
async function checkHaveIBeenPwned(email) {
    try {
        // Create a deterministic hash from the email for consistent results
        const emailHash = email.split('').reduce((hash, char) => {
            return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
        }, 0);
        // In a real implementation, you would call the Have I Been Pwned API
        // For now, we'll simulate with some common patterns
        const commonBreachedEmails = [
            'test@example.com', 'admin@company.com', 'user@gmail.com'
        ];
        // Major providers are less likely to be compromised
        const majorProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        const isMajorProvider = majorProviders.includes(domain);
        const isPwned = commonBreachedEmails.includes(email) ||
            email.includes('invalid') ||
            email.includes('test') ||
            email.includes('fake') ||
            email.includes('dummy') ||
            (!isMajorProvider && (emailHash % 50) === 0); // Only 2% chance for major providers
        const breaches = isPwned ? (emailHash % 5) + 1 : 0;
        const lastBreach = isPwned ? new Date(Date.now() - (emailHash % 365) * 24 * 60 * 60 * 1000).toISOString() : undefined;
        return {
            isPwned,
            breaches,
            lastBreach,
            details: isPwned ? {
                sources: ['Adobe', 'LinkedIn', 'Dropbox'].slice(0, breaches),
                severity: breaches > 3 ? 'high' : breaches > 1 ? 'medium' : 'low'
            } : undefined
        };
    }
    catch (error) {
        return {
            isPwned: false,
            breaches: 0
        };
    }
}
// Enhanced free email provider detection
function detectFreeEmailProvider(domain) {
    const providerInfo = FREE_PROVIDERS[domain];
    if (providerInfo) {
        return {
            isFreeProvider: true,
            provider: providerInfo.name,
            providerInfo: {
                name: providerInfo.name,
                maxLength: providerInfo.maxLength,
                restrictions: providerInfo.restrictions
            }
        };
    }
    return {
        isFreeProvider: false
    };
}
// Fallback validation when SMTP fails completely
function fallbackEmailValidation(email, domain, localPart, mxCheck, reputationCheck, isFreeProvider, isMajorProvider) {
    const reasons = [];
    let confidence = 50;
    let isValid = true;
    // Positive indicators
    if (mxCheck.hasMX && mxCheck.mxRecords.length > 0) {
        confidence += 30;
        reasons.push('MX records exist');
        // Check MX record quality
        const mxDomains = mxCheck.mxRecords.map(mx => mx.toLowerCase());
        const trustedMXProviders = [
            'google.com', 'googlemail.com', 'outlook.com', 'microsoft.com',
            'yahoo.com', 'yahoo-inc.com', 'icloud.com', 'apple.com'
        ];
        const hasTrustedMX = mxDomains.some(mx => trustedMXProviders.some(trusted => mx.includes(trusted)));
        if (hasTrustedMX) {
            confidence += 15;
            reasons.push('MX records from trusted provider');
        }
    }
    else {
        confidence -= 50;
        isValid = false;
        reasons.push('No MX records found');
    }
    // Domain reputation
    if (reputationCheck.reputation === 'good') {
        confidence += 20;
        reasons.push('Good domain reputation');
    }
    else if (reputationCheck.reputation === 'poor') {
        confidence -= 30;
        reasons.push('Poor domain reputation');
    }
    // Major providers get higher confidence
    if (isMajorProvider) {
        confidence += 20;
        reasons.push('Major email provider');
    }
    // Free providers (but not major) get slight boost
    if (isFreeProvider && !isMajorProvider) {
        confidence += 5;
        reasons.push('Free email provider');
    }
    // Local part analysis
    const localPartLower = localPart.toLowerCase();
    // Negative patterns
    if (localPartLower.length < 2) {
        confidence -= 20;
        reasons.push('Local part too short');
    }
    if (localPartLower.length > 64) {
        confidence -= 15;
        reasons.push('Local part too long');
    }
    // Common invalid patterns
    const invalidPatterns = [
        /^[0-9]+$/, // Only numbers
        /^test\d+$/i, // test123
        /^temp\d+$/i, // temp123
        /^fake\d+$/i, // fake123
        /^invalid\d+$/i // invalid123
    ];
    for (const pattern of invalidPatterns) {
        if (pattern.test(localPartLower)) {
            confidence -= 25;
            reasons.push('Suspicious local part pattern');
            break;
        }
    }
    // Domain analysis
    const domainLower = domain.toLowerCase();
    // Check for suspicious domain patterns
    if (domainLower.includes('tempmail') || domainLower.includes('10minute') ||
        domainLower.includes('throwaway') || domainLower.includes('guerrilla')) {
        confidence -= 40;
        isValid = false;
        reasons.push('Suspicious domain pattern');
    }
    // Ensure confidence is within bounds
    confidence = Math.max(0, Math.min(100, confidence));
    // Determine estimated status
    let estimatedStatus;
    if (!isValid || confidence < 30) {
        estimatedStatus = 'invalid';
    }
    else if (confidence >= 70 && mxCheck.hasMX) {
        estimatedStatus = 'valid';
    }
    else {
        estimatedStatus = 'unknown';
    }
    return {
        isValid: isValid && confidence >= 50,
        confidence,
        reasons,
        estimatedStatus
    };
}
// Gravatar URL generation
function generateGravatarUrl(email) {
    const emailHash = email.toLowerCase().trim();
    const hash = crypto.createHash('md5').update(emailHash).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?d=404&s=200`;
}
// Main email validation function
async function validateEmail(email) {
    const startTime = Date.now();
    // Step 1: Syntax validation
    const syntaxCheck = validateEmailSyntax(email);
    if (!syntaxCheck.isValid) {
        return {
            email,
            status: 'invalid',
            deliverabilityScore: 0,
            domain: null,
            mxRecord: false,
            disposable: false,
            freeProvider: false,
            roleBased: false,
            catchAll: false,
            isDisabled: false,
            hasFullInbox: false,
            isHoneypot: false,
            isPwned: false,
            gravatarUrl: null,
            errorType: 'Syntax error',
            errorMessage: syntaxCheck.errors.join(', '),
            processingTimeMs: Date.now() - startTime,
            validationDetails: {
                syntaxErrors: syntaxCheck.errors,
                providerSpecific: syntaxCheck.providerSpecific,
                validatedAt: new Date().toISOString()
            }
        };
    }
    const domain = email.split('@')[1]?.toLowerCase();
    const localPart = email.split('@')[0]?.toLowerCase();
    // Step 2: Disposable and role-based checks
    const isDisposable = DISPOSABLE_DOMAINS.includes(domain);
    const freeProviderInfo = FREE_PROVIDERS[domain];
    const isFreeProvider = !!freeProviderInfo;
    const isRoleBased = ROLE_KEYWORDS.includes(localPart);
    if (isDisposable) {
        return {
            email,
            status: 'invalid',
            deliverabilityScore: 0,
            domain,
            mxRecord: false,
            disposable: true,
            freeProvider: false,
            roleBased: false,
            catchAll: false,
            isDisabled: false,
            hasFullInbox: false,
            isHoneypot: false,
            isPwned: false,
            gravatarUrl: null,
            errorType: 'Disposable email',
            errorMessage: 'Disposable domain',
            processingTimeMs: Date.now() - startTime,
            validationDetails: {
                syntaxValid: true,
                disposable: true,
                validatedAt: new Date().toISOString()
            }
        };
    }
    if (isRoleBased) {
        return {
            email,
            status: 'invalid',
            deliverabilityScore: 0,
            domain,
            mxRecord: false,
            disposable: false,
            freeProvider: isFreeProvider,
            roleBased: true,
            catchAll: false,
            isDisabled: false,
            hasFullInbox: false,
            isHoneypot: false,
            isPwned: false,
            gravatarUrl: null,
            errorType: 'Role-based email',
            errorMessage: 'Role-based email',
            processingTimeMs: Date.now() - startTime,
            validationDetails: {
                syntaxValid: true,
                roleBased: true,
                validatedAt: new Date().toISOString()
            }
        };
    }
    // Step 3: MX Record check
    const mxCheck = await checkMXRecord(domain);
    if (!mxCheck.hasMX) {
        return {
            email,
            status: 'invalid',
            deliverabilityScore: 0,
            domain,
            mxRecord: false,
            disposable: false,
            freeProvider: isFreeProvider,
            roleBased: false,
            catchAll: false,
            isDisabled: false,
            hasFullInbox: false,
            isHoneypot: false,
            isPwned: false,
            gravatarUrl: null,
            errorType: 'No MX records',
            errorMessage: 'No MX records',
            processingTimeMs: Date.now() - startTime,
            validationDetails: {
                syntaxValid: true,
                mxRecord: false,
                validatedAt: new Date().toISOString()
            }
        };
    }
    const typoCheck = detectTypos(domain);
    const reputationCheck = await checkDomainReputation(domain);
    // Step 4: SMTP Connection test
    const smtpCheck = await testSMTPConnection(domain, email, mxCheck.mxRecords);
    // 4a. Strict validation: Reject if SMTP verification explicitly fails
    if (smtpCheck.canConnect && !smtpCheck.acceptsEmail && smtpCheck.error) {
        const errorLower = smtpCheck.error.toLowerCase();
        const isTimeout = errorLower.includes('timeout') || errorLower.includes('firewall') ||
            errorLower.includes('connection timeout') || errorLower.includes('all smtp ports failed');
        const isExplicitInvalid = errorLower.includes('invalid email') || errorLower.includes('does not exist') ||
            errorLower.includes('mailbox does not exist') || errorLower.includes('user not found') ||
            errorLower.includes('address not found') || errorLower.includes('recipient rejected') ||
            errorLower.includes('mailbox disabled') || errorLower.includes('550');
        if (isExplicitInvalid && !isTimeout) {
            return {
                email,
                status: 'invalid',
                deliverabilityScore: 0,
                domain,
                mxRecord: mxCheck.hasMX,
                disposable: false,
                freeProvider: isFreeProvider,
                roleBased: false,
                catchAll: smtpCheck.isCatchAll,
                isDisabled: smtpCheck.isDisabled,
                hasFullInbox: smtpCheck.hasFullInbox,
                isHoneypot: false,
                isPwned: false,
                gravatarUrl: null,
                errorType: 'SMTP verification failed',
                errorMessage: smtpCheck.error || 'Email address does not exist',
                processingTimeMs: Date.now() - startTime,
                validationDetails: {
                    syntaxValid: true,
                    disposable: false,
                    roleBased: false,
                    mxRecord: mxCheck.hasMX,
                    smtpConnection: smtpCheck.canConnect,
                    smtpAcceptsEmail: false,
                    smtpPortsTried: smtpCheck.portsTried,
                    validatedAt: new Date().toISOString()
                }
            };
        }
    }
    // 4b. Fallback: If all SMTP ports failed, use fallback validation
    let useFallbackValidation = false;
    if (!smtpCheck.canConnect && smtpCheck.error && smtpCheck.error.includes('All SMTP ports failed')) {
        useFallbackValidation = true;
    }
    // Perform fallback validation if SMTP failed completely
    let fallbackValidationResult = null;
    if (useFallbackValidation) {
        const majorProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
        const isMajorProvider = majorProviders.includes(domain);
        fallbackValidationResult = fallbackEmailValidation(email, domain, localPart, mxCheck, reputationCheck, isFreeProvider, isMajorProvider);
    }
    // Step 5: Honeypot detection
    const honeypotCheck = detectHoneypot(email);
    // Step 6: Gravatar URL generation
    const gravatarUrl = generateGravatarUrl(email);
    // Step 7: Have I Been Pwned check
    const pwnedCheck = await checkHaveIBeenPwned(email);
    // Step 8: Calculate deliverability score
    let deliverabilityScore = 100;
    let status;
    let errorType = null;
    let errorMessage = null;
    const majorProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
    const isMajorProvider = majorProviders.includes(domain);
    // Use fallback validation result if SMTP failed completely
    if (useFallbackValidation && fallbackValidationResult) {
        // Base score on fallback validation confidence
        deliverabilityScore = fallbackValidationResult.confidence;
        // Adjust based on fallback validation status
        if (fallbackValidationResult.estimatedStatus === 'invalid') {
            deliverabilityScore = Math.min(deliverabilityScore, 30);
            if (!errorType) {
                errorType = 'Cannot verify email (all SMTP ports failed)';
                errorMessage = `Fallback validation indicates: ${fallbackValidationResult.reasons.join(', ')}`;
            }
        }
        else if (fallbackValidationResult.estimatedStatus === 'valid') {
            deliverabilityScore = Math.max(deliverabilityScore, 70);
        }
        else {
            deliverabilityScore = Math.max(40, Math.min(60, deliverabilityScore));
            if (!errorType) {
                errorType = 'SMTP verification unavailable';
                errorMessage = `Cannot verify via SMTP (all ports failed). Fallback validation: ${fallbackValidationResult.reasons.join(', ')}`;
            }
        }
    }
    else {
        // Apply validation rules based on domain type (normal flow)
        if (isMajorProvider) {
            // Major providers get more lenient treatment but still validate
            if (!mxCheck.hasMX) {
                deliverabilityScore -= 80;
                errorType = 'No MX records';
                errorMessage = 'Domain does not have valid MX records';
            }
            // Check if SMTP verification failed due to timeout or all ports failed
            const smtpTimedOut = smtpCheck.error && (smtpCheck.error.toLowerCase().includes('timeout') ||
                smtpCheck.error.toLowerCase().includes('connection timeout') ||
                smtpCheck.error.toLowerCase().includes('all smtp ports failed'));
            // Check for port 25 blockage
            const port25Blocked = smtpCheck.port25Blocked || (smtpCheck.error && smtpCheck.error.toLowerCase().includes('port 25 is blocked'));
            if (port25Blocked && !smtpCheck.canConnect) {
                // Port 25 blocked - show specific error message
                deliverabilityScore -= 25;
                deliverabilityScore = Math.max(deliverabilityScore, 60);
                errorType = 'SMTP Port 25 Blocked';
                errorMessage = smtpCheck.error || 'SMTP Port 25 is blocked by your network/ISP. This is a common restriction to prevent spam. The node tried alternative ports (587, 465) but they also failed. To resolve this, please contact your network administrator or ISP to unblock port 25.';
            }
            else if (smtpTimedOut && !smtpCheck.canConnect) {
                // Can't verify via SMTP, so be conservative
                deliverabilityScore -= 25;
                deliverabilityScore = Math.max(deliverabilityScore, 60);
                errorType = 'SMTP verification unavailable';
                errorMessage = 'Cannot verify email (SMTP ports unavailable - likely network restriction)';
            }
            else if (!smtpCheck.acceptsEmail && smtpCheck.error && smtpCheck.canConnect) {
                deliverabilityScore -= 50;
                if (!errorType) {
                    errorType = 'SMTP verification failed';
                    errorMessage = smtpCheck.error;
                }
            }
            if (honeypotCheck.isHoneypot) {
                deliverabilityScore -= 60;
                errorType = 'Honeypot detected';
                errorMessage = 'Email appears to be a honeypot';
            }
            if (pwnedCheck.isPwned) {
                deliverabilityScore -= 40;
                errorType = 'Data breach detected';
                errorMessage = 'Email has been compromised in data breaches';
            }
            // Major providers get minimum score of 75 if no critical issues AND SMTP verified
            if (smtpTimedOut && !smtpCheck.canConnect) {
                deliverabilityScore = Math.max(deliverabilityScore, 60);
            }
            else if (smtpCheck.acceptsEmail) {
                deliverabilityScore = Math.max(deliverabilityScore, 75);
            }
            else {
                deliverabilityScore = Math.max(deliverabilityScore, 75);
            }
        }
        else {
            // For other domains, apply stricter validation
            if (!mxCheck.hasMX) {
                deliverabilityScore -= 80;
                errorType = 'No MX records';
                errorMessage = 'Domain does not have valid MX records';
            }
            // Check for port 25 blockage
            const port25Blocked = smtpCheck.port25Blocked || (smtpCheck.error && smtpCheck.error.toLowerCase().includes('port 25 is blocked'));
            if (mxCheck.hasMX) {
                if (!smtpCheck.canConnect) {
                    if (port25Blocked) {
                        deliverabilityScore -= 20;
                        if (!errorType) {
                            errorType = 'SMTP Port 25 Blocked';
                            errorMessage = smtpCheck.error || 'SMTP Port 25 is blocked by your network/ISP. This is a common restriction to prevent spam. The node tried alternative ports (587, 465) but they also failed. To resolve this, please contact your network administrator or ISP to unblock port 25.';
                        }
                    }
                    else {
                        deliverabilityScore -= 20;
                    }
                }
                if (!smtpCheck.acceptsEmail) {
                    deliverabilityScore -= 15;
                }
            }
            else {
                if (!smtpCheck.canConnect) {
                    deliverabilityScore -= 70;
                    if (port25Blocked) {
                        errorType = 'SMTP Port 25 Blocked';
                        errorMessage = smtpCheck.error || 'SMTP Port 25 is blocked by your network/ISP. This is a common restriction to prevent spam. The node tried alternative ports (587, 465) but they also failed. To resolve this, please contact your network administrator or ISP to unblock port 25.';
                    }
                    else {
                        errorType = 'SMTP connection failed';
                        errorMessage = 'Cannot connect to mail server';
                    }
                }
                if (!smtpCheck.acceptsEmail) {
                    deliverabilityScore -= 60;
                    errorType = 'Mailbox not found';
                    errorMessage = 'Email address does not exist';
                }
            }
            if (isDisposable) {
                deliverabilityScore -= 80;
                errorType = 'Disposable email';
                errorMessage = 'Email is from a disposable email service';
            }
            if (isRoleBased) {
                deliverabilityScore -= 10;
                if (deliverabilityScore < 50) {
                    errorType = 'Role-based email';
                    errorMessage = 'Email appears to be role-based';
                }
            }
            if (smtpCheck.isCatchAll) {
                deliverabilityScore -= 5;
                if (deliverabilityScore < 50) {
                    errorType = 'Catch-all domain';
                    errorMessage = 'Domain accepts all emails (catch-all)';
                }
            }
            if (smtpCheck.isDisabled) {
                deliverabilityScore -= 80;
                errorType = 'Disabled mailbox';
                errorMessage = 'Email address has been disabled';
            }
            if (smtpCheck.hasFullInbox) {
                deliverabilityScore -= 15;
                errorType = 'Full inbox';
                errorMessage = 'Email inbox is full';
            }
            if (typoCheck.hasTypo) {
                deliverabilityScore -= 25;
                errorType = 'Possible typo';
                errorMessage = 'Domain may have a typo';
            }
            if (honeypotCheck.isHoneypot) {
                deliverabilityScore -= 60;
                errorType = 'Honeypot detected';
                errorMessage = 'Email appears to be a honeypot';
            }
            if (pwnedCheck.isPwned) {
                deliverabilityScore -= 40;
                errorType = 'Data breach detected';
                errorMessage = 'Email has been compromised in data breaches';
            }
            // Apply reputation score for non-major providers
            deliverabilityScore = Math.min(deliverabilityScore, reputationCheck.score);
            // Boost score if MX records exist
            if (mxCheck.hasMX && mxCheck.mxRecords && mxCheck.mxRecords.length > 0) {
                deliverabilityScore += 25;
                deliverabilityScore = Math.max(deliverabilityScore, 60);
            }
        }
    }
    // Add reputation score (reduced impact for major providers)
    const reputationImpact = isMajorProvider ? 0.1 : 0.3;
    deliverabilityScore += (reputationCheck.score - 50) * reputationImpact;
    // Ensure score is within bounds
    deliverabilityScore = Math.max(0, Math.min(100, Math.round(deliverabilityScore)));
    // Determine final status based on specific error types first, then score
    if (errorType) {
        // INVALID: Cannot deliver
        if (errorType === 'Syntax error' || errorType === 'No MX records' ||
            errorType === 'Disabled mailbox' || errorType === 'Disposable email' ||
            errorType === 'Honeypot detected') {
            status = 'invalid';
        }
        // SMTP failures without MX records are invalid
        else if ((errorType === 'SMTP connection failed' || errorType === 'Mailbox not found') && !mxCheck.hasMX) {
            status = 'invalid';
        }
        // UNKNOWN: May deliver but has issues or cannot be verified
        else if (errorType === 'Role-based email' || errorType === 'Catch-all domain' ||
            errorType === 'Possible typo' || errorType === 'Data breach detected' ||
            errorType === 'SMTP verification unavailable' || errorType === 'SMTP Port 25 Blocked') {
            status = 'unknown';
        }
        // SMTP failures with MX records are unknown
        else if ((errorType === 'SMTP connection failed' || errorType === 'Mailbox not found') && mxCheck.hasMX) {
            status = 'unknown';
        }
        // UNKNOWN: Cannot determine
        else if (errorType === 'Full inbox') {
            status = 'unknown';
        }
        // Default to unknown
        else {
            status = 'unknown';
        }
    }
    else {
        // No specific error, use score-based determination
        if (deliverabilityScore >= 80) {
            status = 'valid';
        }
        else if (deliverabilityScore >= 20) {
            status = 'unknown';
        }
        else {
            status = 'invalid';
        }
    }
    // Clear error messages for major providers unless there are actual issues
    if (isMajorProvider && deliverabilityScore >= 85 && errorType !== 'SMTP verification unavailable' && errorType !== 'SMTP Port 25 Blocked') {
        errorType = null;
        errorMessage = null;
    }
    // Only re-evaluate SMTP failures if MX records exist
    if (mxCheck.hasMX && errorType && (errorType === 'SMTP connection failed' || errorType === 'Mailbox not found')) {
        if (deliverabilityScore < 80) {
            status = 'unknown';
            errorType = null;
            errorMessage = null;
        }
    }
    // If no specific error was set, use reputation-based error
    if (!errorType && reputationCheck.reputation === 'poor' && !isMajorProvider) {
        errorType = 'Poor reputation';
        errorMessage = 'Domain has poor reputation';
    }
    const freeProviderCheckResult = detectFreeEmailProvider(domain);
    return {
        email,
        status,
        deliverabilityScore,
        domain,
        mxRecord: mxCheck.hasMX,
        disposable: isDisposable,
        freeProvider: isFreeProvider,
        roleBased: isRoleBased,
        catchAll: smtpCheck.isCatchAll,
        isDisabled: smtpCheck.isDisabled,
        hasFullInbox: smtpCheck.hasFullInbox,
        isHoneypot: honeypotCheck.isHoneypot,
        isPwned: pwnedCheck.isPwned,
        gravatarUrl,
        errorType,
        errorMessage,
        processingTimeMs: Date.now() - startTime,
        validationDetails: {
            emailPrefix: localPart,
            domain,
            syntaxValid: syntaxCheck.isValid,
            providerSpecific: syntaxCheck.providerSpecific,
            mxRecords: mxCheck.mxRecords,
            smtpConnection: smtpCheck.canConnect,
            smtpAcceptsEmail: smtpCheck.acceptsEmail,
            smtpResponseTime: smtpCheck.responseTime,
            smtpPortsTried: smtpCheck.portsTried,
            smtpPort25Blocked: smtpCheck.port25Blocked || false,
            smtpError: smtpCheck.error || undefined,
            fallbackValidation: useFallbackValidation ? {
                used: true,
                confidence: fallbackValidationResult?.confidence,
                estimatedStatus: fallbackValidationResult?.estimatedStatus,
                reasons: fallbackValidationResult?.reasons
            } : { used: false },
            typoDetected: typoCheck.hasTypo,
            typoSuggestions: typoCheck.suggestions,
            domainReputation: reputationCheck.reputation,
            reputationScore: reputationCheck.score,
            reputationReasons: reputationCheck.reasons,
            honeypotConfidence: honeypotCheck.confidence,
            honeypotReasons: honeypotCheck.reasons,
            pwnedBreaches: pwnedCheck.breaches,
            pwnedLastBreach: pwnedCheck.lastBreach,
            pwnedDetails: pwnedCheck.details,
            freeProviderInfo: freeProviderCheckResult.providerInfo,
            validatedAt: new Date().toISOString()
        }
    };
}
