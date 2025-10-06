import { Box, Modal } from "@mui/material";
import { url } from "inspector";
import Image from "next/image";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface FixedWidthModalProps {
  open: any;
  onClose: () => void;
}

const InstagramNotConnectedModal: React.FC<FixedWidthModalProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter()
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
            className=" relative overflow-hidden [&::-webkit-scrollbar]:hidden scroll-smooth min-h-[300px] min-w-[300px]  px-[20px] pb-[30px] flex flex-col items-center justify-center gap-5 border-[4px] border-[#e4e4e4] rounded-[14px]"
          >
            {/* <Image
              src={"/static/Payment.png"}
              alt="payment"
              width={100}
              height={200}
            /> */}
            <img src="/static/InstaRabbit.gif" alt="Computer man" style={{
              width: '200px',
              height: '200px'
            }} />

            <div className="flex flex-col items-center justify-center w-full gap-4">
              <h1 className="text-[15px] font-bold text-[#000] leading-[27px] text-center font-inter ">
                Ooopsie!!
              </h1>

              <div className="flex flex-col items-center justify-center w-full gap-5">
                <div>
                  <ul className=" text-[12px] font-medium text-[#000] leading-normal text-center font-inter ">
                    <li><FiberManualRecordIcon sx={{ fontSize: '8px', margin: '0px 2px 1px 0px' }} /> Hit 1000+ followers on Instagram
                    </li>
                    {/* <li><FiberManualRecordIcon sx={{ fontSize: '8px', margin: '0px 2px 1px 0px' }} />
                      Make your account public

                    </li> */}
                    <p>
                      And we will roll out our red carpet for you.

                    </p>
                  </ul>
                </div>
                <button onClick={onClose} className="px-4 flex items-center justify-center py-2 text-[14px] font-medium font-inter leading-normal text-[#fff] bg-[rgba(222,44,109,1)] rounded-sm">
                  Try Another Account
                </button>

                <button onClick={() => router.push('/home')} className="text-[14px] font-bold text-[#000] leading-normal text-center font-inter underline ">
                  Skip
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Box>
    </Modal>
  );
};

export default InstagramNotConnectedModal;
