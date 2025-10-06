"use client";
import React, { useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateCollectionMutation } from "@/redux/api/collectionApi";
import { useGetProductDetailsMutation } from "@/redux/api/collectionApi";
import { KeyboardEvent, ChangeEvent } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { CollectionPostLoading } from "../LoadingStatesAndModals/CollectionPostLoading";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from 'react-redux';
import { openModal } from "@/redux/features/modalSlice";
import { showToast } from "@/components/Toast/Toast";
import { checkURL } from "@/utils/common_functions";

interface URLInputProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  readOnly?: boolean;
  value: string;
  setValue: any;
}

// import React from 'react';

interface SlideUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  // profileComplete: boolean;
  children: React.ReactNode;
  productCollection: ProductDetail[];
}

const SlideUpModal: React.FC<SlideUpModalProps> = ({
  isOpen,
  onClose,
  children,
  productCollection,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 h-[100vh] z-70 flex flex-col justify-end &::--scrollbar]:hidden  scroll-smooth max-w-[448px] mx-auto">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 h-[100vh] bg-black/30 backdrop-blur-[0px] &::--scrollbar]:hidden  scroll-smooth"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Slide-up Panel */}
          <motion.div
            className={`relative bg-white h-[100vh] pb-[45px] z-50 max-w-[448px] min-w-full mx-auto &::--scrollbar]:hidden  scroll-smooth`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const URLInput = ({
  initialValue = "",
  placeholder = "Enter Product Link",
  onChange,
  onClear,
  readOnly = false,
  value,
  setValue,
}: URLInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    setValue("");
    onClear?.();
  };

  return (
    <div className="flex items-center justify-between w-full h-10 px-[10px] gap-0.5 py-2 bg-white border-[0.2px] border-[#000] rounded-[5px] shadow-sm">
<div className="flex items-center justify-start">
        {/* Link Icon */}
      <div className="flex-shrink-0 mr-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="18"
          viewBox="0 0 17 18"
          fill="none"
        >
          <path
            d="M9.87318 12.3973C9.8399 12.3643 9.79496 12.3458 9.74812 12.3458C9.70128 12.3458 9.65634 12.3643 9.62306 12.3973L7.05101 14.9695C5.86016 16.1605 3.85033 16.2866 2.53553 14.9695C1.21852 13.6524 1.34468 11.6446 2.53553 10.4537L5.10758 7.88141C5.1762 7.81279 5.1762 7.6999 5.10758 7.63127L4.22662 6.75024C4.19334 6.71728 4.1484 6.69879 4.10156 6.69879C4.05472 6.69879 4.00978 6.71728 3.9765 6.75024L1.40445 9.3225C-0.468149 11.1952 -0.468149 14.2257 1.40445 16.0963C3.27704 17.9668 6.30728 17.969 8.17766 16.0963L10.7497 13.524C10.8183 13.4554 10.8183 13.3425 10.7497 13.2739L9.87318 12.3973ZM15.5972 1.90456C13.7246 0.0318131 10.6944 0.0318131 8.824 1.90456L6.24973 4.47682C6.21678 4.51011 6.19829 4.55505 6.19829 4.60189C6.19829 4.64873 6.21678 4.69368 6.24973 4.72696L7.12848 5.60578C7.1971 5.67441 7.30998 5.67441 7.3786 5.60578L9.95065 3.03352C11.1415 1.84258 13.1513 1.7164 14.4661 3.03352C15.7831 4.35064 15.657 6.35842 14.4661 7.54937L11.8941 10.1216C11.8611 10.1549 11.8426 10.1999 11.8426 10.2467C11.8426 10.2935 11.8611 10.3385 11.8941 10.3718L12.775 11.2528C12.8437 11.3214 12.9565 11.3214 13.0252 11.2528L15.5972 8.68054C17.4676 6.8078 17.4676 3.77731 15.5972 1.90456ZM10.6722 5.90905C10.639 5.8761 10.594 5.85761 10.5472 5.85761C10.5003 5.85761 10.4554 5.8761 10.4221 5.90905L5.40861 10.9208C5.37566 10.954 5.35717 10.999 5.35717 11.0458C5.35717 11.0927 5.37566 11.1376 5.40861 11.1709L6.28515 12.0475C6.35377 12.1161 6.46665 12.1161 6.53527 12.0475L11.5466 7.0358C11.6152 6.96718 11.6152 6.85428 11.5466 6.78566L10.6722 5.90905Z"
            fill="black"
          />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-grow outline-none text-[16px] max-w-[185px] text-gray-800"
        readOnly={readOnly}
      />
</div>

      {/* Clear Button (X icon) - Only visible when there's text */}
      {value && (
        <button
          onClick={handleClear}
          className="flex-shrink-0   text-[#000] bg-[#eaeaea] p-[5px] rounded-full"
          aria-label="Clear input"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// Interface for product details
interface ProductDetail {
  url: string;
  imageUrl: string;
  title: string;
}

interface ProductDetailsPreview {
  url: string;
  imageUrl: string;
  title: string;
  store: string;
  actualPrice: number;
  discountPrice: number;
}

const collectionGenerator = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [URL, setURL] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
  const [productDetailsPreview, setProductDetialsPreview] = useState<ProductDetailsPreview[]>([]);

  // RTK Query hooks
  const [createCollection, createCollectionState] = useCreateCollectionMutation();
  const [getProductDetails, getProductDetailsState] = useGetProductDetailsMutation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

  const dispatch = useDispatch();

  const handleReorder = () => {
    if (draggedItemIndex === null || dragOverItemIndex === null) return;

    // Create new copies of both arrays
    const newProductDetails = [...productDetails];
    const newUrls = [...urls];

    // Remove items from their original positions
    const draggedProduct = newProductDetails.splice(draggedItemIndex, 1)[0];
    const draggedUrl = newUrls.splice(draggedItemIndex, 1)[0];

    // Insert items at the new positions
    newProductDetails.splice(dragOverItemIndex, 0, draggedProduct);
    newUrls.splice(dragOverItemIndex, 0, draggedUrl);

    // Update the state
    setProductDetails(newProductDetails);
    setUrls(newUrls);

    // Reset drag indices
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const processUrl = async (url: string) => {
    if (!url.trim()) return;

    try {
      let obj: any = {};
      obj.link = url;
      const response = await getProductDetails(obj).unwrap();

      if (response.code == 200) {
        if (productDetails.filter((product: any) => product.pid == response.data?.pid).length) {
          showToast({
            message: "Product already added.",
            type: 'warning'
          })
          setCurrentInput("");
          setURL("");
          return
        }
        setUrls((prevUrls) => [...prevUrls, url]);
        setProductDetails((prevDetails) => [
          ...prevDetails,
          {
            url: url,
            imageUrl: response.data?.imgurl || "",
            title: response.data?.title || "Unknown Product",
            store: response.data?.store_name || "Unknown Store",
            pid: response.data?.pid
          },
        ]);
        setProductDetialsPreview((prevDetails) => [
          ...prevDetails,
          {
            url: url,
            imageUrl: response.data?.imgurl || "",
            title: response.data?.title || "Unknown Product",
            store: response.data?.store_name || "Unknown Store",
            actualPrice: response.data?.mrp || "N/A",
            discountPrice: response.data?.price || "N/A",
          },
        ]);
        setCurrentInput("");
        setURL("");
      } else {
        setCurrentInput("");
        showToast({
          message: response.message,
          type: 'error'
        });
        setURL("");
      }
    } catch (error) {
    }
  };

  // Add a URL when Enter is pressed
  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentInput.trim()) {
      processUrl(currentInput);
    }
  };

  // Handle Add button click
  const handleAddClicked = async () => {
    let check = await checkURL(currentInput)
    if (!check) {
      showToast({
        message: "Please enter correct URL",
        type: 'warning'
      })
      setCurrentInput("");
      setURL("");
      return
    }
    if (urls.length >= 10) {
      showToast({
        message: "Cannot add more than 10 products at a time.",
        type: "warning"
      });
    }
    if (
      urls.filter((url) => {
        return url == currentInput;
      }).length
    ) {
      setURL("");
      return showToast({
        message: "Product already added.",
        type: "warning"
      });
    } else {
      processUrl(currentInput);
    }
  };

  // Remove a URL from the arrays
  const handleRemoveUrl = (indexToRemove: number) => {
    setUrls(urls.filter((_, index) => index !== indexToRemove));
    setProductDetails(
      productDetails.filter((_, index) => index !== indexToRemove)
    );
    setProductDetialsPreview(
      productDetailsPreview.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleClear = () => {
    setValue("");
  };

  const handleURLChange = (value: string) => {
    setCurrentInput(value);
  };

  const handleURLClear = () => {
    setCurrentInput("");
  };

  const handleSubmit = async () => {
    let obj: any = {};
    obj.name = value;
    obj.link_arr = urls;
    const res = await createCollection(obj).unwrap();
    router.push("/create");
    dispatch(
      openModal({
        type: 'collection_creation',
        data: value,
        id: res.collectionId
      })
    );

  };

  if (createCollectionState.isLoading) {
    return (
      <CollectionPostLoading isLoading={createCollectionState.isLoading} />
    );
  }

  return (
    <div className="h-screen overflow-x-scroll [&::-webkit-scrollbar]:hidden font-inter">
      <div className="pb-20  flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-start gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <svg
            onClick={() => router.push("/create")}
            className="cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
          >
            <path
              d="M2.17678 10.5L20.999 10.5"
              stroke="black"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M9.88867 19.3888L1.58351 11.0836C1.2612 10.7613 1.26126 10.2386 1.58364 9.91622L9.88867 1.61118"
              stroke="black"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <p className="m-0 text-[#000] text-[18px] font-semibold leading-normal font-inter ">
            Create New Collection
          </p>
        </div>

        <div className="px-[15px] pb-[15px] pt-[20px] flex items-center justify-between w-full">
          <div className="flex flex-col items-start justify-center gap-0">
            <h2 className="text-[#000] text-[17px] font-bold font-inter leading-normal ">
              Add Products
            </h2>
            <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-normal ">
              One collection. One smart link. Earn always.
            </p>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="43"
            height="43"
            viewBox="0 0 43 43"
            fill="none"
          >
            <path
              d="M33.9893 5.96804C33.9069 5.73781 33.7331 5.55148 33.51 5.45204L25.4475 1.86871C25.108 1.71731 24.712 1.79167 24.4505 2.05414C22.8245 3.68008 20.1764 3.68008 18.5505 2.05414C18.2889 1.79167 17.893 1.71821 17.5534 1.86871L9.49093 5.45204C9.03405 5.64464 8.82174 6.23142 9.05376 6.67127L10.8454 10.2546C11.0452 10.6532 11.5066 10.845 11.9303 10.7034L13.438 10.2009V20.6042C13.438 21.0987 13.8393 21.5 14.3338 21.5H28.6671C29.1616 21.5 29.563 21.0987 29.563 20.6042V10.2009L31.0716 10.7043C31.4944 10.845 31.9566 10.6532 32.1564 10.2555L33.9481 6.67217C34.0574 6.45269 34.0726 6.19827 33.9893 5.96804Z"
              fill="#A9CA95"
            />
            <path
              d="M37.625 22.3958V40.3125C37.625 40.8052 37.2219 41.2083 36.7292 41.2083H6.27083C5.77812 41.2083 5.375 40.8052 5.375 40.3125V22.3958C5.375 21.9031 5.77812 21.5 6.27083 21.5H36.7292C37.2219 21.5 37.625 21.9031 37.625 22.3958Z"
              fill="#D3AA59"
            />
            <path
              d="M22.3961 20.6042C22.4274 20.8648 22.1506 21.2671 22.0557 21.5C21.7314 22.1602 18.7142 28.174 18.7142 28.174C18.5709 28.4785 18.2573 28.6667 17.9169 28.6667H2.68774C2.03647 28.6864 1.58049 27.9348 1.89045 27.3677L5.47378 20.201C5.61712 19.8965 5.93066 19.7083 6.27108 19.7083H21.5002C21.9885 19.6985 22.4059 20.1258 22.3961 20.6042Z"
              fill="#FFD889"
            />
            <path
              d="M41.0742 28.2456C40.913 28.5054 40.6263 28.6667 40.3128 28.6667H25.0836C24.7432 28.6667 24.4297 28.4785 24.2863 28.1739C23.4111 26.3921 21.8111 23.2531 20.9538 21.5L20.703 21.0073C20.3939 20.4393 20.8454 19.6895 21.5003 19.7083H36.7295C37.0699 19.7083 37.3834 19.8964 37.5267 20.201L41.1101 27.3677C41.2534 27.6454 41.2355 27.9769 41.0742 28.2456Z"
              fill="#FFD889"
            />
            <path
              d="M37.5315 20.2038C37.3792 19.9002 37.0692 19.7084 36.7297 19.7084H29.563V10.201L31.0716 10.7044C31.4945 10.8451 31.9567 10.6534 32.1565 10.2556L33.9482 6.67228C34.1784 6.23422 33.9697 5.64476 33.511 5.45305L25.4485 1.86972C25.1081 1.71743 24.7121 1.79178 24.4505 2.05426C22.8246 3.6802 20.1765 3.6802 18.5506 2.05426C18.289 1.79178 17.893 1.71832 17.5535 1.86882L9.491 5.45216C9.26704 5.55159 9.09415 5.73793 9.01173 5.96816C8.92931 6.19838 8.94454 6.4528 9.05383 6.67138L10.8455 10.2547C11.0453 10.6534 11.5066 10.8451 11.9304 10.7035L13.438 10.201V19.7084H6.27138C5.93186 19.7084 5.6219 19.9002 5.46961 20.2038L1.88627 27.3705C1.58438 27.9376 2.04036 28.6874 2.68804 28.6668H5.37554V40.3126C5.37554 40.8071 5.77688 41.2085 6.27138 41.2085H36.7297C37.2242 41.2085 37.6255 40.8071 37.6255 40.3126V28.6668H40.313C40.6239 28.6668 40.9115 28.5055 41.0754 28.2422C41.2384 27.9779 41.2537 27.6482 41.1148 27.3705L37.5315 20.2038ZM14.857 8.23193C14.6241 8.06261 14.3231 8.01782 14.0508 8.1083L12.1006 8.75868L11.0757 6.70901L17.7515 3.74201C19.9301 5.5068 23.0718 5.5068 25.2505 3.74201L31.9263 6.70901L30.9014 8.75868L28.9512 8.1083C28.6771 8.01782 28.3779 8.06261 28.144 8.23193C27.9093 8.40034 27.7714 8.67088 27.7714 8.95845V19.7084C24.6458 19.704 18.3553 19.7111 15.2297 19.7084V8.95845C15.2297 8.67088 15.0918 8.40034 14.857 8.23193ZM6.825 21.5001H20.0511L17.3636 26.8751C15.8192 26.876 5.39794 26.8742 4.1375 26.8751L6.825 21.5001ZM7.16721 28.6668H17.9172C18.2567 28.6668 18.5667 28.4751 18.719 28.1714L20.6047 24.399V39.4168H7.16721V28.6668ZM35.8339 39.4168H22.3964V24.399L24.2821 28.1714C24.4344 28.4751 24.7444 28.6668 25.0839 28.6668H35.8339V39.4168ZM25.6375 26.8751L22.95 21.5001H36.1761L38.8636 26.8751C38.8636 26.8751 25.6429 26.8742 25.6375 26.8751Z"
              fill="black"
            />
          </svg>
        </div>

        <div className="w-full px-[15px]">
          <div className="rounded-[14px] bg-[#fcfcfc] p-[15px] w-full flex flex-col items-start justify-center gap-[14px] ">
            <div className="flex flex-col items-start justify-start gap-[5px] w-full">
              <p className="m-0 text-[14px] font-normal font-inter leading-[24px]">
                Collection Name<span className="text-red-700"> *</span>
              </p>

              <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={"Collection Name"}
                className="flex-grow border-[0.2px] border-[#000] bg-[#fff] text-[16px] text-[#000] w-full py-2 px-[10px] rounded-[5px] "
              />
            </div>

            <div className="flex flex-col items-start justify-start gap-[5px] w-full">
              <p className="m-0 text-[14px] font-normal font-inter leading-[24px]">
                Paste your Product <span className="font-medium">URL</span>
              </p>

              <div className="flex items-center justify-start gap-4 w-full  mb-2">
<div className="w-[80%]">
                  <URLInput
                  initialValue={currentInput}
                  onChange={handleURLChange}
                  onClear={handleURLClear}
                  value={URL}
                  setValue={setURL}
                />
</div>
                <button
                  className="flex items-center w-[20%] justify-center p-2 gap-1.5 rounded-[4px] bg-[rgba(222,44,109,1)] cursor-pointer"
                  onClick={handleAddClicked}
                  disabled={getProductDetailsState.isLoading}
                >
    
                  <p className="m-0 text-[14px] font-bold font-inter text-[#fff]">
                    {getProductDetailsState.isLoading ? "Adding..." : "Add"}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-start gap-[18px] w-full py-5">
          <div className="px-[15px] flex items-center justify-between w-full">
            <h4 className="text-[#000] text-[16px] font-bold font-inter leading-normal ">
              Recently Created
            </h4>
            <button className="text-[12px] text-[#000]/50 font-medium cursor-pointer ">
              ({productDetails.length} Added)
            </button>
          </div>

          <div className="flex flex-col items-start justify-center gap-[9px] px-[15px] w-full">
            {productDetails.map((product, index: any) => (
              <div
                key={index}
                className="w-full flex items-center justify-center gap-3"
                draggable
                onDragStart={() => setDraggedItemIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverItemIndex(index);
                }}
                onDragEnd={handleReorder}
              >
                <div className="p-2 border-[0.5px] text-[#f9f8f4] bg-[#fff] rounded-[5px] flex items-center justify-between gap-[9px] relative w-full">
                  <div className="flex items-center justify-start gap-4.5">
                    <div className="rounded-[5px] bg-[#eaeaea] ">
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        height={35}
                        width={35}
                        className="rounded-[5px] "
                      />
                    </div>
                    <p className="text-[12px] text-[#000] font-inter font-medium ellipsis line-clamp-1 overflow-hidden">
                      {product.title}
                    </p>
                  </div>

                  <div
                    className="rounded-[21px] bg-[#eaeaea] p-[5px]"
                    onClick={() => handleRemoveUrl(index)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.64645 2.64645C8.84171 2.45118 9.15829 2.45118 9.35355 2.64645C9.54882 2.84171 9.54882 3.15829 9.35355 3.35355L6.70711 6L9.35355 8.64645C9.54882 8.84171 9.54882 9.15829 9.35355 9.35355C9.15829 9.54882 8.84171 9.54882 8.64645 9.35355L6 6.70711L3.35355 9.35355C3.15829 9.54882 2.84171 9.54882 2.64645 9.35355C2.45118 9.15829 2.45118 8.84171 2.64645 8.64645L5.29289 6L2.64645 3.35355C2.45118 3.15829 2.45118 2.84171 2.64645 2.64645C2.84171 2.45118 3.15829 2.45118 3.35355 2.64645L6 5.29289L8.64645 2.64645Z"
                        fill="#090909"
                      />
                    </svg>
                  </div>
                </div>
                <div
                  className="cursor-grab active:cursor-grabbing"
                  onMouseDown={() => setDraggedItemIndex(index)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="18"
                    viewBox="0 0 12 18"
                    fill="none"
                  >
                    <g opacity="0.57">
                      <path
                        d="M0 15.5785C0 16.6407 0.866817 17.5 1.92626 17.5C2.9857 17.5 3.85252 16.6407 3.85252 15.5785C3.85252 14.5165 2.9857 13.6475 1.92626 13.6475C0.866817 13.6475 0 14.5165 0 15.5785Z"
                        fill="black"
                      />
                      <path
                        d="M0 9.21795C0 10.2796 0.866817 11.1386 1.92626 11.1386C2.9857 11.1386 3.85252 10.2796 3.85252 9.21795C3.85252 8.15637 2.9857 7.28772 1.92626 7.28772C0.866817 7.28772 0 8.15637 0 9.21795Z"
                        fill="black"
                      />
                      <path
                        d="M0 2.43108C0 3.49319 0.866817 4.35252 1.92626 4.35252C2.9857 4.35252 3.85252 3.49319 3.85252 2.43108C3.85252 1.36899 2.9857 0.5 1.92626 0.5C0.866817 0.5 0 1.36899 0 2.43108Z"
                        fill="black"
                      />
                      <path
                        d="M7.83008 2.74542C7.83008 3.80752 8.69689 4.66685 9.75634 4.66685C10.8158 4.66685 11.6826 3.80752 11.6826 2.74542C11.6826 1.68332 10.8158 0.814331 9.75634 0.814331C8.69689 0.814331 7.83008 1.68332 7.83008 2.74542Z"
                        fill="black"
                      />
                      <path
                        d="M7.83008 9.15069C7.83008 10.2124 8.69689 11.0713 9.75634 11.0713C10.8158 11.0713 11.6826 10.2124 11.6826 9.15069C11.6826 8.08911 10.8158 7.22046 9.75634 7.22046C8.69689 7.22046 7.83008 8.08911 7.83008 9.15069Z"
                        fill="black"
                      />
                      <path
                        d="M7.83008 15.5578C7.83008 16.6199 8.69689 17.4792 9.75634 17.4792C10.8158 17.4792 11.6826 16.6199 11.6826 15.5578C11.6826 14.4957 10.8158 13.6267 9.75634 13.6267C8.69689 13.6267 7.83008 14.4957 7.83008 15.5578Z"
                        fill="black"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            boxShadow: "0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)",
          }}
          className="w-full fixed bottom-0 max-w-[448px] px-[15px] py-[21px] rounded-t-[14px] bg-[#fff] z-50 "
        >
          <button
            onClick={handleOpen}
            className={
              " py-3 w-full rounded-[7px] text-white text-[16px] font-semibold font-inter leading-normal bg-[rgba(222,44,109,1)] hover:bg-[#e03d73] transition-color cursor-pointer disabled:bg-gray-500"
            }
            type="button"
            disabled={
              createCollectionState.isLoading || !urls.length || value == ""
            }
          >
            Preview Collection
          </button>
        </div>

<SlideUpModal
          isOpen={isModalOpen}
          onClose={handleClose}
          productCollection={productDetailsPreview}
        >
          <div className="min-h-[100vh] max-h-[100vh] overflow-y-scroll overflow-x-hidden [&::-webkit-scrollbar]:hidden scroll-smooth">
            <div className="flex items-center justify-start gap-[14px] px-[15px] py-4 border-b-[1px] border-b-[#f0f2f5]">
              <svg
                onClick={handleClose}
                className="cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
              >
                <path
                  d="M1.00125 15.3628L14.3105 2.05349"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.16599 1.63711L14.4753 14.9464"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <h1 className="text-[16px] font-bold font-inter text-[#000]">
                Preview
              </h1>
            </div>

            <div className="flex flex-col gap-3 items-center justify-center w-full py-3 px-[15px]">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-[13px] font-bold leading-6 text-[#000] font-inter">
                  All Product
                </h2>
                <p className="text-[#000]/50 font-inter leading-6 text-[13px] font-medium">
                  ({productDetailsPreview?.length} Added)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-20 w-full">
                {productDetailsPreview?.map((product, index) => (
                  <div className="mb-[14px] flex flex-col items-start justify-start gap-0.5 min-h-[320px]" key={index}>
                    <div className="w-full h-[250px] rounded-[5px] overflow-hidden flex-shrink-0">
                      <Image
                        className="w-full h-full object-cover"
                        src={product.imageUrl}
                        alt={product.title}
                        height={300}
                        width={200}
                      />
                    </div>
                    <h2 className="text-[11px] font-bold text-[#000] font-inter mb-0.5 leading-tight">
                      {product.store}
                    </h2>
                    <h3 className="text-[#000] text-[10px] font-inter line-clamp-2 leading-tight min-h-[20px]">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-start w-full gap-1 mt-auto">
                      <h4 className="text-[11px] font-bold font-inter text-[#000]">
                        ₹{product.discountPrice}
                      </h4>
                      <h5 className="text-[11px] font-normal font-inter text-[#b7aeae] line-through">
                        ₹{product.actualPrice}
                      </h5>
                      <h6 className="text-[10px] text-[#f54a4a] font-medium font-inter whitespace-nowrap">
                        ({Math.floor(
                          ((product.actualPrice - product.discountPrice) / product.actualPrice) * 100
                        )}% off)
                      </h6>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                boxShadow: "0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)",
              }}
              className="w-full fixed bottom-0 max-w-[448px] px-[15px] py-[21px] rounded-t-[14px] bg-[#fff] z-50"
            >
              <button
                onClick={handleSubmit}
                className="py-3 w-full rounded-[7px] text-white text-[16px] font-semibold font-inter leading-normal bg-[rgba(222,44,109,1)] hover:bg-[#e03d73] transition-colors cursor-pointer disabled:bg-gray-500"
                type="button"
                disabled={
                  createCollectionState.isLoading || !urls.length || value == ""
                }
              >
                {createCollectionState.isLoading
                  ? "Publishing..."
                  : `Publish (${urls.length})`}
              </button>
            </div>
          </div>
        </SlideUpModal>
      </div>
    </div>
  );
};

export default collectionGenerator;
