import Image from "next/image";
import React from "react";
import { useGrabDealDeepLinkMutation, useDeeplinkMutation } from "@/redux/api/productsApi";
import { showToast } from "../../Toast/Toast";
import { handleShare, copyToClipboard } from "@/utils/common_functions";
interface Products {
  storeIcon: string;
  image: string;
  commission: string;
  title: string;
  actualPrice: number;
  discountedPrice: number;
  discount: string;
  price: number;
  mrp: number;
  imgurl: string;
  store_imgurl: string;
}

interface ProductGridProps {
  products: Products[];
}

const ProductCard: React.FC<{ product: Products }> = ({ product }) => {

  const [dealDeepLink, dealDeepLinkState] = useGrabDealDeepLinkMutation()
  const [deepLink, deepLinkState] = useDeeplinkMutation()

  const redirect = async (product: any) => {
    const obj: any = {}
    obj.pid = product.PID
    obj.sid = product.Store
    showToast({
      message: "Redirecting...",
      type: 'success'
    })
    const res = await dealDeepLink(obj).unwrap()
    window.open(res.link, '_blank');
  }

  const copyLink = async (product: any) => {
    const obj: any = {}
    obj.pid = product.PID
    obj.sid = product.Store
    let res = await deepLink(obj).unwrap()
    if (res.code == 400) {
      res = await dealDeepLink(obj).unwrap()
      copyToClipboard(res.link)
      return
    }
    copyToClipboard(res.data.link)
  }

  const shareLink = async (product: any) => {
    const obj: any = {}
    obj.pid = product.PID
    obj.sid = product.Store
    let res = await deepLink(obj).unwrap()
    if (res.code == 400) {
      res = await dealDeepLink(obj).unwrap()
      if(res.code == 400) {
      showToast({
        message: "Store not supported...",
        type: 'error'
      })
      } else {
      handleShare(res.link)
      }
      return
    }
    handleShare(res.data.link)
  }

  return (
    <div className="bg-white rounded-[5px]  transition-shadow duration-200 cursor-pointer">
      {/* Product Image */}
      <div className="relative">
        <img
          src={product.imgurl}
          alt={product.title}
          onClick={() => redirect(product)}
          className="w-full h-54 object-cover rounded-[5px]"
        />

        {/* Store Icon */}
        <div className="absolute top-2 left-2 bg-white rounded px-2 py-1 text-xs font-medium text-gray-700" onClick={() => redirect(product)}>
          <Image src={product.store_imgurl} alt="icon" height={40} width={40} />
        </div>

        {/* Heart Icon */}
        <button className="absolute bottom-10 right-2 bg-white rounded-full p-2 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => copyLink(product)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="8"
            viewBox="0 0 10 10"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.5 1.25C2.5 0.918479 2.6317 0.600537 2.86612 0.366117C3.10054 0.131696 3.41848 0 3.75 0L8.75 0C9.08152 0 9.39946 0.131696 9.63388 0.366117C9.8683 0.600537 10 0.918479 10 1.25V6.25C10 6.58152 9.8683 6.89946 9.63388 7.13388C9.39946 7.3683 9.08152 7.5 8.75 7.5H3.75C3.41848 7.5 3.10054 7.3683 2.86612 7.13388C2.6317 6.89946 2.5 6.58152 2.5 6.25V1.25ZM3.75 0.625C3.58424 0.625 3.42527 0.690848 3.30806 0.808058C3.19085 0.925268 3.125 1.08424 3.125 1.25V6.25C3.125 6.41576 3.19085 6.57473 3.30806 6.69194C3.42527 6.80915 3.58424 6.875 3.75 6.875H8.75C8.91576 6.875 9.07473 6.80915 9.19194 6.69194C9.30915 6.57473 9.375 6.41576 9.375 6.25V1.25C9.375 1.08424 9.30915 0.925268 9.19194 0.808058C9.07473 0.690848 8.91576 0.625 8.75 0.625H3.75ZM1.25 3.125C1.08424 3.125 0.925268 3.19085 0.808058 3.30806C0.690848 3.42527 0.625 3.58424 0.625 3.75V8.75C0.625 8.91576 0.690848 9.07473 0.808058 9.19194C0.925268 9.30915 1.08424 9.375 1.25 9.375H6.25C6.41576 9.375 6.57473 9.30915 6.69194 9.19194C6.80915 9.07473 6.875 8.91576 6.875 8.75V8.125H7.5V8.75C7.5 9.08152 7.3683 9.39946 7.13388 9.63388C6.89946 9.8683 6.58152 10 6.25 10H1.25C0.918479 10 0.600537 9.8683 0.366117 9.63388C0.131696 9.39946 0 9.08152 0 8.75V3.75C0 3.41848 0.131696 3.10054 0.366117 2.86612C0.600537 2.6317 0.918479 2.5 1.25 2.5H1.875V3.125H1.25Z"
              fill="black"
            />
          </svg>
        </button>

        {/* Plus Icon */}
        <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => shareLink(product)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="8"
            viewBox="0 0 10 10"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.28567 1.66644C6.28571 1.27706 6.43768 0.899994 6.71519 0.600674C6.9927 0.301354 7.37824 0.0986793 7.8049 0.0278269C8.23155 -0.0430255 8.67238 0.0224176 9.05088 0.212797C9.42937 0.403177 9.72164 0.706475 9.87695 1.07005C10.0323 1.43362 10.0408 1.83452 9.90111 2.20316C9.76142 2.5718 9.4823 2.88491 9.11219 3.08815C8.74209 3.29138 8.30437 3.37191 7.87501 3.31576C7.44565 3.25961 7.05175 3.07032 6.76168 2.78074L5.20909 3.54071L3.47193 4.43144C3.7148 4.81504 3.77849 5.26934 3.64907 5.69497L6.76168 7.21849C7.0662 6.91487 7.48438 6.72218 7.93679 6.67703C8.3892 6.63188 8.84434 6.73741 9.21575 6.97357C9.58717 7.20974 9.849 7.56008 9.95151 7.95808C10.054 8.35608 9.99009 8.774 9.77184 9.13247C9.55359 9.49095 9.19623 9.76501 8.76763 9.90261C8.33903 10.0402 7.86905 10.0318 7.44694 9.87886C7.02482 9.72596 6.67999 9.43927 6.47792 9.07324C6.27585 8.7072 6.23062 8.28732 6.35082 7.89333L3.23821 6.37032C3.001 6.60709 2.69316 6.77793 2.35114 6.86261C2.00912 6.9473 1.64722 6.9423 1.30827 6.8482C0.969314 6.75409 0.667493 6.57483 0.438517 6.33161C0.209541 6.08839 0.0629931 5.79141 0.0162137 5.47579C-0.0305657 5.16018 0.0243814 4.83914 0.174553 4.55067C0.324725 4.2622 0.563836 4.01837 0.863594 3.84803C1.16335 3.67769 1.51121 3.58797 1.86601 3.58949C2.22081 3.59101 2.5677 3.6837 2.86564 3.85659L4.79137 2.86894L6.35082 2.10539C6.30747 1.96232 6.28556 1.8147 6.28567 1.66644ZM8.14284 0.769042C7.87762 0.769042 7.62326 0.863589 7.43572 1.03188C7.24818 1.20018 7.14283 1.42843 7.14283 1.66644C7.14283 1.90444 7.24818 2.1327 7.43572 2.30099C7.62326 2.46928 7.87762 2.56383 8.14284 2.56383C8.40806 2.56383 8.66241 2.46928 8.84995 2.30099C9.03749 2.1327 9.14285 1.90444 9.14285 1.66644C9.14285 1.42843 9.03749 1.20018 8.84995 1.03188C8.66241 0.863589 8.40806 0.769042 8.14284 0.769042ZM1.85706 4.35862C1.59184 4.35862 1.33748 4.45317 1.14994 4.62146C0.962403 4.78975 0.857045 5.01801 0.857045 5.25601C0.857045 5.49402 0.962403 5.72227 1.14994 5.89057C1.33748 6.05886 1.59184 6.15341 1.85706 6.15341C2.12227 6.15341 2.37663 6.05886 2.56417 5.89057C2.75171 5.72227 2.85707 5.49402 2.85707 5.25601C2.85707 5.01801 2.75171 4.78975 2.56417 4.62146C2.37663 4.45317 2.12227 4.35862 1.85706 4.35862ZM7.14283 8.33279C7.14283 8.09479 7.24818 7.86653 7.43572 7.69824C7.62326 7.52995 7.87762 7.4354 8.14284 7.4354C8.40806 7.4354 8.66241 7.52995 8.84995 7.69824C9.03749 7.86653 9.14285 8.09479 9.14285 8.33279C9.14285 8.5708 9.03749 8.79905 8.84995 8.96735C8.66241 9.13564 8.40806 9.23019 8.14284 9.23019C7.87762 9.23019 7.62326 9.13564 7.43572 8.96735C7.24818 8.79905 7.14283 8.5708 7.14283 8.33279Z"
              fill="black"
            />
          </svg>
        </button>
      </div>

      {/* Commission Banner */}
      <div className="bg-[#000] text-[#fff] text-center text-[10px] font-inter leading-5 font-medium w-[95%] mx-auto rounded-b-sm">
        {product.commission}
      </div>

      {/* Product Info */}
      <div className="mt-[13px] flex flex-col items-start justify-start w-full gap-[7px]" onClick={() => redirect(product)}>
        <h3 className="text-[#000] text-[12px] font-normal font-inter text-ellipsis line-clamp-2 leading-[13.5px]">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[12px] font-bold text-[#000] font-inter leading-3">
            ₹{product.price}
          </span>
          {
            product.mrp ?
              <div className="gap-2">
                <span className="text-[12px] text-[#b7aeae] font-normal font-inter line-through">
                  ₹{product.mrp}
                </span>
                <span className="text-[12px] text-[#f83b3b] font-normal font-inter">
                  {((product.price / product.mrp) * 100).toFixed(2)}%
                </span>
              </div>
              :
              null
          }
        </div>
      </div>
    </div>
  );
};

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-2 gap-3.5 mt-3.5">
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  );
};
