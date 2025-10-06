const util = require("util");
const mysql = require("mysql");
const key = require("../config/keys");
const axiosRetry = require("axios-retry").default;
const axios = require("axios");
const { get_final_url_after_redirect } = require("../services/affiliateService");
const options = {
    host: key.MYSQL_HOST,
    user: key.MYSQL_USER,
    password: key.MYSQL_PASSWORD,
    database: key.MYSQL_DATABASE,
};

var connection = mysql.createConnection(options);
const query = util.promisify(connection.query).bind(connection);

const options_fs9 = {
    host: key.MYSQL_HOST_fs9,
    user: key.MYSQL_USER_fs9,
    password: key.MYSQL_PASSWORD_fs9,
    database: key.MYSQL_DATABASE_fs9,
};

var connection_fs9 = mysql.createConnection(options_fs9);
const query_fs9 = util.promisify(connection_fs9.query).bind(connection_fs9);

const modifyUrl = async function (user_data, url) {
    try {
        new URL(url);
    } catch (error) {
        return { error: "invalid url" };
    }
    return { url: await modifyUrl_fn(user_data, url) };
};

async function modifyUrl_fn(user_data, url) {
    if (isTelegramUrl(url)) return "";
    let f_url = await startDeepLinking(user_data, url);
    if (isTelegramUrl(f_url)) return "";
    if (f_url.url == url) return ""; // url;
    if (
        user_data &&
        user_data.bitly_key &&
        user_data.preferred_shortner &&
        isBitlyActiveStore(user_data, f_url)
    ) {
        let bit_url = await returnBitlyShortLink(user_data.bitly_key, f_url.url);
        if (bit_url && bit_url != "false") return bit_url;
    }

    // return "https://hyyzo.com";
    return await returnShortLink(f_url);
}

async function returnShortLink(url_data) {
    // return link;
    let link = url_data.url;
    let ref_id = url_data.clid;
    let store_id = url_data.store_id;
    try {
        function generateRandomString() {
            const characters = "abcdefghijklmnopqrstuvwxyz123456789";
            let result = "hf";
            for (let i = 0; i < 5; i++) {
                result += characters.charAt(
                    Math.floor(Math.random() * characters.length)
                );
            }
            return result;
        }

        let code = generateRandomString();
        await query_fs9(
            " INSERT INTO url_shortener (code, url,ref_id) VALUES (?, ?,?)",
            [code, link, ref_id || ""]
        );
        if (store_id) {
            if (store_id == "a60a31f6") return `https://amznn.cc/${code}`;
            else if (store_id == "f71d7d78") return `https://fpkrt.cc/${code}`;
            else if (store_id == "e53fef62") return `https://mytr.cc/${code}`;
            else if (store_id == "aa23d30d") return `https://ajio.uk/${code}`;
        }
        return `https://fs9.in/${code}`;
    } catch (e) {
        console.log("error in returnShortLink", e.message);
        return "";
    }
}

function isTelegramUrl(url) {
    try {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url; // Assume HTTPS by default
        }
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        // Define Telegram domains
        const telegramDomains = [
            "t.me",
            "telegram.me",
            "web.telegram.org",
            "desktop.telegram.org",
            "macos.telegram.org",
        ];

        // Check if the hostname matches any Telegram domain
        return telegramDomains.some((domain) => hostname.endsWith(domain));
    } catch (error) {
        // If URL is invalid, return false
        return false;
    }
}

async function startDeepLinking(user_data, iurl, source = "") {
    try {
        let uid = user_data.uid;
        let url = await get_final_url_after_redirect(iurl);
        let url_with_path = url.split("?")[0];
        if (user_data.amz_aff && url_with_path.includes("//www.amazon.in")) {
            let amz_url = await generate_amz_url(url, user_data.amz_aff);
            return { url: amz_url, store_id: "a60a31f6", clid: "other_amz_" + uid };
        }
        if (url_with_path.includes("flipkart.com/s/")) {
            return { url: iurl };
        }
        let store_ids = await query(
            `Select b.store_id, b.active from deeplink_domain_mapping a inner join cb_stores b on a.store_id=b.store_id WHERE ? LIKE CONCAT ('%', a.url,'%') order by  b.active desc, length(a.url)  desc`,
            [url_with_path]
        );

        if (!store_ids?.[0]?.active) {
            return { url: iurl };
        }
        let store_id = store_ids[0]["store_id"];
        let link = await query(
            `Select c.camp_id, c.utm_blank, c.utm_add,c.deeplink_support, d.id as partner_id,d.base_url,d.query_url,d.click_id,d.sub_id2,d.sub_id3, d.deeplink_pattern,e.activity_id, b.active as store_active, c.active as link_active, d.active as partner_active,f.user_share_per,f.user_share_flat,f.user_share_max,f.user_share_min,f.allow_api_posting from cb_stores b left join aff_links c on b.aff_links_id = c.id LEFT join partner_master d on c.partner_id = d.id left join cb_stores_extra e on b.store_id = e.store_id LEFT JOIN point_master f on b.store_id = f.store_id where b.store_id = "${store_id}"`
        );
        if (!link.length || link[0]["deeplink_support"] != 1) return { url: iurl };

        let f_url = "";
        // var ip = requestIp.getClientIp(req);
        link = link[0];
        // console.log(link, "link");
        link.url = url;
        link.uid = uid;
        link.store_id = store_id;
        link.ip = "1.1.1.1";
        if (link.allow_api_posting == 0 || link.allow_api_posting == null)
            link.disallow_api_posting = 1;
        if (!link.store_active || !link.link_active || !link.partner_active) {
            // console.log(link.store_active, link.link_active, link.partner_active);
            f_url = link.url;
            // console.log(f_url, "f_url1");
        } else {
            link.system_info = "telegram-bot";
            f_url = await generateDeepLinkURL(link, 1);
        }
        if (f_url && f_url.url) return { ...f_url, store_id };
        else return { url: iurl, store_id };
    } catch (error) {
        console.log(error, "error in startdeeplink");
        return { url: iurl };
    }
}

function isBitlyActiveStore(user_data, f_url) {
    if (
        !user_data.bitly_stores ||
        user_data.bitly_stores == "0" ||
        !f_url.store_id
    )
        return true;
    try {
        let sids = user_data.bitly_stores.split(",");
        if (sids.includes(f_url.store_id.toString())) return true;
        return false;
    } catch (e) {
        console.log("Error: in isBitlyActiveStore", e);
        return true;
    }
    return true;
}

async function returnBitlyShortLink(bitly_key, longUrl) {
    try {
        if (!bitly_key) return false;
        const response = await axios.post(
            "https://api-ssl.bitly.com/v4/shorten",
            {
                long_url: longUrl,
            },
            {
                headers: {
                    Authorization: `Bearer ${bitly_key}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.link; // Return the shortened URL
    } catch (error) {
        // console.error('Error shortening URL:', error.response ? error.response.data : error.message);
        return;
    }
}

const generateDeepLinkURL = async (data, returnclid = 0) => {
    // console.log(data, "data=======");
    let remove_params = [];
    let add_params = {};
    try {
        if (data.utm_blank) remove_params = JSON.parse(data.utm_blank);
    } catch (e) {
        console.log(e, "error utm_blank");
    }
    try {
        if (data.utm_add) add_params = JSON.parse(data.utm_add);
    } catch (e) {
        console.log(e, "error utm add");
    }
    // console.log(add_params, "add_params");
    // console.log(remove_params, "remove_params");
    let url = data.url;
    if (remove_params.length) url = removeURLParameter(url, remove_params);
    // console.log(url);
    for (const property in add_params) {
        url = replaceUrlParam(url, property, add_params[property]);
    }
    let UID = data.uid;
    let partner_id = data.partner_id;
    let camp_id = data.camp_id;
    let clickId = generateClickId(20);
    let store_id = data.store_id;
    let params = {};
    let affiliateUrl = data.deeplink_pattern ? data.deeplink_pattern : url;
    affiliateUrl = data.deeplink_support ? affiliateUrl : data.base_url;
    // console.log(affiliateUrl, "base_url");
    try {
        params = JSON.parse(data.query_url);
    } catch (e) {
        console.log(e, "error in deeplink.js 1");
    }
    if (!data.deeplink_pattern || !data.deeplink_support) {
        for (const property in params) {
            affiliateUrl = replaceUrlParam(affiliateUrl, property, params[property]);
        }
    }
    affiliateUrl = replaceUrlParam(affiliateUrl, data.click_id, clickId);
    if (data.sub_id2 !== null && data.sub_id2) {
        affiliateUrl = replaceUrlParam(affiliateUrl, data.sub_id2, store_id);
    }
    if (data.sub_id3 !== null && data.sub_id3) {
        // affiliateUrl = replaceUrlParam(affiliateUrl,data.sub_id3,'sub_id3');
    }
    affiliateUrl = affiliateUrl.replace("{camp_id}", camp_id);
    affiliateUrl = affiliateUrl.replace("{encoded_url}", encodeURIComponent(url));
    let newData = {};
    newData.store_id = store_id;
    newData.click_id = clickId;
    newData.partner_id = partner_id;
    newData.activity_code = data.activity_id ? data.activity_id : 1;
    newData.system_info = data.system_info;
    newData.uid = UID;

    if (data.user_share_per) newData.user_share_per = data.user_share_per;
    if (data.user_share_flat) newData.user_share_flat = data.user_share_flat;
    if (data.user_share_max) newData.user_share_max = data.user_share_max;
    if (data.user_share_min) newData.user_share_min = data.user_share_min;
    if (data.disallow_api_posting)
        newData.disallow_api_posting = data.disallow_api_posting;

    const query = util.promisify(connection.query).bind(connection);
    // console.log(affiliateUrl, newData, "aff_new");
    try {
        await query("INSERT INTO aff_clicks SET ?", newData);
        if (returnclid) return { url: affiliateUrl, clid: clickId };
        return affiliateUrl;
    } catch (e) {
        return false;
    }
    return false;
};


function removeURLParameter(url, parameters) {
    //prefer to use l.search if you have a location/link object
    var urlparts = url.split("?");
    if (urlparts.length >= 2) {
        var hashsplit = urlparts[1].split("#");
        var pars = hashsplit[0].split(/[&;]/g);
        var hash = hashsplit.length > 1 ? "#" + hashsplit[1] : "";
        //reverse iteration as may be destructive

        for (var j = parameters.length; j-- > 0;) {
            var prefix = encodeURIComponent(parameters[j]) + "=";
            for (var i = pars.length; i-- > 0;) {
                //idiom for string.startsWith
                if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                    pars.splice(i, 1);
                }
            }
        }

        return urlparts[0] + (pars.length > 0 ? "?" + pars.join("&") : "") + hash;
    }
    // console.log(url);
    return url;
}

async function fetchFinalUrl(
    initialUrl,
    timeoutThreshold = 10000,
    time = 0,
    type = "furl"
) {
    try {
        let data;
        // if ((type = "furl")) {
        //   data = await fetch("https://flipshope.com/api/curl/get", {
        //     signal: AbortSignal.timeout(timeoutThreshold),
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json", // Ensuring the content type is set correctly
        //     },
        //     body: JSON.stringify({ key: "hbhvgf56", url: initialUrl, type }),
        //   });
        //   data = await data.json();
        // } else {
        data = await fetch("https://curl.flipshope.com/", {
            signal: AbortSignal.timeout(timeoutThreshold),
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Ensuring the content type is set correctly
            },
            body: JSON.stringify({ key: "hbhvgf56", url: initialUrl, type }),
        });
        data = await data.json();
        // }
        // data = data.json();
        // console.log("data         00000000000000000", data);
        if (!data || !data.res) {
            // console.log(data, "data");
            if (!time) return await fetchFinalUrl_self(initialUrl);
            return initialUrl;
        }
        return data.res;
    } catch (e) {
        console.log("error in curl fetch", e);
        if (!time) return await fetchFinalUrl_self(initialUrl);
        return initialUrl;
    }
}

async function fetchFinalUrl_self(initialUrl, timeoutThreshold = 3000) {
    let finalUrl = initialUrl;
    let startTime = Date.now();

    // Create an axios instance
    const instance = axios.create({
        timeout: timeoutThreshold,
        maxRedirects: 0, // Disable automatic redirects
    });

    // Set up retry logic for handling transient errors
    axiosRetry(instance, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

    while (true) {
        try {
            let response = await instance.get(finalUrl);
            // Normally, we won't reach here because 3xx causes an exception in this setup
            // console.log("Response status:", response.status);
            return finalUrl;
        } catch (error) {
            if (axios.isCancel(error)) {
                // console.log("Request cancelled due to timeout");
                return finalUrl; // Return the last known URL
            }
            if (
                error.response &&
                error.response.status >= 300 &&
                error.response.status < 400
            ) {
                // Check for redirect in headers
                const locationHeader = error.response.headers.location;
                if (locationHeader) {
                    finalUrl = new URL(locationHeader, finalUrl).href; // Resolve relative URLs
                    // console.log("Redirect found to:", finalUrl);

                    // Check timeout condition
                    if (Date.now() - startTime > timeoutThreshold) {
                        // console.log("Timeout threshold reached, returning last known URL");
                        return finalUrl;
                    }
                    if (
                        (finalUrl.substring(0, 28).indexOf("amazon.in") > -1 ||
                            finalUrl.substring(0, 28).indexOf("flipkart.com") > -1 ||
                            finalUrl.substring(0, 28).indexOf("ajio.com") > -1 ||
                            finalUrl.substring(0, 28).indexOf("myntra.com") > -1 ||
                            finalUrl.substring(0, 28).indexOf("croma.in") > -1 ||
                            finalUrl.substring(0, 28).indexOf("meesho.com") > -1) &&
                        finalUrl.substring(0, 28).indexOf("flipkart.com/s/") == -1
                    ) {
                        console.log("Major site found");
                        return finalUrl;
                    }
                    continue; // Follow the redirect
                }
            } else {
                // For non-redirect errors, log and return the last URL attempted
                console.error("Error fetching URL:", error.message);
                return finalUrl;
            }
        }
    }
}

async function is_listed_domain(url, type) {
    const now = Date.now();

    // Check if cached domains are available and not expired
    if (
        !cachedDomains.merchant ||
        !cachedDomains.js_redirect ||
        now > cacheExpiry
    ) {
        try {
            const data = await fetchDomains();

            // Separate merchant and js_redirect domains
            cachedDomains.merchant = data
                .filter((row) => row.type === "merchant")
                .map((row) => row.domain);

            cachedDomains.js_redirect = data
                .filter((row) => row.type === "js_redirect")
                .map((row) => row.domain);

            // Set cache expiry to 10 minutes
            cacheExpiry = now + 10 * 60 * 1000;
        } catch (error) {
            console.error("Error fetching domains:", error);
            return false; // In case of database error, return false
        }
    }

    // Choose the appropriate domain list based on the type
    const domainList =
        type === "merchant" ? cachedDomains.merchant : cachedDomains.js_redirect;

    if (url.substring(0, 28).indexOf("flipkart.com/s/") > -1) return false;
    // Check if URL matches any domain in the cached list
    return domainList.some(
        (domain) => url.indexOf(domain) + 1 && url.indexOf(domain) < 15
    );
}

async function save_url(iurl, url, red_type) {
    try {
        if (iurl.length < 256) {
            await query(
                `INSERT IGNORE INTO url_final_url_mapping(url,f_url,type) VALUES (?,?,?) ON DUPLICATE KEY UPDATE f_url = VALUES(f_url) ,type = VALUES(type) , date = NOW()`,
                [iurl, url, red_type]
            );
        }
    } catch (e) { }
}

function generateClickId(length) {
    var randomChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "HY";
    for (var i = 0; i < length - 2; i++) {
        result += randomChars.charAt(
            Math.floor(Math.random() * randomChars.length)
        );
    }
    return result;
}

function replaceUrlParam(url, paramName, paramValue) {
    if (paramValue == null) {
        paramValue = "";
    }
    var pattern = new RegExp("\\b(" + paramName + "=).*?(&|#|$)");
    if (url.search(pattern) >= 0) {
        if (paramValue) return url.replace(pattern, "$1" + paramValue + "$2");
        return url.replace(pattern, "");
    }
    url = url.replace(/[?#]$/, "");
    return (
        url + (url.indexOf("?") > 0 ? "&" : "?") + paramName + "=" + paramValue
    );
}

module.exports = { generateDeepLinkURL, modifyUrl, fetchFinalUrl };