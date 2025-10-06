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
    charset: 'utf8mb4',
};
var connection = mysql.createConnection(options);
const query = util.promisify(connection.query).bind(connection);

exports.getStories = async (req, res) => {
    try {
        const stories = await query(
            `SELECT *
            FROM stories
            WHERE active = 1
            ORDER BY updated_at DESC`
        )
        if (!stories.length) {
            return res
                .status(200)
                .send({
                    message: "No stories found."
                })
        }
        let result = []
        for (let story of stories) {
            let { id, user_name, img, details } = story
            let obj = {}
            obj.id = id
            obj.username = user_name
            obj.header_image = img
            details = JSON.parse(details)
            obj.stories = details.filter((detail) => (detail.active == 1))
            result.push(obj)
        }

        res
            .status(200)
            .send(result)

    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error getting stories."
            })
    }
}

exports.getUpcomingSales = async (req, res) => {
    try {
        let { start_date } = req.query
        const selectedDate = new Date(start_date);
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();

        let sales = await query(
            `SELECT us.*, img.url as img_url, cs.*
            FROM upcoming_sales AS us
            LEFT JOIN cb_stores AS cs ON us.store_id = cs.store_id
            LEFT JOIN images_srcset AS img ON cs.image = img.id
            WHERE MONTH(start_date) = ? AND YEAR(start_date) = ? OR MONTH(end_date) = ? AND YEAR(end_date) = ?`,
            [month, year, month, year]
        )
        res
            .status(200)
            .send(sales)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error getting upcoming sales."
            })
    }
}

exports.getNotification = async (req, res) => {
    try {
        const notifications = await query(
            `SELECT *
            FROM notification
            WHERE active = 1`
        )
        res
            .status(200)
            .send(notifications)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error getting notifications"
            })
    }
}

exports.getTask = async (req, res) => {
    try {
        let { type } = req.query
        if (type == "all") {
            const tasks = await query(
                `SELECT *
                FROM tasks AS t
                LEFT JOIN images_srcset AS img ON t.image = img.id
                WHERE t.active = 1
                ORDER BY t.created`
            )
            return res
                .status(200)
                .send(tasks)
        }
        const tasks = await query(
            `SELECT *
            FROM tasks AS t
            LEFT JOIN images_srcset AS img ON t.image = img.id
            WHERE t.active = 1
            ORDER BY t.created
            LIMIT 10`
        )
        res
            .status(200)
            .send(tasks)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error getting tasks."
            })
    }
}

exports.gettaskbyurl = async (req, res) => {
    let { task_url } = req.query;

    try {
        const results = await query(
            `SELECT a.*, b.alt_text, b.url, b.width, b.height AS image, b.srcset AS resized 
             FROM tasks a 
             LEFT JOIN images_srcset b ON a.image = b.id 
             WHERE a.task_url = ?`,
            [task_url]
        );

        if (results.length) {
            res.status(200).send({
                code: 200,
                success: "Got Activity Data",
                data: results,
            });
        } else {
            res.status(404).send({
                code: 404,
                failed: "Activity Not Found",
                data: results,
            });
        }
    } catch (error) {
        console.error(error, "error in taskcont 4");
        res.status(500).send({
            code: 500,
            failed: "Error occurred",
            error,
        });
    }
};

exports.getBonusStatus = async (req, res) => {
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

        let bonus = await query(
            `SELECT bonus_status
            FROM cb_users
            WHERE uid = ?`,
            [uid]
        )
        bonus = bonus[0]

        res
            .status(200)
            .send(bonus)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error fetching bonus status"
            })
    }
}

exports.getBestEarning = async (req, res) => {
    try {
        let bestEarning = await query(
            `SELECT SUM(points) AS points
            FROM point_post
            WHERE DATE(order_date) = CURDATE() - INTERVAL 1 DAY
            GROUP BY uid
            ORDER BY points DESC;`
        )

        res
            .status(200)
            .send(bestEarning)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error getting best earning."
            })
    }
}

exports.getTotalComission = async (req, res) => {
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
        let totalComission = await query(
            `SELECT SUM(points) AS points
            FROM point_post
            WHERE uid = ?;`,
            [uid]
        )

        res
            .status(200)
            .send(totalComission)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error getting best earning."
            })
    }
}

exports.getBanners = async (req, res) => {
    try {
        const banners = await query(
            `SELECT
                a.type,
                a.image AS img_id,
                a.url,
                b.image_type,
                b.alt_text,
                b.url AS image,
                b.width,
                b.height,
                b.srcset AS resized
            FROM
                managebanners a
            LEFT JOIN images_srcset b ON
                a.image = b.id
            WHERE
                a.live = '1' AND(
                    a.scheduled_time IS NULL OR a.scheduled_time <= NOW())
                ORDER BY
                    a.priority;`
        )

        res
            .status(200)
            .send(banners)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Internal server error."
            })
    }
}