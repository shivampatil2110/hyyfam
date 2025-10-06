const util = require("util");
const mysql = require("mysql");
const key = require("../config/keys");
const options = {
    host: key.MYSQL_HOST,
    user: key.MYSQL_USER,
    password: key.MYSQL_PASSWORD,
    database: key.MYSQL_DATABASE,
    // timezone: "local", // Ensures IST is used
};
var connection = mysql.createConnection(options);
const query = util.promisify(connection.query).bind(connection);
const moment = require("moment");
const axios = require("axios");

exports.getDailyReport = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        } else {
            var uid = req.uid;
        }

        if (!uid) {
            return res.status(400).send({
                message: "Session expired, please login again.",
            });
        }

        let { start_date, end_date, alltime, store, store_id } = req.query;

        if (store == "true") {
            const store = [];
            if (alltime == "true") {
                store = await query(
                    `SELECT cs.store_name,cs.store_id
                    FROM point_post AS pp
                    LEFT JOIN cb_stores AS cs
                    ON cs.store_id = pp.store_id
                    WHERE uid = ?
                    GROUP BY cs.store_id,cs.store_name`,
                    [uid]
                );

                return res.status(200).send(store);
            }
            store = await query(
                `SELECT cs.store_name,cs.store_id
                FROM point_post AS pp
                LEFT JOIN cb_stores AS cs
                ON cs.store_id = pp.store_id
                WHERE uid = ? AND date(pp.order_date) BETWEEN ? AND ?
                GROUP BY cs.store_id,cs.store_name`,
                [uid, start_date, end_date]
            );
            return res.status(200).send(store);
        }

        let [report, clicks] = await Promise.all([
            query(
                `SELECT 
                    DATE_FORMAT(DATE(order_date), '%Y-%m-%d') AS date,
                    COUNT(*) AS per_day_purchase,
                    COALESCE(SUM(pr.sale_amount),0) AS earnings,
                    COALESCE(SUM(CASE
                        WHEN pp.status = 'cancelled' THEN 0
                        ELSE points
                    END),0) AS approved_amount
                FROM
                    point_post AS pp
                        LEFT JOIN
                    partner_response AS pr ON pp.res_id = pr.unique_id
                WHERE
                    pp.uid = ? AND DATE(pp.order_date) BETWEEN ? AND ? ${store_id ? `AND pp.store_id = ${store_id}` : ""}
                GROUP BY DATE_FORMAT(DATE(order_date), '%Y-%m-%d')
                ORDER BY DATE_FORMAT(DATE(order_date), '%Y-%m-%d') DESC`,
                [uid, start_date, end_date]
            ),
            query(
                `SELECT SUM(clicks) AS clicks,DATE_FORMAT(DATE(date), '%Y-%m-%d') AS date
                FROM link_report
                WHERE uid = ? AND DATE(date) BETWEEN ? AND ?
                GROUP BY DATE_FORMAT(DATE(date), '%Y-%m-%d')`,
                [uid, start_date, end_date]
            )
        ])

        const clicksMap = {};
        for (const c of clicks) {
            clicksMap[c.date] = c.clicks || 0;
        }

        const merged = report.map(r => ({
            ...r,
            clicks: clicksMap[r.date] || 0,
        }));

        for (const c of clicks) {
            if (!report.find(r => r.date === c.date)) {
                merged.push({
                    date: c.date,
                    per_day_purchase: 0,
                    earnings: 0,
                    approved_amount: 0,
                    clicks: c.clicks || 0,
                });
            }
        }

        merged.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).send(merged);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Error fetching daily report.",
        });
    }
};

exports.getPostReport = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        } else {
            var uid = req.uid;
        }

        if (!uid) {
            return res.status(400).send({
                message: "Session expired, please login again.",
            });
        }

        let { post_id } = req.query;

        if (post_id) {
            let report = await query(
                `SELECT 
                    pl.name,
                    pl.img_url,
                    pl.aff_link,
                    DATE_FORMAT(DATE(pl.created_at), "%Y-%m-%d") AS date,
                    IFNULL(lr.clicks, 0) AS total_clicks,
                    IFNULL(pp_stats.purchased_quantity, 0) AS total_purchased_quantity,
                    IFNULL(pp_stats.approved_amount, 0) AS total_approved_amount,
                    IFNULL(pp_stats.total_earning, 0) AS total_earning
                FROM 
                    user_post_mapping upm
                JOIN 
                    product_links pl 
                    ON FIND_IN_SET(pl.id, REPLACE(REPLACE(upm.links_id, '[', ''), ']', '')) > 0
                LEFT JOIN 
                    link_report lr 
                    ON lr.code = SUBSTRING_INDEX(pl.aff_link, '/', -1)
                LEFT JOIN (
                    SELECT 
                        pr.click_id,
                        COUNT(*) AS purchased_quantity, 
                        SUM(CASE WHEN pp.status = 'paid' THEN pp.points ELSE 0 END) AS approved_amount, 
                        SUM(CASE WHEN pp.status != 'cancelled' THEN pp.points ELSE 0 END) AS total_earning
                    FROM 
                        point_post pp
                    JOIN 
                        partner_response pr ON pp.res_id = pr.unique_id
                    GROUP BY 
                        pr.click_id
                ) AS pp_stats ON pp_stats.click_id = lr.click_id
                WHERE 
                    upm.uid = ?  AND upm.post_id = ?
                ORDER BY 
                    upm.post_id
                `,
                [uid, post_id]
            );

            return res.status(200).send(report);
        }

        let { start_date, end_date, sort_by, page } = req.query;
        page = parseInt(page) || 1;
        let offset = (page - 1) * 10;

        let orderByClause = "upm.created_at DESC";
        switch (sort_by) {
            case "newest_first":
                orderByClause = "upm.created_at DESC";
                break;
            case "oldest_first":
                orderByClause = "upm.created_at ASC";
                break;
            case "most_clicks":
                orderByClause = "total_clicks DESC";
                break;
            case "least_commission":
                orderByClause = "total_earning ASC";
                break;
            case "most_commission":
                orderByClause = "total_earning DESC";
                break;
        }

        let count = null;
        if (page == 1) {
            count = await query(
                `SELECT COUNT(*) AS count
                FROM user_post_mapping
                WHERE uid = ? AND DATE(created_at) BETWEEN ? AND ? AND active = 1`,
                [uid, start_date, end_date]
            );
            count = count[0].count;
        }

        let report = await query(
            `SELECT 
                upm.post_id,
                upm.created_at,  
                SUM(IFNULL(lr.clicks, 0)) AS total_clicks,
                SUM(IFNULL(pp_stats.purchased_quantity, 0)) AS total_purchased_quantity,
                SUM(IFNULL(pp_stats.approved_amount, 0)) AS total_approved_amount,
                SUM(IFNULL(pp_stats.total_earning, 0)) AS total_earning
            FROM 
                user_post_mapping upm
            JOIN 
                product_links pl 
                ON FIND_IN_SET(pl.id, REPLACE(REPLACE(upm.links_id, '[', ''), ']', '')) > 0
            LEFT JOIN 
                link_report lr 
                ON lr.code = SUBSTRING_INDEX(pl.aff_link, '/', -1)
            LEFT JOIN (
                SELECT 
                    pr.click_id,
                    COUNT(*) AS purchased_quantity, 
                    SUM(CASE WHEN pp.status = 'paid' THEN pp.points ELSE 0 END) AS approved_amount, 
                    SUM(CASE WHEN pp.status != 'cancelled' THEN pp.points ELSE 0 END) AS total_earning
                FROM 
                    point_post pp
                JOIN 
                    partner_response pr ON pp.res_id = pr.unique_id
                GROUP BY 
                    pr.click_id
            ) AS pp_stats ON pp_stats.click_id = lr.click_id
            WHERE 
                upm.uid = ? 
                AND upm.active = 1
                AND DATE(upm.created_at) BETWEEN ? AND ?
            GROUP BY 
                upm.post_id, upm.created_at
            ORDER BY 
                ${orderByClause}
            LIMIT 10 OFFSET ?
            `,
            [uid, start_date, end_date, offset]
        );

        if (!report.length) {
            return res.status(200).send({
                count: 0,
                report: []
            });
        }

        let accessToken = await query(
            `SELECT access_token
            FROM user_access_token
            WHERE uid = ?`,
            [uid]
        );

        if (!accessToken.length) {
            return res.status(200).send([]);
        }
        accessToken = accessToken[0]?.access_token;

        for (let i = 0; i < report.length; i++) {
            try {
                let data = await axios.get(
                    `https://graph.instagram.com/v22.0/${report[i].post_id}?fields=media_url,thumbnail_url,permalink&access_token=${accessToken}`
                );
                report[i].imgUrl =
                    data?.data?.thumbnail_url || data?.data?.media_url || "";
                report[i].permalink = data?.data?.permalink || "";
            } catch (error) {
                console.error(error);
            }
        }

        res.status(200).send({
            report,
            count,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Error fetching post report.",
        });
    }
};

exports.getCollectionReport = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        } else {
            var uid = req.uid;
        }

        if (!uid) {
            return res.status(400).send({
                message: "Session expired, please login again.",
            });
        }

        let { cid } = req.query;

        if (cid) {
            let report = await query(
                `SELECT 
                    pl.created_at,
                    pl.img_url,
                    pl.name,
                    pl.aff_link,
                    IFNULL(lr.clicks, 0) AS total_clicks,
                    lr.click_id AS click_ids,
                    IFNULL(pp_stats.purchased_quantity, 0) AS total_purchased_quantity,
                    IFNULL(pp_stats.approved_amount, 0) AS total_approved_amount,
                    IFNULL(pp_stats.total_earning, 0) AS total_earning
                FROM
                    user_collection uc
                        JOIN
                    product_links pl ON FIND_IN_SET(pl.id,
                            REPLACE(REPLACE(uc.aff_links_order, '[', ''),
                                ']',
                                '')) > 0
                        LEFT JOIN
                    link_report lr ON lr.code = SUBSTRING_INDEX(pl.aff_link, '/', - 1)
                        LEFT JOIN
                    (SELECT 
                        pr.click_id,
                            COUNT(*) AS purchased_quantity,
                            SUM(CASE
                                WHEN pp.status = 'paid' THEN pp.points
                                ELSE 0
                            END) AS approved_amount,
                            SUM(CASE
                                WHEN pp.status != 'cancelled' THEN pp.points
                                ELSE 0
                            END) AS total_earning
                    FROM
                        point_post pp
                    JOIN partner_response pr ON pp.res_id = pr.unique_id
                    GROUP BY pr.click_id) AS pp_stats ON pp_stats.click_id = lr.click_id
                WHERE
                    uc.uid = ? AND uc.id = ? AND uc.active = 1
                ORDER BY uc.created_at`,
                [uid, cid]
            );

            return res.status(200).send(report);
        }

        let { start_date, end_date, sort_by, page, alltime } = req.query;
        page = parseInt(page) || 1;
        let offset = (page - 1) * 10;

        let orderByClause = "uc.created_at DESC";
        switch (sort_by) {
            case "newest_first":
                orderByClause = "uc.created_at DESC";
                break;
            case "oldest_first":
                orderByClause = "uc.created_at ASC";
                break;
            case "most_clicks":
                orderByClause = "clicks DESC";
                break;
            case "least_commission":
                orderByClause = "total_earning ASC";
                break;
            case "most_commission":
                orderByClause = "total_earning DESC";
                break;
        }

        let count = null;
        if (page == 1) {
            if (alltime == 'true') {
                count = await query(
                    `SELECT COUNT(*) AS count
                    FROM user_collection
                    WHERE uid = ? AND active = 1`,
                    [uid]
                );
            }
            else {
                count = await query(
                    `SELECT COUNT(*) AS count
                    FROM user_collection
                    WHERE uid = ? AND DATE(created_at) BETWEEN ? AND ? AND active = 1`,
                    [uid, start_date, end_date]
                );
            }
            count = count[0].count;
        }

        let report = await query(
            `SELECT 
                uc.id,
                uc.name,
                uc.created_at,
                SUM(IFNULL(lr.clicks, 0)) AS total_clicks,
                GROUP_CONCAT(DISTINCT lr.click_id) AS click_ids,
                SUM(IFNULL(pp_stats.purchased_quantity, 0)) AS total_purchased_quantity,
                SUM(IFNULL(pp_stats.approved_amount, 0)) AS total_approved_amount,
                SUM(IFNULL(pp_stats.total_earning, 0)) AS total_earning,
                (
                    CHAR_LENGTH(REPLACE(REPLACE(REPLACE(uc.aff_links_order, '[', ''), ']', ''), ' ', '')) 
                    - CHAR_LENGTH(REPLACE(REPLACE(REPLACE(uc.aff_links_order, '[', ''), ']', ''), ',', '')) + 1
                ) AS aff_links_length,
                (
                    SELECT pl.img_url
                    FROM product_links pl
                    WHERE pl.id = CAST(
                        SUBSTRING_INDEX(
                            REPLACE(REPLACE(REPLACE(uc.aff_links_order, '[', ''), ']', ''), ' ', ''), 
                            ',', 
                            1
                        ) AS UNSIGNED
                    )
                    LIMIT 1
                ) AS first_img_url

            FROM
                user_collection uc
            JOIN
                product_links pl ON FIND_IN_SET(pl.id,
                    REPLACE(REPLACE(uc.aff_links_order, '[', ''), ']', '')
                ) > 0
            LEFT JOIN
                link_report lr ON lr.code = SUBSTRING_INDEX(pl.aff_link, '/', -1)
            LEFT JOIN
                (
                    SELECT 
                        pr.click_id,
                        COUNT(*) AS purchased_quantity,
                        SUM(CASE WHEN pp.status = 'paid' THEN pp.points ELSE 0 END) AS approved_amount,
                        SUM(CASE WHEN pp.status != 'cancelled' THEN pp.points ELSE 0 END) AS total_earning
                    FROM point_post pp
                    JOIN partner_response pr ON pp.res_id = pr.unique_id
                    GROUP BY pr.click_id
                ) AS pp_stats ON pp_stats.click_id = lr.click_id

            WHERE
                uc.uid = ? 
                AND uc.active = 1
                AND DATE(uc.created_at) BETWEEN ? AND ?

            GROUP BY uc.id, uc.name, uc.created_at,uc.aff_links_order
            ORDER BY ${orderByClause}
            LIMIT 10 OFFSET ?`,
            [uid, start_date, end_date, offset]
        );

        res.status(200).send({
            report,
            count,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Error fetching collection report.",
        });
    }
};

exports.getProductReport = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        } else {
            var uid = req.uid;
        }

        if (!uid) {
            return res.status(400).send({
                message: "Session expired, please login again.",
            });
        }

        let { start_date, end_date, sort_by, page } = req.query;
        page = parseInt(page) || 1;
        let offset = (page - 1) * 10;

        let orderByClause = "pl.created_at DESC";
        switch (sort_by) {
            case "newest_first":
                orderByClause = "pl.created_at DESC";
                break;
            case "oldest_first":
                orderByClause = "pl.created_at ASC";
                break;
            case "most_clicks":
                orderByClause = "clicks DESC";
                break;
            case "least_commission":
                orderByClause = "total_earning ASC";
                break;
            case "most_commission":
                orderByClause = "total_earning DESC";
                break;
        }

        let count = null;
        if (page == 1) {
            count = await query(
                `SELECT COUNT(*) AS count
                FROM product_links
                WHERE uid = ? AND DATE(created_at) BETWEEN ? AND ? AND cid IS NULL AND post_id IS NULL`,
                [uid, start_date, end_date]
            );
            count = count[0].count;
        }

        let report = await query(
            `SELECT 
                pl.aff_link,
                pl.name,
                pl.created_at,
                pl.img_url,
                IFNULL(lr.clicks, 0) AS clicks,
                IFNULL(pp_stats.purchased_quantity, 0) AS purchased_quantity,
                IFNULL(pp_stats.approved_amount, 0) AS approved_amount,
                IFNULL(pp_stats.total_earning, 0) AS total_earning
            FROM
                product_links pl
            LEFT JOIN 
                link_report lr ON lr.code = SUBSTRING_INDEX(pl.aff_link, '/', -1)
            LEFT JOIN (
                SELECT 
                    pr.click_id,
                    COUNT(*) AS purchased_quantity, 
                    SUM(CASE WHEN pp.status = 'paid' THEN pp.points ELSE 0 END) AS approved_amount, 
                    SUM(CASE WHEN pp.status != 'cancelled' THEN pp.points ELSE 0 END) AS total_earning
                FROM 
                    point_post pp
                JOIN 
                    partner_response pr ON pp.res_id = pr.unique_id
                GROUP BY 
                    pr.click_id
            ) AS pp_stats ON pp_stats.click_id = lr.click_id
            WHERE
                pl.uid = ?
                AND pl.cid IS NULL 
                AND pl.post_id IS NULL
                AND DATE(pl.created_at) BETWEEN ? AND ?
            ORDER BY 
                ${orderByClause}
            LIMIT 10 OFFSET ?
            `,
            [uid, start_date, end_date, offset]
        );

        res.status(200).send({
            report,
            count,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Error fetching product report.",
        });
    }
};

exports.getBrandReport = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        } else {
            var uid = req.uid;
        }

        if (!uid) {
            return res.status(400).send({
                message: "Session expired, please login again.",
            });
        }

        let { start_date, end_date, store_id, store, alltime } = req.query;

        // let report = await query(
        // `WITH ranked_data AS (
        //     SELECT
        //         COUNT(*) AS purchase,
        //         SUM(CASE WHEN pop.status = 'cancelled' THEN 0 ELSE pop.points END) AS earnings,
        //         SUM(CASE WHEN pop.status = 'paid' THEN pop.points ELSE 0 END) AS approved_amount,
        //         cs.store_name AS brand,
        //         pop.store_id,
        //         ROW_NUMBER() OVER (ORDER BY SUM(CASE WHEN pop.status = 'cancelled' THEN 0 ELSE pop.points END) DESC) AS rn
        //     FROM
        //         point_post AS pop
        //     LEFT JOIN
        //         cb_stores AS cs
        //     ON
        //         pop.store_id = cs.store_id
        //     WHERE
        //         pop.uid = '00b5084d'
        //     GROUP BY
        //         pop.store_id, cs.store_name
        // )
        // SELECT
        //     purchase,
        //     earnings,
        //     approved_amount,
        //     brand
        // FROM ranked_data
        // WHERE rn <= 5

        // UNION ALL
        // SELECT
        //     SUM(purchase) AS purchase,
        //     SUM(earnings) AS earnings,
        //     SUM(approved_amount) AS approved_amount,
        //     'Miscellaneous' AS brand
        // FROM ranked_data
        // WHERE rn > 5

        // ORDER BY earnings DESC;
        //     `,
        //     [uid, start_date, end_date]
        // );

        if (store == "true") {
            let store = [];
            if (alltime == "true") {
                store = await query(
                    `SELECT cs.store_name,cs.store_id
                    FROM point_post AS pp
                    LEFT JOIN cb_stores AS cs
                    ON cs.store_id = pp.store_id
                    WHERE uid = ?
                    GROUP BY cs.store_id,cs.store_name`,
                    [uid]
                );
                return res.status(200).send(store);
            }
            store = await query(
                `SELECT cs.store_name,cs.store_id
                FROM point_post AS pp
                LEFT JOIN cb_stores AS cs
                ON cs.store_id = pp.store_id
                WHERE uid = ? AND date(pp.order_date) BETWEEN ? AND ?
                GROUP BY cs.store_id,cs.store_name`,
                [uid, start_date, end_date]
            );
            return res.status(200).send(store);
        }

        const report = await query(
            `SELECT 
                SUM(CASE WHEN pop.status = 'cancelled' THEN pop.points ELSE 0 END) AS cancelled_amount,
                SUM(CASE WHEN pop.status = 'paid' THEN pop.points ELSE 0 END) AS paid_amount,
                SUM(CASE WHEN pop.status = 'pending' THEN pop.points ELSE 0 END) AS pending_amount
            FROM
                point_post AS pop
            WHERE
                pop.uid = ? AND pop.order_date BETWEEN ? AND ? AND pop.store_id = ?`,
            [uid, start_date, end_date, store_id ? store_id : "0a925cdb"]
        );

        res.status(200).send(report);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Error fetching brand report.",
        });
    }
};

exports.getOrderStatus = async (req, res) => {
    try {
        let uid = req.uid;
        if (!uid) {
            return res.status(403).send({
                message: "User Not Authenticated!",
            });
        }
        let { start_date, end_date, alltime } = req.query;
        let sql = `SELECT 
                    COUNT(CASE WHEN status = 'pending' THEN 1 ELSE NULL END) AS pending_orders,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 ELSE NULL END) AS cancelled_orders,
                    COUNT(CASE WHEN status = 'paid' THEN 1 ELSE NULL END) AS approved_orders
                FROM point_post
                WHERE uid = ?
                ${alltime === "true" ? "" : `AND order_date BETWEEN ? AND ?`}`;

        let params = [uid];
        if (alltime != "true") {
            params.push(start_date, end_date);
        }

        let orderDetails = await query(sql, params);

        let orderArray = Object.values(orderDetails[0]);
        res.status(200).send(orderArray);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error getting order details",
        });
    }
};

exports.getAmountStatus = async (req, res) => {
    try {
        const uid = req.uid;
        if (!uid) {
            return res.status(403).send({
                message: "User Not Authenticated!",
            });
        }
        let { start_date, end_date, alltime } = req.query;
        let sql = `SELECT 
                SUM(CASE WHEN status = 'pending' THEN points ELSE 0 END) AS pending_amount,
                SUM(CASE WHEN status = 'cancelled' THEN points ELSE 0 END) AS cancelled_amount,
                SUM(CASE WHEN status = 'paid' THEN points ELSE 0 END) AS approved_amount
            FROM point_post
            WHERE uid = ?
            ${alltime === "true" ? "" : "AND order_date BETWEEN ? AND ?"}`;

        let params = [uid];
        if (alltime != "true") {
            params.push(start_date, end_date);
        }

        let amountDetails = await query(sql, params);

        let amountArray = Object.values(amountDetails[0]);
        res.status(200).send(amountArray);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error getting amount details",
        });
    }
};

exports.getCashbackDetails = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        if (hyyzoUser && hyyzoUser.uid) {
            var uid = hyyzoUser.uid;
        } else {
            var uid = req.uid;
        }
        if (!uid) {
            return res.status(400).send({
                message: "Session expired, Try login",
            });
        }
        let {
            start_date,
            end_date,
            store_arr = [],
            status_arr = [],
            page,
        } = req.body;
        let limit = 20;
        let offset = 0;
        if (page) {
            offset = limit * (page - 1);
        }
        let cashbackData = await query(
            `SELECT 
          h.order_id,
          DATE_FORMAT(a.order_date, '%b %e, %Y') AS posting_date,
          DATE_FORMAT(a.est_approval_date, '%b %e, %Y') AS est_approval_date,
          DATE_FORMAT(a.actual_approval_date, '%b %e, %Y') AS actual_approval_date,
          f.text AS status,
          f.color AS status_color,
          a.points AS cashback,
          b.store_name,
          d.master_activity,
          g.url AS store_imgurl,
          h.sale_amount
      FROM
          point_post a
              LEFT JOIN
          cb_stores b ON a.store_id = b.store_id
              LEFT JOIN
          activity_code_master d ON a.activity_id = d.id
              LEFT JOIN
          cb_users e ON a.uid = e.uid
              LEFT JOIN
          status_master f ON a.status = f.status
              LEFT JOIN
          images_srcset g ON b.image = g.id
              LEFT JOIN
          partner_response h ON a.res_id = h.unique_id
      WHERE
          a.uid = ?
          AND d.type = 'purchase'
      ${store_arr && store_arr.length
                ? `AND a.store_id IN (${store_arr
                    .map((sid) => `'${sid}'`)
                    .join(",")})`
                : ""
            }
      ${start_date && end_date
                ? `AND DATE(a.order_date) BETWEEN '${start_date}' and '${end_date}'`
                : ""
            }
      ${status_arr && status_arr.length
                ? `AND a.status IN (${status_arr
                    .map((status) => `'${status}'`)
                    .join(",")})`
                : ""
            }
      ORDER BY a.order_date DESC
      LIMIT ${limit} OFFSET ${offset};`,
            [uid]
        );
        let cashbackCount = await query(
            `SELECT COUNT(*) AS cashbackCount
      FROM point_post a
      LEFT JOIN activity_code_master d ON a.activity_id=d.id 
      WHERE a.uid = '${uid}' 
      AND d.type = 'purchase'
      ${start_date && end_date
                ? `AND DATE(a.order_date) BETWEEN '${start_date}' and '${end_date}'`
                : ""
            }
      ${status_arr && status_arr.length
                ? `AND a.status IN (${status_arr
                    .map((status) => `'${status}'`)
                    .join(",")})`
                : ""
            }
      ${store_arr && store_arr.length
                ? `AND a.store_id IN (${store_arr
                    .map((sid) => `'${sid}'`)
                    .join(",")})`
                : ""
            }`
        );
        res.status(200).send({
            cashbackData,
            count: cashbackCount[0].cashbackCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Error fetching cashback details.",
        });
    }
};

exports.getLinkReport = async (req, res) => {
    try {
        let uid = req.uid;
        let { start_date, end_date } = req.body;
        if (!uid) {
            return res.status(403).send({
                message: "User Not Authenticated!",
            });
        }
        let report = await query(
            `
            SELECT 
                DATE_FORMAT(DATE(date), "%Y-%m-%d") AS date, 
                SUM(clicks) AS day_total_clicks,
                COUNT(*) AS day_total_links
            FROM 
                link_report
            WHERE 
                uid = ? 
                AND DATE(date) BETWEEN ? AND ?
            GROUP BY 
                DATE_FORMAT(DATE(date), "%Y-%m-%d")
            ORDER BY 
                DATE_FORMAT(DATE(date), "%Y-%m-%d") DESC`,
            [uid, start_date, end_date]
        );
        res.status(200).send(report);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error occured while getting link report summary.",
        });
    }
};

exports.getUserEarningWallet = async (req, res) => {
    try {
        if ((!req.session || !req.session.hyyzoUser) && !req.uid) {
            return res.send({
                code: 400,
                failed: "error occured",
                status: "Please Refresh the page.",
            });
        }
        let uid = req.uid || req.session.hyyzoUser.uid;
        if (!uid)
            return res.status(400).json({
                code: 400,
                failed: "error occured",
                message: "Please Refresh the page Or login.",
            });

        let data = { code: 200, msg: "Got User Activities Earnings" };
        let earnings = await query(
            `SELECT sum(approved) as total_earning,sum(redeemed) as total_redeemed FROM cb_users_balance where uid = ?`,
            [uid]
        );

        // let allTheStoreFilters = await query(
        //   `SELECT DISTINCT CASE WHEN b.store_name IS NOT NULL THEN b.store_name ELSE c. task_short_name END AS store_name FROM point_post a
        //     LEFT JOIN cb_stores b ON a.store_id = b.store_id
        //     LEFT JOIN tasks c ON a.task_id = c.task_id
        //     WHERE uid = ? AND (b.store_name IS NOT NULL OR c.task_short_name IS NOT NULL)`,
        //   [uid]
        // );
        data["earnings"] = earnings[0] || { total_earning: 0, total_redeemed: 0 };
        // data["store_filters"] = allTheStoreFilters || [];
        // console.log(data, "data.......");
        res.send(data);
    } catch (error) {
        console.log(error, "error in pointscont 2");
        res.send({
            code: 400,
            failed: "error ocurred",
            error: error,
        });
    }
};

exports.getTransactionReport = async (req, res) => {
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
        let { start_date, end_date, status, store_arr, page, limit } = req.query;

        const parseQueryParam = (param) => {
            if (!param || typeof param !== "string") return param;

            try {
                // Check if it looks like JSON
                if (
                    param.startsWith("[") ||
                    param.startsWith("{") ||
                    param.startsWith('"')
                ) {
                    return JSON.parse(param);
                }
                return param;
            } catch (error) {
                console.log("Failed to parse parameter:", param, error);
                return param;
            }
        };

        // Parse JSON strings back to arrays
        status = parseQueryParam(status);
        store_arr = parseQueryParam(store_arr);

        if (!page) page = 1;
        if (!limit) limit = 10;

        let offset = (page - 1) * limit;
        let data = { code: 200, msg: "Got User Activities" };

        let cashbacks = await query(
            `SELECT h.order_id,a.store_id, d.type, DATE_FORMAT(a.order_date,'%b %e, %Y') as order_date ,DATE_FORMAT(a.est_approval_date,'%b %e, %Y') as est_approval_date,DATE_FORMAT(a.actual_approval_date,'%b %e, %Y') as actual_approval_date,a.note, f.text as status, f.color as status_color, a.points as cashback,b.store_name,c.task_short_name,d.master_activity,g.url as store_imgurl FROM point_post a LEFT JOIN cb_stores b ON a.store_id=b.store_id 
        LEFT JOIN tasks c ON a.task_id=c.task_id 
        LEFT JOIN activity_code_master d ON a.activity_id=d.id 
        LEFT JOIN cb_users e ON a.uid=e.uid 
        LEFT JOIN status_master f on a.status = f.status 
        LEFT JOIN images_srcset g on b.image = g.id 
        LEFT JOIN partner_response h on a.res_id = h.unique_id
        WHERE a.uid='${uid}'  ${start_date && end_date
                ? `AND DATE(a.order_date) BETWEEN '${start_date}' and '${end_date}'`
                : ""
            }      ${status && status.length
                ? `AND a.status IN (${status.map((sid) => `'${sid}'`).join(",")})`
                : ""
            }  ${store_arr && store_arr.length
                ? `AND a.store_id IN (${store_arr
                    .map((sid) => `'${sid}'`)
                    .join(",")})`
                : ""
            }
      order by a.order_date desc LIMIT ${offset},${limit}`
        );

        let tottalRecordsLength = await query(
            `SELECT count(*) as total_records FROM point_post a WHERE a.uid='${uid}'  ${start_date && end_date
                ? `AND DATE(a.order_date) BETWEEN '${start_date}' and '${end_date}'`
                : ""
            }  ${status && status.length
                ? `AND a.status IN (${status.map((sid) => `'${sid}'`).join(",")})`
                : ""
            }  ${store_arr && store_arr.length
                ? `AND a.store_id IN (${store_arr
                    .map((sid) => `'${sid}'`)
                    .join(",")})`
                : ""
            }`
        );
        let allTheStoreFilters = await query(
            `SELECT CONCAT( '[', GROUP_CONCAT( DISTINCT CASE WHEN b.store_name IS NOT NULL THEN JSON_OBJECT('store_id', b.store_id, 'store_name', b.store_name) WHEN c.task_short_name IS NOT NULL THEN JSON_OBJECT('store_id', c.task_id, 'store_name', c.task_short_name) END ), ']' ) AS store_name FROM point_post a LEFT JOIN cb_stores b ON a.store_id = b.store_id LEFT JOIN tasks c ON a.task_id = c.task_id WHERE uid = ? AND (b.store_name IS NOT NULL OR c.task_short_name IS NOT NULL) ${start_date && end_date
                ? `AND DATE(a.order_date) BETWEEN '${start_date}' and '${end_date}'`
                : ""
            }      ${status && status.length
                ? `AND a.status IN (${status.map((sid) => `'${sid}'`).join(",")})`
                : ""
            }`,
            [uid]
        );
        tottalRecordsLength = tottalRecordsLength[0].total_records;
        // console.log(clickHistory.length, cashbacks.length, "lengths");
        if (!cashbacks.length) {
            return res.status(404).json({
                code: 404,
                msg: "No data found",
                data: [],
            });
        }
        data["cashback_activity"] = cashbacks || [];
        data["total_records"] = tottalRecordsLength || 0;
        data["store_filters"] = JSON.parse(allTheStoreFilters[0].store_name) || [];
        return res.status(200).json(data);
    } catch (error) {
        console.log(error, "error in pointscont 2");
        res.send({
            code: 400,
            failed: "error ocurred",
            error: error,
        });
    }
};

exports.getEarningsGraph = async (req, res) => {
    try {
        let uid = req.uid;
        if (!uid) {
            return res.status(403).send({
                message: "User Not Authenticated!",
            });
        }
        let { start_date, end_date, type } = req.query;
        let typeQuery = "";
        if (type == "Commission") {
            typeQuery =
                "COALESCE(SUM(CASE WHEN p.status = 'cancelled' THEN 0 ELSE p.points END), 0) AS value";
        } else {
            typeQuery = "COUNT(p.order_date) AS value";
        }
        let graphData = await query(
            `WITH RECURSIVE date_range AS (
                SELECT DATE(?) AS date
                UNION ALL
                SELECT DATE_ADD(date, INTERVAL 1 DAY)
                FROM date_range
                WHERE date < DATE(?)
            )
            SELECT 
                DATE_FORMAT(d.date, "%d %b") AS date,
                ${typeQuery}
            FROM date_range d
            LEFT JOIN point_post p
                ON DATE(p.order_date) = d.date AND p.uid = ?
            GROUP BY d.date
            ORDER BY d.date ASC`,
            [start_date, end_date, uid]
        );

        res.status(200).send(graphData);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error getting graph data.",
        });
    }
};

exports.getUserSummary = async (req, res) => {
    try {
        if ((!req.session || !req.session.hyyzoUser) && !req.uid) {
            return res.send({
                code: 400,
                failed: "error occured",
                status: "Please Refresh the page.",
            });
        }
        let uid = req.uid || req.session.hyyzoUser.uid;
        if (!uid) {
            return res.status(400).json({
                code: 400,
                failed: "error occured",
                message: "Please Refresh the page Or login.",
            });
        }

        let { start_date, end_date, alltime } = req.query;

        let [summary] = await query(
            `SELECT 
                SUM(points) AS total_comission,
                SUM(CASE WHEN pop.status = 'cancelled' THEN 0 ELSE pop.points END) AS total_cashback,
                (
                    SELECT SUM(clicks) AS total_clicks
                    FROM link_report
                    WHERE uid = ? ${start_date && end_date && alltime != 'true'
                ? `AND DATE(date) BETWEEN '${start_date}' AND '${end_date}'`
                : ""
            }
                ) AS total_clicks,
                (
                    SELECT FLOOR(SUM(sale_amount)) AS total_sales
                    FROM partner_response
                    WHERE uid = ? ${start_date && end_date && alltime != 'true'
                ? `AND DATE(action_date) BETWEEN '${start_date}' AND '${end_date}'`
                : ""
            }
                ) AS total_sales,
                (
                    SELECT SUM(redeemed) AS total_redeemed
                    FROM cb_users_balance
                    WHERE uid = ?
                ) AS total_redeemed,
                (
                    SELECT COUNT(*) AS total_orders
                    FROM partner_response 
                    WHERE uid = ? ${start_date && end_date && alltime != 'true'
                ? `AND DATE(action_date) BETWEEN '${start_date}' AND '${end_date}'`
                : ""
            }
                ) AS total_orders
                FROM point_post AS pop
                WHERE uid = ? ${start_date && end_date && alltime != 'true'
                ? `AND DATE(pop.order_date) BETWEEN '${start_date}' AND '${end_date}'`
                : ""
            }
                GROUP BY total_clicks, total_sales, total_redeemed, total_orders
                `,
            [uid, uid, uid, uid, uid]
        );

        res.status(200).send(summary);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Internal server error.",
        });
    }
};
