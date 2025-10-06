const mysql = require("mysql");
const key = require("../config/keys");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const useragent = require("express-useragent");
// const iplocation = require("ip-location");
// const dateFormat = require("dateformat");
const requestIp = require("request-ip");
const request = require("request");
const sgMail = require("@sendgrid/mail");
const _ = require("lodash");
const browser = require("browser-detect");
const moment = require("moment");
const util = require("util");
const sharp = require('sharp');
const path = require('path');
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { SES_CONFIG } = require("../config/keys");
const client = new SESClient(SES_CONFIG);
const FormData = require("form-data");
const axios = require('axios')

sgMail.setApiKey(key.SENDGRID_API_KEY);
var sessionData;

const options = {
    host: key.MYSQL_HOST,
    user: key.MYSQL_USER,
    password: key.MYSQL_PASSWORD,
    database: key.MYSQL_DATABASE,
};

var connection = mysql.createConnection(options);
const query = util.promisify(connection.query).bind(connection);


exports.loginWithPassword = async (req, res) => {
    const { type } = req.body;

    // console.log(type);
    try {
        if (type == "email") {
            var { email, password } = req.body;
            // console.log(email,password);
            var result = await query(`SELECT * FROM cb_users WHERE email='${email}'`);
            var u_data = { email: email };
            // console.log(result);
        } else if (type == "mobile") {
            var { mobile, password } = req.body;
            var result = await query(
                `SELECT * FROM cb_users WHERE mobile='${mobile}'`
            );
            var u_data = { mobile: mobile };
        } else {
            return res.send({
                code: 404,
                msg: "Neither Mobile nor Email",
            });
        }
        // let { email, password } = req.body;
        // let result = await query(`SELECT * FROM cb_users WHERE email='${email}'`)

        if (result && result.length > 0) {
            // console.log(result, result[0], "res");
            if (result[0].password) {
                // console.log(password, result[0].password, 'password');
                bcrypt.compare(password, result[0].password).then(async (isMatch) => {
                    // console.log(isMatch, 'isMatch');
                    if (isMatch) {
                        resp = await login_handle(u_data, req, res);

                        if (resp && resp.status) {
                            res.json({
                                code: 200,
                                uid: result[0].uid,
                                msg: "login Successful",
                            });
                        } else if (!resp || !resp.status) {
                            res.json({
                                code: 400,
                                failed: resp.msg,
                            });
                        }
                    } else {
                        res.send({
                            code: 402,
                            msg: "Email and password does not match! Try Again",
                        });
                    }
                });
            } else {
                res.send({
                    code: 404,
                    msg: "Password is not set for your account",
                });
            }
        } else {
            res.send({
                code: 404,
                msg: "Email does not exits Please Signup",
            });
        }
    } catch (error) {
        console.log(error, "error in loginWithpassword");
        res.json({
            code: 400,
            failed: "error ocurred",
        });
    }
};

exports.sendMobileOtp = async (req, res) => {
    let mobile = req.body.mobile;

    try {
        var results = await query(
            `Select * from cb_users WHERE mobile='${mobile}'`
        );
        if (results.length > 0 && results[0].isMobileVerified) {
            res.send({
                code: 402,
                msg: "User Already Exist",
            });
        } else {
            sendOtp(req, res, mobile);
        }
    } catch (error) {
        console.log(error, "error in sendMobileOtp sql 2");
        res.json({
            code: 400,
            failed: "error ocurred",
        });
    }
};

exports.sendLoginOtp = async (req, res) => {
    let mobile = req.body.mobile;

    try {
        results = await query(`Select * from cb_users WHERE mobile='${mobile}'`);
        if (!results.length) {
            return res.send({
                code: 400,
                failed: "User does not exists, please sign up",
            });
        } else return sendOtp(req, res, mobile);
    } catch (e) {
        res.send({
            code: 400,
            failed: "error ocurred",
        });
    }
};

exports.verifyMobile = async (req, res) => {
    // console.log(req.cookies);
    let otp = req.body.otp;
    let mobile = req.body.mobile;
    // console.log(otp, mobile, "otp and mobile");

    try {
        let verified = await verifyOtp(mobile, otp);
        // console.log(verified, "verified");
        if (verified.status || verified.status == true) {
            var results = await query(
                `SELECT isMobileVerified from cb_users WHERE mobile='${mobile}'`
            );
            // console.log(results, "results");
            if (results.length > 0) {
                results = await query(
                    `UPDATE cb_users SET isMobileVerified = 1 where  mobile='${mobile}'`
                );
            } else {
                let newUserData = {
                    mobile: mobile,
                    isMobileVerified: true,
                };
                if (req.session && req.session?.hyyzoUser?.uid)
                    newUserData.uid = req.session?.hyyzoUser?.uid;
                let resp = await signup_new_user(newUserData, req);
                // console.log(resp, "resp");
                await login_handle({ mobile: mobile }, req, res);
                if (!resp || !resp.status) {
                    return res.json({
                        code: 400,
                        failed: resp.msg,
                    });
                }
                // console.log(resp, "resp2");
                // results = await query(`INSERT Into cb_users SET ? `, newUserData)
                await query(`Update cb_otp SET active='0' WHERE mobile='${mobile}'`);
            }
            results = await query(
                `Select uid,mobile FROM cb_users WHERE mobile='${mobile}'`
            );
            return res.send({
                code: 200,
                msg: "Mobile Verified Successfully !!",
                data: results,
            });
        } else {
            res.json(verified);
        }
    } catch (error) {
        console.log(error, "error in verifyMobile");
        res.json({
            code: 400,
            failed: "error ocurred in verify_mobile",
            error: error,
        });
    }
};

exports.loginWithOtp = async (req, res) => {
    const { mobile, otp } = req.body;
    const source = req.headers["user-agent"];
    // var ip = req.headers["x-real-ip"];
    var ip = requestIp.getClientIp(req);
    const clientIp = requestIp.getClientIp(req);
    let u_data = { mobile: mobile };
    let verified = await verifyOtp(mobile, otp);
    // console.log(verified.status, "status");
    if (verified.status || verified.status == true) {
        let resp = await login_handle(u_data, req, res);

        if (resp && resp.status) {
            if (resp.uid) {
                res.json({
                    code: 200,
                    uid: resp.uid,
                    msg: "login Successful",
                });
            } else {
                res.json({
                    code: 200,
                    msg: "login Successful",
                });
            }
        } else if (!resp || resp.status == false) {
            res.json({
                code: 400,
                failed: resp.msg,
            });
        }
    } else res.send(verified);
};

exports.signup = async (req, res) => {
    const { hyyzoUser } = req.session;
    let uid = hyyzoUser && hyyzoUser.uid ? hyyzoUser.uid : req.uid;
    // if (hyyzoUser && hyyzoUser.uid) var uid = hyyzoUser.uid;
    // else var uid = req.uid;

    // console.log('uid',uid);
    if (!uid)
        return res.send({
            code: 400,
            msg: "session expeired, try login",
        });

    const password = req.body.password;
    const email = req.body.email;

    const newUser = { active: true };
    if (req.body.name) newUser.name = req.body.name;
    if (email) {
        // console.log(email,'email');
        // const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com)$/;

        // if (regex.test(email) == false)
        //   return res.send({
        //     code: 400,
        //     failed: "error ocurred",
        //     msg: "Invalid Email",
        //   });
        newUser.email = req.body.email;
        var result = await query(`Select * FROM cb_users WHERE email='${email}'`);
        // console.log(result)
        if (result.length)
            return res.send({
                code: 400,
                failed: "error ocurred",
                msg: "Email Id already exists",
            });
        sendVerificationMail(req, res, email, uid, 0);
    }
    try {
        // console.log('inside try');
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) throw err;
                if (password) newUser.password = hash;
                try {
                    await query(`UPDATE cb_users SET ? WHERE uid='${uid}'`, newUser);
                    if (email) {
                        sendGenericMailSMS(2, uid, {}, "email");
                    }
                    let tid = req.cookies && req.cookies.t_id;
                    // console.log(req.cookies, req.cookies.t_id, "req.cookies t_id");
                    if (tid)
                        await query(`INSERT IGNORE INTO tid_uid_mapping SET ? `, {
                            uid: uid,
                            tid: tid,
                        });
                    await login_handle({ uid: uid }, req, res);
                    if (uid) {
                        return res.send({
                            code: 200,
                            uid: uid,
                            msg: "Details successfully added",
                        });
                    } else {
                        return res.send({
                            code: 200,
                            msg: "Details successfully added",
                        });
                    }
                } catch (e) {
                    console.log(e, "error in signup");
                    res.send({
                        code: 400,
                        failed: "error ocurred",
                        msg: "error ocurred",
                    });
                }
            });
        });
    } catch (e) {
        console.log(e, "error in signu");
        res.send({
            code: 400,
            failed: "error ocurred",
            msg: "error ocurred",
        });
    }
};

exports.logout = async (req, res) => {
    const { uid } = req;

    console.log("Session before destroying:", req.session);

    // Destroy session properly
    req.session.destroy(async (err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send({ code: 500, msg: "Logout failed" });
        }

        console.log("Session destroyed successfully");

        const { hyyzo_topic } = req.cookies;

        if (hyyzo_topic) {
            try {
                await query(
                    `UPDATE cb_usercookie SET isDeleted = 1 WHERE cookie = ?`,
                    hyyzo_topic.token
                );

                console.log("User cookie deleted in DB");

                // Clear cookies properly
                res.clearCookie("session", {
                    path: "/",
                    domain: process.env.NODE_ENV === "production" ? "hyyfam.com" : undefined,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "None",
                });

                res.clearCookie("hyyzo_topic", {
                    path: "/",
                    domain: process.env.NODE_ENV === "production" ? "hyyfam.com" : undefined,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "None",
                });

                console.log("Cookies cleared successfully");

                return res.send({
                    code: 200,
                    msg: "Logged out successfully",
                });
            } catch (error) {
                console.error("Error during logout:", error);
                return res.status(400).send({ code: 400, msg: "Logout failed" });
            }
        }
    });
};

exports.getProfile = async (req, res) => {
    // console.log(req.session, "session in profile");
    // console.log(req.uid, "uid in profile");
    if (!req.session || !req.session.hyyzoUser || !req.session.hyyzoUser.uid)
        await login_handle({ uid: req.uid }, req, res);
    await updateSessionData(req);
    if (req.session.hyyzoUser && req.session.hyyzoUser.uid) {
        res.send({
            code: 200,
            success: "found",
            data: req.session.hyyzoUser,
        });
    } else
        res.send({
            code: 404,
            error: "user not valid",
        });
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        let uid = req.uid;
        if (!uid) {
            return res
                .status(403)
                .send({
                    message: "Session expired. Please login again."
                })
        }
        if (!req.file) return res.status(400).send('No file uploaded.');

        const form = new FormData();
        form.append("image", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
        form.append("uid", uid);

        const response = await axios.post(
            `${key.ADMIN_PANEL_URL}/api/gallery/uploadUserProfilePicture`,
            form,
            {
                headers: {
                    ...form.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        const imagePath = response.data?.imagePath;
        if (!imagePath) throw new Error("Image server did not return a path");

        await query(
            `INSERT INTO cb_user_extra (uid, profile_image)
            VALUES (?,?)
            ON DUPLICATE KEY UPDATE
                profile_image = VALUES(profile_image)`,
            [uid, `${imagePath}`]
        )

        res
            .status(200)
            .send({
                message: "Image updated successfully."
            })

    } catch (error) {
        console.error(error);
        res
            .status(500)
            .send({
                message: 'Error processing image'
            });

    }
}

exports.getUserProfile = async (req, res) => {
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

        let profile = await query(
            `SELECT 
                cu.*, cue.*, uat.username
            FROM
                cb_users AS cu
                    LEFT JOIN
                cb_user_extra AS cue ON cu.uid = cue.uid
                    LEFT JOIN
                user_access_token AS uat ON uat.uid = cu.uid
            WHERE
                cu.uid = ?`,
            [uid]
        )

        res
            .status(200)
            .send(profile)
    } catch (error) {
        console.error(error)
        res
            .status(500)
            .send({
                message: "Error getting user."
            })
    }
}

exports.updateUserExtraDetails = async (req, res) => {
    try {
        const { name, bday, gender, marital_status, state, email } = req.body;
        const uid = req.session?.hyyzoUser?.uid || req.uid;

        if (!uid) {
            return res.status(400).json({ code: 400, msg: "Session Expired! Please Login" });
        }

        const data = {
            uid,
            active: 1,
            ...(bday && { birthday: moment(bday).format("YYYY/MM/DD") }),
            ...(gender && { gender }),
            ...(marital_status && { marital_status }),
            ...(state && { state }),
        };

        if (email) {
            await query(
                "UPDATE cb_users SET email = ? WHERE uid = ? AND isEmailVerified = 0",
                [email, uid]
            );
        }

        if (name) {
            await query(
                "UPDATE cb_users SET name = ? WHERE uid = ?",
                [name, uid]
            );
        }

        if (bday || gender || marital_status || state) {
            await query(
                "INSERT INTO cb_user_extra SET ? ON DUPLICATE KEY UPDATE ?",
                [data, data]
            );
        }

        return res.json({
            code: 200,
            msg: "Your Profile successfully updated",
            data: {},
        });
    } catch (error) {
        console.error("Error in updateUserExtraDetails:", error);
        return res.status(500).json({
            code: 400,
            failed: "error occurred",
            msg: "Please try after sometime",
        });
    }
};

exports.sendverificationemail = async (req, res) => {
    let email = req.body.email;
    const { hyyzoUser } = req.session;
    if (hyyzoUser && hyyzoUser.uid) var uid = hyyzoUser.uid;
    else var uid = req.uid;
    // console.log('uid',uid);
    if (!uid)
        return res.send({
            code: 400,
            msg: "session expeired, try login",
        });
    if (!email)
        return res.send({
            code: 400,
            msg: "Invalid email",
        });

    try {
        let checkEmailExists = await query(
            `Select email FROM cb_users WHERE email='${email}' and isEmailVerified = 1`
        );
        if (checkEmailExists.length > 0) {
            return res.send({
                code: 400,
                msg: "Email already Verified",
            });
        }
        await query(`UPDATE cb_users SET email='${email}' WHERE uid='${uid}'`);
        sendVerificationMail(req, res, email, uid);
    } catch (error) {
        console.log(error, "error in sendVerificationemail");
        res.json({
            code: 400,
            failed: "error ocurred",
        });
    }
};

exports.verifyEmail = async (req, res) => {
    let token = req.params.token;
    const verify_token = util.promisify(jwt.verify);

    try {
        let results = await query(
            `SELECT * from cb_otp WHERE token='${token}' AND active = 1`
        );
        if (!results.length) {
            return res.send({
                code: 400,
                msg: "Token not found. Please got to your profile section to resend the verification mail",
            });
        } else {
            try {
                var decoded = await verify_token(token, key.SECRET_OR_KEY);
            } catch (err) {
                console.log(err, "err in verifyEmail");
                if (err instanceof jwt.TokenExpiredError) {
                    return res.status(401).send("Unauthorized: Expired token");
                }
                return res.status(401).send("Unauthorized: Invalid token");
                // throw err
            }
            let results1 = await query(
                `SELECT * from cb_users WHERE email='${results[0].email}' AND uid = '${decoded.uid}'  AND active='1'`
            );
            if (!results1.length) {
                return res.send({
                    code: 400,
                    msg: "We were unable to find a user for this verification. Please SignUp!",
                });
            }
            if (results1[0].isEmailVerified) {
                return res
                    .status(200)
                    .send("User has been already verified. Please Login");
            } else {
                await query(
                    `Update cb_users SET isEmailVerified='1' WHERE email='${results[0].email}'`
                );
                query(`Update cb_otp set attempts=1 WHERE token='${token}'`);
                // updateSessionData(req);
                res.end(
                    "<h1>Email has been Successfully verified. Please Continue Using <a href='https://hyyfam.com'>Hyyfam</h1>"
                );
            }
        }
    } catch (error) {
        console.log(error, "error in verifyEmail");
        res.send({
            code: 400,
            msg: "Some error occurred, please try again later or contact customer support",
        });
    }
};

exports.sendMobileOtpForgetPassword = async (req, res) => {
    let mobile = req.body.mobile;

    try {
        sendOtp(req, res, mobile);
    } catch (error) {
        res.json({
            code: 400,
            failed: "error ocurred",
        });
    }
};

exports.forgotPassword = async (req, res) => {
    const { new_password, otp, mobile } = req.body;
    if (!new_password || !otp || !mobile)
        return res.send({
            code: 400,
            failed: "error ocurred",
            msg: "Parameters Missing",
        });

    if (otp) {
        let verified = await verifyOtp(mobile, otp);
        if (!verified || !verified.status || verified.status !== true)
            return res.send({
                code: 400,
                failed: "error ocurred",
                msg: "otp invaild",
            });
    }
    let uid = await query(
        "select uid from cb_users where mobile = ? and isMobileVerified =1 and active = 1 ",
        [mobile]
    );
    if (uid?.[0]?.uid) {
        uid = uid[0].uid;
        try {
            //generate new password
            await bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(new_password, salt, async (err, hash) => {
                    if (err) throw err;
                    try {
                        await query(
                            `UPDATE cb_users SET password=? WHERE uid='${uid}'`,
                            hash
                        );
                        return res.send({
                            code: 200,
                            msg: "Password Change successfully",
                        });
                    } catch (e) {
                        console.log(e, "error in changePassword");
                        res.send({
                            code: 400,
                            failed: "error ocurred",
                            msg: "error ocurred",
                        });
                    }
                });
            });
        } catch (e) {
            console.log(e, "error in changePassword 2");
            res.send({
                code: 400,
                failed: "error ocurred",
                msg: "error ocurred",
            });
        }
    } else {
        return res.send({
            code: 400,
            failed: "error ocurred",
            msg: "No active account found",
        });
    }
};

async function login_handle(data, req, res) {
    // let time = new Date();

    try {
        var results;

        let uid = data.uid;
        if (!uid) {
            if (data.email)
                results = await query(
                    `SELECT a.uid FROM cb_users a WHERE a.email='${data.email}'`
                );
            else if (data.mobile)
                results = await query(
                    `SELECT a.uid FROM cb_users a WHERE a.mobile='${data.mobile}'`
                );
            uid = results?.[0]?.uid;
        }
        // console.log(new Date() - time, "time taken for uid");
        if (uid) {
            results = await query(
                `SELECT a.*,b.birthday,b.gender,b.marital_status,b.state,c.referralCode,d.pending,d.approved,d.redeemed FROM cb_users a LEFT JOIN cb_user_extra b ON a.uid=b.uid LEFT JOIN referral_mapping c ON a.uid=c.uid LEFT JOIN (SELECT uid,SUM(pending) AS pending,SUM(approved) AS approved,SUM(redeemed) AS redeemed FROM cb_users_balance WHERE uid='${uid}' GROUP BY uid  ) d ON a.uid=d.uid WHERE a.uid='${uid}'`
            );
            // console.log(new Date() - time, "time taken for 2");
        } else results = [];
        // if (data.email)
        //   results = await query(
        //     `SELECT a.*,b.birthday,b.gender,b.marital_status,b.state,c.referralCode,d.pending,d.approved,d.redeemed FROM cb_users a LEFT JOIN cb_user_extra b ON a.uid=b.uid LEFT JOIN referral_mapping c ON a.uid=c.uid LEFT JOIN (SELECT uid,SUM(pending) AS pending,SUM(approved) AS approved,SUM(redeemed) AS redeemed FROM cb_users_balance GROUP BY uid ) d ON a.uid=d.uid WHERE a.email='${data.email}'`
        //   );
        // else if (data.mobile)
        //   results = await query(
        //     `SELECT a.*,b.birthday,b.gender,b.marital_status,b.state,c.referralCode,d.pending,d.approved,d.redeemed FROM cb_users a LEFT JOIN cb_user_extra b ON a.uid=b.uid LEFT JOIN referral_mapping c ON a.uid=c.uid LEFT JOIN (SELECT uid,SUM(pending) AS pending,SUM(approved) AS approved,SUM(redeemed) AS redeemed FROM cb_users_balance GROUP BY uid ) d ON a.uid=d.uid WHERE a.mobile='${data.mobile}'`
        //   );
        // else if (data.uid)
        //   results = await query(
        //     `SELECT a.*,b.birthday,b.gender,b.marital_status,b.state,c.referralCode,d.pending,d.approved,d.redeemed FROM cb_users a LEFT JOIN cb_user_extra b ON a.uid=b.uid LEFT JOIN referral_mapping c ON a.uid=c.uid LEFT JOIN (SELECT uid,SUM(pending) AS pending,SUM(approved) AS approved,SUM(redeemed) AS redeemed FROM cb_users_balance GROUP BY uid ) d ON a.uid=d.uid WHERE a.uid='${data.uid}'`
        //   );
        // else return { status: false, redirect: "https://hyyzo.com/" };
        // return console.log(results);
        if (!results[0] || !results[0].active)
            return { status: false, msg: "Account not active" };
        else if (results[0].isMobileVerified) {
            // results = await query(`UPDATE cb_usercookie SET isDeleted='1' WHERE uid='${results[0].uid}'`)
            const source = req.headers["user-agent"];
            // var ip = req.headers["x-real-ip"];
            var ip = requestIp.getClientIp(req);
            var token = makeToken(30);
            var future = new Date();
            future.setDate(future.getDate() + 90);
            const data = {
                uid: results[0].uid,
                cookie: token,
                userInfo: source,
                ip: ip,
                isDeleted: false,
                time: future,
            };
            addSessionDataToReq(req, results[0]);
            // console.log(
            //   "Setting session ",
            //   sessionData
            // );
            // console.log("-----work here----");
            await query("INSERT INTO cb_usercookie SET ?", data);
            // console.log(new Date() - time, "time taken for 3");
            let bData = browser(req.headers["user-agent"]);
            let cookiedata = {
                b: bData.name,
                v: bData.version,
                token: token,
            };
            // const oneWeekToSeconds = 24 * 60 * 60 * 7;
            const nintydaysToSeconds = 24 * 60 * 60 * 90 * 1000;
            res.cookie("hyyzo_topic", cookiedata, {
                maxAge: nintydaysToSeconds,
                httpOnly: process.env.NODE_ENV === "production" ? true : false,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production" ? true : false,
            });
            return {
                status: true,
                redirect: `https://hyyfam.com/home`,
                uid: data?.uid ? data?.uid : "",
            };
        } else {
            sessionData = req.session;
            sessionData.hyyzoUser = {};
            sessionData.hyyzoUser.uid = results[0].uid;
            sessionData.hyyzoUser.name = results[0].name;
            sessionData.hyyzoUser.email = results[0].email;
            sessionData.hyyzoUser.profile = results[0].profile;
            sessionData.hyyzoUser.isEmailVerified = results[0].isEmailVerified;
            return {
                status: true,
                redirect: `https://hyyfam.com/?response=register&utm_source=google`,
            };
            // res.redirect(`http://hyyzo.com/`)
            // res.redirect(`http://localhost:3050?response=register&utm_source=google`);
            // res.writeHead(302, { Location: '/?response=register&utm_source=google' }).end()
        }
    } catch (error) {
        console.log(error, "in login handle");
    }
}

async function sendOtp(req, res, mobile, sendresp = 1) {
    try {
        results = await query(
            `UPDATE cb_otp SET active='0' WHERE mobile='${mobile}'`
        );
        let otp = Math.floor(100000 + Math.random() * 900000);
        if (mobile == "7123456789") otp = 951357;
        if (mobile == "6375083348") otp = 789456;
        if (mobile == "9509726768") otp = 124421;
        let data = {};
        data.type = "mobile";
        data.mobile = mobile;
        data.otp = otp;
        data.attempts = 3;
        data.active = 1;
        if (mobile.toString().length != 10)
            return (response = {
                code: 400,
                msg: "Invalid Mobile Number !",
            });
        results = await query("INSERT INTO cb_otp SET ?", data);
        // let text = "Your verification code is " + otp;
        let smsresp = await sendSMSOTP(mobile, otp);
        if (smsresp) {
            var response = {
                code: 200,
                msg: "Otp Sent Successfully Please Verify",
            };
        } else {
            var response = {
                code: 400,
                msg: "Couldn't Send Otp ! Try again after some time",
            };
        }
        if (sendresp) res.send(response);
        else return response;
    } catch (error) {
        console.log(error, "error in sendOtp");
        var response = {
            code: 400,
            msg: "error ocurred",
        };
        if (sendresp) res.send(response);
        else return response;
    }
}

async function verifyOtp(mobile, otp) {
    try {
        var results = await query(
            `SELECT * from cb_otp WHERE mobile='${mobile}' AND active='1'`
        );
        if (!results.length) {
            return {
                code: 400,
                msg: "OTP not found, please resend the OTP",
                data: results,
            };
        } else if (otp == results[0].otp) {
            // results = await query(`INSERT Into cb_users SET ? `, newUserData)
            query(`Update cb_otp SET active='0' WHERE mobile='${mobile}'`);
            return {
                status: true,
                code: 200,
                msg: "login Successful",
            };
        } else {
            let attempts = results[0].attempts - 1;
            if (attempts > 0) {
                results = await query(
                    `Update cb_otp SET attempts='${attempts}' WHERE mobile='${mobile}'`
                );
                return {
                    code: 402,
                    msg: "OTP is Not Valid, Please Try again!!",
                    attempts: attempts,
                };
            } else {
                results = await query(
                    `Update cb_otp SET active='0' WHERE mobile='${mobile}'`
                );
                return {
                    code: 402,
                    msg: "Maximum Attempts reached. Please Try After Some Time !",
                    attempts: -1,
                };
            }
        }
    } catch (error) {
        console.log(error, "error in VerifyOtp");
        return {
            code: 400,
            failed: "error ocurred in verify_otp",
        };
    }
}

async function signup_new_user(data, req) {
    if (!data) return { status: false, error: "no data", msg: "no data" };

    try {
        let referredBy = false;
        data.active = true;
        let tid = req.cookies && req.cookies.t_id;
        // console.log(req.cookies, req.cookies.t_id, "req.cookies")
        // if (tid) await query(`INSERT INTO tid_uid_mapping SET ? `, { uid: data.uid, tid: tid });
        if (data.uid) {
            //case 1 (unknown situation)
            await query(`UPDATE cb_users SET ? where uid = '${data.uid}'`, data);
            if (tid)
                await query(`INSERT IGNORE INTO tid_uid_mapping SET ? `, {
                    uid: data.uid,
                    tid: tid,
                });
        } else if (data.mobile && data.isMobileVerified == 1) {
            // case 1 and 3
            referredBy = await getrefuid(req);
            if (referredBy) data.referredBy = referredBy;
            let uid = create_UUID();
            data.uid = uid;
            await query("INSERT INTO cb_users SET ?", data);
            // console.log(referredBy, "refereedBy");
            // console.log(uid, "uid");
            // console.log(req.body.ref_id, "req.body.ref_id");
            if (referredBy && uid && req.body.ref_id) {
                await query(
                    `UPDATE referral_history SET type = "app"  where referredBy =  "${referredBy}" and referredTo = "${uid}" `
                );
            }
            // console.log(tid, data.uid, "tid uid");
            if (tid)
                await query(`INSERT IGNORE INTO tid_uid_mapping SET ? `, {
                    uid: data.uid,
                    tid: tid,
                });
            // console.log(referredBy, "referby");
            if (referredBy) sendReferringMail(3, referredBy, data.uid);
        } else if (data.gid) {
            //case 2
            var data1 = {
                gid: data.gid,
                email: data.email,
                name: data.name,
                profile: data.profile,
            };
            await query("INSERT IGNORE INTO cb_social_users SET ?", data1);
            sessionData = req.session;
            sessionData.google = data1;
            console.log("=============================>", sessionData, "sessionData");
            console.log("=============================>", req.session, "req.session");
        } else {
            return { status: false, error: e, msg: "Unknown error occured" };
        }
        if (data.email && data.uid) {
            sendGenericMailSMS(2, uid, {}, "email");
        }
        if (!data.mobile || !data.isMobileVerified) {
            // return {status: false, error:'Mobile not verified' msg:'Mobile not verified'}
            return {
                status: true,
                redirect: `https://hyyfam.com/?response=register&utm_source=google`,
            };
        }
        return { status: true, redirect: `https://hyyfam.com/` };
    } catch (e) {
        return { status: false, error: e, msg: "error occured" };
    }
}

async function sendVerificationMail(req, res, email, uid, sendresp = 1) {
    try {
        let random_num = Math.floor(Math.random() * 10000000 + 10000000);
        const payload = { email, uid, random_num };
        jwt.sign(
            payload,
            key.SECRET_OR_KEY,
            { expiresIn: "3d" },
            async (err, token) => {
                let otpData = {};
                otpData.type = "email";
                otpData.email = email;
                otpData.mobile = null;
                otpData.otp = null;
                otpData.token = token;
                otpData.attempts = 0;
                otpData.active = 1;
                await query("INSERT INTO cb_otp SET ?", otpData);
                let link = "https://www.hyyfam.com/api/confirmation/" + token;
                let emailresp = await sendVerifyEMail(5, uid, { link }, email);
                if (sendresp)
                    res.send({
                        code: 200,
                        msg: "Mail Sent Successfully Please Verify",
                    });
                return true;
            }
        );
    } catch (error) {
        console.log(error, "error in sendverificationemail");
        var response = {
            code: 400,
            msg: "Error Ocurred! Try again after some time",
        };
        if (sendresp) res.send(response);
        return false;
    }
}

const sendGenericMailSMS = async (
    template_id,
    uid,
    datatoreplace = {},
    type = ""
) => {
    var email, name, mobile;
    //get email from uid and get template from signup
    connection.query(
        `select * from cb_users where uid='${uid}'`,
        async function (err, result) {
            if (err) console.log(err, "Error in sendemailsms 1");
            else {
                email = result[0].email;
                name = result[0].name;
                mobile = result[0].mobile;
                datatoreplace.name = name ? name : "";
                datatoreplace.email = email;
                datatoreplace.mobile = mobile;
                let resp = await createNsend(
                    mobile,
                    email,
                    uid,
                    template_id,
                    datatoreplace,
                    type
                );
                return resp;
            }
        }
    );
};

async function updateSessionData(req) {
    if (!req.session || !req.session.hyyzoUser || !req.session.hyyzoUser.uid)
        return false;
    let uid = req.session.hyyzoUser.uid;
    let results = await query(
        `SELECT a.*,b.birthday,b.gender,b.marital_status,b.state,b.profile_image,c.referralCode,d.pending,d.approved,d.redeemed FROM cb_users a LEFT JOIN cb_user_extra b ON a.uid=b.uid LEFT JOIN referral_mapping c ON a.uid=c.uid LEFT JOIN (SELECT uid,SUM(pending) AS pending,SUM(approved) AS approved,SUM(redeemed) AS redeemed FROM cb_users_balance WHERE uid='${uid}' GROUP BY uid ) d ON a.uid=d.uid WHERE a.uid='${uid}'`
    );
    if (!results[0] || !results[0].active || !results[0].isMobileVerified)
        return false;
    return addSessionDataToReq(req, results[0]);
}

function addSessionDataToReq(req, data) {
    sessionData = req.session;
    sessionData.hyyzoUser = {};
    sessionData.hyyzoUser.uid = data.uid;
    sessionData.hyyzoUser.name = data.name;
    sessionData.hyyzoUser.email = data.email;
    sessionData.hyyzoUser.mobile = data.mobile;
    sessionData.hyyzoUser.profile = data.profile;
    sessionData.hyyzoUser.isEmailVerified = data.isEmailVerified;
    sessionData.hyyzoUser.isMobileVerified = data.isMobileVerified;
    sessionData.hyyzoUser.active = data.active;
    sessionData.hyyzoUser.referredBy = data.referredBy;
    sessionData.hyyzoUser.birthday = data.birthday;
    sessionData.hyyzoUser.gender = data.gender;
    sessionData.hyyzoUser.marital_status = data.marital_status;
    sessionData.hyyzoUser.state = data.state;
    sessionData.hyyzoUser.ref_code = data.referralCode;
    sessionData.hyyzoUser.pending = data.pending - data.approved;
    sessionData.hyyzoUser.balance = data.approved - data.redeemed;
    sessionData.hyyzoUser.redeem = data.redeemed;
    sessionData.hyyzoUser.isnew = !data.redeemed;
    sessionData.hyyzoUser.profile_image = data.profile_image;
    sessionData.hyyzoUser.created_at = data.created_at;
    // console.log(sessionData, "Addd");
    return sessionData;
}

function makeToken(length) {
    var randomChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(
            Math.floor(Math.random() * randomChars.length)
        );
    }
    return result;
}

async function sendSMSOTP(number, OTP, sender = "mHYYZO") {
    let api_data = getSenderId(sender);
    // var body = "{\n  \"flow_id\": \"622b369247439d18372df56c\",\n  \"sender\": \""+sender+"\",\n  \"mobiles\": \""+number+"\",\n  \"OTP\": \""+OTP+"\"\n}";
    // var bodyobj = JSON.stringify(body);
    // var apiUrl = "";
    // var headers = {
    //   authkey: api_data.key,
    //   "Content-Type": "application/json"
    // };
    return new Promise(function (resolve, reject) {
        // return resolve(true);
        request.post(
            {
                headers: {
                    authkey: api_data.key,
                    "Content-Type": "application/json",
                },
                url: "http://api.msg91.com/api/v5/flow/",
                body: JSON.stringify({
                    flow_id: "6385902565f0ce797d0bfd14",
                    sender: sender,
                    mobiles: "91" + number,
                    OTP: OTP,
                    APP_CD: "EUlxXUxE4L3",
                }),
            },
            function (error, response, body) {
                // console.log(response, "otp response", response.statusCode)
                if (!error && response.statusCode == 200) {
                    // console.log(body,response);
                    resolve(true);
                } else {
                    console.log(error, "Error in sendsms 3");
                    resolve(false);
                }
            }
        );
    });
}

async function getrefuid(req) {
    try {
        if (!req.cookies.ref_id && !req.body.ref_id) return false;
        let refCode = req.cookies.ref_id || req.body.ref_id;
        // console.log("ref_id: ", refCode);
        let result = await query(
            `select uid from referral_mapping where referralCode='${refCode}'`
        );
        // console.log(result);
        if (result.length) return result[0].uid;
    } catch (e) {
        console.log(e, "error in getrefuid");
        return false;
    }
    return false;
}

function create_UUID() {
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}

const sendReferringMail = async (template_id, uid, referredUid, type = "") => {
    connection.query(
        `select email from cb_users where uid='${referredUid}'`,
        function (err, result) {
            if (err) console.log(err, "Error in sendemailsms 4");
            else if (result[0]) {
                let datatoreplace = { points: 50 };
                datatoreplace.ref_name = result[0].name || "a friend";
                if (result[0].email) {
                    datatoreplace.ref_email = masking(result[0].email);
                }
                sendGenericMailSMS(template_id, uid, datatoreplace, type);
            }
        }
    );
};

const sendVerifyEMail = async (template_id, uid, datatoreplace = {}, email) => {
    try {
        const result = await query(`SELECT * FROM cb_users WHERE uid = ?`, [uid]);

        if (!result || !result.length) throw new Error("User not found");

        const { name, mobile } = result[0];

        datatoreplace.name = name || "";
        datatoreplace.email = email;
        datatoreplace.mobile = mobile;

        const resp = await createNsend(
            mobile,
            email,
            uid,
            template_id,
            datatoreplace,
            "email"
        );

        return resp;
    } catch (err) {
        console.error("Error in sendVerifyEMail:", err);
        throw err;
    }
};


async function createNsend(
    mobile,
    email,
    uid,
    template_id,
    datatoreplace,
    type = ""
) {
    try {
        const data = await query(
            `SELECT * FROM templates WHERE template_id = ? AND active = 1`,
            [template_id]
        );

        if (!data || !data.length) return false;

        let sent = false;
        const template = data[0];

        if (type !== "sms" && email && template.email_template) {
            let email_template = template.email_template;
            let subject = template.subject;

            for (let key in datatoreplace) {
                email_template = replaceAll(email_template, `{${key}}`, datatoreplace[key]);
                subject = replaceAll(subject, `{${key}}`, datatoreplace[key]);
            }

            await sendMail(email, email_template, uid, template_id, subject);
            sent = true;
        }

        if (type !== "email" && mobile && template.sms_template) {
            let sms_template = template.sms_template;

            for (let key in datatoreplace) {
                sms_template = replaceAll(sms_template, `{${key}}`, datatoreplace[key]);
            }

            await sendSMS(mobile, sms_template);
            sent = true;
        }

        return sent;
    } catch (err) {
        console.error("Error in createNsend:", err);
        return false;
    }
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function getSenderId(sender = "") {
    var smsapi = {
        mHYYZO: {
            sender: "mHYYZO",
            key: "373779AO4fU6D1h1ZX621e06bdP1",
        },
        HYYTXN: {
            sender: "HYYTXN",
            key: "373779AO4fU6D1h1ZX621e06bdP1",
        },
    };
    if (sender && smsapi[sender]) return smsapi[sender];
    return smsapi["mHYYZO"];
}

function masking(a) {
    if (!a || a.length < 5) return false;
    var star = "*";
    var b = a.split("@")[0];
    if (b.length > 3) {
        var c = b.substring(0, 3);
        var count = b.length - 2;
        var string = c + star.repeat(count) + a.split("@")[1];
        //console.log(string);
    } else {
        var c = b.substring(0, 1);
        var count = b.length - 1;
        var string = c + star.repeat(count) + a.split("@")[1];
        // console.log(string);
    }
    return string;
}

const sendMail = async (
    email,
    template,
    uid,
    template_id,
    subject,
    from = "no-reply@hyyfam.com"
) => {
    const command = new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [email] },
        Message: {
            Body: {
                Html: { Charset: "UTF-8", Data: template },
            },
            Subject: { Charset: "UTF-8", Data: subject },
        },
    });

    try {
        await client.send(command);
        insertEmailHistory(email, uid, template_id);
    } catch (error) {
        console.error(
            "Error in SES:",
            error,
            "\n data",
            email,
            template,
            uid,
            template_id,
            subject,
            from
        );
    }
};

async function insertEmailHistory(email, uid, template_id) {
    try {
        const content = {
            email,
            template_id,
            uid,
        };

        await query("INSERT INTO email_history SET ?", content);
        // console.log("email_history inserted");
    } catch (err) {
        console.error("Error in insertEmailHistory:", err);
    }
}

async function sendSMS(number, data) {
    return new Promise(function (resolve, reject) {
        try {
            data = JSON.parse(data);
            data.mobiles = "91" + number;
            // return resolve(true);
            request.post(
                {
                    headers: {
                        authkey: "373779AO4fU6D1h1ZX621e06bdP1",
                        "Content-Type": "application/json",
                    },
                    url: "http://api.msg91.com/api/v5/flow/",
                    body: JSON.stringify(data),
                },
                function (error, response, body) {
                    // console.log(response, "otp response", response.statusCode)
                    if (!error && response.statusCode == 200) {
                        // console.log(body,response);
                        resolve(true);
                    } else {
                        console.log(error, "Error in sendsms 1");
                        resolve(false);
                    }
                }
            );
        } catch (e) {
            console.log(e, "Error in sendsms 2");
            resolve(false);
        }
    });
}