/**
 * EnsureEnv checks that environment variable with the given name exists and
 * returns its value otherwise throws an error. This is needed to make sure the
 * app is properly configured with required variables.
 * @param envName environment variable name
 */
 const ensureEnv = (envName: string): string => {
    const envValue = process.env[envName];
    if (envValue === undefined) {
        throw new Error(`Variable ${envName} is required and must be defined`);
    }

    return envValue;
}

/**
 * Reads URL from an environment and prepends with base URL if it starts with "/"
 * otherwise treats URL as full with schema and hostname and just returns it.
 * @param envName Environment variable name to read URL from
 * @param defaultVal default value if variable is not defined
 */
const getUrl = (envName: string, defaultVal : string): string => {
    const url = process.env[envName] ?? defaultVal ;
    return url.startsWith("/") ? baseUrl + url : url;
};


const baseUrl = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:3001";

// {locationPath} vill be replaced with location's path in sitemap, e.g. /europe/southcampus/bldg1
export const sitemapUrl = getUrl("REACT_APP_SITEMAP_URL", "/sitemap");
export const assetDataUrl = getUrl("REACT_APP_ASSET_DATA_URL", "/assets")
export const deskBookingUrl = getUrl("REACT_APP_DESK_BOOKING_URL", "/book_desk")
export const assetTypeDataUrl = getUrl("REACT_APP_ASSET_TYPES_DATA_URL", "/asset_types")
export const iconsUrl = getUrl("REACT_APP_ICONS_URL", "/asset_icons")
export const assetTypePropDataUrl = getUrl("REACT_APP_ASSET_TYPES_PROPS_DATA_URL", "/asset_type_props")
export const roomsDataUrl = getUrl("REACT_APP_ROOMS_DATA_URL", "/roomdata/{locationPath}");
export const sensorsDataUrl = getUrl("REACT_APP_SENSORDATA_URL", "/state/{locationPath}");
export const sidebarDataUrl = getUrl("REACT_APP_SIDEBAR_DATA_URL", "/sidebar/{locationPath}");
export const warningsDataUrl = getUrl("REACT_APP_WARNINGS_DATA_URL", "/faults/{locationPath}");
export const UserDataUrl = getUrl("REACT_APP_USER_DATA_URL", "/user")
export const UserRightsUrl = getUrl("REACT_APP_USER_RIGHTS_URL", "/user_rights")

export const trackerHostname = process.env.REACT_APP_TRACKER_HOSTNAME ?? "localhost:3001";
export const subscriptionKey = ensureEnv("REACT_APP_MAP_SUBSCRIPTION_KEY");
