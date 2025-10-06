'use client'
import { Box, Modal } from "@mui/material";
import Image from "next/image";
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from "@/redux/features/modalSlice";
import { WEBSITE_URL } from "@/appConstants/baseURL";
import { handleShare } from "@/utils/common_functions";

interface FixedWidthModalProps {
  open: any;
  onClose: () => void;
  link: string;
  title: string;
  img?: any;
  type: string;
  //   hideCloseButton?: boolean;
}

const FixedWidthModal: React.FC = () => {

  const { isOpen, type, data, id } = useSelector((state: any) => state.modal);
  const { uid } = useSelector((state: any) => state.auth.user || {});
  const dispatch = useDispatch();

  return (
    <Modal
      open={isOpen}
      onClose={() => dispatch(closeModal())}
      aria-labelledby="fixed-width-modal-title"
      aria-describedby="fixed-width-modal-description"
      className="flex items-center justify-center"
    >
      <Box
        className="bg-transparent rounded-[14px] shadow-lg outline-none w-[250px] max-h-[90vh] overflow-y-auto "
        sx={{ maxWidth: "250px" }} // Ensure MUI also respects the fixed width
      >
        <Box className="relative w-full mt-10 bg-[#fff] rounded-t-[14px]">
          <div id="fixed-width-modal-description">
            {/* {type === "collection_update" && ( */}
            <div className="flex flex-col items-center justify-center py-8 ">
              <div className="relative border-[4px] border-[#e4e4e4] rounded-[14px]">
                <svg
                  className="absolute right-0 top-0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="23"
                  viewBox="0 0 22 23"
                  fill="none"
                >
                  <g clipPath="url(#clip0_1803_20920)">
                    <path
                      d="M19.6735 16.6513C19.4273 16.6015 19.1726 16.6224 18.937 16.7118C18.7013 16.8012 18.4936 16.9556 18.3361 17.1586C18.1786 17.3616 18.0773 17.6053 18.0431 17.8636C18.0089 18.122 18.0432 18.3851 18.1421 18.6247C18.7271 19.9929 17.0936 21.2292 15.9346 20.2998C15.7372 20.1386 15.5027 20.0339 15.2543 19.996C15.0059 19.9581 14.7523 19.9883 14.5186 20.0837C14.285 20.179 14.0793 20.3362 13.9221 20.5397C13.7649 20.7431 13.6616 20.9857 13.6223 21.2435C13.4457 22.7178 11.4149 22.9645 10.863 21.5877C10.7639 21.3458 10.6058 21.1351 10.4043 20.9761C10.2029 20.8172 9.96504 20.7156 9.71429 20.6815C9.46354 20.6473 9.20855 20.6817 8.97449 20.7813C8.74044 20.8808 8.53541 21.0421 8.37965 21.2492C7.48839 22.4396 5.59826 21.6451 5.82452 20.1765C5.85565 19.9195 5.82086 19.6586 5.7237 19.4202C5.62653 19.1817 5.47044 18.9742 5.27125 18.8187C5.07206 18.6632 4.83685 18.5652 4.58947 18.5347C4.3421 18.5041 4.09135 18.5421 3.86265 18.6448C2.49679 19.2185 1.25786 17.595 2.19051 16.4362H2.20706C2.3595 16.234 2.45691 15.993 2.48912 15.7384C2.52133 15.4837 2.48715 15.2247 2.39015 14.9885C2.29316 14.7522 2.1369 14.5474 1.93772 14.3954C1.73854 14.2434 1.50374 14.1498 1.25786 14.1243C0.946728 14.0986 0.65352 13.9626 0.427229 13.7392C0.200937 13.5157 0.0552715 13.2183 0.0145711 12.8966C-0.0261292 12.5749 0.0406014 12.2485 0.203613 11.9718C0.366624 11.6951 0.616041 11.485 0.910188 11.3765C1.14513 11.292 1.35313 11.1419 1.51131 10.9425C1.6695 10.7432 1.77175 10.5023 1.80683 10.2465C1.8419 9.99067 1.80845 9.72974 1.71014 9.49238C1.61183 9.25503 1.45247 9.05045 1.24958 8.90112C0.0603195 8.00907 0.855002 6.12172 2.32572 6.34832C2.57235 6.39941 2.82773 6.37946 3.06424 6.29061C3.30075 6.20177 3.50941 6.04741 3.66765 5.84423C3.82589 5.64105 3.9277 5.39678 3.96207 5.13781C3.99644 4.87885 3.96206 4.61504 3.86265 4.37491C3.28044 3.0096 4.91119 1.77048 6.0701 2.69982C6.26735 2.86096 6.50167 2.96575 6.74985 3.00382C6.99804 3.04189 7.25148 3.01191 7.4851 2.91686C7.71872 2.82181 7.9244 2.66498 8.08178 2.4619C8.23917 2.25881 8.34279 2.01652 8.38241 1.75901C8.56176 0.281825 10.5899 0.038018 11.1417 1.41194C11.2409 1.65379 11.399 1.86458 11.6004 2.0235C11.8019 2.18243 12.0397 2.28399 12.2905 2.31817C12.5412 2.35234 12.7962 2.31795 13.0303 2.21838C13.2643 2.11881 13.4693 1.95751 13.6251 1.7504C14.4888 0.56292 16.3761 1.36031 16.1499 2.82602C16.1182 3.08417 16.1531 3.34643 16.251 3.58596C16.3489 3.82548 16.5062 4.03367 16.7069 4.1892C16.9076 4.34474 17.1445 4.44204 17.3933 4.47114C17.6421 4.50025 17.8938 4.46011 18.1228 4.35484C19.4886 3.78117 20.7276 5.40464 19.7977 6.56344C19.6396 6.7634 19.5373 7.00453 19.5018 7.26067C19.4662 7.51681 19.4988 7.77818 19.5961 8.01641C19.6933 8.25464 19.8515 8.46064 20.0534 8.61205C20.2553 8.76347 20.4932 8.85451 20.7414 8.87531C21.0536 8.90014 21.348 9.03594 21.5752 9.25988C21.8024 9.48382 21.9486 9.78224 21.989 10.105C22.0295 10.4277 21.9618 10.7551 21.7974 11.0321C21.633 11.3091 21.3819 11.5188 21.0863 11.626C20.8513 11.71 20.6431 11.8598 20.4848 12.0589C20.3265 12.258 20.2241 12.4986 20.189 12.7544C20.1539 13.0101 20.1874 13.2709 20.2859 13.5081C20.3843 13.7453 20.5438 13.9496 20.7469 14.0985C21.9361 14.9906 21.1415 16.8779 19.6735 16.6513Z"
                      fill="#F1437E"
                    />
                    <path
                      d="M9.04728 15.5705L5.24219 11.2938L6.49216 10.092L9.19076 13.1238L15.6558 7.43018L16.7568 8.78115L9.04728 15.5705Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1803_20920">
                      <rect
                        width="22"
                        height="22"
                        fill="white"
                        transform="translate(0 0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
                <Image
                  className="gap-2"
                  src={"/static/rabbitpop.png"}
                  alt="rabbit"
                  width={100}
                  height={100}
                />
              </div>
              {type === "collection_update" && (
                <>
                  <h3 className="text-[16px] font-bold text-[#161616] leading-normal font-inter mb-2 px-5 text-center">
                    Well Done!
                  </h3>
                  <p className="text-[#232323] text-[13px] font-normal font-inter leading-[160%] mb-7 px-5 text-center">
                    Your collection <span className="font-bold">"{data}"</span>{" "}
                    has been{" "}
                    <span className="font-bold">Updated Successfully!</span>
                  </p>
                </>
              )}

              {type === "post_updated" && (
                <>
                  <h3 className="text-[16px] font-bold text-[#161616] leading-normal font-inter mb-2 px-5 text-center">
                    Well Done!
                  </h3>
                  <p className="text-[#232323] text-[13px] font-normal font-inter leading-[160%] mb-7 px-5 text-center">
                    Your post has been successfully
                    <span className="font-bold">  updated!</span>
                  </p>
                </>
              )}

              {type === "post_creation" && (
                <>
                  <h3 className="text-[16px] font-bold text-[#161616] leading-normal font-inter mb-2 px-5 text-center">
                    Well Done!
                  </h3>
                  <p className="text-[#232323] text-[13px] font-normal font-inter leading-[160%] mb-7 px-5 text-center">
                    Your post has been successfully
                    <span className="font-bold">  published!</span>
                  </p>
                </>
              )}

              {type === "collection_creation" && (
                <>
                  <h3 className="text-[16px] font-bold text-[#161616] leading-normal font-inter mb-2 px-5 text-center">
                    Yayy!
                  </h3>
                  <p className="text-[#232323] text-[13px] font-normal font-inter leading-[160%] mb-7 px-5 text-center">
                    Your collection <br />{" "}
                    <span className="font-bold">"{data}"</span> is
                    <span className="font-bold"> published </span>now!
                  </p>
                </>
              )}

              {type === "link_creation" && (
                <>
                  <h3 className="text-[16px] font-bold text-[#161616] leading-normal font-inter  px-2 text-center">
                    Your Link is ready to share!
                  </h3>
                  <p className="text-[#919191] text-[11px] font-medium font-inter leading-[160%] mb-3 px-2 text-center">
                    CREATE, SHARE, EARN!
                  </p>
                  <div
                    style={{
                      boxShadow: "0px 0px 1.1px 0px rgba(0, 0, 0, 0.25)",
                    }}
                    className="p-[3px] rounded-[3px] bg-[#fff] mb-3"
                  >
                    <Image
                      src={"/static/rabbitpop.png"}
                      alt="product-image"
                      width={80}
                      height={80}
                    />
                  </div>
                  <p className="text-[11px] text-[#000] font-medium font-inter leading-[169%] mb-3">
                    {data}
                  </p>
                </>
              )}
              {id && <button className="bg-[rgba(222,44,109,1)] py-2 px-3 flex items-center justify-center gap-[7px] rounded-sm cursor-pointer" onClick={() => {
                handleShare(`${WEBSITE_URL}/preview/${uid}/${id}`)
                dispatch(closeModal())
              }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="12"
                  viewBox="0 0 13 12"
                  fill="none"
                >
                  <path
                    d="M10.5 8.32653C10.025 8.32653 9.58667 8.47959 9.24333 8.7352L5.79 6.44082C5.84782 6.14934 5.84782 5.85066 5.79 5.55918L9.24333 3.2648C9.58667 3.52041 10.025 3.67347 10.5 3.67347C11.6033 3.67347 12.5 2.85 12.5 1.83673C12.5 0.823469 11.6033 0 10.5 0C9.39667 0 8.5 0.823469 8.5 1.83673C8.5 2.01429 8.52667 2.18418 8.57833 2.34643L5.29833 4.52755C4.81167 3.9352 4.03833 3.55102 3.16667 3.55102C1.69333 3.55102 0.5 4.64694 0.5 6C0.5 7.35306 1.69333 8.44898 3.16667 8.44898C4.03833 8.44898 4.81167 8.0648 5.29833 7.47245L8.57833 9.65357C8.52667 9.81582 8.5 9.98724 8.5 10.1633C8.5 11.1765 9.39667 12 10.5 12C11.6033 12 12.5 11.1765 12.5 10.1633C12.5 9.15 11.6033 8.32653 10.5 8.32653ZM10.5 1.04082C10.9783 1.04082 11.3667 1.39745 11.3667 1.83673C11.3667 2.27602 10.9783 2.63265 10.5 2.63265C10.0217 2.63265 9.63333 2.27602 9.63333 1.83673C9.63333 1.39745 10.0217 1.04082 10.5 1.04082ZM3.16667 7.34694C2.35833 7.34694 1.7 6.74235 1.7 6C1.7 5.25765 2.35833 4.65306 3.16667 4.65306C3.975 4.65306 4.63333 5.25765 4.63333 6C4.63333 6.74235 3.975 7.34694 3.16667 7.34694ZM10.5 10.9592C10.0217 10.9592 9.63333 10.6026 9.63333 10.1633C9.63333 9.72398 10.0217 9.36735 10.5 9.36735C10.9783 9.36735 11.3667 9.72398 11.3667 10.1633C11.3667 10.6026 10.9783 10.9592 10.5 10.9592Z"
                    fill="white"
                  />
                </svg>
                <p className="text-[#fff] text-[14px] font-medium leading-normal font-inter ">
                  Share Link
                </p>
              </button>
              }
            </div>
            {/* )} */}
          </div>
        </Box>
      </Box>
    </Modal>
  );
};

export default FixedWidthModal;
