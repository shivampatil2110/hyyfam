"use client";

import { useEffect, useState, ReactNode, useRef, DragEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Modal, Box, IconButton, Typography } from "@mui/material";
import { KeyboardEvent, ChangeEvent } from "react";
import {
  useGetCollectionLinksQuery,
  useUpdateCollectionMutation,
  useGetProductDetailsMutation,
} from "@/redux/api/collectionApi";
import { CollectionPostLoading } from "../LoadingStatesAndModals/CollectionPostLoading";
import { useDispatch } from "react-redux";
import { openModal } from "@/redux/features/modalSlice";
import { showToast } from "@/components/Toast/Toast";
import { checkURL, getPIDFromLink } from "@/utils/common_functions";
import LoadingSpinner from "../LoadingStatesAndModals/LoadingSpinner";

interface URLInputProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  value: string;
  setValue: any;
}

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
  id: string;
}

interface FixedWidthModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  hideCloseButton?: boolean;
}

const FixedWidthModal: React.FC<FixedWidthModalProps> = ({
  open,
  onClose,
  title,
  children,
  hideCloseButton = false,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="fixed-width-modal-title"
      aria-describedby="fixed-width-modal-description"
      className="flex items-center justify-center"
    >
      <Box
        className="bg-transparent rounded-[14px] shadow-lg outline-none w-[250px] max-h-[90vh] overflow-y-auto "
        sx={{ maxWidth: "250px" }} // Ensure MUI also respects the fixed width
      >
        {/* <div className="flex items-center justify-end mb-3"> */}
        {/* {title && (
                <Typography 
                  id="fixed-width-modal-title"
                  component="h2" 
                  className="text-lg font-medium"
                >
                  {title}
                </Typography>
              )} */}

        {/* {!hideCloseButton && (
                <IconButton 
                  aria-label="close" 
                  onClick={onClose} 
                  className="p-1 ml-auto"
                  size="small"
                >
                  <X size={28} />
                </IconButton>
              )} */}
        {/* </div> */}
        <Box className="relative w-full mt-10 bg-[#fff] rounded-t-[14px]">
          <svg
            className="absolute left-25 top-[-20px]"
            xmlns="http://www.w3.org/2000/svg"
            width="53"
            height="54"
            viewBox="0 0 53 54"
            fill="none"
          >
            <path
              d="M26.3184 53.0764C40.8536 53.0764 52.6367 41.1949 52.6367 26.5382C52.6367 11.8816 40.8536 0 26.3184 0C11.7831 0 0 11.8816 0 26.5382C0 41.1949 11.7831 53.0764 26.3184 53.0764Z"
              fill="url(#paint0_linear_773_8125)"
            />
            <path
              opacity="0.6"
              d="M26.3197 2.27468C39.93 2.27468 50.9837 13.0669 51.2845 26.4624C51.2845 26.2854 51.2845 26.0832 51.2845 25.9063C51.2845 12.2328 40.1055 1.1626 26.2946 1.1626C12.5088 1.1626 1.30469 12.2328 1.30469 25.9063V26.4624C1.6556 13.0669 12.7093 2.27468 26.3197 2.27468Z"
              fill="#CFF9AF"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.9363 23.101C14.4125 22.5702 15.2647 22.4944 15.8161 22.9493L22.3581 28.2064C22.9096 28.6613 23.7868 28.6108 24.3132 28.1053L36.921 15.8977C37.4473 15.3922 38.2745 15.4175 38.7758 15.923L41.8337 19.0823C42.335 19.5878 42.31 20.4219 41.8087 20.9273L24.9148 37.3052C24.3884 37.8107 23.5111 37.8613 22.9346 37.4316L11.0287 28.2822C10.4522 27.8526 10.377 27.0438 10.8783 26.513L13.9363 23.101Z"
              fill="white"
            />
            <defs>
              <linearGradient
                id="paint0_linear_773_8125"
                x1="26.3184"
                y1="52.3425"
                x2="26.3184"
                y2="-2.01311"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#64B236" />
                <stop offset="0.3788" stopColor="#7EC828" />
                <stop offset="0.7353" stopColor="#8FD61E" />
                <stop offset="1" stopColor="#95DB1B" />
              </linearGradient>
            </defs>
          </svg>

          <div id="fixed-width-modal-description">{children}</div>
        </Box>
      </Box>
    </Modal>
  );
};

// Plus button SVG component
function AddButton() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="22"
      viewBox="0 0 21 22"
      fill="none"
      className="flex-shrink-0"
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
  );
}

// Clear/Cross button SVG component
function ClearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function URLInput({
  initialValue = "",
  onChange,
  onClear,
  onKeyDown,
  readOnly = false,
  value,
  setValue,
}: URLInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    setValue("");
    onClear?.();
  };
  return (
    <div className="relative flex-1">
      <input
        type="text"
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        placeholder="https://www.example.com/..."
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
      />
      {initialValue && (
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={handleClear}
          type="button"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
}

interface SelectCollectionProps {
  id?: any;
  collectioName?: any;
  // permaLink?: string;
  // schedule?: boolean;
  changeTab: (tab: string, id: number, title: string) => void;
}

export default function EditCollectionView({
  id,
  collectioName,
  changeTab,
}: SelectCollectionProps) {
  // const searchParams = useSearchParams();
  // const id = searchParams.get("id");
  // const collectioName = searchParams.get("name");

  const router = useRouter();

  const [productDetails, setProductDetails] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [value, setValue] = useState("");
  const [urls, setUrls] = useState<any[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  // Add this state to provide visual cues during dragging
  const [isDragging, setIsDragging] = useState(false);
  const [URL, setURL] = useState("");
  const dispatch = useDispatch();

  const {
    data: collectionDetails = [],
    isLoading,
    error,
  } = useGetCollectionLinksQuery(id ?? "", {
    skip: !id,
  });

  const [getProductDetails, getProductDetailsState] =
    useGetProductDetailsMutation();

  const [updateCollection, updateCollectionState] =
    useUpdateCollectionMutation();

useEffect(() => {
  if (collectionDetails && typeof collectionDetails === 'object') {
    setProductDetails((prevDetails : any) => {
      // Only update if the data is actually different
      if (JSON.stringify(prevDetails) !== JSON.stringify(collectionDetails)) {
        return collectionDetails;
      }
      return prevDetails; // Return previous state to prevent re-render
    });
  }

  if (collectioName && typeof collectioName === 'string' && collectioName.trim() !== '') {
    setValue(prevValue => {
      // Only update if the value is actually different
      if (prevValue !== collectioName) {
        return collectioName;
      }
      return prevValue; // Return previous state to prevent re-render
    });
  }
}, [collectionDetails, collectioName]);

  const handleDragStart = (index: number) => {
    setDragItem(index);
    setIsDragging(true);
  };

  // Improved function to handle dragging over an item
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    return false;
  };

  // Function to handle drag enter
  const handleDragEnter = (index: number) => {
    setDragOverItem(index);
  };

  // Function to handle drop and reordering
  const handleDrop = () => {
    setIsDragging(false);

    if (
      dragItem === null ||
      dragOverItem === null ||
      dragItem === dragOverItem
    ) {
      // Reset drag states if no actual change
      setDragItem(null);
      setDragOverItem(null);
      return;
    }

    // Create a copy of the current products array
    const newItems: any = [...productDetails];

    // Get the dragged item
    const draggedItem = newItems[dragItem];

    // Remove the dragged item from its original position
    newItems.splice(dragItem, 1);

    // Insert at the new position
    newItems.splice(dragOverItem, 0, draggedItem);

    // Update the state with the new order
    setProductDetails(newItems);

    // Reset drag states
    setDragItem(null);
    setDragOverItem(null);
  };

  // Function to handle drag end (in case drop event doesn't fire)
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragItem(null);
    setDragOverItem(null);
  };

  // Function to save the new order when needed
  const saveNewOrder = async () => {
    if (!id) return;

    // Instead of using a new mutation, use your existing updateCollection
    try {
      const orderPayload = {
        name: value,
        collection_id: id,
        links_id: productDetails.map((product: any) => product.id),
      };

      await updateCollection(orderPayload).unwrap();
      dispatch(
        openModal({
          type: "collection_update",
          data: value,
          id: id,
        })
      );
    } catch (err) {
      showToast({
        message: "Error updating collection",
        type: "error",
      });
    }
  };

  // Add a URL to the array when Enter is pressed
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentInput.trim()) {
      setUrls([...urls, currentInput]);
      setCurrentInput("");
    }
  };

  // Update the current input value
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
  };

  // Clear the current input value
  const handleClearCurrentInput = () => {
    setCurrentInput("");
  };

  // Remove a URL from the array
  const handleRemoveUrl = (indexToRemove: number) => {
    setUrls(urls.filter((_, index) => index !== indexToRemove));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    //   onChange?.(e.target.value);
  };

  const handleOpen = async (e: any) => {
    e.preventDefault();
    let obj: any = {};
    obj.name = value;
    obj.link_arr = urls.map((url: any) => url.url);
    obj.collection_id = id;
    obj.links_id = productDetails
      .filter((product: any) => !product.isNew)
      .map((product: any) => product.id);

    const newProductsWithPosition = productDetails
      .map((product: any, index: number) => ({
        id: product.id,
        position: index,
        isNew: product.isNew || false,
      }))
      .filter((product: any) => product.isNew);
    obj.new_products_metadata = newProductsWithPosition;

    await updateCollection(obj)
      .unwrap()
      .then(() => {
        dispatch(
          openModal({
            type: "collection_update",
            data: value,
            id: id,
          })
        );
      });
    setUrls([]);
    router.push("/profile?type=collections");
    // setIsModalOpen(true);
    // setT
  };
  const handleClose = () => setIsModalOpen(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!id) {
    return <div>No collection ID provided</div>;
  }

  const handleContinue = (): void => {
    router.push(`/profile`);
  };

  // Helper function to reorder the list
  const reorderList = (list: any, startIndex: any, endIndex: any) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleURLChange = (value: string) => {
    setCurrentInput(value);
  };

  const handleURLClear = () => {
    setCurrentInput("");
  };

  const handleAddClicked = async () => {
    let check = await checkURL(currentInput);
    if (!check) {
      showToast({
        message: "Please enter correct URL",
        type: "warning",
      });
      setCurrentInput("");
      setURL("");
      return;
    }
    if (urls.length >= 10) {
      showToast({
        message: "Cannont add more than 10 products at a time.",
        type: "warning",
      });
    }
    if (
      productDetails.filter((pro: any) => {
        return pro.org_link == currentInput;
      }).length
    ) {
      setURL("");
      return showToast({
        message: "Product already added",
        type: "warning",
      });
    } else {
      processUrl(currentInput);
    }
  };

  const processUrl = async (url: string) => {
    if (!url.trim()) return;

    try {
      // Call the RTK Query mutation for product details
      let obj: any = {};
      obj.link = url;
      const response = await getProductDetails(obj).unwrap();

      if (response.code == 200) {
        if (
          productDetails.some(
            (product: any) =>
              product.pid === response.data?.pid ||
              getPIDFromLink(product.org_link) === response.data?.pid
          )
        ) {
          showToast({
            message: "Product already added",
            type: "warning",
          });
          setCurrentInput("");
          setURL("");
          return;
        }
        const product = {
          id: Date.now(),
          cid: id,
          uid: "",
          sid: "",
          code: "",
          name: response.data?.title || "Unknown Product",
          aff_link: "",
          org_link: url,
          img_url: response.data?.imgurl || "",
          clicks: 0,
          click_id: "",
          approved_amount: 0,
          purchased_quantity: 0,
          total_earning: 0,
          isNew: true,
          pid: response.data?.pid,
        };
        setProductDetails((prevDetails: any) => [product, ...prevDetails]);
        setUrls((prevUrls) => [
          ...prevUrls,
          {
            url,
            id: product.id,
          },
        ]);
        // Clear the input field
        setCurrentInput("");
        setURL("");
      } else {
        setCurrentInput("");
        setURL("");
        showToast({
          message: "Affiliate link not supported",
          type: "error",
        });
      }
    } catch (error) {}
  };

  const handleDeleteProduct = (id: string | number) => {
    setProductDetails((prevDetails: any[]) =>
      prevDetails.filter((product) => product.id !== id)
    );
    setUrls((prevDetails: any[]) => prevDetails.filter((url) => url.id !== id));
  };

  // Function to handle drag start
  // const handleDragStart = (index: any) => {
  //   setDragItem(index);
  // };

  // // Handle dragging over an item
  // const handleDragOver = (e: any, index: any) => {
  //   return (e: DragEvent<HTMLDivElement>) => {
  //     e.preventDefault();
  //   };
  // };

  // // Function to handle drag enter
  // const handleDragEnter = (index: any) => {
  //   setDragOverItem(index);
  // };

  // Function to handle drop and reordering
  // const handleDrop = () => {
  //   if (dragItem !== null && dragOverItem !== null) {
  //     const newItems: any = [...productDetails];
  //     const draggedItem = newItems[dragItem];

  //     // Remove the dragged item
  //     newItems.splice(dragItem, 1);

  //     // Insert at the new position
  //     newItems.splice(dragOverItem, 0, draggedItem);

  //     // Reset drag states
  //     setDragItem(null);
  //     setDragOverItem(null);

  //     // Update the reordered array
  //     setProductDetails(newItems);
  //   }
  // };

  if (updateCollectionState.isLoading) {
    return (
      <CollectionPostLoading isLoading={updateCollectionState.isLoading} />
    );
  }

  return (
    <div className="h-screen overflow-x-scroll [&::-webkit-scrollbar]:hidden font-inter">
      {/* Grid of products */}
      <div className="pb-20 flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-between  py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <div className="flex items-center justify-start gap-[14px]">
            <svg
              onClick={() => changeTab("Profile", 0, "")}
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
            >
              <path
                d="M0.999295 15.3628L14.3086 2.05349"
                stroke="black"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M1.16406 1.63711L14.4734 14.9464"
                stroke="black"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <p className="m-0 text-[#000] text-[18px] font-semibold leading-normal font-inter ">
              Edit Collection
            </p>
          </div>
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

        <div className="rounded-[14px] bg-[#f9f8f4] p-[15px] w-full flex flex-col items-start justify-center gap-[20px]">
          <div className="flex flex-col items-start justify-start gap-[9px] w-full">
            <p className="m-0 text-[14px] font-normal font-inter leading-[24px]">
              Edit Collection Name
            </p>

            <input
              type="text"
              value={value}
              onChange={handleChange}
              placeholder={"Collection Name"}
              className="flex-grow border-[1px] border-[#000] bg-[#fff] text-sm text-[#000] w-full py-2 px-[10px] rounded-[5px] "
            />
          </div>
        </div>

        <div className="flex flex-col items-start justify-start gap-[3px] w-full py-4 px-5">
          <div className="px-[15px] flex items-center justify-between w-full">
            <h4 className="text-[#000] text-[16px] font-bold font-inter leading-normal ">
              Add Product Link
            </h4>
          </div>

          <div className="flex items-center justify-between w-full gap-4 mb-2">
            <URLInput
              initialValue={currentInput}
              onChange={handleURLChange}
              onClear={handleURLClear}
              value={URL}
              setValue={setURL}
            />
            <button
              className="flex items-center justify-center p-2 gap-1.5 rounded-[4px] bg-[rgba(222,44,109,1)] cursor-pointer"
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
        </div>

        <div className="px-[15px] flex items-center justify-between w-full pb-[10px] pt-[25px]">
          <h4 className="text-[#000] text-[16px] font-bold font-inter leading-normal ">
            Added Products ({productDetails.length})
          </h4>
        </div>

        <div className="flex flex-col items-start justify-start gap-[11px] overflow-scroll [&::-webkit-scrollbar]:hidden scroll-smooth w-full">
          {productDetails.map((product: any, index: number) => (
            <div
              // key={product.id || index}
              // draggable
              // onDragStart={() => handleDragStart(index)}
              // onDragOver={handleDragOver(error, index)}
              // onDragEnter={() => handleDragEnter(index)}
              // onDragEnd={handleDrop}
              key={product.id || index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              className={`w-full flex items-center justify-between gap-3 px-[15px] cursor-move ${
                dragItem === index ? "opacity-50" : ""
              }`}
            >
              <div className="flex flex-col items-center justify-center rounded-[7px] border-[1px] border-[#eaeaea] w-full relative">
                <div className="w-full flex items-center justify-center gap-[10px] px-2 pt-2 pb-1">
                  <div className="flex items-center justify-center mb-[14px] relative">
                    <Image
                      src={product.img_url}
                      alt="product"
                      height={100}
                      width={160}
                    />
                    {/* <Image
                      className="absolute left-[35%] bottom-[-12px]"
                      src={product.store_img}
                      alt="store"
                      height={20}
                      width={30}
                    /> */}
                  </div>

                  <div className="flex flex-col items-start justify-center w-full">
                    <div className="flex flex-col items-start justify-center mb-2">
                      <h2 className="text-[#000] text-[14px] font-semibold font-inter leading-[119%] ellipsis line-clamp-1 overflow-hidden ">
                        {product.name}
                      </h2>
                      <p className="text-[10px] text-[#787878] ">
                        {new Date(product.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            // hour: "2-digit",
                            // minute: "2-digit",
                            // hour12: true,
                          }
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-start gap-[15px] mt-2 mb-1">
                      <div className="min-w-[60px] flex flex-col items-start justify-center py-0.5 gap-[3px] border-r-[0.5px] border-r-[#000]/50 rounded-[3px]">
                        <h4 className="text-[#6b6565] text-[12px] font-medium font-inter leading-[120%] ">
                          Orders
                        </h4>
                        <p className="text-[#000] text-[14px] font-bold font-inter leading-[120%]">
                          {product.purchased_quantity}
                        </p>
                      </div>

                      <div className="min-w-[90px] flex flex-col items-start justify-center py-0.5 gap-[3px] ">
                        <h4 className="text-[#6b6565] text-[12px] font-medium font-inter leading-[120%] ">
                          Commissions
                        </h4>
                        <p className="text-[#000] text-[14px] font-bold font-inter leading-[120%]">
                          ₹{product.total_earning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => handleDeleteProduct(product.id)}
                  type="button"
                >
                  <ClearIcon />
                </button>
              </div>

              {/* Drag handle icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="18"
                viewBox="0 0 12 18"
                fill="none"
                className="cursor-move"
                style={{ cursor: "move" }}
              >
                <g opacity="0.57">
                  <path
                    d="M0 15.5786C0 16.6407 0.866817 17.5 1.92626 17.5C2.9857 17.5 3.85252 16.6407 3.85252 15.5786C3.85252 14.5165 2.9857 13.6475 1.92626 13.6475C0.866817 13.6475 0 14.5165 0 15.5786Z"
                    fill="black"
                  />
                  <path
                    d="M0 9.21801C0 10.2797 0.866817 11.1386 1.92626 11.1386C2.9857 11.1386 3.85252 10.2797 3.85252 9.21801C3.85252 8.15643 2.9857 7.28778 1.92626 7.28778C0.866817 7.28778 0 8.15643 0 9.21801Z"
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
                    d="M7.83008 9.15075C7.83008 10.2124 8.69689 11.0714 9.75634 11.0714C10.8158 11.0714 11.6826 10.2124 11.6826 9.15075C11.6826 8.08917 10.8158 7.22052 9.75634 7.22052C8.69689 7.22052 7.83008 8.08917 7.83008 9.15075Z"
                    fill="black"
                  />
                  <path
                    d="M7.83008 15.5578C7.83008 16.6199 8.69689 17.4792 9.75634 17.4792C10.8158 17.4792 11.6826 16.6199 11.6826 15.5578C11.6826 14.4957 10.8158 13.6267 9.75634 13.6267C8.69689 13.6267 7.83008 14.4957 7.83008 15.5578Z"
                    fill="black"
                  />
                </g>
              </svg>
            </div>
          ))}
        </div>

        <div
          style={{
            boxShadow: "0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)",
          }}
          className="w-full fixed bottom-0 max-w-[450px] px-[15px] py-[21px] rounded-t-[14px] bg-[#fff] z-50 "
        >
          <button
            onClick={(e) => handleOpen(e)}
            //   disabled={!selectedPostId}
            className={
              " py-3 w-full rounded-[7px] text-white text-[16px] font-semibold font-inter leading-normal bg-[rgba(222,44,109,1)] hover:bg-[#e03d73] transition-color cursor-pointer disabled:bg-gray-500"
            }
            disabled={value == "" || !productDetails.length}
            type="button"
          >
            Save
          </button>
        </div>
      </div>
      <FixedWidthModal
        open={isModalOpen}
        onClose={handleClose}
        // title="Subscribe"
      >
        <div className="w-[80%] mx-auto flex flex-col items-center justify-center gap-5 pb-7 pt-11">
          <div className="flex flex-col items-center justify-center gap-2">
            <h3 className="m-0 text-[#161616] text-[16px] font-bold font-inter">
              Great Job!
            </h3>
            <p className="m-0 text-[#232323] text-[14px] font-normal font-inter text-center">
              Your collection has been updated
            </p>
          </div>
          <button className="w-full bg-[rgba(222,44,109,1)] rounded-[4px] flex items-center justify-center gap-2 py-2 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="16"
              viewBox="0 0 15 16"
              fill="none"
            >
              <path
                d="M12.5 10.9082C11.9062 10.9082 11.3583 11.0995 10.9292 11.419L6.6125 8.55102C6.68478 8.18667 6.68478 7.81333 6.6125 7.44898L10.9292 4.58099C11.3583 4.90051 11.9062 5.09184 12.5 5.09184C13.8792 5.09184 15 4.0625 15 2.79592C15 1.52934 13.8792 0.5 12.5 0.5C11.1208 0.5 10 1.52934 10 2.79592C10 3.01786 10.0333 3.23023 10.0979 3.43304L5.99792 6.15944C5.38958 5.419 4.42292 4.93878 3.33333 4.93878C1.49167 4.93878 0 6.30867 0 8C0 9.69133 1.49167 11.0612 3.33333 11.0612C4.42292 11.0612 5.38958 10.581 5.99792 9.84056L10.0979 12.567C10.0333 12.7698 10 12.9841 10 13.2041C10 14.4707 11.1208 15.5 12.5 15.5C13.8792 15.5 15 14.4707 15 13.2041C15 11.9375 13.8792 10.9082 12.5 10.9082ZM12.5 1.80102C13.0979 1.80102 13.5833 2.24681 13.5833 2.79592C13.5833 3.34503 13.0979 3.79082 12.5 3.79082C11.9021 3.79082 11.4167 3.34503 11.4167 2.79592C11.4167 2.24681 11.9021 1.80102 12.5 1.80102ZM3.33333 9.68367C2.32292 9.68367 1.5 8.92793 1.5 8C1.5 7.07207 2.32292 6.31633 3.33333 6.31633C4.34375 6.31633 5.16667 7.07207 5.16667 8C5.16667 8.92793 4.34375 9.68367 3.33333 9.68367ZM12.5 14.199C11.9021 14.199 11.4167 13.7532 11.4167 13.2041C11.4167 12.655 11.9021 12.2092 12.5 12.2092C13.0979 12.2092 13.5833 12.655 13.5833 13.2041C13.5833 13.7532 13.0979 14.199 12.5 14.199Z"
                fill="white"
              />
            </svg>
            <p className="m-0 text-[15px] text-[#fff] font-normal font-inter leading-normal ">
              Share Link
            </p>
          </button>
        </div>
      </FixedWidthModal>
    </div>
  );
}
