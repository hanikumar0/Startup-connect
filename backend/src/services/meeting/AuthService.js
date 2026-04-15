import axios from "axios";
import { google } from "googleapis";

import User from "../../models/User.js";

class AuthService {
    /**
     * Get Zoom Access Token using Server-to-Server OAuth
     */
    static async getZoomToken() {
        try {
            const zoomClientId = process.env.ZOOM_CLIENT_ID;
            const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
            const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;

            if (!zoomClientId || !zoomClientSecret || !zoomAccountId) {
                throw new Error("Missing Zoom API credentials in .env");
            }

            const response = await axios.post(
                "https://zoom.us/oauth/token",
                null,
                {
                    params: {
                        grant_type: "account_credentials",
                        account_id: zoomAccountId,
                    },
                    headers: {
                        Authorization: "Basic " + Buffer.from(
                            zoomClientId + ":" + zoomClientSecret
                        ).toString("base64"),
                    },
                }
            );
            return response.data.access_token;
        } catch (error) {
            console.error("Zoom Token Retrieval Failed:", error.response?.data || error.message);
            throw new Error(`Zoom Token Retrieval Failed: ${error.message}`);
        }
    }

    /**
     * Get MS Teams Access Token using Client Credentials
     */
    static async getTeamsToken() {
        try {
            const tenantId = process.env.TEAMS_TENANT_ID;
            const clientId = process.env.TEAMS_CLIENT_ID;
            const clientSecret = process.env.TEAMS_CLIENT_SECRET;

            if (!tenantId || !clientId || !clientSecret) {
                throw new Error("Missing Teams API credentials in .env");
            }

            const response = await axios.post(
                `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
                new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: "client_credentials",
                    scope: "https://graph.microsoft.com/.default",
                })
            );
            return response.data.access_token;
        } catch (error) {
            console.error("Teams Token Retrieval Failed:", error.response?.data || error.message);
            throw new Error(`Teams Token Retrieval Failed: ${error.message}`);
        }
    }

    /**
     * Get Google OAuth2 Client
     */
    static getGoogleClient() {
        return new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/auth/google/callback`
        );
    }

    /**
     * Unified Access Token Handler
     */
    static async getCredentials(provider, hostId = null) {
        const credentials = {};

        switch (provider) {
            case "zoom":
                credentials.zoomAccessToken = await this.getZoomToken();
                break;
            case "microsoft_teams":
                credentials.teamsAccessToken = await this.getTeamsToken();
                break;
            case "google":
            case "google_meet":
                const client = this.getGoogleClient();
                if (hostId) {
                    const host = await User.findById(hostId).select("+googleTokens");
                    if (host && host.googleTokens?.refresh_token) {
                        client.setCredentials(host.googleTokens);
                        
                        // Check if token is expired and refresh if necessary
                        if (host.googleTokens.expiry_date && host.googleTokens.expiry_date <= Date.now() + 60000) {
                             const { credentials: refreshedTokens } = await client.refreshAccessToken();
                             host.googleTokens = { ...host.googleTokens, ...refreshedTokens };
                             await host.save();
                        }
                    }
                }
                credentials.oauth2Client = client;
                break;
            default:
                break;
        }

        return credentials;
    }
}

export default AuthService;
