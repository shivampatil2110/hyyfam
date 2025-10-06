"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { useGetProductDetailsMutation } from "@/redux/api/collectionApi";
import {
  useCreateAutoPostMutation,
  useGetUserSettingQuery,
} from "@/redux/api/postsApi";
import ProductCollectionPopup from "./ProductCollectionPopup";
import { CollectionPostLoading } from "../LoadingStatesAndModals/CollectionPostLoading";
import { useDispatch } from "react-redux";
import { openModal } from "@/redux/features/modalSlice";
import { showToast } from "@/components/Toast/Toast";
import "./styles.css";
import { checkURL } from "@/utils/common_functions";

interface URLInputProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  setValue: (value: string) => void;
  value: string;
}

const URLInput = ({
  initialValue = "",
  placeholder = "https://",
  onChange,
  onClear,
  setValue,
  value,
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
    <div className="flex items-center w-full h-10 px-[10px] py-2 bg-white border border-[#000] rounded-[5px] shadow-sm">
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
        className="flex-grow outline-none text-sm text-gray-800"
      />

      {/* Clear Button (X icon) - Only visible when there's text */}
      {value && (
        <button
          onClick={handleClear}
          className="flex-shrink-0 ml-2 text-[#000] bg-[#eaeaea] p-[5px] rounded-full"
          aria-label="Clear input"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

interface TagInputProps {
  initialTags?: string[];
  placeholder?: string;
  onTagsChange?: (tags: string[]) => void;
  maxTags?: number;
}

interface Product {
  id: string;
  imageUrl: string;
  title?: string;
  price: string;
  discountedPrice: string;
  storeImg: string;
}

const TagInput = ({
  initialTags = [],
  placeholder = "Add word",
  onTagsChange,
  maxTags = 10,
}: TagInputProps) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onTagsChange) {
      onTagsChange(tags);
    }
  }, [tags, onTagsChange]);

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      const newTags = [...tags, trimmedValue];
      setTags(newTags);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="w-full">
      {/* Input field with add button */}
      <div
        className="flex items-center w-full h-10 px-[10px] py-2 bg-white border border-[#000] rounded-[5px]"
        onClick={focusInput}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow outline-none text-sm text-[#000] placeholder:text-[#000]"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            addTag();
          }}
          className="flex-shrink-0 ml-2 text-[rgba(222,44,109,1)] hover:text-pink-600 focus:outline-none cursor-pointer transition-colors"
          aria-label="Add tag"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Tags container */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center px-2 py-1 bg-white text-[12px] text-[#000] font-medium font-inter rounded-full border border-[#c6c6c6]"
            >
              {tag}
              <button
                onClick={() => removeTag(index)}
                className="ml-1 text-[rgba(222,44,109,1)] hover:text-[rgba(222,44,109,1)]/70 cursor-pointer focus:outline-none"
                aria-label={`Remove ${tag}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface SelectPostProps {
  postId?: string;
  imgurl?: string;
  permaLink?: string;
  schedule?: boolean;
  changeTab: (tab: string) => void;
  handleSchedulePost: (val: boolean) => void;
}

export default function index({
  postId,
  imgurl,
  permaLink,
  schedule,
  changeTab,
  handleSchedulePost,
}: SelectPostProps) {
  const [activeStates, setActiveStates] = useState<boolean>(true);
  const router = useRouter();
  const imageUrl = imgurl
    ? decodeURIComponent(imgurl)
    : "/images/samplePost.png";
  const dispatch = useDispatch();

  const [tags, setTags] = useState<string[]>([]);
  const [url, setUrl] = useState<any>("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { data: settings, isLoading } = useGetUserSettingQuery();
  const [getProductDetails, getProductDetailsState] =
    useGetProductDetailsMutation();
  const [createAutoPost, createAutoPostState] = useCreateAutoPostMutation();
  const [products, setProducts] = useState<any>([]);

  useEffect(() => {
    if (settings?.length) {
      setTags(JSON.parse(settings[0].keywords));
    }
  }, [settings]);

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  const handleContinue = async () => {
    let obj: any = {};
    let urls = products.map((product: any) => {
      return product.org_link;
    });
    obj.post_id = postId;
    obj.perma_link = permaLink;
    obj.isScheduled = schedule ? true : false;
    obj.link_arr = urls;
    obj.keywords = tags;
    // obj.invalidateTags = true;
    await createAutoPost(obj)
      .unwrap()
      .then(() => {
        dispatch(
          openModal({
            type: "post_creation",
            data: null,
            id: null,
          })
        );
        // router.push("/profile/select_post")
        changeTab("Select Post");
      })
      .catch(() => {
        showToast({
          message: "Error publishing post",
          type: "error",
        });
      });
  };

  const handleURLChange = (value: string) => {};

  const handleURLClear = () => {};

  const handleToggleChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newActiveState = event.target.checked;
    setActiveStates(newActiveState);
  };

  const handleAddClicked = async () => {
    let check = await checkURL(url);
    if (!check) {
      showToast({
        message: "Please enter correct URL",
        type: "warning",
      });
      setUrl("");
      return;
    }
    if (products.length >= 10) {
      setUrl("");
      return showToast({
        message: "Utmost 10 products can be added to post.",
        type: "warning",
      });
    }
    if (
      products.filter((pro: any) => {
        return pro.org_link == url;
      }).length
    ) {
      setUrl("");
      return showToast({
        message: "Product already added",
        type: "warning",
      });
    }
    let obj = {
      link: url,
    };
    let response = await getProductDetails(obj).unwrap();
    if (response.code == 200) {
      let { data } = response;
      if (products.filter((prod: any) => data.pid == prod.pid).length) {
        showToast({
          message: "Product already added.",
          type: "warning",
        });
        setUrl("");
        return;
      }
      let productData = { ...data, org_link: url };
      setProducts((prev: any) => [...prev, productData]);
      setUrl("");
    } else {
      showToast({
        message: "Affiliate link not supported",
        type: "error",
      });
      setUrl("");
    }
  };

  const handleUpdateFromCollection = (
    selectedFromPopup: Product[],
    previouslySelectedFromPopup: Product[]
  ): any => {
    setProducts((prevProducts: any) => {
      const selectedIds = selectedFromPopup.map((p) => p.id);
      const previouslySelectedIds = previouslySelectedFromPopup
        .map((p) => p.id)
        .filter((id): id is any => id !== undefined);

      // Remove products that were in previous popup selection but are now unselected
      const filteredProducts = prevProducts.filter(
        (p: any) =>
          !previouslySelectedIds.includes(p.id) || selectedIds.includes(p.id)
      );

      // Add newly selected products (those in selectedFromPopup but not already in filteredProducts)
      const newProducts = selectedFromPopup.filter(
        (newP) =>
          !filteredProducts.some((existing: any) => existing.id === newP.id)
      );

      return [...filteredProducts, ...newProducts];
    });
  };

  const removeProduct = (product: any) => {
    let newProducts = products.filter(
      (pro: any) => pro.org_link != product.org_link
    );
    setProducts(newProducts);
  };

  if (createAutoPostState.isLoading) {
    return <CollectionPostLoading isLoading={createAutoPostState.isLoading} />;
  }

  return (
    <div className="min-h-screen  font-inter">
      <div className="pb-20 flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-start gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <svg
            onClick={() => {
              changeTab("Select Post");
              // schedule ? handleSchedulePost(true) : ""
            }}
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
          {schedule ? (
            <p className="m-0 text-[#000] text-[18px] font-semibold leading-normal font-inter ">
              Schedule a Post
            </p>
          ) : (
            <p className="m-0 text-[#000] text-[18px] font-semibold leading-normal font-inter ">
              Create a Post
            </p>
          )}
        </div>

        <div className="py-3 flex flex-col items-center justify-start gap-[23px] w-full">
          <div className="px-[15px] w-full flex items-center justify-start gap-[15px]">
            {schedule ? (
              <div className="border border-dashed border-[#dfdfdf] bg-[#f8f8f8] rounded-[5px] p-0.5 flex flex-col items-center justify-center gap-1.5 min-w-22 min-h-28">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <g opacity="0.32">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2.45 1.8C2.09101 1.8 1.8 2.09101 1.8 2.45V11.55C1.8 11.909 2.09101 12.2 2.45 12.2H11.55C11.909 12.2 12.2 11.909 12.2 11.55V2.45C12.2 2.09101 11.909 1.8 11.55 1.8H2.45ZM0.5 2.45C0.5 1.37304 1.37304 0.5 2.45 0.5H11.55C12.627 0.5 13.5 1.37304 13.5 2.45V11.55C13.5 12.627 12.627 13.5 11.55 13.5H2.45C1.37304 13.5 0.5 12.627 0.5 11.55V2.45Z"
                      fill="black"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7 3.75C7.35898 3.75 7.65 4.04101 7.65 4.4V9.6C7.65 9.95899 7.35898 10.25 7 10.25C6.64101 10.25 6.35 9.95899 6.35 9.6V4.4C6.35 4.04101 6.64101 3.75 7 3.75Z"
                      fill="black"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.75 7C3.75 6.64101 4.04101 6.35 4.4 6.35H9.6C9.95899 6.35 10.25 6.64101 10.25 7C10.25 7.35898 9.95899 7.65 9.6 7.65H4.4C4.04101 7.65 3.75 7.35898 3.75 7Z"
                      fill="black"
                    />
                  </g>
                </svg>
                <p className="text-center text-[#232323]/50 text-[10px] font-medium font-inter ">
                  Upcoming Insta Post
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <Image
                  className="rounded-[5px]"
                  src={imageUrl}
                  alt="post"
                  height={100}
                  width={130}
                />
              </div>
            )}
          </div>

          <div className="rounded-[14px] bg-[#f9f8f4] px-[15px] py-3 w-full flex flex-col items-start justify-center gap-[22px]">
            <div className="flex flex-col items-start justify-start gap-[9px] w-full">
              <p className="m-0 text-[14px] font-normal font-inter leading-[24px]">
                Paste your Product <span className="font-medium">URL</span>
              </p>

              <div className="flex items-center justify-between w-full gap-4">
   <div className="w-[80%]">           <URLInput
                  initialValue=""
                  onChange={handleURLChange}
                  onClear={handleURLClear}
                  value={url}
                  setValue={setUrl}
                /></div>  
                <button
                  className="flex items-center w-[20%] justify-center p-2 gap-1.5 rounded-[4px] bg-[rgba(222,44,109,1)] cursor-pointer"
                  onClick={handleAddClicked}
                  disabled={getProductDetailsState.isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M12 5.25H6.75V0H5.25V5.25H0V6.75H5.25V12H6.75V6.75H12V5.25Z"
                      fill="white"
                    />
                  </svg>
                  <p className="m-0 text-[14px] font-bold font-inter text-[#fff]">
                    {getProductDetailsState.isLoading ? "Adding..." : "Add"}
                  </p>
                </button>
              </div>
              <p className="m-0 text-[#000]/40 font-inter text-[12px] font-normal leading-normal  ">
                Or
              </p>

              <div
                className="flex items-center justify-start min-w-fit gap-[7px] cursor-pointer"
                onClick={() => setIsPopupOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="22"
                  viewBox="0 0 21 22"
                  fill="none"
                >
                  <path
                    d="M10.5 2C15.45 2 19.5 6.05 19.5 11C19.5 15.95 15.45 20 10.5 20C5.55 20 1.5 15.95 1.5 11C1.5 6.05 5.55 2 10.5 2ZM10.5 0.5C4.725 0.5 0 5.225 0 11C0 16.775 4.725 21.5 10.5 21.5C16.275 21.5 21 16.775 21 11C21 5.225 16.275 0.5 10.5 0.5Z"
                    fill="rgba(222,44,109,1)"
                  />
                  <path
                    d="M16.5 10.25H11.25V5H9.75V10.25H4.5V11.75H9.75V17H11.25V11.75H16.5V10.25Z"
                    fill="rgba(222,44,109,1)"
                  />
                </svg>
                <p className="m-0 text-[14px] text-[rgba(222,44,109,1)] font-inter font-bold leading-normal ">
                  Add Products from Collection
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start justify-start gap-3 w-full">
              <div className="flex items-center justify-between  w-full">
                <p className="text-[14px] text-[#000] font-medium font-inter leading-normal  ">
                  Tags for Auto DM
                </p>
              </div>

              {/* add conditional div for adding word */}
              {activeStates && (
                <TagInput
                  initialTags={tags}
                  onTagsChange={handleTagsChange}
                  key={tags.join(",")}
                />
              )}
            </div>
          </div>

          <div className="px-[15px] py-0 flex flex-col items-start justify-center gap-[14px] w-full">
            <p className="m-0 text-[16px] text-[#000] font-medium font-inter leading-[24px] ">
              Added Products ({products.length})
            </p>

            <div className="grid grid-cols-3 gap-[6px] w-full">
              {products.map((product: any) => (
                <div
                  key={product.id || product.pid}
                  className="relative rounded-[3px] overflow-hidden mb-2"
                  // onClick={() => handleproductSelect(product.id)}
                >
                  <div className="w-full flex flex-col items-start justify-center gap-2">
                    <div className="flex items-center justify-start min-h-[140px] max-h-[140px] w-full">
                      <img
                        src={product.imgurl || product.img_url}
                        alt={product.title || `product ${product.id}`}
                        className="w-full object-cover max-h-[140px]  rounded-[3px]"
                      />
                    </div>

                    <div
                      className={`flex flex-col items-start justify-center gap-[3px] `}
                    >
                      <h3
                        className={`text-[12px] font-normal font-inter text-[#000] overflow-hidden line-clamp-2 text-ellipsis leading-[112%]`}
                      >
                        {/* {title} */}
                        {product?.title || product?.name}
                      </h3>
                    </div>
                  </div>

                  {/* Checkbox in top right corner */}
                  <div className="absolute top-2 left-2 z-10">
                    <Image
                      src={product.store_img || product.img_url}
                      alt="store"
                      height={25}
                      width={35}
                    />
                  </div>

                  <div
                    className="delete-icon"
                    onClick={() => removeProduct(product)}
                    aria-label="Delete product"
                  >
                    <span className="absolute -top-px text-[12px]">x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div
        style={{
          boxShadow: "0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)",
        }}
        className="w-full fixed bottom-0 max-w-[450px] px-[15px] py-[21px] rounded-t-[14px] bg-[#fff] z-50 "
      >
        <button
          onClick={handleContinue}
          className={
            " py-3 w-full rounded-[7px] text-white text-[16px] font-semibold font-inter leading-normal bg-[rgba(222,44,109,1)] hover:bg-[#e03d73] transition-color cursor-pointer disabled:bg-gray-500"
          }
          type="button"
          disabled={!tags.length || !products.length}
        >
          Publish
        </button>
      </div>
      <ProductCollectionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onAdd={handleUpdateFromCollection}
        initialSelectedProducts={products}
        products={products}
      />
    </div>
  );
}
