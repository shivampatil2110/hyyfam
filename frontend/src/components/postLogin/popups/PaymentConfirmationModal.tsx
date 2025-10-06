import { Box, Modal } from "@mui/material";
import { url } from "inspector";
import Image from "next/image";
import { ReactNode } from "react";

interface FixedWidthModalProps {
  open: any;
  onClose: () => void;
}

const PaymentConfirmationModal: React.FC<FixedWidthModalProps> = ({
  open,
  onClose,
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
        sx={{ maxWidth: "320px", minWidth: "300px", minHeight: "300px" }} // Ensure MUI also respects the fixed width
      >
        <Box className="relative w-full bg-[#fff] rounded-[14px] ">
          <div
            // style={{ backgroundImage: "url('/static/Vector.png')" }}
            id="fixed-width-modal-description"
            className=" relative overflow-hidden [&::-webkit-scrollbar]:hidden scroll-smooth min-h-[300px] min-w-[300px]  px-[20px] py-[30px] flex flex-col items-center justify-center gap-5 border-[4px] border-[#e4e4e4] rounded-[14px]"
          >
            <Image
              src={"/static/Payment.png"}
              alt="payment"
              width={100}
              height={200}
            />

            <div className="flex flex-col items-center justify-center w-full gap-4">
              <h1 className="text-[15px] font-bold text-[#000] leading-[27px] text-center font-inter ">
                Payment Transfer Initiated
              </h1>

              <div className="flex flex-col items-center justify-center w-full gap-6">
                <h3 className="text-[#919191] text-center text-[14px] font-medium font-inter leading-normal">
                  Your withdrawal request is being processed. It may take up to
                  24-48 hours to reflect in your account.
                </h3>
                <button onClick={onClose} className="w-[104px] flex items-center justify-center py-2 text-[14px] font-medium font-inter leading-normal bg-[#EEF1F4] rounded-sm">
                  Okay
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Box>
    </Modal>
  );
};

export default PaymentConfirmationModal;
