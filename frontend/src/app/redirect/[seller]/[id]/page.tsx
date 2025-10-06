import axios from "axios";
import RedirectPage from "@/components/postLogin/redirect/index";
import { headers } from "next/headers";
import { BASE_URL } from '../../../../appConstants/baseURL'


interface StoreResponse {
    error?: string;
    data?: any;
}

export default async function Redirect({ params, searchParams }: any) {
    let { seller, id } = await params
    let { name, img_url } = await searchParams

    let data: Record<string, string> = {};

    let responseData: any = {};
    responseData.name = name
    responseData.img_url = img_url

    const requestHeaders = await headers();
    const cookieHeader = requestHeaders.get("cookie");

    try {
        if (seller == 'seller') {
            data.store_name = id;
            const resp = await axios.post<StoreResponse>(
                `${BASE_URL}/products/storeurl`,
                data,
                {
                    headers: {
                        Cookie: cookieHeader ?? "",
                    },
                    withCredentials: true,
                }
            );
            if (resp.data?.error === "please_login") {
                // optionally redirect to login page or show a flag
            } else {
                responseData.link = resp.data?.data
            }
        } else if (seller == 'task') {
            data.task_id = id;
            const resp = await axios.post<StoreResponse>(
                `${BASE_URL}/products/taskurl`,
                data,
                {
                    headers: {
                        Cookie: cookieHeader ?? "",
                    },
                    withCredentials: true,
                }
            );

            if (resp.data?.error === "please_login") {
                // optionally handle login
            } else {
                responseData.link = resp.data?.data
            }
        }
    } catch (error) {
    }

    return <RedirectPage serverData={responseData} />;
}
