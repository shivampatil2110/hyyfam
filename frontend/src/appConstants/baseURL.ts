declare const process: {
    env: {
        NEXT_PUBLIC_BASE_URL: string;
        NEXT_PUBLIC_ADMIN_PANEL_URL: string;
        NEXT_PUBLIC_CDN_URL: string;
        NEXT_PUBLIC_WEBSITE_URL: string;
        NEXT_PUBLIC_INSTA_AUTH_URL: string;
    };
};

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const ADMIN_PANEL_URL = process.env.NEXT_PUBLIC_ADMIN_PANEL_URL;
export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;
export const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;
export const INSTA_AUTH_URL = process.env.NEXT_PUBLIC_INSTA_AUTH_URL;
