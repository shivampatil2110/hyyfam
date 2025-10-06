const { default: axios } = require("axios");
const keys = require("../config/keys");

async function returnLink(siteid, PID) {
    let link = "";
    try {
        // console.log(siteid,typeof(siteid),"siteId")
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
                link = `https://paytmmall.com/shop/p/voucher-worth-DEAVOUCHER-WORTQWIK8617935F5B2F76?product_id=${PID}`;
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
            default:
                link = ``;
        }
        return link;
    } catch (e) {
        return "";
    }
}

async function get_final_url_after_redirect(url) {
    try {
        let finalURL = await axios.post(
            'https://plt.flipshope.com/api/link/getfinalurl',
            { url },
            {
                headers: {
                    'x-api-key': keys.X_API_KEY,
                    'x-api-secret': keys.X_API_SECRET
                }
            }
        );
        return finalURL.data.data
    } catch (error) {
        return ""
    }
}

module.exports = { returnLink, get_final_url_after_redirect }