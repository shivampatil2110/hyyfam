const util = require("util");
const mysql = require("mysql");
const key = require("../config/keys");
const axios = require('axios')
const requestIp = require("request-ip");
const options = {
    host: key.MYSQL_HOST,
    user: key.MYSQL_USER,
    password: key.MYSQL_PASSWORD,
    database: key.MYSQL_DATABASE,
};
var connection = mysql.createConnection(options);
const query = util.promisify(connection.query).bind(connection);
const { generateDeepLinkURL } = require('../controllers/affiliate.controller');
const { get_final_url_after_redirect } = require("../services/affiliateService");


exports.getDealsData = async (req, res) => {
    let { page, sid_arr, limit, cat_arr, sub_cat_arr } = req.body;

    limit = parseInt(limit) || 12;
    page = parseInt(page) || 0;
    let offset = page * limit;

    const url = `https://flipshope.com/api/prices/getrecentpricedrop`;
    const requestData = { page, sid_arr, limit, cat_arr, sub_cat_arr };

    try {
        let attempts = 3; // Retry up to 3 times
        let success = false;
        let data, result;

        while (attempts > 0 && !success) {
            try {
                const response = await axios.post(url, requestData, {
                    timeout: 10000,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (compatible; MyServer/1.0)",
                        "Content-Type": "application/json",
                    },
                });

                data = response.data;
                success = true;
            } catch (error) {
                attempts--;
                console.error(`Axios request failed: ${error.message}`);

                if (attempts === 0) throw error;
            }
        }

        result = data?.data || [];
        const total_recent_data = data?.total_recent_data || 0;

        return res.send({
            code: 200,
            success: `Got recent price drop Data`,
            data: result,
            total_recent_data,
        });
    } catch (err) {
        console.error("Error fetching deals:", err.message);
        res.status(502).send({
            code: 502,
            failed: "Bad Gateway - Unable to fetch data",
            msg: err.message,
            error: err,
        });
    }
};

exports.grabDealDeepLinking = async (req, res) => {
    let { sid, pid } = req.body;
    if ((!req.session || !req.session.hyyzoUser) && !req.uid) {
        return res.send({
            code: 400,
            failed: "error occured",
            status: "Please Refresh the page.",
        });
    }
    let uid = req.uid;
    if (!uid) uid = req.session.hyyzoUser.uid;
    // let uid ="25ca4bc7";
    // const query = util.promisify(connection.query).bind(connection);
    // newData.uid="8089a151";
    let { store } = req.body;
    let url = await returnLink(sid, pid);

    let store_ids;
    try {
        store_ids = await query(
            `Select b.store_id, b.active from deeplink_domain_mapping a inner join cb_stores b on a.store_id=b.store_id WHERE '${url}' LIKE CONCAT ('%', a.url,'%') order by  b.active desc, length(a.url)  desc`
        );

        let no_store = {
            code: 400,
            failed: "error occured",
            status: "URL not supported",
        };
        if (!store_ids.length) {
            return res.send(no_store);
        }

        if (!store_ids[0].active) {
            // console.log(url);
            no_store.status = "Store is currently not active";
            no_store.link = url;
            return res.send(no_store);
        }
        let store_id = store_ids[0]["store_id"];
        let link = await query(
            `Select c.camp_id, c.utm_blank, c.utm_add,c.deeplink_support, d.id as partner_id,d.base_url,d.query_url,d.click_id,d.sub_id2,d.sub_id3, d.deeplink_pattern,e.activity_id, b.active as store_active, c.active as link_active, d.active as partner_active,f.user_share_per,f.user_share_flat,f.user_share_max,f.user_share_min,f.allow_api_posting from cb_stores b left join aff_links c on b.aff_links_id = c.id LEFT join partner_master d on c.partner_id = d.id left join cb_stores_extra e on b.store_id = e.store_id LEFT JOIN point_master f on b.store_id = f.store_id where b.store_id = "${store_id}"`
        );
        if (!link.length) {
            return res.send({
                code: 400,
                failed: "error occured",
                status: "Invalid link",
            });
        }
        let f_url = "";
        var ip = requestIp.getClientIp(req);
        link = link[0];
        // console.log(link, "link");
        link.url = url;
        link.uid = uid;
        link.store_id = store_id;
        link.ip = ip;
        if (link.user_share_per) link.user_share_per = link.user_share_per;
        if (link.user_share_flat) link.user_share_flat = link.user_share_flat;
        if (link.user_share_max) link.user_share_max = link.user_share_max;
        if (link.user_share_min) link.user_share_min = link.user_share_min;
        if (link.allow_api_posting == 0 || link.allow_api_posting == null)
            link.disallow_api_posting = 1;
        if (!link.store_active || !link.link_active || !link.partner_active) {
            // console.log("inside,");
            // console.log(link.store_active, link.link_active, link.partner_active);
            f_url = link.url;
            // console.log(f_url, "f_url1");
        } else {
            link.system_info = req.headers["user-agent"];

            f_url = await generateDeepLinkURL(link);
        }
        // console.log(f_url, "f_url");
        if (f_url)
            return res.send({
                code: 200,
                success: "true",
                link: f_url,
            });
        else
            res.send({
                code: 400,
                failed: "error ocurred",
            });
    } catch (error) {
        console.log(error, "error in grabDealDeepLinking");
        res.send({
            code: 400,
            failed: "error ocurred",
            error: error,
        });
    }
};

exports.startDeepLinking = async (req, res) => {
    let { url, sid, pid } = req.body;
    if ((!req.session || !req.session.hyyzoUser) && !req.uid) {
        return res.send({
            code: 400,
            failed: "error occured",
            status: "Please Refresh the page.",
        });
    }
    let uid = req.uid;
    if (!uid) uid = req.session.hyyzoUser.uid;
    // let uid ="25ca4bc7";
    //   const query = util.promisify(connection.query).bind(connection);
    // newData.uid="8089a151";
    let store = req.body.store_id;
    let store_ids;
    if (sid && pid) url = await returnLink(sid, pid);
    else {
        try {
            new URL(url);
        } catch (error) {
            console.log("returning invalid url");
            return res.send({
                code: 400,
                failed: "Please enter a valid url",
                status: "invalid url",
            });
        }
        url = await get_final_url_after_redirect(url);
    }
    console.log(url, "url");
    try {
        let i = 0;
        while (i < 2) {
            store_ids = await query(
                `Select b.store_id, b.active from deeplink_domain_mapping a inner join cb_stores b on a.store_id=b.store_id WHERE '${url}' LIKE CONCAT ('%', a.url,'%') order by  b.active desc, length(a.url)  desc`
            );
            let no_store = {
                code: 400,
                failed: "error occured",
                status: "URL not supported",
            };

            if (!store_ids.length) {
                if (!i) {
                    if (!js_url_domain_list.some((domain) => url.includes(domain))) {
                        let data = await fetch(url);
                        if (data && data.url && data.url != url) url = data.url;
                        else i++;
                        // console.log("fetch url:");
                    }
                    if (js_url_domain_list.some((domain) => url.includes(domain))) {
                        try {
                            let Furl = await axios.post(
                                "https://flipshope.com/api/prices/finalfetchurl",
                                {
                                    url: url,
                                }
                            );
                            if (Furl.data.code == 200) {
                                url = await Furl.data.data;
                                // console.log(url, "final url----------------");
                            } else {
                                url = null;
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
                if (i > 0) {
                    query(
                        `INSERT INTO log_warning(type, tag, error) VALUES ('deeplink','no_store_ids','${url}')`
                    );
                    return res.send(no_store);
                }
                // console.log(url);
                i++;
            } else i = 100;
            if (!store_ids[0].active) {
                // console.log(url);
                no_store.status = "Store is currently not active";
                // console.log(no_store, "no_store");

                return res.send(no_store);
            }
        }

        if (store_ids.length > 1) {
            query(
                `INSERT INTO log_warning(type, tag, error) VALUES ('deeplink','multi_store_ids','${url}')`
            );
        }
        let store_id = store_ids[0]["store_id"];

        let store_info = await query(
            `select a.store_name, a.store_id, a.store_page_url,c.deeplink_support, c.active, b.tracking_speed,b.missing_cashback, DATE_FORMAT(b.expected_approval_date,'%d-%m-%y') as expected_approval_date from cb_stores a inner join cb_stores_extra b on a.store_id = b.store_id INNER JOIN aff_links c on a.aff_links_id = c.id where c.active =1 and a.store_id = '${store_id}'`
        );
        console.log(store_info, "store_info");
        if (!store_info.length) return res.send(no_store);
        let lid = "hyy" + +new Date() + Math.floor(Math.random() * 100);
        let data = { link: `${key.WEBSITE_URL}/dl/${lid}` };
        data.store_data = store_info[0];
        if (store && store != store_id) {
            let curr_store = await query(
                `Select store_name from cb_stores where store_id='${store}'`
            );
            data[
                "note"
            ] = `The link Created is for ${store_info[0]["store_name"]} not for ${curr_store[0]["store_name"]}`;
        }
        if (store_info[0]["deeplink_support"] != 1)
            data[
                "warning"
            ] = `Created profit link for homepage as deeplink is not allowed`;
        await query(
            `INSERT INTO deeplinks(lid, uid, store_id, url) VALUES ('${lid}','${uid}','${store_id}','${url}')`
        );
        res.send({
            code: 200,
            success: true,
            data: data,
            msg: "Got Deeplink Url",
        });
    } catch (error) {
        res.send({
            code: 400,
            failed: "error ocurred",
            error: error,
        });
    }
};

exports.getDeepLinkURL = async (req, res) => {
    const { link_id } = req.body;
    if (!link_id) {
        return res.send({
            code: 400,
            failed: "error occured",
            status: "No link id",
        });
    }
    try {
        let link = await query(
            `Select a.lid,a.uid, a.url, a.store_id, c.camp_id, c.utm_blank, c.utm_add,c.deeplink_support, d.id as partner_id,d.base_url,d.query_url,d.click_id,d.sub_id2,d.sub_id3, d.deeplink_pattern,e.activity_id, b.active as store_active, c.active as link_active, d.active as partner_active,f.user_share_per,f.user_share_flat,f.user_share_max,f.user_share_min,f.allow_api_posting from deeplinks a left join cb_stores b on a.store_id = b.store_id left join aff_links c on b.aff_links_id = c.id LEFT join partner_master d on c.partner_id = d.id left join cb_stores_extra e on a.store_id = e.store_id LEFT JOIN point_master f on a.store_id = f.store_id where a.lid='${link_id}'`
        );
        if (!link.length) {
            return res.send({
                code: 400,
                failed: "error occured",
                status: "Invalid link",
            });
        }
        let f_url = "";
        var ip = requestIp.getClientIp(req);
        link = link[0];
        link.ip = ip;
        // console.log(link, "link");
        if (!link.store_active || !link.link_active || !link.partner_active) {
            // console.log(link.store_active, link.link_active, link.partner_active);
            f_url = link.url;
            // console.log(f_url, "f_url1");
        } else {
            link.system_info = req.headers["user-agent"];
            if (link.user_share_per) link.user_share_per = link.user_share_per;
            if (link.user_share_flat) link.user_share_flat = link.user_share_flat;
            if (link.user_share_max) link.user_share_max = link.user_share_max;
            if (link.user_share_min) link.user_share_min = link.user_share_min;
            if (link.allow_api_posting == 0 || link.allow_api_posting == null)
                link.disallow_api_posting = 1;
            f_url = await generateDeepLinkURL(link);
        }
        // console.log(f_url);
        if (f_url)
            return res.send({
                code: 200,
                success: "true",
                link: f_url,
            });
        else
            res.send({
                code: 400,
                failed: "error ocurred",
            });
        //store click
    } catch (error) {
        res.send({
            code: 400,
            failed: "error ocurred",
            error: error,
        });
    }
};

exports.getAllStoresByCategories = async (req, res) => {
    let { cat } = req.query;

    let allStoresData;

    try {
        if (cat == "all") {
            allStoresData = await query(
                `SELECT 
                    a.store_id,
                    MAX(a.cashback_upto) AS cashback_upto,
                    MAX(a.store_page_url) AS store_page_url,
                    MAX(a.store_name) AS store_name,
                    MAX(a.image) AS img_id,
                    MAX(a.url) AS url,
                    MAX(a.active) AS active,
                    MAX(b.alt_text) AS alt_text,
                    MAX(b.url) AS img_url,
                    MAX(b.width) AS width,
                    MAX(b.height) AS height,
                    MAX(b.srcset) AS resized,
                    CONCAT('[', GROUP_CONCAT(DISTINCT e.category_name), ']') AS store_catArr
                FROM
                    cb_stores a
                    LEFT JOIN images_srcset b ON a.image = b.id
                    LEFT JOIN store_category d ON a.store_id = d.store_id
                    LEFT JOIN category_master e ON d.category_id = e.c_id
                    LEFT JOIN cb_stores_extra c ON a.store_id = c.store_id
                GROUP BY a.store_id
                ORDER BY store_name;`
            );
        } else if (cat == "trend_stores") {
            allStoresData = await query(
                `SELECT 
                    a.store_id,
                    MAX(a.cashback_upto) AS cashback_upto,
                    MAX(a.store_page_url) AS store_page_url,
                    MAX(a.store_name) AS store_name,
                    MAX(a.image) AS img_id,
                    MAX(a.url) AS url,
                    MAX(a.active) AS active,
                    MAX(b.alt_text) AS alt_text,
                    MAX(b.url) AS img_url,
                    MAX(b.width) AS width,
                    MAX(b.height) AS height,
                    MAX(b.srcset) AS resized,
                    CONCAT('[', GROUP_CONCAT(DISTINCT QUOTE(e.category_name)), ']') AS store_catArr
                FROM
                    cb_stores a
                    LEFT JOIN images_srcset b ON a.image = b.id
                    LEFT JOIN store_category d ON a.store_id = d.store_id
                    LEFT JOIN category_master e ON d.category_id = e.c_id
                    LEFT JOIN cb_stores_extra c ON a.store_id = c.store_id
                WHERE
                    a.active = 1
                GROUP BY a.store_id
                ORDER BY MAX(c.weight) DESC
                LIMIT 12;`
            );
            // SELECT distinct a.*,d.url AS img_url,  d.width, d.height, d.srcset as resized,d.alt_text,CONCAT( '[',GROUP_CONCAT(c.category_name),']') as store_catArr FROM cb_stores a JOIN store_category b ON a.store_id = b.store_id  JOIN category_master c ON b.category_id = c.c_id LEFT JOIN images_srcset d ON a.image=d.id WHERE c.active = 1 and b.active = 1 and c.c_id IN (3) GROUP by a.store_name,a.store_id  order by a.store_name
        }
        // console.log(allStoresData, "allStoresData==============");
        res.send({
            code: 200,
            success: `Got All Stores Data`,
            data: allStoresData,
        });
    } catch (err) {
        // console.log(err, "err")
        res.send({
            code: 400,
            failed: "error occured",
            msg: err,
            error: err,
        });
    }
};

exports.getStoreSchema = async (req, res) => {
    const { store_id } = req.body;
    if (!store_id)
        return res.send({ code: 400, msg: `no store_schema`, data: {} });
    try {
        let data = { code: 200, msg: "store Schema", data: {} };
        data["data"] = await query(
            `SELECT store_schema From store_schema WHERE store_id="${store_id}"`
        );
        res.send(data);
    } catch (error) {
        res.send({
            code: 400,
            failed: "error ocurred",
            error: error,
        });
    }
};

exports.getStoreDescription = async (req, res) => {
    try {
        const store_page_url = req.query.store_page_url;

        if (!store_page_url) {
            return res.status(400).send({
                code: 400,
                msg: "Missing 'store_page_url' query parameter"
            });
        }

        const sql = `SELECT 
                        a.*, 
                        b.seo_title, b.seo_description, b.h1_title, b.related_description, 
                        b.description_editor AS description, 
                        c.activity_id, c.tips, c.expected_approval_date, c.tracking_speed, c.missing_cashback, 
                        d.url AS image, d.alt_text, d.id AS img_id, d.width, d.height, d.srcset AS resized,
                        e.description
                    FROM cb_stores a 
                    LEFT JOIN cb_store_description b ON b.active = 1 AND a.store_id = b.store_id 
                    LEFT JOIN cb_stores_extra c ON c.active = 1 AND a.store_id = c.store_id 
                    LEFT JOIN images_srcset d ON a.image = d.id 
                    LEFT JOIN point_master e ON e.store_id = a.store_id
                    WHERE a.store_page_url = ?`;

        const results = await query(sql, [store_page_url]);

        if (results.length > 0) {
            res.status(200).send({
                code: 200,
                success: `Got ${results[0].store_name} Data`,
                data: results,
            });
        } else {
            res.status(404).send({
                code: 404,
                msg: "Description not found",
            });
        }
    } catch (error) {
        console.error("Error in getStoreDescription:", error);
        res.status(500).send({
            code: 500,
            msg: "Internal Server Error",
            error,
        });
    }
};

exports.getRedirectUrl = async (req, res) => {
    // console.log('headers', req.headers);
    let affiliateUrl = "";
    let UID = "";
    let store_name = req.body.store_name;
    // console.log(req.session, 'session');
    // console.log(req.body, 'body');
    if (req.body.username) {
        //for username based url
        try {
            // console.log("============");
            let result = await query(
                `select uid from username_mapping where  username= ?`,
                req.body.username
            );
            // console.log(result,'-09890')
            if (!result || !result.length) {
                return res.send({
                    code: 400,
                    failed: "Invalid Username",
                    status: "Invalid Username",
                });
            }
            UID = result[0].uid;
        } catch (error) {
            return res.send({
                code: 400,
                failed: "error ocurred",
                error: error,
            });
        }
        if (UID && store_name && store_name.startsWith("task-")) {
            req.manual_uid = UID;
            req.body.task_id = store_name.substring(5);
            return module.exports.getTaskRedirectUrl(req, res);
        }
    } else if (req.manual_uid) {
        let result = await query(
            `select uid from cb_users where  uid= ?`,
            req.manual_uid
        );
        if (result && result.length) UID = req.manual_uid;
    } else if (req.session && req.session.hyyzoUser) {
        UID = req.session.hyyzoUser.uid;
    } else if (req.uid) {
        UID = req.uid;
    } else {
        UID = null;
    }
    try {
        let redirectData = await query(
            `SELECT a.url,e.user_share_per,e.user_share_flat,e.user_share_max,e.user_share_min,e.allow_api_posting,UPPER(a.store_name) AS store_name, d.url AS img_url, d.width, d.height, a.store_id,b.id as sub2, b.camp_id,c.base_url,c.query_url,c.id as partner_id,c.click_id,c.sub_id2,c.sub_id3, m.activity_id FROM cb_stores a LEFT JOIN aff_links b ON a.aff_links_id=b.id and b.active = '1'  LEFT JOIN cb_stores_extra m ON b.store_id=m.store_id LEFT JOIN partner_master c ON b.partner_id=c.id AND c.active='1' LEFT JOIN images d on a.image = d.id LEFT JOIN point_master e on a.store_id = e.store_id WHERE a.active = 1 and a.store_page_url='${store_name}'`
        );
        if (redirectData && redirectData.length) {
            // console.log(results[0],"result 0");
            let partner_id = redirectData[0].partner_id;
            let store_id = redirectData[0].store_id;
            let camp_id = redirectData[0].camp_id;
            if (UID && store_id == "a60a31f6") {
                let res_user = await query(
                    ` select * from amazon_partners where uid = "${UID}"`
                );
                if (res_user.length) camp_id = res_user[0].amz_camp_id;
            }
            // console.log(camp_id,"camp_id")
            let clickId = generateClickId(20);
            let params = {};
            let activity_code = redirectData[0].activity_id
                ? redirectData[0].activity_id
                : 1;
            let red_data = {
                store_name: redirectData[0].store_name,
                img_url: redirectData[0].img_url,
                width: redirectData[0].width,
                height: redirectData[0].height,
            };
            if (partner_id) {
                let affiliateUrl = redirectData[0].base_url;
                try {
                    params = JSON.parse(redirectData[0].query_url);
                } catch (e) {
                    // params = {};
                }

                affiliateUrl = affiliateUrl + `?${redirectData[0].click_id}=${clickId}`;
                if (redirectData[0].sub_id2 !== null && redirectData[0].sub_id2) {
                    affiliateUrl =
                        affiliateUrl +
                        `&${redirectData[0].sub_id2}=${redirectData[0].sub2}`;
                }
                if (redirectData[0].sub_id3 !== null && redirectData[0].sub_id3) {
                    affiliateUrl = affiliateUrl + `&${redirectData[0].sub_id3}=hyyzo`;
                }

                let keys = Object.keys(params);
                // console.log(results[0].click_id)
                for (var i = 0; i < keys.length; i++) {
                    affiliateUrl = affiliateUrl + `&${keys[i]}=${params[keys[i]]}`;
                }
                affiliateUrl = affiliateUrl.replace("{camp_id}", camp_id);
                red_data["aff_url"] = affiliateUrl;
                var ip = requestIp.getClientIp(req);
                if (UID) {
                    let newData = {};
                    newData.store_id = store_id;
                    newData.click_id = clickId;
                    newData.partner_id = partner_id;
                    newData.activity_code = activity_code;
                    newData.system_info = req.headers["user-agent"];
                    newData.uid = UID;
                    newData.ip = ip;
                    if (redirectData[0].user_share_per)
                        newData.user_share_per = redirectData[0].user_share_per;
                    if (redirectData[0].user_share_flat)
                        newData.user_share_flat = redirectData[0].user_share_flat;
                    if (redirectData[0].user_share_max)
                        newData.user_share_max = redirectData[0].user_share_max;
                    if (redirectData[0].user_share_min)
                        newData.user_share_min = redirectData[0].user_share_min;
                    if (
                        redirectData[0].allow_api_posting == 0 ||
                        redirectData[0].allow_api_posting == null
                    )
                        newData.disallow_api_posting = 1;
                    connection.query(
                        "INSERT INTO aff_clicks SET ?",
                        newData,
                        function (error, results, fields) {
                            if (error) {
                                // console.log(error);
                                res.send({
                                    code: 400,
                                    failed: "error ocurred",
                                });
                            } else {
                                res.send({
                                    code: 200,
                                    msg: "url generated!",
                                    data: red_data,
                                });
                            }
                        }
                    );
                } else {
                    res.send({
                        code: 200,
                        msg: "url generated!",
                        data: red_data,
                        error: "please_login",
                    });
                }
            } else {
                // console.log('no partner id');
                if (req.body.username) {
                    return res.send({
                        code: 400,
                        failed: "error occured",
                        error: "merchant is currently Inactive",
                        status:
                            redirectData[0].store_name +
                            ' is currently Inactive, <a href="' +
                            redirectData[0].url +
                            '">Click Here</a> to Proceed without cashback',
                    });
                }
                affiliateUrl = redirectData[0].url;
                red_data["aff_url"] = affiliateUrl;
                res.send({
                    code: 200,
                    msg: "url generated!",
                    data: red_data,
                });
            }
        } else {
            if (req.body.username) {
                //
                let res1 = await query(
                    "SELECT store_name,url from cb_stores WHERE store_page_url =?",
                    store_name
                );
                if (res1 && res1.length) {
                    return res.send({
                        code: 400,
                        failed: "error occured",
                        error: "merchant is currently Inactive",
                        status:
                            res1[0].store_name +
                            ' is currently Inactive, <a href="' +
                            res1[0].url +
                            '">Click Here</a> to Proceed without cashback',
                    });
                }
                let res2 = await query(
                    'SELECT store_page_url,store_name from cb_stores WHERE SOUNDEX(store_page_url) like concat("%",SOUNDEX(?),"%") and active=1 LIMIT 5',
                    store_name
                );
                if (res2 && res2.length) {
                    let mlist = res2.map((mer) => {
                        return (
                            '</br><a href="' +
                            mer.store_page_url +
                            '">' +
                            mer.store_name +
                            " </a>"
                        );
                    });
                    return res.send({
                        code: 400,
                        failed: "error occured",
                        error: "misspelled",
                        status: "Merchant not found. Did you mean" + mlist.join(""),
                    });
                }
            }
            res.send({
                code: 400,
                failed: "error occured",
                error: "merchant not found",
                status:
                    'Merchant is not available. Please visit <a href="/all/stores">All stores Page</a> for full merchant list',
            });
        }
    } catch (error) {
        res.send({
            code: 400,
            failed: "error occured",
            error: error,
        });
    }
};

exports.getTaskRedirectUrl = async (req, res) => {
    const task_id = req.body.task_id;
    let UID = null;

    try {
        // Get UID from manual_uid, session, or uid
        if (req.manual_uid) {
            const result = await query(`SELECT uid FROM cb_users WHERE uid = ?`, [req.manual_uid]);
            if (result.length) UID = req.manual_uid;
        } else if (req.session && req.session.hyyzoUser) {
            UID = req.session.hyyzoUser.uid;
        } else if (req.uid) {
            UID = req.uid;
        }

        // Get task details
        const results = await query(
            `SELECT a.link, a.partner_id, d.url AS img_url, d.width, d.height,
                    e.user_share_per, e.user_share_flat, e.user_share_max,
                    e.user_share_min, e.allow_api_posting
             FROM tasks a
             LEFT JOIN images d ON a.image = d.id
             LEFT JOIN point_master e ON a.task_id = e.task_id
             WHERE a.task_id = ? AND a.active = 1`,
            [task_id]
        );

        if (!results.length) {
            return res.status(400).send({
                code: 400,
                failed: "error occurred",
                error: "merchant not found",
            });
        }

        const result = results[0];
        const clickId = generateClickId(20);
        const affiliateUrl = result.link.replace("{click_id}", clickId);
        const ip = requestIp.getClientIp(req);

        const red_data = {
            store_name: "Merchant",
            img_url: result.img_url,
            width: result.width,
            height: result.height,
            aff_url: affiliateUrl,
        };

        if (!UID) {
            return res.status(200).send({
                code: 200,
                msg: "url generated!",
                data: red_data,
                error: "please_login",
            });
        }

        // Prepare click tracking data
        const newData = {
            task_id,
            click_id: clickId,
            partner_id: result.partner_id,
            activity_code: 4,
            system_info: req.headers["user-agent"],
            uid: UID,
            ip: ip,
        };

        if (result.user_share_per) newData.user_share_per = result.user_share_per;
        if (result.user_share_flat) newData.user_share_flat = result.user_share_flat;
        if (result.user_share_max) newData.user_share_max = result.user_share_max;
        if (result.user_share_min) newData.user_share_min = result.user_share_min;
        if (result.allow_api_posting === 0 || result.allow_api_posting == null)
            newData.disallow_api_posting = 1;

        await query(`INSERT INTO aff_clicks SET ?`, newData);

        return res.status(200).send({
            code: 200,
            msg: "url generated!",
            data: red_data,
        });
    } catch (error) {
        console.error(error, "in getTaskRedirectUrl");
        return res.status(500).send({
            code: 500,
            failed: "error occurred",
            error: error.message,
        });
    }
};


async function returnLink(siteid, PID) {
    let link = "";
    // console.log(siteid, PID, "siteid, PID in return link 33");
    try {
        switch (+siteid) {
            case 1:
                link = `https://www.flipkart.com/p/p/item?pid=${PID}`;
                break;
            case 2:
                link = `https://www.amazon.in/dp/${PID}`;
                break;
            case 3:
                link = `https://bazaar.shopclues.com/${PID}.html`;
                break;
            case 4:
                link = `https://www.snapdeal.com/product/p/${PID}`;
                break;
            case 5:
                link = `https://www.jiomart.com/search/${PID}`;
                break;
            case 6:
                link = `https://www.tatacliq.com/p/p-${PID}`;
                break;
            case 7:
                link = `https://www.myntra.com/product/p/p/${PID}/buy`;
                break;
            case 8:
                link = `https://www.nykaa.com/p/p/${PID}?productId=${PID}`;
                break;
            case 9:
                link = `https://www.ajio.com/p/${PID}`;
                break;
            case 10:
                link = `https://www.pepperfry.com/site_product/search?q=${PID}`;
                break;
            case 11:
                link = `https://www.firstcry.com/p/p/${PID}/product-detail`;
                break;
            case 12:
                link = `https://www.nykaafashion.com/p/p/${PID}`;
                break;
            case 13:
                link = `https://www.croma.com/p/p/${PID}`;
                break;
            case 14:
                link = `https://www.reliancedigital.in/p/p/${PID}`;
                break;
            case 15:
                link = `https://www.meesho.com/q/p/${PID}`;
                break;
            case 16:
                link = `https://purplle.com/product/${PID}`;
                break;
            default:
                link = ``;
        }
        // console.log(link, "link in return link 33");
        return link;
    } catch (e) {
        return "";
    }
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

async function fetchFinalUrl(initialUrl, timeoutThreshold = 4000, time = 0) {
    try {
        let data = await fetch("https://curl.flipshope.com/", {
            signal: AbortSignal.timeout(timeoutThreshold),
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Ensuring the content type is set correctly
            },
            body: JSON.stringify({ key: "hbhvgf56", url: initialUrl, type: "furl" }),
        });
        data = await data.json();
        // data = data.json();
        // console.log("data", data);
        if (!data || !data.res) {
            if (!time) return fetchFinalUrl_self(initialUrl);
            return initialUrl;
        }
        return data.res;
    } catch (e) {
        console.log("error in curl fetch", e);
        if (!time) return fetchFinalUrl_self(initialUrl);
        return initialUrl;
    }
}