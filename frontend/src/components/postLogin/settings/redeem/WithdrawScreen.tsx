import React, { useState } from 'react';
import { ArrowLeft, Filter, ChevronDown, ChevronUp, Building, Check, X, Plus } from 'lucide-react';
import PopUpModal from './PopUpModal';
import { useGetUserPayInfoQuery, useRemoveUserPaymentInfoMutation } from '@/redux/api/pointsApi';
import { useSelector } from 'react-redux';
import OtpScreen from './OtpScreen';
import axios from 'axios';
import { BASE_URL } from '@/appConstants/baseURL';
import { showToast } from '@/components/Toast/Toast';
import Image from 'next/image';

interface BankAccount {
    id: string;
    accountHolder: string;
    accountNumber: string;
    bank: string;
    isSelected?: boolean;
}

interface WithdrawProps {
    setCurrentScreen: React.Dispatch<React.SetStateAction<'wallet' | 'withdraw'>>;
}

const WithdrawScreen: React.FC<WithdrawProps> = ({ setCurrentScreen }) => {
    // const [currentScreen, setCurrentScreen] = useState<'wallet' | 'withdraw'>('wallet');
    const withdrawableBalance = useSelector((state: any) => state.auth.user.balance);;
    const [totalBalance] = useState(withdrawableBalance);
    const [transferAmount, setTransferAmount] = useState<any>();
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [showUpiDropdown, setShowUpiDropdown] = useState(false);
    const [showAddBankModal, setShowAddBankModal] = useState(false);
    const [showOtpScreen, setShowOtpScreen] = useState<boolean>(false)

    const { data = [], isLoading, isFetching } = useGetUserPayInfoQuery()
    const [removePayment, removePaymentState] = useRemoveUserPaymentInfoMutation()
    const userInfo = useSelector((state: any) => (
        state.auth.user
    ))

    const handleWithdrawClick = () => {
        setCurrentScreen('withdraw');
    };

    const handleBackToWallet = () => {
        setCurrentScreen('wallet');
    };

    const handleAccountSelect = (accountId: string) => {
        setSelectedAccount(accountId);
    };

    const handleTransfer = async (e: any) => {
        let phoneNumber = userInfo.mobile
        await axios.post(`${BASE_URL}/user/auth/sendloginotp`, {
            mobile: phoneNumber
        }).then(() => {
            showToast({
                message: "OTP sent. Please Verify",
                type: "success"
            })
        })
        setShowOtpScreen(true)
    };

    const removePaymentMethod = async (r_id: any) => {
        let obj: any = {}
        obj.rid = r_id
        await removePayment(obj).unwrap()
        showToast({
                message: "Account removed. Successfully",
                type: "success"
            });
    }

    return showOtpScreen ? (
      <OtpScreen
        setShowOtpScreen={setShowOtpScreen}
        selectedAccount={selectedAccount}
        transferAmount={transferAmount}
      />
    ) : (
      <div className="mx-auto bg-white h-screen overflow-y-scroll [&::-webkit-scrollbar]:hidden scroll-smooth font-inter">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b-2 border-[#F0F2F5]">
          <div className="flex items-center gap-3">
            <button onClick={handleBackToWallet}>
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <span className="text-lg font-medium text-gray-900">Withdrawn</span>
          </div>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm font-medium text-gray-900">
              ₹{totalBalance}
            </span>
          </div>
        </div>

        <div className="py-4">
          <div
            style={{
              background: "linear-gradient(90deg, #FFF 40%, #FFEDE4 100%)",
            }}
            className=" px-[15px] py-[10px] gap-1"
          >
            <div className="text-[12px] font-inter font-normal text-[#6e6e6e]">
              Withdrawable Balance
            </div>
            <div className="text-[12px] font-inter font-medium text-[#000]">
              ₹{withdrawableBalance}
            </div>
          </div>
        </div>
        <div className="p-4 space-y-6">
          {/* Withdrawable Balance */}

          {/* Transfer Amount */}
          <div>
            <label className="block text-sm font-medium text-[#000] mb-2">
              Transfer Amount
            </label>
            <div className="relative w-full">
             
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[21px] font-medium text-gray-900 pointer-events-none">
                  ₹
                </div>
       
              <input
                type="text" // use text to avoid spinner arrows
                inputMode="numeric" // show numeric keyboard on mobile
                pattern="[0-9]*" // enforce only digits
                value={transferAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Accept only digits
                  if (/^\d*$/.test(value)) {
                    setTransferAmount(value);
                  }
                }}
                placeholder="Enter Amount"
                className={`w-full pl-10 pr-4 py-4 border ${
                  transferAmount < 600 ? "border-red-700" : "border-gray-200"
                } rounded-lg text-left text-[21px] font-medium text-[#000] placeholder:text-[18px] placeholder:font-normal placeholder:text-[#ababab]  appearance-none`}
              />
            </div>
            {transferAmount < 600 && (
              <span className="text-[12px] text-red-700">
                Redemption Amount must be Greater than 600
              </span>
            )}
          </div>

          {/* Select Mode of Payment */}
          <div>
            <span className="block text-[12px] font-normal text-gray-900 mb-3">
              Select mode of payment
            </span>

            {/* Bank Account Section */}
            <div
              className={`space-y-3 border-1 ${
                showBankDropdown ? "border-[#F1437E]" : "border-[#C2C2C2]"
              } rounded-[10px]`}

            >
              <button
                onClick={() => {
                  setShowBankDropdown(!showBankDropdown);
                  setShowUpiDropdown(false);
                  setSelectedAccount("");
                }}
                              style={{
background: 'linear-gradient(95deg, #FFF9F6 28.82%, #FFECE2 101.03%)'
              }}
                className={`w-full flex items-center justify-between p-4 cursor-pointer ${showBankDropdown ? "rounded-t-[10px]" : "rounded-[10px]"}`}
              >
                <div className="flex items-center gap-3">
                  {/* <Building className="w-5 h-5 text-gray-600" /> */}
                  <div className="bg-[#fff] p-[9px] rounded-full border-[0.5px] border-[#c2c2c2]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M17.305 7.85139C17.9767 7.85139 18.2572 6.93986 17.7115 6.51968L9.40868 0.141208C9.2901 0.0494613 9.14694 0 8.99995 0C8.85296 0 8.70979 0.0494613 8.59122 0.141208L0.288382 6.51968C-0.257313 6.93756 0.0231439 7.85139 0.697111 7.85139H2.04287V16.4387H0.477528C0.381868 16.4387 0.303601 16.5213 0.303601 16.6224V17.8163C0.303601 17.9173 0.381868 18 0.477528 18H17.5224C17.618 18 17.6963 17.9173 17.6963 17.8163V16.6224C17.6963 16.5213 17.618 16.4387 17.5224 16.4387H15.957V7.85139H17.305ZM8.99995 1.75993L14.8939 6.28777H3.106L8.99995 1.75993ZM3.60821 7.85139H6.15189V16.4387H3.60821V7.85139ZM7.71724 7.85139H10.2609V16.4387H7.71724V7.85139ZM14.3917 16.4387H11.8263V7.85139H14.3917V16.4387Z"
                        fill="black"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-[#000]">
                    To Bank A/c
                  </span>
                </div>
                {showBankDropdown ? (
                                    <svg
                                    className='rotate-180'
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.334735 0.366117C0.781049 -0.122039 1.50467 -0.122039 1.95098 0.366117L8 6.98223L14.049 0.366117C14.4953 -0.122039 15.219 -0.122039 15.6653 0.366117C16.1116 0.854272 16.1116 1.64573 15.6653 2.13388L8.80812 9.63388C8.36181 10.122 7.63819 10.122 7.19188 9.63388L0.334735 2.13388C-0.111578 1.64573 -0.111578 0.854272 0.334735 0.366117Z"
                      fill="black"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.334735 0.366117C0.781049 -0.122039 1.50467 -0.122039 1.95098 0.366117L8 6.98223L14.049 0.366117C14.4953 -0.122039 15.219 -0.122039 15.6653 0.366117C16.1116 0.854272 16.1116 1.64573 15.6653 2.13388L8.80812 9.63388C8.36181 10.122 7.63819 10.122 7.19188 9.63388L0.334735 2.13388C-0.111578 1.64573 -0.111578 0.854272 0.334735 0.366117Z"
                      fill="black"
                    />
                  </svg>
                )}
              </button>

              {showBankDropdown && (
                <div className="space-y-2 px-4">
                  {data.Bank?.map((account: any) => (
                    <div className="flex items-center" key={account.r_id}>
                      <div style={{
                        boxShadow: '0px 0px 1.6px 0px rgba(0, 0, 0, 0.25)'
                      }} className=" bg-[#fff] p-[9px]  rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-medium text-[#000]">
                          {account.details.account_holder_name
                            .split(" ")
                            .map((n: any) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div
                        key={account.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer flex-col w-full"
                        onClick={() => handleAccountSelect(account.r_id)}
                      >
                        <div className="flex w-full">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-[#000]">
                              {account.details.account_holder_name}
                            </div>
                            <div className="text-xs text-[#000] font-medium">
                              {account.details.account_number} |{" "}
                              {account.details.bank_name}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedAccount === account.r_id ? (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ): (
                                <div className='h-5 w-5 border-[1px] border-[#dddde3] bg-[#f5f5fa] rounded-full' />
                            )}
                          </div>
                        </div>
                        <div onClick={() => removePaymentMethod(account.r_id)} className="flex cursor-pointer">
                          <button
                            
                          >
                            <X className="w-3 h-3 text-[#000]" />
                          </button>
                          <span className="text-[9px] font-normal">Remove</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    className="flex items-center gap-2 p-3 text-[rgba(222,44,109,1)] hover:bg-pink-50 rounded-lg w-full"
                    onClick={() => {
                      setShowAddBankModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Add new Bank A/c
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleTransfer(e)}
                    className="w-full mb-4 bg-[rgba(222,44,109,1)] hover:bg-pink-600 text-white font-medium py-4 rounded-lg  transition-colors disabled:bg-gray-600"
                    disabled={
                      selectedAccount == "" ||
                      transferAmount > withdrawableBalance ||
                      transferAmount <= 0
                    }
                  >
                    {transferAmount >= 0
                      ? `Transfer ₹${transferAmount}`
                      : "Enter amount"}
                  </button>
                </div>
              )}
            </div>

            {/* Transfer Button */}

            {/* UPI Section */}
            <div
              className={`mt-4 border-[#C2C2C2] rounded-[10px] space-y-3 border-1 ${
                showUpiDropdown ? "border-[#F1437E]" : "border-[#C2C2C2]"
              }`}
            >
              <button
                onClick={() => {
                  setShowUpiDropdown(!showUpiDropdown);
                  setShowBankDropdown(false);
                  setSelectedAccount("");
                }}
                className={`w-full flex items-center justify-between p-4 cursor-pointer ${showUpiDropdown ? "rounded-t-[10px]" : "rounded-[10px]"}`}
              
                              style={{
background: 'linear-gradient(95deg, #FFF9F6 28.82%, #FFECE2 101.03%)'
              }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#fff] px-[9px] py-3.5 rounded-full border-[0.5px] border-[#c2c2c2]">
                    <Image 
                    src={'/static/upi.png'}
                    alt='upi-img'
                    width={20}
                    height={20}
                    />
                  </div>
                  <div className='flex flex-col items-start justify-center'>
                    <div className="text-sm font-medium text-[#000]">
                      To UPI
                    </div>
                    <div className="text-[10px] text-[#000] font-normal">
                      Transfer to Gpay, Phonepe, Bhim or any UPI app
                    </div>
                  </div>
                </div>
                {showUpiDropdown ? (
                                             <svg
                                    className='rotate-180'
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.334735 0.366117C0.781049 -0.122039 1.50467 -0.122039 1.95098 0.366117L8 6.98223L14.049 0.366117C14.4953 -0.122039 15.219 -0.122039 15.6653 0.366117C16.1116 0.854272 16.1116 1.64573 15.6653 2.13388L8.80812 9.63388C8.36181 10.122 7.63819 10.122 7.19188 9.63388L0.334735 2.13388C-0.111578 1.64573 -0.111578 0.854272 0.334735 0.366117Z"
                      fill="black"
                    />
                  </svg>
                ) : (
                      <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.334735 0.366117C0.781049 -0.122039 1.50467 -0.122039 1.95098 0.366117L8 6.98223L14.049 0.366117C14.4953 -0.122039 15.219 -0.122039 15.6653 0.366117C16.1116 0.854272 16.1116 1.64573 15.6653 2.13388L8.80812 9.63388C8.36181 10.122 7.63819 10.122 7.19188 9.63388L0.334735 2.13388C-0.111578 1.64573 -0.111578 0.854272 0.334735 0.366117Z"
                      fill="black"
                    />
                  </svg>
                )}
              </button>
              {showUpiDropdown && (
                <div className="space-y-2 p-4">
                  {data.UPI?.map((account: any) => (
                    <div className="flex items-center" key={account.r_id}>
                      <div style={{
                        boxShadow: '0px 0px 1.6px 0px rgba(0, 0, 0, 0.25)'
                      }} className="bg-[#fff] p-[9px]  rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-medium text-[#000]">
                          {account.details?.name
                            ?.split(" ")
                            ?.map((n: any) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div
                        key={account.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer flex-col w-full"
                        onClick={() => handleAccountSelect(account.r_id)}
                      >
                        <div className="flex w-full">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-[#000]">
                              {account.details?.name}
                            </div>
                            <div className="text-xs text-[#000] font-medium">
                              {account.details.upi}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                                            {selectedAccount === account.r_id ? (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ): (
                                <div className='h-5 w-5 border-[1px] border-[#dddde3] bg-[#f5f5fa] rounded-full' />
                            )}
                          </div>
                        </div>
                      <div onClick={() => removePaymentMethod(account.r_id)} className="flex cursor-pointer">
                          <button
                            
                          >
                            <X className="w-3 h-3 text-[#000]" />
                          </button>
                          <span className="text-[9px] font-normal">Remove</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    className="flex items-center gap-2 p-3 text-[#F1437E] hover:bg-pink-50 rounded-lg w-full"
                    onClick={() => {
                      setShowAddBankModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add new UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleTransfer(e)}
                    className="w-full bg-[#F1437E] hover:bg-pink-600 text-white font-medium py-4 rounded-lg mt-6 transition-colors disabled:bg-gray-600"
                    disabled={
                      selectedAccount == "" ||
                      transferAmount > withdrawableBalance ||
                      transferAmount <= 600 ||
                      transferAmount == null
                    }
                  >
                    {transferAmount >= 0
                      ? `Transfer ₹${transferAmount}`
                      : "Enter amount"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {showAddBankModal && (
          <PopUpModal
            setShowAddBankModal={setShowAddBankModal}
            type={showBankDropdown == true ? "bank" : "upi"}
          />
        )}
      </div>
    );
}

export default WithdrawScreen