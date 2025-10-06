const util = require("util");
const mysql = require("mysql");
const key = require("../config/keys");
const options = {
    host: key.MYSQL_HOST,
    user: key.MYSQL_USER,
    password: key.MYSQL_PASSWORD,
    database: key.MYSQL_DATABASE,
    charset: "utf8mb4"
    // timezone: "local", // Ensures IST is used
};
var connection = mysql.createConnection(options);
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const axios = require("axios");
const { modifyUrl, fetchFinalUrl } = require("./affiliate.controller");
const qs = require('qs')
const moment = require('moment');
const { checkBonus } = require("../routes/common_functions/common_function");
let getting_post = {};
const VERIFY_TOKEN = key.VERIFY_TOKEN || "my_secure_token";
const permissions = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments'
];

const custom_code = {
    permission_error: 403,
    followers_error: 416,
    insta_not_signedup: 401,
    permission_follower_error: 422,
    is_reverifcation_required:430
}


exports.getUserInstaPost = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        const { page } = req.query
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        }
        else {
            var uid = req.uid;
        }
        if (!uid) {
            return res
                .status(400)
                .send({
                    message: "Session expired, please login again.",
                });
        }

        let accessToken = await query(
            `SELECT access_token
            FROM user_access_token
            WHERE uid = ? AND social_platform = 'instagram'`,
            [uid]
        )

        if (!accessToken.length) {
            return res
                .status(403)
                .send({
                    message: "No access token found."
                })
        }
        accessToken = accessToken[0].access_token
        let posts = await axios.get(
            `https://graph.instagram.com/me/media?fields=id,media_url,thumbnail_url,timestamp,media_product_type,media_type,permalink,username&access_token=${accessToken}&limit=9${page ? '&after=' + page : ''}`
        )

        let scheduledPost = await query(
            `SELECT *
            FROM user_scheduled_posts
            WHERE uid = ? AND active = 1`,
            [uid]
        )

        if (scheduledPost.length) {
            let createdTime = scheduledPost[0].created_time
            if (isTimeDifferenceMoreThan(createdTime, 180)) {
                let id = scheduledPost[0].id
                await query(
                    `UPDATE user_scheduled_posts
                    SET active = 0
                    WHERE id = ?`,
                    [id]
                )
            }
            else {
                posts.data.scheduled = createdTime
            }
        }

        res
            .status(200)
            .send(posts.data)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error fetching posts."
            })
    }
}

exports.createAutoPost = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        }
        else {
            var uid = req.uid;
        }

        if (!uid) {
            return res
                .status(400)
                .send({
                    message: "Session expired, please login again.",
                });
        }

        let { post_id, link_arr, keywords, isScheduled, perma_link } = req.body;

        if (!link_arr || !Array.isArray(link_arr) || link_arr.length == 0) {
            return res.status(400).send({
                message: "Cannot add collection. Please try again.",
            });
        }

        const u_data = await query(`SELECT * FROM cb_users WHERE uid = ?`, [uid]);

        if (u_data.length == 0) {
            return res.status(404).send({
                message: "User not found",
            });
        }

        let productDetailPromises = link_arr.map((link) => (
            axios.post(
                "https://flipshope.com/api/prices/proddetails",
                {
                    link: link,
                }
            )
        ))

        let productDetails = await Promise.allSettled(productDetailPromises)

        let linkArr = productDetails.map((product) => {
            return returnLink(product.value.data.data.sid, product.value.data.data.pid)
        })

        let storeIdPromises = linkArr.map((link) => {
            return query(
                `SELECT 
                    b.store_id, b.active
                FROM
                    deeplink_domain_mapping a
                        INNER JOIN
                    cb_stores b ON a.store_id = b.store_id
                WHERE
                    '${link}' LIKE CONCAT('%', a.url, '%')
                ORDER BY b.active DESC , LENGTH(a.url) DESC`
            )
        })

        let storeId = await Promise.all(storeIdPromises)

        const errorIndexArray = [];

        for (let i = 0; i < storeId.length; i++) {
            if (!storeId[i].length || !storeId[i][0].active) {
                errorIndexArray.push(i)
            }
        }

        if (errorIndexArray.length) {
            return res
                .status(501)
                .send({
                    message: "Store not supported for some links.",
                    errorIndexArray
                })
        }

        const user = u_data[0];
        const productsToInsert = [];

        let affLinksPromises = link_arr.map((link) => (
            modifyUrl(user, link)
        ))

        let affLinks = await Promise.all(affLinksPromises)

        for (const link of affLinks) {
            if (!link.url || link.error) {
                errorIndexArray.push(affLinks.indexOf(link));
            }
        }

        if (errorIndexArray.length) {
            return res
                .status(501)
                .send({
                    message: "Store not supported for some links.",
                    errorIndexArray
                })
        }

        for (let i = 0; i < affLinks.length; i++) {
            if (productDetails[i].status == "fulfilled") {
                const { title, imgurl } = productDetails[i].value?.data?.data
                productsToInsert.push({
                    uid,
                    name: title || null,
                    img_url: imgurl || null,
                    aff_link: affLinks[i].url,
                    sid: storeId[i][0].store_id,
                    org_link: link_arr[i]
                })
            }
            else {
                productsToInsert.push({
                    uid,
                    name: null,
                    img_url: null,
                    aff_link: affLinks[i].url,
                    sid: storeId[i][0].store_id || null,
                    org_link: link_arr[i]
                })
            }
        }

        if (productsToInsert.length > 0) {
            const insertPromises = productsToInsert.map((product) =>
                query(
                    `INSERT INTO product_links (sid, name, img_url, uid, aff_link, org_link, post_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [product.sid, product.name, product.img_url, product.uid, product.aff_link, product.org_link, post_id ? post_id : null]
                )
            );

            const insertResults = await Promise.all(insertPromises);
            let insertIds = insertResults.map((result) => result.insertId);
            insertIds = JSON.stringify(insertIds);
            if (isScheduled) {
                await query(
                    `UPDATE user_scheduled_posts
                    SET active = 0
                    WHERE uid = ?`,
                    [uid]
                )
                await query(
                    `INSERT INTO user_scheduled_posts (uid, links_id, keywords, social_platform)
                    VALUES (?,?,?,?)`,
                    [uid, insertIds, JSON.stringify(keywords), "instagram"]
                )
            }
            else {
                await query(
                    `INSERT INTO user_post_mapping (uid, post_id, permalink, links_id, keywords, social_platform, active)
                    VALUES (?,?,?,?,?,?,1)
                    ON DUPLICATE KEY UPDATE 
                        links_id = VALUES(links_id),
                        keywords = VALUES(keywords),
                        social_platform = VALUES(social_platform),
                        active = 1`,
                    [uid, post_id, perma_link, insertIds, JSON.stringify(keywords), "instagram"]
                )
            }
            res
                .status(201)
                .send({
                    message: "Successfully created autopost."
                })

            if (isScheduled) {
                let [schedule] = await query(
                    `SELECT COUNT(*) AS count
                    FROM user_scheduled_posts
                    WHERE uid = ?`,
                    [uid]
                )

                schedule = schedule.count

                if (schedule) {
                    checkBonus("setup_schedule", uid)
                }
            }
        }
        else {
            res
                .status(419)
                .send({
                    message: "No links converted."
                })
        }

    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error creating Auto Post."
            })
    }
}

exports.updateAutoPost = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        }
        else {
            var uid = req.uid;
        }

        if (!uid) {
            return res
                .status(400)
                .send({
                    message: "Session expired, please login again.",
                });
        }

        let { link_arr, removed_products, post_id, keywords, scheduleId } = req.body

        const u_data = await query(`SELECT * FROM cb_users WHERE uid = ?`, [uid]);

        if (u_data.length == 0) {
            return res.status(404).send({
                message: "User not found",
            });
        }

        let productDetailPromises = link_arr.map((link) => (
            axios.post(
                "https://flipshope.com/api/prices/proddetails",
                {
                    link: link,
                }
            )
        ))

        let productDetails = await Promise.allSettled(productDetailPromises)

        let linkArr = productDetails.map((product) => {
            return returnLink(product.value.data.data.sid, product.value.data.data.pid)
        })

        let storeIdPromises = linkArr.map((link) => {
            return query(
                `SELECT 
            b.store_id, b.active
        FROM
            deeplink_domain_mapping a
                INNER JOIN
            cb_stores b ON a.store_id = b.store_id
        WHERE
            '${link}' LIKE CONCAT('%', a.url, '%')
        ORDER BY b.active DESC , LENGTH(a.url) DESC`
            )
        })

        let storeId = await Promise.all(storeIdPromises)

        const errorIndexArray = [];

        for (let i = 0; i < storeId.length; i++) {
            if (!storeId[i].length || !storeId[i][0].active) {
                errorIndexArray.push(i)
            }
        }

        if (errorIndexArray.length) {
            return res
                .status(501)
                .send({
                    message: "Store not supported for some links.",
                    errorIndexArray
                })
        }

        const user = u_data[0];
        const productsToInsert = [];

        let affLinksPromises = link_arr.map((link) => (
            modifyUrl(user, link)
        ))

        let affLinks = await Promise.all(affLinksPromises)

        for (const link of affLinks) {
            if (!link.url || link.error) {
                errorIndexArray.push(affLinks.indexOf(link));
            }
        }

        if (errorIndexArray.length) {
            return res
                .status(501)
                .send({
                    message: "Store not supported for some links.",
                    errorIndexArray
                })
        }

        for (let i = 0; i < affLinks.length; i++) {
            if (productDetails[i].status == "fulfilled") {
                const { title, imgurl } = productDetails[i].value?.data?.data
                productsToInsert.push({
                    uid,
                    name: title || null,
                    img_url: imgurl || null,
                    aff_link: affLinks[i].url,
                    sid: storeId[i][0].store_id,
                    org_link: link_arr[i],
                })
            }
            else {
                productsToInsert.push({
                    uid,
                    name: null,
                    img_url: null,
                    aff_link: affLinks[i].url,
                    sid: storeId[i][0].store_id || null,
                    org_link: link_arr[i],
                })
            }
        }

        if (productsToInsert.length > 0) {
            // Use Promise.all for parallel insertions
            const insertPromises = productsToInsert.map((product) =>
                query(
                    `INSERT INTO product_links (sid, name, img_url, uid, aff_link, org_link, post_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [product.sid, product.name, product.img_url, product.uid, product.aff_link, product.org_link, post_id ? post_id : null]
                )
            );
            const insertResults = await Promise.all(insertPromises);

            let insertIds = insertResults.map((result) => result.insertId);

            let postLinks = []

            if (scheduleId) {
                postLinks = await query(
                    `SELECT links_id
                    FROM user_scheduled_posts
                    WHERE id = ?`,
                    [scheduleId]
                )
            }
            else {
                postLinks = await query(
                    `SELECT links_id
                    FROM user_post_mapping
                    WHERE post_id = ?`,
                    [post_id]
                )
            }

            postLinks = JSON.parse(postLinks[0].links_id)

            const idsToRemove = removed_products.map(item => item.id);

            const removedElements = postLinks.filter(item => idsToRemove.includes(item));

            let updatedArray = postLinks.filter(item => !idsToRemove.includes(item));

            updatedArray = [...updatedArray, ...insertIds]

            if (scheduleId) {
                await query(
                    `UPDATE user_scheduled_posts
                    SET links_id = ?, keywords = ?
                    WHERE id = ?`,
                    [JSON.stringify(updatedArray), JSON.stringify(keywords), scheduleId]
                )

                // if (removedElements.length) {
                //     await query(
                //         `UPDATE product_links
                //         SET post_id = NULL
                //         WHERE id IN (${removedElements.map(() => '?').join(',')})`,
                //         removedElements
                //     );
                // }
            }
            else {
                await query(
                    `UPDATE user_post_mapping
                    SET links_id = ?, keywords = ?
                    WHERE post_id = ?`,
                    [JSON.stringify(updatedArray), JSON.stringify(keywords), post_id]
                )

                if (removedElements.length) {
                    await query(
                        `UPDATE product_links
                        SET post_id = NULL
                        WHERE id IN (${removedElements.map(() => '?').join(',')})`,
                        removedElements
                    );
                }
            }
        }
        else {
            const idsToRemove = removed_products.map(item => item.id);
            if (scheduleId) {
                await query(
                    `UPDATE user_scheduled_posts
                    SET keywords = ?
                    WHERE id = ?`,
                    [JSON.stringify(keywords), scheduleId]
                )
                if(idsToRemove.length){
                    let productArray = await query(
                        `SELECT links_id
                        FROM user_scheduled_posts
                        WHERE id = ?`,
                        [scheduleId]
                    )

                    productArray = productArray[0].links_id
                    productArray = JSON.parse(productArray)
                    productArray = productArray.filter((product) => !idsToRemove.includes(product))
                    await query(
                        `UPDATE user_scheduled_posts
                        SET links_id = ?
                        WHERE id = ?`,
                        [JSON.stringify(productArray), scheduleId]
                    )
                }
            }
            else {
                await query(
                    `UPDATE user_post_mapping
                    SET keywords = ?
                    WHERE post_id = ?`,
                    [JSON.stringify(keywords), post_id]
                )
                if (idsToRemove.length) {
                    let productArray = await query(
                        `SELECT links_id
                        FROM user_post_mapping
                        WHERE post_id = ?`,
                        [post_id]
                    )

                    productArray = productArray[0].links_id
                    productArray = JSON.parse(productArray)
                    productArray = productArray.filter((product) => !idsToRemove.includes(product))
                    await query(
                        `UPDATE product_links
                        SET post_id = NULL
                        WHERE id IN (${idsToRemove.map(() => '?').join(',')})`,
                        idsToRemove
                    );
                    await query(
                        `UPDATE user_post_mapping
                        SET links_id = ?
                        WHERE post_id = ?`,
                        [JSON.stringify(productArray), post_id]
                    )
                }
            }
        }
        res
            .status(200)
            .send({
                message: "Updated successfully"
            })
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error updating post."
            })
    }
}

exports.deleteAutoPost = async (req, res) => {
    try {
        if ((!req.session || !req.session.hyyzoUser) && !req.uid) {
            return res.send({
                code: 400,
                failed: "error occured",
                status: "Please Refresh the page.",
            });
        }

        let uid = req.uid;
        if (!uid) uid = req.session.hyyzoUser.uid;

        let { post_id } = req.body

        await beginTransaction()

        await query(
            `UPDATE product_links
            JOIN user_post_mapping
            ON user_post_mapping.post_id = ?
            AND REPLACE(REPLACE(user_post_mapping.links_id, '[', ''), ']', '') REGEXP CONCAT('(^|,)', product_links.id, '(,|$)')
            SET product_links.post_id = NULL`,
            [post_id]
        )

        await query(
            `UPDATE user_post_mapping
            SET active = 0, links_id = '[]', keywords = '[]'
            WHERE uid = ? AND post_id = ?
            `,
            [uid, post_id]
        )

        await commit()
        res
            .status(204)
            .send({
                message: "Auto Post deleted successfully."
            })
    } catch (error) {
        await rollback()
        console.error(error)
        res
            .status(500)
            .send({
                message: "Internal server error"
            })
    }
}

exports.getAutoPost = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        }
        else {
            var uid = req.uid;
        }

        if (!uid) {
            return res
                .status(400)
                .send({
                    message: "Session expired, please login again.",
                });
        }

        let page = parseInt(req.query.page) || 1;
        let offset = (page - 1) * 10;

        let autoPosts = await query(`
            SELECT 
                upm.post_id,
                JSON_LENGTH(upm.links_id) AS total_products,
                CONCAT('[', 
                    GROUP_CONCAT(
                        CONCAT(
                            '{"id":', pl.id, ',',
                            '"name":"', REPLACE(pl.name, '"', '\\"'), '",',
                            '"aff_link":"', pl.aff_link, '",',
                            '"img_url":"', pl.img_url, '",',
                            '"position":', n.num - 1, '}'
                        )
                        ORDER BY n.num
                    ),
                ']') AS products
            FROM 
                user_post_mapping upm
            JOIN (
                SELECT 1 AS num UNION ALL
                SELECT 2 UNION ALL
                SELECT 3
            ) AS n
            JOIN product_links pl ON (
                pl.id = SUBSTRING_INDEX(
                    SUBSTRING_INDEX(
                        REPLACE(
                            REPLACE(upm.links_id, '[', ''),
                            ']', ''
                        ),
                        ',',
                        n.num
                    ),
                    ',',
                    -1
                )
            )
            WHERE 
                n.num <= (
                    LENGTH(REPLACE(REPLACE(upm.links_id, '[', ''), ']', '')) 	
                    - LENGTH(REPLACE(REPLACE(REPLACE(upm.links_id, '[', ''), ']', ''), ',', '')) + 1
                )
                AND n.num <= 3
                AND upm.uid = ?
                AND upm.active = 1
            GROUP BY 
                upm.post_id, upm.img_url, upm.links_id
            LIMIT 10 OFFSET ?`,
            [uid, offset]
        )

        if (!autoPosts.length) {
            return res
                .status(200)
                .send([])
        }

        let accessToken = await query(
            `SELECT access_token
                    FROM user_access_token
                    WHERE uid = ?`,
            [uid]
        )

        if (!accessToken.length) {
            return res
                .status(200)
                .send([])
        }
        accessToken = accessToken[0]?.access_token

        for (let i = 0; i < autoPosts.length; i++) {
            try {
                let data = await axios.get(`https://graph.instagram.com/v22.0/${autoPosts[i].post_id}?fields=media_url,thumbnail_url,permalink&access_token=${accessToken}`)
                autoPosts[i].img_url = data?.data?.thumbnail_url || data?.data?.media_url || ""
                autoPosts[i].permalink = data?.data?.permalink || ""
            } catch (error) {
                console.log(error)
            }
        }

        res
            .status(200)
            .send(autoPosts)

    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error fetching Auto posts."
            })
    }
}

exports.getPostLinks = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        }
        else {
            var uid = req.uid;
        }

        if (!uid) {
            return res
                .status(400)
                .send({
                    message: "Session expired, please login again.",
                });
        }

        let { post_id } = req.query

        if (post_id == "isScheduled") {
            let postData = await query(
                `SELECT 
                    upm.id,
                    upm.keywords,
                    CONCAT('[',
                            GROUP_CONCAT(CONCAT('{"id":',
                                        pl.id,
                                        ',',
                                        '"name":"',
                                        REPLACE(pl.name, '"', '\"'),
                                        '",',
                                        '"aff_link":"',
                                        pl.aff_link,
                                        '",',
                                        '"org_link":"',
                                        pl.org_link,
                                        '",',
                                        '"store_img":"',
                                        img.url,
                                        '",',
                                        '"store_name":"',
                                        cs.store_name,
                                        '",',
                                        '"img_url":"',
                                        pl.img_url,
                                        '"}')
                                ORDER BY FIND_IN_SET(pl.id,
                                        REPLACE(REPLACE(upm.links_id, '[', ''),
                                            ']',
                                            ''))
                                SEPARATOR ','),
                            ']') AS products
                FROM
                    user_scheduled_posts upm
                        JOIN
                    product_links pl ON FIND_IN_SET(pl.id,
                            REPLACE(REPLACE(upm.links_id, '[', ''),
                                ']',
                                '')) > 0
                        LEFT JOIN
                    cb_stores AS cs ON pl.sid = cs.store_id
                        LEFT JOIN
                    images_srcset AS img ON img.id = cs.image
                WHERE 
                    upm.uid = ? AND upm.active = 1
                GROUP BY upm.id, upm.keywords`,
                [uid]
            )

            return res
                .status(200)
                .send(postData)
        }

        let postData = await query(
            `SELECT 
                upm.keywords,
                CONCAT('[',
                        GROUP_CONCAT(CONCAT('{"id":',
                                    pl.id,
                                    ',',
                                    '"name":"',
                                    REPLACE(pl.name, '"', '\"'),
                                    '",',
                                    '"aff_link":"',
                                    pl.aff_link,
                                    '",',
                                    '"org_link":"',
                                    pl.org_link,
                                    '",',
                                    '"store_img":"',
                                    img.url,
                                    '",',
                                    '"store_name":"',
                                    cs.store_name,
                                    '",',
                                    '"img_url":"',
                                    pl.img_url,
                                    '"}')
                            ORDER BY FIND_IN_SET(pl.id,
                                    REPLACE(REPLACE(upm.links_id, '[', ''),
                                        ']',
                                        ''))
                            SEPARATOR ','),
                        ']') AS products
            FROM
                user_post_mapping upm
                    JOIN
                product_links pl ON FIND_IN_SET(pl.id,
                        REPLACE(REPLACE(upm.links_id, '[', ''),
                            ']',
                            '')) > 0
                    LEFT JOIN
                cb_stores AS cs ON pl.sid = cs.store_id
                    LEFT JOIN
                images_srcset AS img ON img.id = cs.image
            WHERE
            upm.post_id = ?
            GROUP BY upm.img_url, upm.keywords`,
            [post_id]
        )

        res
            .status(200)
            .send(postData)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error fetching auto post links."
            })
    }
}

exports.webhookVerification = async (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified successfully!");
        res.status(200).send(challenge);
    } else {
        res.status(403).send("❌ Verification failed");
    }
}

exports.instaAuth = async (req, res) => {
    const code = req.query.code;
    const uid = req.query.state;

    if (!code) {
        return res.status(400).send("Authorization failed");
    }

    try {
        const data = qs.stringify({
            client_id: key.INSTA_CLIENT_ID,
            client_secret: key.INSTA_CLIENT_SECRET,
            grant_type: "authorization_code",
            redirect_uri: key.INSTA_REDIRECT_URL,
            code: code,
        });

        const response = await axios.post(
            "https://api.instagram.com/oauth/access_token",
            data,
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );
        const oAuthRes = response.data;
        const access_token = oAuthRes.access_token
        const givenPermissions = oAuthRes.permissions
        const social_id = oAuthRes.user_id

        const longLivedToken = await axios.get(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${key.INSTA_CLIENT_SECRET}&access_token=${access_token}`)

        const longLivedAccessToken = longLivedToken.data.access_token

        let userInstaData = await axios.get(`https://graph.instagram.com/v22.0/me?fields=user_id,username,followers_count,account_type,media_count&access_token=${access_token}`)

        const { user_id, followers_count, username } = userInstaData.data

        let allPermissionAccess = permissions.every(item => givenPermissions.includes(item))

        let checkUserInstaExists = await query(
            `SELECT social_app_id
            FROM user_access_token
            WHERE uid = ?`,
            [uid]
        )

        if (checkUserInstaExists.length && checkUserInstaExists[0].social_app_id != user_id) {
            return res.redirect(`${key.WEBSITE_URL}/home?error=account_exists`)
        }

        let checkInstaExists = await query(
            `SELECT uid
            FROM user_access_token
            WHERE social_app_id = ?`,
            [user_id]
        )

        if (checkInstaExists.length && checkInstaExists[0].uid != uid) {
            return res.redirect(`${key.WEBSITE_URL}/home?error=insta_exists`)
        }

        await query(
            `INSERT INTO user_access_token (social_app_id, social_id, uid, username, follower_count, all_permission_access, access_token, social_platform)
            VALUES(?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE
                access_token = VALUES(access_token),
                username = VALUES(username),
                follower_count = VALUES(follower_count),
                all_permission_access = VALUES(all_permission_access)
            `,
            [user_id, social_id, uid, username, followers_count, allPermissionAccess, longLivedAccessToken, "instagram"]
        )

        if (followers_count < 1000 && !allPermissionAccess) {
            return res.redirect(`${key.WEBSITE_URL}/home?error=follower_count_permission`)
        }

        if (followers_count < 1000) {
            return res.redirect(`${key.WEBSITE_URL}/home?error=follower_count`)
        }

        if (!allPermissionAccess) {
            return res.redirect(`${key.WEBSITE_URL}/home?error=permissions`)
        }

        await axios.post(`https://graph.instagram.com/v23.0/${user_id}/subscribed_apps?subscribed_fields=comments,messages&access_token=${longLivedAccessToken}`)

        res.redirect(`${key.WEBSITE_URL}/home`)

        let [instaAuth] = await query(
            `SELECT COUNT(*) AS count
            FROM user_access_token
            WHERE uid = ?`,
            [uid]
        )

        instaAuth = instaAuth.count
        if (instaAuth) {
            checkBonus("connect_social", uid)
        }

    } catch (error) {
        console.error("❌ Error getting access token:", error);
        res.status(500).send("Error authenticating");
    }
}

exports.getUserSetting = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        }
        else {
            var uid = req.uid;
        }
        if (!uid) {
            return res
                .status(400)
                .send({
                    message: "Session expired, please login again.",
                });
        }

        let settings = await query(
            `SELECT *
            FROM user_settings
            WHERE uid = ?`,
            [uid]
        )

        res
            .status(200)
            .send(settings)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error fetching settings."
            })
    }
}

exports.updateUserSetting = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        }
        else {
            var uid = req.uid;
        }
        if (!uid) {
            return res
                .status(400)
                .send({
                    message: "Session expired, please login again.",
                });
        }

        let { auto_dm, auto_comment, keywords, auto_comment_reply, auto_dm_post } = req.body

        await query(
            `INSERT INTO user_settings (uid, auto_dm, auto_comment, auto_dm_post, keywords, auto_comment_reply)
            VALUES (?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE
                auto_dm = VALUES(auto_dm),  
                auto_comment = VALUES(auto_comment),  
                auto_dm_post = VALUES(auto_dm_post),  
                keywords = VALUES(keywords),  
                auto_comment_reply = VALUES(auto_comment_reply)`,
            [uid, auto_dm, auto_comment, auto_dm_post, keywords, auto_comment_reply]
        )

        res
            .status(200)
            .send({
                message: "Settings updated."
            })

    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error updating settings."
            })
    }
}

exports.checkInstaAuth = async (req, res, next) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        }
        else {
            var uid = req.uid;
        }

        if (!uid) {
            return res
                .status(400)
                .send({
                    message: "Session expired, please login again.",
                });
        }

        let instaData = await query(
            `SELECT *
            FROM user_access_token
            WHERE uid = ?`,
            [uid]
        )

        if (!instaData.length) {
            return res
                .status(403)
                .send({
                    message: "Insta not signed up.",
                    code: custom_code.insta_not_signedup
                })
        }

        try {
            await axios.get(`https://graph.instagram.com/me/media?fields=id&access_token=${instaData[0].access_token}`);
        }catch (err) {
            const accessToken = await updateAccessToken(instaData[0].access_token,instaData[0].social_app_id);
            if(!accessToken){
                return res
                    .status(403)
                    .send({
                        message: "Failed to refresh access token.",
                        code: custom_code.is_reverifcation_required
                    });
            }
        }

        if (instaData[0].follower_count < 1000 && !instaData[0].all_permission_access) {
            return res
                .status(403)
                .send({
                    message: "Minimum 1000 followers needed and all permission not given.",
                    code: custom_code.permission_follower_error
                })
        }

        if (!instaData[0].all_permission_access) {
            return res
                .status(403)
                .send({
                    message: "Please re-login insta and give all permissions.",
                    code: custom_code.permission_error
                })
        }

        if (instaData[0].follower_count < 1000) {
            return res
                .status(403)
                .send({
                    message: "Minimum 1000 followers needed.",
                    code: custom_code.followers_error
                })
        }

        res
            .status(200)
            .send({
                message: "Insta checked."
            })
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: 'Internal server error.'
            })
    }
}

exports.sendAutoDM = async (req, res) => {
    try {
        const body = req.body;
        if (body.entry) {
            for (const entry of body.entry) {
                const entryId = entry.id;

                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (change.field === "comments") {
                            const comment = change.value;
                            const commentText = comment.text?.toLowerCase();
                            const postId = comment.media?.id;
                            const commentId = comment.id;

                            if (!commentText || !postId || !commentId) continue;

                            await handleKeywordAndSendDM({
                                keywordText: commentText,
                                userId: entryId,
                                postId,
                                commentOrMessageId: commentId,
                            });
                        }
                    }
                }

                if (entry.messaging) {
                    for (const messageEvent of entry.messaging) {
                        const senderId = messageEvent.sender.id;
                        const receiverId = messageEvent.recipient.id;
                        const isEcho = messageEvent.message?.is_echo
                        let messageText = messageEvent.message?.text;
                        let postId = ''

                        if (!messageText) {
                            messageText = messageEvent.message?.attachments[0]
                            if (!messageText || !senderId) continue;
                            const type = messageText.type;
                            const data = messageText.payload;

                            switch (type) {
                                case 'ig_reel':
                                    postId = data.reel_video_id;
                                    break
                                case 'share':
                                    postId = extractAssetIdFromUrl(data.url)
                                    break
                                case 'ig_carousel':
                                    postId = data.media_id || data.post_id;
                                    break
                                default:
                                    postId = null;
                            }
                        }
                        else {
                            if (!messageText || !senderId) continue;

                            const finalRedirectURL = await fetchFinalUrl(messageText)

                            const shortcode = getShortCode(finalRedirectURL)
                            if (!shortcode) continue;

                            postId = await getPostIdFromShortcode(shortcode);
                        }


                        await handleKeywordAndSendDM({
                            userId: isEcho ? senderId : receiverId,
                            postId,
                            commentOrMessageId: isEcho ? receiverId : senderId,
                            isDM: true,
                        });
                    }
                }
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error("Error in sendAutoDM:", error);
        res.sendStatus(200);
    }
};

exports.getProfileSummary = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        }
        else {
            var uid = req.uid;
        }
        if (!uid) {
            return res
                .status(400)
                .send({
                    message: "Session expired, please login again.",
                });
        }

        let details = await Promise.all([
            query(`SELECT COUNT(*) AS post_count FROM user_post_mapping WHERE uid = ? AND active = 1`, [uid]),
            query(`SELECT COUNT(*) AS collection_count FROM user_collection WHERE uid = ? AND active = 1`, [uid]),
            query(`SELECT COUNT(*) AS product_count FROM product_links WHERE uid = ? AND cid IS NULL AND post_id IS NULL`, [uid])
        ])

        let result = {}
        for (let detail of details) {
            let count = detail[0]
            result = { ...count, ...result }
        }

        res
            .status(200)
            .send(result)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error fetching profile summary."
            })
    }
}

exports.checkPostSetup = async(req,res)=>{
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        }
        else {
            var uid = req.uid;
        }
        if (!uid) {
            return res
                .status(400)
                .send({
                    message: "Session expired, please login again.",
                });
        }

        const { post_id } = req.body;

        const isPostSetup = await query(
            `SELECT *
            FROM user_post_mapping
            WHERE post_id = ? AND active = 1`,
            [post_id]
        )

        if(isPostSetup.length){
            return res
                .status(200)
                .send({
                    isPostSetup: true
                })
        }
        
        res
            .status(200)
            .send({
                isPostSetup: false
            })
    } catch (error) {
        console.log(error)
        res
        .status(500)
        .send({
            message:"Internal server error."
        })
    }
}

function extractAssetIdFromUrl(url) {
    const match = url.match(/asset_id=(\d+)/);
    return match ? match[1] : null;
}

async function handleKeywordAndSendDM({ keywordText, userId, postId, commentOrMessageId, isDM }) {
    let autoPostData = []
    if (postId) {
        autoPostData = await query(
            `SELECT 
                upm.uid,
                upm.keywords,
                uat.access_token,
                uat.social_app_id,
                uat.last_updated_time,
                CONCAT('[',
                        GROUP_CONCAT(DISTINCT CONCAT('{"id":',
                                    pl.id,
                                    ',"name":"',
                                    REPLACE(pl.name, '"', '\"'),
                                    '","aff_link":"',
                                    pl.aff_link,
                                    '","img_url":"',
                                    REPLACE(pl.img_url, '"', '\"'),
                                    '"}')),
                        ']') AS links_details
            FROM
                user_post_mapping upm
                    JOIN
                user_access_token uat ON upm.uid = uat.uid
                    AND upm.social_platform = uat.social_platform
                    LEFT JOIN
                product_links pl ON upm.uid = pl.uid
                    AND JSON_CONTAINS(upm.links_id, CAST(pl.id AS CHAR))
            WHERE
                upm.post_id = ? AND upm.active = 1
            GROUP BY upm.uid, upm.keywords, uat.access_token, uat.last_updated_time, uat.social_app_id`,
            [postId]
        );
    }

    if (autoPostData.length) {
        let { uid, access_token, keywords, last_updated_time, social_app_id, links_details } = autoPostData[0];
        if (!await checkUserSettings(uid, isDM)) {
            return
        }

        if (checkTimeDifference(last_updated_time)) {
            access_token = await updateAccessToken(access_token, social_app_id);
        }

        if (isDM || JSON.parse(keywords).map(kw => kw.toLowerCase()).includes(keywordText.toLowerCase())) {
            if (!isDM) {
                await sendCommentReply(commentOrMessageId, access_token, uid)
            }
            await sendDM(commentOrMessageId, access_token, links_details, isDM, uid);
        }
    } else {
        const scheduledData = await query(
            `SELECT 
                usp.id,
                usp.uid,
                usp.keywords,
                usp.links_id,
                usp.created_time,
                uat.access_token,
                uat.social_app_id,
                uat.last_updated_time,
                CONCAT('[',
                        GROUP_CONCAT(DISTINCT CONCAT('{"id":',
                                    pl.id,
                                    ',"name":"',
                                    REPLACE(pl.name, '"', '\"'),
                                    '","aff_link":"',
                                    pl.aff_link,
                                    '","img_url":"',
                                    REPLACE(pl.img_url, '"', '\"'),
                                    '"}')),
                        ']') AS links_details
            FROM
                user_scheduled_posts usp
                    JOIN
                user_access_token uat ON usp.uid = uat.uid AND usp.social_platform = uat.social_platform
                    LEFT JOIN
                product_links pl ON usp.uid = pl.uid AND JSON_CONTAINS(usp.links_id, CAST(pl.id AS CHAR))
            WHERE
                uat.social_app_id = ?
                AND usp.active = 1
            GROUP BY usp.id,usp.uid,usp.keywords, usp.created_time,usp.links_id, uat.access_token , uat.last_updated_time , uat.social_app_id`,
            [userId]
        );

        if (scheduledData.length) {
            let { id, uid, access_token, keywords, links_id, last_updated_time, social_app_id, links_details, created_time } = scheduledData[0];
            if (!await checkUserSettings(uid, isDM)) {
                return
            }
            if (isDM || JSON.parse(keywords).map(kw => kw.toLowerCase()).includes(keywordText)) {
                if (checkTimeDifference(last_updated_time)) {
                    access_token = await updateAccessToken(access_token, social_app_id);
                }
                let is_sch_post = await get_sch_post(id, postId, access_token, created_time, uid, links_id, keywords, isDM);
                if (is_sch_post) {
                    if (!isDM) {
                        await sendCommentReply(commentOrMessageId, access_token, uid)
                    }
                    await sendDM(commentOrMessageId, access_token, links_details, isDM, uid);
                }
            }
        }
    }
}

async function getPostIdFromShortcode(shortcode) {
    try {
        let post_id = await query(
            `SELECT post_id
            FROM user_post_mapping
            WHERE permalink = ?`,
            shortcode
        )
        if (!post_id.length) {
            return null
        }
        return post_id[0].post_id;
    } catch (err) {
        console.error("Error converting shortcode to media ID:", err);
        return null;
    }
}

async function get_sch_post(id, postId, access_token, created_time, uid, links_id, keywords, isDM) {
    if (getting_post?.postId) return getting_post.postId;
    if (isDM) {
        const time = moment(created_time).unix()
        let url = `https://graph.instagram.com/me/media?fields=id,timestamp,permalink&limit=1&since=${time}&access_token=${access_token}`

        try {
            const postDetails = await axios.get(url)
            if (postDetails?.data?.data?.length) {
                const { id: postId, timestamp, permalink } = postDetails.data.data[0];
                const shortcode = getShortCode(permalink);
                if (isWithinThreeHours(timestamp, created_time)) {
                    const ids = JSON.parse(links_id);
                    const placeholders = ids.map(() => '?').join(',');
                    await Promise.all([
                        query(
                            `INSERT INTO user_post_mapping (uid, post_id, permalink, links_id, keywords, social_platform) 
                            VALUES (?, ?, ?, ?, ?, ?)`,
                            [uid, postId, shortcode, links_id, keywords, "instagram"]
                        ),
                        query(
                            `UPDATE product_links SET post_id = ? WHERE id IN (${placeholders})`,
                            [postId, ...ids]
                        ),
                        query(
                            `UPDATE user_scheduled_posts SET active = 0 WHERE id = ?`,
                            [id]
                        )
                    ]);
                    return true
                }
            }
            return false
        } catch (error) {
            return false
        }
    }
    else {
        let url = `https://graph.instagram.com/v22.0/${postId}?fields=timestamp,permalink&access_token=${access_token}`;

        getting_post.postId = new Promise(async (resolve, reject) => {
            try {
                const postDetails = await axios.get(url);
                const { timestamp, permalink } = postDetails.data;

                const shortcode = getShortCode(permalink);
                if (isWithinThreeHours(timestamp, created_time)) {
                    const ids = JSON.parse(links_id);
                    const placeholders = ids.map(() => '?').join(',');
                    await Promise.all([
                        query(
                            `INSERT INTO user_post_mapping (uid, post_id, permalink, links_id, keywords, social_platform) 
                            VALUES (?,?,?,?,?,?)`,
                            [uid, postId, shortcode, links_id, keywords, "instagram"]
                        ),
                        query(
                            `UPDATE product_links SET post_id = ? WHERE id IN (${placeholders})`,
                            [postId, ...ids]
                        ),
                        query(
                            `UPDATE user_scheduled_posts
                            SET active = 0
                            WHERE id = ?`,
                            [id]
                        )
                    ]);
                    delete getting_post.postId;
                    return resolve(true);
                }
                delete getting_post.postId;
                return resolve(false)
            } catch (error) {
                delete getting_post.postId;
                reject(false);
            }
        });
        return getting_post.postId;
    }

}

const updateAccessToken = async (accessToken, socialId) => {
    try {
        let refreshToken = await axios.get(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`)

        let { access_token } = refreshToken.data

        await query(
            `UPDATE user_access_token SET access_token = ?
            WHERE social_app_id = ?`,
            [access_token, socialId]
        )
        return access_token
    } catch (error) {
        console.log(error)
    }
}

const getShortCode = (permalink) => {
    const patterns = [
        /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/tv\/([A-Za-z0-9_-]+)/
    ];
    for (const pattern of patterns) {
        const match = permalink.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

const sendDM = async (commentId, accessToken, linksDetail, isDM, uid) => {
    try {
        let templates = createMessageTemplate(linksDetail, uid)

        await axios.post(`https://graph.instagram.com/v22.0/me/messages`,
            {
                recipient: isDM
                    ? { id: commentId }
                    : { comment_id: commentId },
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": templates
                        }
                    }
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        )
    } catch (error) {
        console.log(error)
    }
}

const createMessageTemplate = (linksDetail, uid) => {
    let elements = JSON.parse(linksDetail).map((link) => {
        let obj = {}
        obj.title = link.name
        obj.image_url = link.img_url
        obj.default_action = {
            "type": "web_url",
            "url": link.aff_link
        }
        obj.buttons = [
            {
                "type": "web_url",
                "url": link.aff_link,
                "title": "Product Link"
            },
            {
                "type": "web_url",
                "url": `${key.WEBSITE_URL}/preview/${uid}`,
                "title": "View my Hyyfam"
            }
        ]
        return obj
    })

    return elements;
}

const checkTimeDifference = (time, maxHours = 240) => {
    const timestamp = moment(new Date(time));
    const adjustedTime = timestamp.add(2, 'months');
    const now = moment();

    const diffInHours = adjustedTime.diff(now, 'hours');

    return diffInHours < maxHours;

};

const isWithinThreeHours = (time1, time2) => {
    const moment1 = moment(time1);
    const moment2 = time2 ? moment(time2) : moment();
    if (!moment1.isValid() || !moment2.isValid()) {
        console.error('Invalid date provided');
        return false;
    }

    const diffInHours = Math.abs(moment2.diff(moment1, 'hours', true));
    return diffInHours < 3;
}

function returnLink(siteid, PID) {
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

async function sendCommentReply(commentId, accessToken, uid) {
    try {
        let commentText = await query(
            `SELECT auto_comment_reply, auto_comment
            FROM user_settings
            WHERE uid = ?`,
            [uid]
        )
        if (commentText.length && commentText[0].auto_comment) {
            commentText = JSON.parse(commentText[0].auto_comment_reply)
            commentText = getRandomElement(commentText)
            let url = `https://graph.instagram.com/${commentId}/replies?message=${commentText}`
            await axios.post(url,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            )
        }
    } catch (error) {
        console.error(error)
    }
}

const getRandomElement = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error("Array empty");
    }

    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
};

const isTimeDifferenceMoreThan = (givenTime, thresholdInMinutes) => {
    const now = moment();
    const given = moment(givenTime);

    const diffInMinutes = now.diff(given, 'minutes');

    return diffInMinutes > thresholdInMinutes;
}

const checkUserSettings = async (uid, isDM) => {
    let settings = await query(
        `SELECT *
        FROM user_settings
        WHERE uid = ?`,
        [uid]
    )
    if (settings.length) {
        let auto_dm = settings[0].auto_dm
        let auto_dm_post = settings[0].auto_dm_post
        if (isDM) {
            if (auto_dm_post) {
                return true
            }
            else {
                return false
            }
        }
        else if (auto_dm) {
            return true
        }
        else {
            return false
        }
    }
    return true
}
