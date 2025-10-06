const axios = require("axios")
const query = require("../config/db.connection")
const moment = require('moment');

async function sendDM(data, postId, commentId) {
    try {
        let uid = data.uid;
        let userData = await query(`SELECT * FROM access_token WHERE uid = ?`, [uid])
        let accessToken = userData[0].access_token
        if (checkDayDifference(userData[0].last_updated_time) < 10) {
            let socialId = userData[0].social_id
            accessToken = await refreshAccessToken(accessToken, socialId)
        }
        let message = {
            "message": {
                "text": ""
            },
            "recipient": {
                "comment_id": commentId
            }
        }
        await axios.post(`https://graph.instagram.com/v21.0/me/messages`,
            message,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        )
    } catch (error) {
        console.error(error)
        throw new Error(error)
    }
}

const refreshAccessToken = async (accessToken, socialId) => {
    try {
        let { access_token } = await axios.get(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`)

        await query(
            `UPDATE access_token
            SET access_token = ?
            WHERE social_id = ?`,
            [access_token, socialId]
        )
        return access_token
    } catch (error) {
        console.log(error)
        throw new Error("Cannot fetch refresh token.")
    }
}

function checkDayDifference(timestamp) {
    const rowDate = moment(timestamp);
    const currentDate = moment();
    const differenceInDays = currentDate.diff(rowDate, 'days');

    return differenceInDays;
}

module.exports = { sendDM }