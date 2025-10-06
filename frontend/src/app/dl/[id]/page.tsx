import { BASE_URL } from '../../../appConstants/baseURL'
import axios from 'axios';

export async function generateMetadata({ params }: any) {
    return {
        title: 'HyyFam',
        description: 'Click to view product',
    };
}

export default async function DeeplinkPage({ params }: any) {
    const { id } = params;
    const data = { link_id: id };

    let link = null;

    try {
        const resp = await axios.post(`${BASE_URL}/products/getdeeplink`, data,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })

        if (resp?.data?.link) {
            link = resp.data.link;
        }
    } catch (error) {
    }

    if (!link) {
        return (
            <html lang="en">
                <body>
                    <h1>Not a valid link</h1>
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `window.location.href='${link}';`
                }} />
            </head>
            <body>
                <p>Redirecting...</p>
            </body>
        </html>
    );
}
