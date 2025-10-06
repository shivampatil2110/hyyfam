const mysql = require("mysql");
const key = require("../../config/keys");
const browser = require("browser-detect");
const requestIp = require("request-ip");
const { result } = require("lodash");
const util = require("util");

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

exports.isAuthenticated = async (req, res, next) => {
    try {
        // console.log("inside the isAUthenticate");
        let { hyyzoUser } = req.session;
        // console.log(req.session, "session in isAUthenticate");
        // console.log(req.cookies, "cookies in isAUthenticate");
        if (!hyyzoUser) {
            // console.log(
            //   "no user on url",
            //   req.originalUrl,
            //   "ip: ",
            //   requestIp.getClientIp(req)
            // );

            const { hyyzo_topic } = req.cookies;
            // console.log(hyyzo_topic, "hyyzo_topic");
            if (hyyzo_topic && hyyzo_topic?.token) {
                // console.log("topic found");
                connection.query(
                    "Select * from cb_usercookie where cookie= ?",
                    [hyyzo_topic.token],
                    async (error, results, fields) => {
                        if (error) {
                            console.log(error.message, "error in isauthenticated");
                            return res.status(400).send("Error occured");
                        } else {
                            // console.log(results?.[0]?.isDeleted, "value is deleted-----");
                            if (!results || !results.length) {
                                return res.status(401).send("Unauthorized: Incorrect token");
                            } else if (results[0] && results[0].isDeleted) {
                                // var ip = req.headers["x-real-ip"];
                                // console.log("inside isDeleted");
                                var ip = requestIp.getClientIp(req);
                                // req.session.destroy();
                                req.session.destroy(async (err) => {
                                    if (err) {
                                        console.error("Error destroying session:", err);
                                        return res
                                            .status(500)
                                            .send({ code: 500, msg: "Logout failed" });
                                    }

                                    console.log("Session destroyed successfully");

                                    // Clear cookies properly
                                    res.clearCookie("session", {
                                        path: "/",
                                        domain:
                                            process.env.NODE_ENV === "production"
                                                ? "hyyfam.com"
                                                : undefined,
                                        httpOnly: true,
                                        secure: process.env.NODE_ENV === "production",
                                        sameSite: "None",
                                    });

                                    res.clearCookie("hyyzo_topic", {
                                        path: "/",
                                        domain:
                                            process.env.NODE_ENV === "production"
                                                ? "hyyfam.com"
                                                : undefined,
                                        httpOnly: true,
                                        secure: process.env.NODE_ENV === "production",
                                        sameSite: "None",
                                    });
                                });
                                return res.status(401).send("Unauthorized: Incorrect token");
                            } else {
                                var token = hyyzo_topic.token;
                                if (!token) {
                                    res.status(401).send("Unauthorized: No token provided");
                                } else {
                                    req.uid = results[0].uid;
                                    // res.cookie("hyyz0_test", "asdfghjklhjkl");
                                    // console.log('inside cookie////////////////////////////////////////////////////////////////////////')
                                    // await authController.cookie_login_handle({uid:results[0].uid},req,res);
                                    next();
                                }
                            }
                        }
                    }
                );
            } else {
                // console.log("login issue");
                res.send({
                    code: 404,
                    error: "Please Login",
                });
            }
        } else {
            // console.log("session found");
            if (!hyyzoUser.isMobileVerified)
                res.status(401).send("Mobile not verified");
            else {
                req.uid = hyyzoUser.uid;
                next();
            }
        }
    } catch (e) {
        console.log(e, "error in auth");
        res.send({
            code: 404,
            error: "Please Login",
        });
    }
};

exports.completeUserProfile = async (req, res, next) => {
    try {
        // console.log("START SEE-------------", req.session, "req.session")
        let uid = null;
        let { hyyzoUser } = req.session;
        if (!hyyzoUser || !hyyzoUser.uid) uid = req.uid;
        else uid = hyyzoUser.uid;
        if (!uid)
            return res.send({
                code: 400,
                msg: "Please Login Again",
            });
        // let { hyyzoUser } = req.session;
        // if (hyyzoUser && hyyzoUser.uid) var uid = hyyzoUser.uid;
        // else var uid = req.uid;
        // console.log(hyyzoUser, uid, "hyyzoUser uid");
        // if (!hyyzoUser || !uid) return res.send({
        //   code: 400,
        //   msg: "session expeired, try login"
        // });
        // console.log(user, "user===========");

        connection.query(
            "Select a.*,b.gender,b.birthday,b.state from cb_users a left join cb_user_extra b on a.uid = b.uid where a.uid= ?",
            [uid],
            async (error, results, fields) => {
                if (error) {
                    // console.log(error.message, "error in isauthenticated");
                    return res.status(400).send("some Error Found");
                } else {
                    // console.log(results?.[0]?.isDeleted, "value is deleted-----");
                    if (!results || !results.length) {
                        return res.status(401).send("Unauthorized: NO user Found");
                    } else {
                        // console.log(results[0], "user found");
                        user = results[0];
                        if (
                            !user.name ||
                            !user.email ||
                            !user.birthday ||
                            !user.isEmailVerified ||
                            !user.isMobileVerified ||
                            !user.mobile ||
                            !user.gender ||
                            !user.state
                        ) {
                            return res.send({
                                code: 400,
                                msg: "Please complete Profile Details....",
                                data: false,
                            });
                        } else return next();
                    }
                }
            }
        );
    } catch (e) {
        console.log(e, "error in completeuserprofile");
        return res.status(401).send("profile not complete");
    }
};

exports.getUidInSession = (req, res, next) => {
    try {
        if (req.body && req.body.uid) {
            req.manual_uid = req.body.uid;
        }
        const { hyyzoUser } = req.session;
        // console.log(user,'user_in_session');
        if (!hyyzoUser) {
            // console.log("no user");
            // console.log("no user on url --2", req.originalUrl, "ip: ", req.ip);
            const { hyyzo_topic } = req.cookies;
            if (hyyzo_topic && hyyzo_topic.token) {
                // console.log(hyyzo_topic.token);
                connection.query(
                    "Select * from cb_usercookie where time > NOW() and cookie= ?",
                    [hyyzo_topic.token],
                    (error, results, fields) => {
                        if (error) {
                            console.log(error.message, "error in getuidinsession");
                            return;
                            next();
                        } else {
                            // console.log(res, 'auth response');
                            // console.log(results[0].isDeleted,"value")
                            if (results[0]) {
                                // console.log("data found");
                                req.uid = results[0].uid;
                            }
                            return next();
                        }
                    }
                );
            } else return next();
        } else return next();
    } catch (e) {
        console.log(e, "error in auth");
        res.status(401).send("Unauthorized: No token provided");
    }
};

exports.checkInsta = (req, res, next) => {
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

        connection.query(
            `SELECT follower_count, all_permission_access
            FROM user_access_token
            WHERE uid = ?`,
            [uid],
            async (error, result, fields) => {
                if (error) {
                    return res
                        .status(500)
                        .send({
                            message: "Internal server error"
                        })
                }
                if (!result || !result.length) {
                    return res
                        .status(403)
                        .send({
                            message: "Insta account not found."
                        })
                }
                let follower_count = result[0].follower_count
                let all_permission_access = result[0].all_permission_access

                if (follower_count < 1000 || all_permission_access == 0) {
                    return res
                        .send(403)
                        .send({
                            message: "All insta check not satisfied"
                        })
                }
                next()
            }
        )
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Internal server error."
            })
    }
}

exports.checkBonus = async (type, uid) => {
    try {
        await beginTransaction();

        const [user] = await query(`SELECT bonus_status FROM cb_users WHERE uid = ?`, [uid]);

        if (!user || !user.bonus_status) {
            console.warn(`No bonus_status found for uid: ${uid}`);
            await rollback();
            return;
        }

        let bonusStatus;
        try {
            bonusStatus = JSON.parse(user.bonus_status);
        } catch (err) {
            console.error("Invalid JSON in bonus_status:", err);
            await rollback();
            return;
        }

        if (!bonusStatus[type]) {
            await query(
                `INSERT INTO point_post (uid, res_id, activity_id, status, points, actual_points, posted_by, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    uid,
                    `${uid + "_" + type}`,
                    5,
                    "paid",
                    100,
                    0,
                    "script",
                    `${type} bonus`,
                ]
            );
            bonusStatus[type] = true
            await query(
                `UPDATE cb_users SET bonus_status = ? WHERE uid = ?`,
                [JSON.stringify(bonusStatus), uid]
            );
        }
        await commit();

    } catch (error) {
        console.error(error)
        await rollback();
    }
}