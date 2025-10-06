"use client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "../postLogin/LoadingStatesAndModals/LoadingSpinner";
import {
  useGetPreviewCollectionDetailsQuery
} from "@/redux/api/collectionApi";
import ReplyIcon from "@mui/icons-material/Reply";
import { CDN_URL, WEBSITE_URL } from "@/appConstants/baseURL";
import { showToast } from "../Toast/Toast";
import { handleShare } from "@/utils/common_functions";

interface ProductDetails {
  storeImg: string;
  productImg: string;
  title: string;
  date: string;
  price: string;
  orderAmount: string;
  orderComission: string;
  clicks: string;
  views: string;
  order: string;
}

interface Collection {
  id: string;
  name: string;
  aff_link_order: number[]; // Array of indices from productDetails
  updated_at: string;
}

const CollectionPreviewPage: React.FC = () => {
  const params = useParams();
  const uid = params?.uid;
  const cid = params?.cid;

  const { data, isLoading, error, isFetching } = useGetPreviewCollectionDetailsQuery({
    uid: uid,
    cid: cid
  });

  const redirectPrduct = (product: any) => {
    const url = product.aff_link
    window.open(url, '_blank');
  }

  if (isLoading) {
    return <LoadingSpinner isOpen={true} />
  }

  if (error) {
    return (
      <div className="bg-[#fff] max-w-[448px] mx-auto overflow-scroll h-screen [&::-webkit-scrollbar]:hidden scroll-smooth flex flex-col items-center justify-center">
        <h1>Collection does not belong to this user.</h1>
      </div>
    )
  }

  return (
    <div className="bg-[#fff] max-w-[448px] mx-auto overflow-scroll h-screen [&::-webkit-scrollbar]:hidden scroll-smooth flex flex-col items-center justify-start">
      <div className="flex flex-col items-center justify-center w-full ">
        <div className="flex items-center justify-between w-full px-[15px] py-2 border-b-[1px] border-b-[#f0f2f5]">
          <div className="flex items-center justify-start gap-2">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={!data.userDetails[0].profile_image ? "/images/profileImage.webp" : `${CDN_URL + "/images" + data.userDetails[0].profile_image}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-[14px] font-semibold font-inter text-[#000] ">
              {data.userDetails[0].name}
            </h1>
          </div>
        </div>

        <div className="flex flex-col w-full items-center justify-center gap-5 px-[15px] py-[26px]">
          <div className="flex flex-col items-start justify-center w-full ">
            <h3 className="text-[14px] text-[#000] font-bold font-inter mb-1">
              My Top Collection
            </h3>
            <p className="txet-[10px] text-[#000] font-medim font-inter">
              Handpicked recommendations you’ll love.
            </p>
          </div>


          <div className="grid grid-cols-2 gap-2.5 mb-20 w-full overflow-scroll [&::-webkit-scrollbar]:hidden scroll-smooth ">
            {data.links?.map((product: any, index: number) => (
              <div className="mb-[14px] flex flex-col items-start justify-center gap-0.5 cursor-pointer relative" key={product.id} onClick={() => redirectPrduct(product)}>
                <Image
                  className="w-full min-h-[230px] max-h-[230px] rounded-[5px]"
                  src={product.img_url}
                  alt={product.name}
                  height={300}
                  width={200}
                />
                <h2 className="text-[11px] font-bold text-[#000] font-inter mb-0.5">{product.store_name
                }</h2>
                <h3 className="text-[#000] text-[10px] font-inter text-ellipsis line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center justify-start w-full gap-1">
                  {product.price &&
                    <h4 className="text-[11px] fomnt-bold font-inter text-[#000]">₹{product.price}</h4>
                  }
                  {
                    product.mrp && (product.mrp != product?.price) &&
                    <h5 className="text-[11px] font-normal font-inter text-[#b7aeae] line-through ">₹{product.mrp}</h5>
                  }
                  {
                    (product.mrp && product.price) && (product.mrp != product?.price) &&
                    <h6 className=" text-[10px] text-[#f54a4a] font-medium font-inter ">
                      ({Math.round(
                        ((product.mrp - product.price) / product.mrp) * 100
                      )}
                      % off)
                    </h6>
                  }
                  <ReplyIcon
                    sx={{
                      transform: "scale(-1, 1)",
                      position: "absolute",
                      right: "10px",
                      top: "7px",
                      cursor: "pointer",
                      color: "#222 !important",
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(`${product.aff_link}`)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              boxShadow: "0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)",
            }}
            className="w-full fixed bottom-0 max-w-[448px] px-[15px] py-[21px] rounded-t-[14px] bg-[#fff] z-50 "
          >
            <button
              className={
                " py-3 w-full rounded-[7px] text-white text-[16px] font-semibold font-inter leading-normal bg-[rgba(222,44,109,1)] hover:bg-[#e03d73] transition-color cursor-pointer disabled:bg-gray-500"
              }
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleShare(`${WEBSITE_URL}/preview/${uid}/${cid}`)
              }}
            >
              Share this Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionPreviewPage;
