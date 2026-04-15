import GoogleMeetProvider from "./GoogleMeetProvider.js";
import ZoomProvider from "./ZoomProvider.js";
import InternalProvider from "./InternalProvider.js";
import CustomLinkProvider from "./CustomLinkProvider.js";
import TeamsProvider from "./TeamsProvider.js";

class ProviderFactory {
    static getProvider(type, credentials = {}) {
        switch (type) {
            case "google":
            case "google_meet":
                return new GoogleMeetProvider(credentials.oauth2Client);
            case "zoom":
                return new ZoomProvider(credentials.zoomAccessToken);
            case "microsoft_teams":
                return new TeamsProvider(credentials.teamsAccessToken);
            case "internal":
                return new InternalProvider();
            case "custom":
                return new CustomLinkProvider();
            default:
                throw new Error(`Unsupported provider type: ${type}`);
        }
    }
}

export default ProviderFactory;
