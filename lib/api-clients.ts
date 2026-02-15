/**
 * lib/api-clients.ts
 *
 * Lazy initialization functions for external data source API clients.
 * Follows the same pattern as lib/agents/providers.ts to avoid throwing
 * at build time when environment variables aren't set.
 */

// ──────────────────────────────────────────────────────────────────────────
// Copernicus Climate Data Store (CDS)
// ──────────────────────────────────────────────────────────────────────────

interface CDSCredentials {
    uid: string;
    apiKey: string;
}

let _cdsCredentials: CDSCredentials | null = null;

export function getCDSCredentials(): CDSCredentials {
    if (!_cdsCredentials) {
        const uid = process.env.CDS_UID;
        const apiKey = process.env.CDS_API_KEY;

        if (!uid) {
            throw new Error("Missing CDS_UID environment variable.");
        }
        if (!apiKey) {
            throw new Error("Missing CDS_API_KEY environment variable.");
        }

        _cdsCredentials = { uid, apiKey };
    }
    return _cdsCredentials;
}

// ──────────────────────────────────────────────────────────────────────────
// NASA API
// ──────────────────────────────────────────────────────────────────────────

let _nasaApiKey: string | null = null;

export function getNASAApiKey(): string {
    if (!_nasaApiKey) {
        const apiKey = process.env.NASA_API_KEY;
        if (!apiKey) {
            throw new Error("Missing NASA_API_KEY environment variable.");
        }
        _nasaApiKey = apiKey;
    }
    return _nasaApiKey;
}

