const util = require("util");
const mysql = require("mysql");
const key = require("../config/keys");

const options = {
    host: key.MYSQL_HOST,
    user: key.MYSQL_USER,
    password: key.MYSQL_PASSWORD,
    database: key.MYSQL_DATABASE,
};
var connection = mysql.createConnection(options);
const query = util.promisify(connection.query).bind(connection);

exports.addUserPaymentInfo = async (req, res) => {
    const {
        bank,
        branch,
        account,
        accountHolder,
        ifsc,
        type,
        wallet,
        wallet_id,
        mobile,
        upi,
        m_id,
        receiver_name
    } = req.body;

    const uid = req.uid;
    let data = { uid, active: 1, m_id };

    if (type === "wallet") {
        data.details = JSON.stringify({
            wallet_type: wallet,
            mobile_number: mobile,
        });
    } else if (type === "bank") {
        data.details = JSON.stringify({
            bank_name: bank,
            branch: branch,
            account_number: account,
            account_holder_name: accountHolder,
            ifsc_code: ifsc,
        });
    } else if (type === "upi") {
        data.details = JSON.stringify({
            upi,
            name: receiver_name
        });
    } else {
        return res.status(400).send({
            code: 400,
            msg: "Invalid payment type",
        });
    }

    try {
        await query(`INSERT INTO redemption_user_info SET ?`, data);
        res.send({
            code: 200,
            msg: `Your ${type} details have been saved successfully.`,
        });
    } catch (error) {
        console.error("Error in addUserPaymentInfo:", error);
        res.status(500).send({
            code: 500,
            msg: "An error occurred while saving your payment details.",
            error,
        });
    }
};

exports.removeUserPaymentInfo = async (req, res) => {
    const { rid } = req.body;
    const uid = req.uid;

    try {
        const sql = `UPDATE redemption_user_info SET active = 0 WHERE uid = ? AND r_id = ?`;
        const result = await query(sql, [uid, rid]);

        if (result.affectedRows > 0) {
            res.send({
                code: 200,
                msg: "Method removed successfully.",
            });
        } else {
            res.status(404).send({
                code: 404,
                msg: "No matching record found.",
            });
        }
    } catch (error) {
        console.error("Error in removeUserPaymentInfo:", error);
        res.status(500).send({
            code: 500,
            msg: "An error occurred while removing the payment method.",
            error,
        });
    }
};

exports.getUserPaymentInfo = async (req, res) => {
    const { hyyzoUser } = req.session;
    const uid = req.uid;

    if (!uid) {
        return res.status(400).send({
            code: 400,
            msg: "Session expired, please login again.",
        });
    }

    try {
        const activityCodes = await query("SELECT * FROM activity_code_master");

        const userPaymentInfo = await query(
            `SELECT a.*, b.type, b.method, b.allowed_activity, b.sub_activity, b.priority 
             FROM redemption_user_info a 
             LEFT JOIN redemption_method b ON a.m_id = b.m_id 
             WHERE a.uid = ? AND a.active = 1 AND b.active = 1`,
            [uid]
        );

        if (activityCodes.length === 0 || userPaymentInfo.length === 0) {
            return res.send({
                code: 200,
                msg: "No payment methods found.",
                data: [],
            });
        }

        const info = userPaymentInfo.map((element) => {
            const details = JSON.parse(element.details || "{}");
            const allowed = JSON.parse(element.allowed_activity || "[]");

            // Collect unique sub_activities that match allowed activity ids
            const activities = [];
            for (const code of activityCodes) {
                if (allowed.includes(code.id) && !activities.includes(code.sub_activity)) {
                    activities.push(code.sub_activity);
                }
            }

            return {
                r_id: element.r_id,
                m_id: element.m_id,
                details,
                type: element.type,
                method: element.method,
                allowed_activity: activities,
                sub_activity: element.sub_activity,
                priority: element.priority,
            };
        });

        res.send({
            code: 200,
            msg: "Got all payment methods",
            data: info,
        });
    } catch (error) {
        console.error("Error in getUserPaymentInfo:", error);
        res.status(500).send({
            code: 500,
            msg: "Error occurred while retrieving payment information.",
            error,
        });
    }
};

exports.redeemPointsRequest = async (req, res) => {
    try {
        const { hyyzoUser } = req.session;
        const uid = (hyyzoUser && hyyzoUser.uid) || req.uid;

        if (!uid) {
            return res.send({
                code: 400,
                msg: "Session expired, try login",
            });
        }

        let { r_id, points, meth_id } = req.body;
        let leftPoints = parseInt(points);
        let m_id = meth_id;

        if (hyyzoUser?.isnew && leftPoints < 200) {
            return res.send({
                code: 400,
                msg: "Minimum redemption amount for New user is 200",
            });
        }

        if (!hyyzoUser?.isnew && leftPoints < 50) {
            return res.send({
                code: 400,
                msg: "Minimum redemption amount for Existing user is 50",
            });
        }

        if (leftPoints < 50) {
            return res.send({
                code: 400,
                msg: "Points are less than 50",
            });
        }

        if (r_id && !m_id) {
            const results = await query(
                `SELECT m_id FROM redemption_user_info WHERE r_id='${r_id}'`
            );
            if (!results.length) {
                throw new Error("Incorrect redemption ID");
            }
            m_id = results[0].m_id;
        }

        if (!m_id) {
            return res.send({
                code: 400,
                failed: "M_id is not present",
                msg: "Please select an account",
            });
        }

        const methodResults = await query(
            `SELECT allowed_activity FROM redemption_method WHERE m_id='${m_id}' AND active = 1`
        );

        const activities = JSON.parse(methodResults[0]?.allowed_activity || '[]');

        const walletBalanceData = await query(
            `SELECT b.id, (a.approved - a.redeemed) AS approved 
            FROM cb_users_balance a 
            INNER JOIN activity_code_master b ON a.activity_code = b.id 
            WHERE a.activity_code IN (?) AND a.uid='${uid}' 
            ORDER BY b.priority DESC`,
            [activities]
        );

        let activity_wise_points = {};

        for (const balance of walletBalanceData) {
            const id = balance.id;
            const approved = balance.approved;

            if (!approved) continue;

            if (leftPoints <= approved) {
                activity_wise_points[id] = leftPoints;
                leftPoints = 0;
                break;
            } else {
                activity_wise_points[id] = approved;
                leftPoints -= approved;
            }

            if (leftPoints === 0) break;
        }

        if (leftPoints !== 0) {
            return res.send({
                code: 400,
                failed: "Insufficient Balance",
                msg: "Insufficient Balance",
            });
        }

        const result2 = await query(
            `INSERT INTO redemption_history (r_id, uid, points, activity_wise_points, status, m_id) 
       VALUES (${r_id ? `'${r_id}'` : null}, '${uid}', '${points}', '${JSON.stringify(
                activity_wise_points
            )}', 'pending', '${m_id}')`
        );

        return res.send({
            code: 200,
            msg: "Redemption request successful",
        });
    } catch (error) {
        console.error("Error in redeemPointsRequest:", error);
        return res.send({
            code: 400,
            failed: "Error occurred",
            msg: "Something went wrong. Try Again",
        });
    }
};

exports.getRedemptionHistory = async (req, res) => {
    const { hyyzoUser } = req.session;
    if (hyyzoUser && hyyzoUser.uid) var uid = hyyzoUser.uid;
    else var uid = req.uid;
    if (!uid)
        return res.send({
            code: 400,
            msg: "session expeired, try login",
        });

    try {
        let { page } = req.query
        let offset = 0
        if (page) {
            offset = (page - 1) * 10
        }
        let results = await query(
            `SELECT 
                a.id,
                a.points,
                a.status,
                a.remarks,
                DATE_FORMAT(a.created_at, '%b %e, %Y') AS date,
                DATE_FORMAT(a.created_at, '%h:%i %p') AS time,
                b.details,
                a.m_id
            FROM
                redemption_history a
                    JOIN
                redemption_status_master d ON a.status = d.status
                    JOIN
                redemption_user_info b ON b.r_id = a.r_id
            WHERE
                a.uid = ?
            ORDER BY a.created_at DESC`,
            [uid]
        )
        res.send({
            code: 200,
            msg: "Got redemption history",
            data: results,
        });
    } catch (error) {
        console.log(error, "error in pointscont 10");
        res.send({
            code: 400,
            failed: "error occured",
            error: error,
        });
    }
};
