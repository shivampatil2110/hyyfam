const util = require("util");
const mysql = require("mysql");
const key = require("../config/keys");
const { modifyUrl } = require("./affiliate.controller");
const { checkBonus } = require("../routes/common_functions/common_function")
const axios = require("axios");

const options = {
    host: key.MYSQL_HOST,
    user: key.MYSQL_USER,
    password: key.MYSQL_PASSWORD,
    database: key.MYSQL_DATABASE,
};
var connection = mysql.createConnection(options);
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

exports.InsertCollection = async (req, res) => {
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
        const { link_arr, name } = req.body;

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
            // Use Promise.all for parallel insertions
            let collectionId = await query(
                `INSERT INTO user_collection (uid, name, aff_links_order)
                VALUES (?, ?, ?)`,
                [uid, name, "[]"]
            );

            collectionId = collectionId.insertId

            const insertPromises = productsToInsert.map((product) =>
                query(
                    `INSERT INTO product_links (sid, name, img_url, uid, aff_link, org_link, cid) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [product.sid, product.name, product.img_url, product.uid, product.aff_link, product.org_link, collectionId]
                )
            );

            const insertResults = await Promise.all(insertPromises);

            // Collect insert IDs
            let insertIds = insertResults.map((result) => result.insertId);
            insertIds = JSON.stringify(insertIds);

            await query(
                `UPDATE user_collection
                SET aff_links_order = ?
                WHERE id = ?`,
                [insertIds, collectionId]
            )

            res.status(201).send({
                message: "Collection created successfully.",
                collectionId
            });

        } else {
            res.status(400).send({
                message: "No valid products found to insert",
            });
        }

        let [collectionCount] = await query(
            `SELECT COUNT(*) AS count
            FROM user_collection
            WHERE uid = ?`,
            [uid]
        )

        collectionCount = collectionCount.count
        if (collectionCount >= 3) {
            checkBonus("create_collection", uid)
        }

    } catch (error) {
        console.error(error);
        res
            .status(500)
            .send({
                message: "Error creating collection. Please try again."
            });
    }
};

exports.getCollection = async (req, res) => {
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

        let { search } = req.query
        let page = parseInt(req.query.page) || 1;
        let offset = (page - 1) * 10;

        let collectionData = await query(
            `SELECT 
            uc.id AS id,
            uc.name AS name,
            uc.updated_at,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', pl.id,
                    'name', pl.name,
                    'aff_link', pl.aff_link,
                    'img_url', pl.img_url,
                    'code', SUBSTRING_INDEX(pl.aff_link, '/', -1),
                    'clicks', IFNULL(lr.clicks, 0),
                    'click_id', IFNULL(lr.click_id, ''),
                    'purchased_quantity', IFNULL(pp_stats.purchased_quantity, 0),
                    'approved_amount', IFNULL(pp_stats.approved_amount, 0),
                    'total_earning', IFNULL(pp_stats.total_earning, 0),
                    'org_link', pl.org_link,
                    'store_img', img.url,
                    'store_name', cs.store_name,
                    'created_at',pl.created_at
                )
            ) AS products
        FROM 
            user_collection uc
        CROSS JOIN (
            SELECT 0 AS position UNION ALL
            SELECT 1 UNION ALL
            SELECT 2 UNION ALL
            SELECT 3 UNION ALL
            SELECT 4
        ) AS positions
        JOIN product_links pl ON (
            pl.id = SUBSTRING_INDEX(
                SUBSTRING_INDEX(
                    REPLACE(
                        REPLACE(uc.aff_links_order, '[', ''),
                        ']', ''
                    ),
                    ',',
                    positions.position + 1
                ),
                ',',
                -1
            )
        )
        LEFT JOIN link_report lr ON lr.code = SUBSTRING_INDEX(pl.aff_link, '/', -1)
        LEFT JOIN (
            SELECT 
                pr.click_id,
                COUNT(*) AS purchased_quantity, 
                SUM(CASE WHEN pp.status = 'paid' THEN pp.points ELSE 0 END) AS approved_amount, 
                SUM(CASE WHEN pp.status != 'cancelled' THEN pp.points ELSE 0 END) AS total_earning
            FROM point_post pp
            JOIN partner_response pr ON pp.res_id = pr.unique_id
            GROUP BY pr.click_id
        ) AS pp_stats ON pp_stats.click_id = lr.click_id
              LEFT JOIN
          cb_stores AS cs ON pl.sid = cs.store_id
              LEFT JOIN
          images_srcset AS img ON img.id = cs.image
        WHERE 
            uc.uid = ?
            AND positions.position < (
                LENGTH(REPLACE(REPLACE(uc.aff_links_order, '[', ''), ']', '')) 
                - LENGTH(REPLACE(REPLACE(REPLACE(uc.aff_links_order, '[', ''), ']', ''), ',', '')) + 1
            )
            AND positions.position < 5
            AND uc.active = 1
            ${search ? `AND uc.name LIKE "%${search}%"` : ""}
        GROUP BY 
            uc.id, uc.name, uc.updated_at
        ORDER BY 
            uc.created_at DESC
        LIMIT 10 OFFSET ?`,
            [uid, offset]
        )

        res
            .status(200)
            .send(collectionData)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error fetching collections."
            })
    }
};

exports.getCollectionLinks = async (req, res) => {
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

        const collectionId = req.query.cid

        let links = await query(
            `SELECT 
          pl.*,
          SUBSTRING_INDEX(pl.aff_link, '/', -1) AS code,
          IFNULL(lr.clicks, 0) AS clicks,
          IFNULL(lr.click_id, '') AS click_id,
          IFNULL(pp_stats.purchased_quantity, 0) AS purchased_quantity,
          IFNULL(pp_stats.approved_amount, 0) AS approved_amount,
          IFNULL(pp_stats.total_earning, 0) AS total_earning,
          img.url AS store_img,
          cs.store_name AS store_name
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
      LEFT JOIN
          cb_stores AS cs ON pl.sid = cs.store_id
      LEFT JOIN
          images_srcset AS img ON img.id = cs.image
      WHERE
          FIND_IN_SET(
              pl.id, 
              (SELECT 
                  REPLACE(
                      REPLACE(
                          aff_links_order,
                          '[', ''
                      ),
                      ']', ''
                  )
              FROM
                  user_collection
              WHERE
                  id = ? and uid = ?
              )
          ) > 0
      ORDER BY
          FIND_IN_SET(
              pl.id, 
              (SELECT 
                  REPLACE(
                      REPLACE(
                          aff_links_order,
                          '[', ''
                      ),
                      ']', ''
                  )
              FROM
                  user_collection
              WHERE
                  id = ? AND uid = ?
              )
          )`,
            [collectionId, uid, collectionId, uid]
        )

        res
            .status(200)
            .send(links)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error fetching collection links."
            })
    }
}

exports.updateCollection = async (req, res) => {
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
        const { link_arr, name, links_id, collection_id, new_products_metadata } = req.body;

        if (Array.isArray(link_arr) && link_arr.length != 0) {
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
                        position: new_products_metadata[i].position
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
                        position: new_products_metadata[i].position
                    })
                }
            }

            if (productsToInsert.length > 0) {
                // Use Promise.all for parallel insertions
                const insertPromises = productsToInsert.map((product) =>
                    query(
                        `INSERT INTO product_links (sid, name, img_url, uid, aff_link, org_link, cid) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [product.sid, product.name, product.img_url, product.uid, product.aff_link, product.org_link, collection_id]
                    )
                );
                const insertResults = await Promise.all(insertPromises);

                const newProductIdWithPosition = insertResults.map((res, idx) => ({
                    id: res.insertId,
                    position: productsToInsert[idx].position
                }));
                const existingProductIdWithPosition = links_id.map((id, index) => ({
                    id,
                    position: index
                }));
                const combined = [...newProductIdWithPosition, ...existingProductIdWithPosition];
                const sorted = combined.sort((a, b) => a.position - b.position);
                const finalIds = sorted.map(item => item.id);

                let existingId = await query(
                    `SELECT aff_links_order
                    FROM user_collection
                    WHERE id = ?`,
                    [collection_id]
                )

                existingId = existingId[0].aff_links_order
                const difference = JSON.parse(existingId).filter(item => !finalIds.includes(item));
                await query(
                    `UPDATE user_collection SET name = ?, aff_links_order = ?
                     WHERE id = ?`,
                    [name, JSON.stringify(finalIds), collection_id]
                )

                if (difference.length) {
                    await query(
                        `UPDATE product_links
                        SET cid = NULL
                        WHERE id IN (${difference.map(() => '?').join(',')})`,
                        difference
                    );
                }

                return res.status(201).send({
                    message: "Collection updated successfully.",
                })
            }
            else {
                return res.status(400).send({
                    message: "No valid products found to insert",
                });
            }
        }
        else {
            let insertIds = JSON.stringify(links_id)
            let existingId = await query(
                `SELECT aff_links_order
          FROM user_collection
          WHERE id = ?`,
                [collection_id]
            )

            existingId = existingId[0].aff_links_order
            const difference = JSON.parse(existingId).filter(item => !insertIds.includes(item));

            await query(
                `UPDATE user_collection SET name = ?, aff_links_order = ?
        WHERE id = ?`,
                [name, insertIds, collection_id]
            )

            await query(
                `UPDATE product_links
          SET cid = NULL
          WHERE id IN (${difference.map(() => '?').join(',')})`,
                difference
            );
        }
        res
            .status(204)
            .send({
                message: "Collection updated successfully."
            })
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .send({
                message: "Error creating collection. Please try again."
            });
    }
}

exports.deleteCollection = async (req, res) => {
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

        let { cid } = req.body;
        await beginTransaction()

        await query(
            `UPDATE user_collection
            SET active = 0
            WHERE uid = ? AND id = ?
            `,
            [uid, cid]
        )
        await query(
            `UPDATE product_links
            JOIN user_collection
            ON user_collection.id = ?
            AND REPLACE(REPLACE(user_collection.aff_links_order, '[', ''), ']', '') REGEXP CONCAT('(^|,)', product_links.id, '(,|$)')
            SET product_links.cid = NULL`,
            [cid]
        )

        await commit()

        res
            .status(204)
            .send({
                message: "Collection deleted successfully."
            })
    } catch (error) {
        await rollback()
        console.error(error)
        res
            .status(500)
            .send({
                message: "Internal server error."
            })
    }
}

exports.getRecentlyAddedProducts = async (req, res) => {
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

        let { search } = req.query
        let page = parseInt(req.query.page) || 1;
        let offset = (page - 1) * 10;

        let recentLinks = await query(
            `SELECT 
            pl.*,
            SUBSTRING_INDEX(pl.aff_link, '/', -1) AS code,
            IFNULL(lr.clicks, 0) AS clicks,
            IFNULL(lr.click_id, '') AS click_id,
            IFNULL(pp_stats.purchased_quantity, 0) AS purchased_quantity,
            IFNULL(pp_stats.approved_amount, 0) AS approved_amount,
            IFNULL(pp_stats.total_earning, 0) AS total_earning,
            img.url AS store_img,
            cs.store_name AS store_name
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
        LEFT JOIN
            cb_stores AS cs ON pl.sid = cs.store_id
        LEFT JOIN
            images_srcset AS img ON img.id = cs.image
        WHERE
            pl.uid = ? AND pl.cid is NULL AND pl.post_id is NULL ${search ? `AND pl.name LIKE "%${search}%"` : ""}
        ORDER BY 
            pl.created_at DESC
            LIMIT 10 OFFSET ?`,
            [uid, offset]
        )

        res
            .status(200)
            .send(recentLinks)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error fetching recent links."
            })
    }
}

exports.convertSingleLink = async (req, res) => {
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

        let { link } = req.body

        if (!link) {
            return res
                .status(422)
                .send({
                    message: "Link cannot be empty."
                })
        }

        const [u_data] = await query(`SELECT * FROM cb_users WHERE uid = ?`, [uid]);
        const aff_link = await modifyUrl(u_data, link)

        if (!aff_link.url || aff_link.error) {
            return res
                .status(501)
                .send({
                    message: "Link not supported."
                })
        }

        try {
            const productDetail = await axios.post(
                "https://flipshope.com/api/prices/proddetails",
                {
                    link
                }
            )
            var { title, imgurl } = productDetail.data?.data

            let url = returnLink(productDetail.data?.data.sid, productDetail.data?.data.pid)

            var storeId = await query(
                `SELECT 
                    b.store_id, b.active
                FROM
                    deeplink_domain_mapping a
                        INNER JOIN
                    cb_stores b ON a.store_id = b.store_id
                WHERE
                    '${url}' LIKE CONCAT('%', a.url, '%')
                ORDER BY b.active DESC , LENGTH(a.url) DESC`
            )

        } catch (error) {
            throw new Error(error)
        }


        await query(
            `INSERT INTO product_links (sid, name, img_url, uid, aff_link, org_link) 
         VALUES (?, ?, ?, ?, ?, ?)`,
            [storeId[0].store_id, title, imgurl, uid, aff_link.url, link]
        )

        res
            .status(200)
            .send({
                name: title,
                img_url: imgurl,
                aff_link: aff_link.url
            })

        let [singleLinkCount] = await query(
            `SELECT COUNT(*) AS count
        FROM product_links
        WHERE uid = ?`,
            [uid]
        )

        singleLinkCount = singleLinkCount.count

        if (singleLinkCount >= 1) {
            checkBonus("generate_link", uid)
        }
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error converting link. Please try again."
            })
    }
}

exports.getProductDetails = async (req, res) => {
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

        const { link } = req.body
        let prodDetails = {}
        try {
            prodDetails = await axios.post(`https://flipshope.com/api/prices/proddetails`, {
                link: link
            })

        } catch (error) {
            console.error(error)
        }

        if (!Object.keys(prodDetails).length) {
            return res
                .status(200)
                .send({
                    code: 404,
                    message: "Product details not found."
                })
        }

        const { pid, sid } = prodDetails.data.data

        const url = returnLink(sid, pid)

        const checkDeepLinkSupport = await query(
            `SELECT 
            b.store_id, b.active, b.store_name, img.url
        FROM
            deeplink_domain_mapping a
                INNER JOIN
            cb_stores b ON a.store_id = b.store_id
                LEFT JOIN
            images_srcset AS img ON img.id = b.image
        WHERE
            '${url}' LIKE CONCAT('%', a.url, '%')
        ORDER BY b.active DESC , LENGTH(a.url) DESC`
        )

        if (checkDeepLinkSupport.length && checkDeepLinkSupport[0].active) {
            storeImg = checkDeepLinkSupport[0].url
            prodDetails.data.data.store_img = storeImg
            prodDetails.data.data.store_name = checkDeepLinkSupport[0].store_name
            return res
                .status(200)
                .send({
                    code: 200,
                    data: prodDetails.data.data
                })
        }
        else {
            return res
                .status(200)
                .send({
                    code: 504,
                    message: "Affiliate link not supported for the store."
                })
        }
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error getting product details."
            })
    }
}

exports.getPreviewCollection = async (req, res) => {
    try {
        let { uid } = req.query
        let page = parseInt(req.query.page) || 1;
        let offset = (page - 1) * 10;

        let collectionData = await query(
            `SELECT 
                uc.id AS id,
                uc.name AS name,
                uc.updated_at,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', pl.id,
                        'img_url', pl.img_url
                    )
                ) AS products
            FROM 
                user_collection uc
            CROSS JOIN (
                SELECT 0 AS position UNION ALL
                SELECT 1 UNION ALL
                SELECT 2 UNION ALL
                SELECT 3 UNION ALL
                SELECT 4
            ) AS positions
            JOIN product_links pl ON (
                pl.id = SUBSTRING_INDEX(
                    SUBSTRING_INDEX(
                        REPLACE(
                            REPLACE(uc.aff_links_order, '[', ''),
                            ']', ''
                        ),
                        ',',
                        positions.position + 1
                    ),
                    ',',
                    -1
                )
            )
            LEFT JOIN
            cb_stores AS cs ON pl.sid = cs.store_id
            WHERE 
                uc.uid = ?
                AND positions.position < (
                    LENGTH(REPLACE(REPLACE(uc.aff_links_order, '[', ''), ']', '')) 
                    - LENGTH(REPLACE(REPLACE(REPLACE(uc.aff_links_order, '[', ''), ']', ''), ',', '')) + 1
                )
                AND positions.position < 5
                AND uc.active = 1
            GROUP BY 
                uc.id, uc.name, uc.updated_at
            ORDER BY 
                uc.created_at DESC
            LIMIT 10 OFFSET ?`,
            [uid, offset]
        )

        if (!collectionData.length) {
            return res
                .status(404)
                .send({
                    message: "No collection found of this user."
                })
        }

        const userDetails = await query(
            `SELECT cu.name, cue.profile_image
            FROM cb_users AS cu
            LEFT JOIN cb_user_extra AS cue ON cu.uid = cue.uid
            WHERE cu.uid = ?`,
            [uid]
        )

        res
            .status(200)
            .send({
                collectionData,
                userDetails
            })
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Internal server error."
            })
    }
}

exports.getPreviewCollectionDetails = async (req, res) => {
    try {
        let { uid, cid } = req.query

        let checkUser = await query(
            `SELECT COUNT(*) AS count
            FROM user_collection
            WHERE uid = ?`,
            [uid]
        )

        if (!checkUser[0].count) {
            return res
                .status(404)
                .send({
                    message: "User not found"
                })
        }

        let links = await query(
            `SELECT 
                pl.id,
                pl.name,
                pl.aff_link,
                pl.img_url,
                cs.store_name,
                pl.org_link
            FROM
                product_links pl
            LEFT JOIN
                cb_stores AS cs ON pl.sid = cs.store_id
            LEFT JOIN
                images_srcset AS img ON img.id = cs.image
            WHERE
                FIND_IN_SET(
                    pl.id, 
                    (SELECT 
                        REPLACE(
                            REPLACE(
                                aff_links_order,
                                '[', ''
                            ),
                            ']', ''
                        )
                    FROM
                        user_collection
                    WHERE
                        id = ? and uid = ? AND active = 1
                    )
                ) > 0
            ORDER BY
                FIND_IN_SET(
                    pl.id, 
                    (SELECT 
                        REPLACE(
                            REPLACE(
                                aff_links_order,
                                '[', ''
                            ),
                            ']', ''
                        )
                    FROM
                        user_collection
                    WHERE
                        id = ? AND uid = ? AND active = 1
                    )
                )`,
            [cid, uid, cid, uid]
        )

        if (!links.length) {
            return res
                .status(404)
                .send({
                    message: "Collection does not belong to the user."
                })
        }

        const productDetailPromises = links.map((link) => (
            axios.post(
                "https://flipshope.com/api/prices/proddetails",
                {
                    link: link.org_link,
                }
            )
        ))

        let productDetails = await Promise.allSettled(productDetailPromises)

        links = links.map((link, index) => {
            link.mrp = productDetails[index].status == "fulfilled" ? productDetails[index].value?.data?.data?.mrp : null
            link.price = productDetails[index].status == "fulfilled" ? productDetails[index].value?.data?.data?.price : null
            return link
        })

        const userDetails = await query(
            `SELECT cu.name, cue.profile_image
            FROM cb_users AS cu
            LEFT JOIN cb_user_extra AS cue ON cu.uid = cue.uid
            WHERE cu.uid = ?`,
            [uid]
        )

        res
            .status(200)
            .send({
                links,
                userDetails
            })
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Internal server error"
            })
    }
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