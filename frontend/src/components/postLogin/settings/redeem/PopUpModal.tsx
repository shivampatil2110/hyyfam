import React, { useState } from 'react'
import { X } from 'lucide-react';
import { useAddUserPaymentInfoMutation } from '@/redux/api/pointsApi';
import { showToast } from '@/components/Toast/Toast';

const PopUpModal = ({ setShowAddBankModal, type }: any) => {
    const [bankForm, setBankForm] = useState({
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        branch: ''
    });
    const [upiForm, setUpiForm] = useState({
        upiId: '',
        receiver_name: ''
    });

    const [addUserPayment, addUserPaymentState] = useAddUserPaymentInfoMutation()

    const handleCloseBankModal = () => {
        setShowAddBankModal(false);
        setBankForm({
            accountHolderName: '',
            accountNumber: '',
            bankName: '',
            ifscCode: '',
            branch: ''
        });
        setUpiForm({
            upiId: '',
            receiver_name: ''
        })
    };

    const handleBankFormChange = (field: string, value: string) => {
        setBankForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpiChange = (field: string, value: string) => {
        setUpiForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveBankAccount = async () => {
        let obj: any = {}
        obj.type = "bank"
        obj.m_id = 2
        obj.bank = bankForm.bankName
        obj.branch = bankForm.branch
        obj.account = bankForm.accountNumber
        obj.accountHolder = bankForm.accountHolderName
        obj.ifsc = bankForm.ifscCode
        await addUserPayment(obj).unwrap()
            .then(() => {
                showToast({
                    message: "Bank account added successfully.",
                    type: "success"
                })
            })
            .catch(() => {
                showToast({
                    message: "Error adding bank details",
                    type: "error"
                })
            })
        handleCloseBankModal();
    };

    const handleSaveUPIAccount = async () => {
        let obj: any = {}
        obj.type = "upi"
        obj.m_id = 3
        obj.upi = upiForm.upiId
        obj.receiver_name = upiForm.receiver_name
        await addUserPayment(obj).unwrap()
            .then(() => {
                showToast({
                    message: "UPI added successfully",
                    type: "success"
                })
            })
            .catch(() => {
                showToast({
                    message: "Error adding UPI details",
                    type: "error"
                })
            })
        handleCloseBankModal()
    }


    return (
        type == 'bank' ?
            <div  className='mx-auto bg-white max-w-[448px] font-inter'>
                <div style={{
                boxShadow: '0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)'
            }} className="absolute  max-w-[448px]  mx-auto bottom-0 left-0 right-0 bg-white rounded-t-3xl transform transition-transform duration-300 ease-out translate-y-0">
                    {/* Handle Bar */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                    </div>

                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 pt-4 pb-1">
                        <h2 className="text-[15px] font-bold text-[#000]">Add Back Account</h2>
               
                    </div>

                             <button
                            onClick={handleCloseBankModal}
                            className="p-1 hover:bg-gray-100 rounded-full absolute top-4 right-4 transition-colors"
                        >
                            <X className="w-6 h-6 text-[#000]" />
                        </button>

                    {/* Modal Content */}
                    <div className="px-6 pb-8 max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                        <p className="text-[12px] text-[#000] mb-6">
                            Kindly provide your bank account information to add an account.
                        </p>

                        <div className="space-y-4">
                            {/* Account Holder Name */}
                            <div>
                                <label className="block text-[13px] font-normal text-[#000] mb-1.5">
                                    Account Holder Name
                                </label>
                                <input
                                    type="text"
                                    value={bankForm.accountHolderName}
                                    onChange={(e) => handleBankFormChange('accountHolderName', e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full py-2 px-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#F1437E] text-[14px] focus:border-transparent placeholder-gray-400"
                                />
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="block text-[13px] font-normal text-[#000] mb-1.5">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={bankForm.accountNumber}
                                    onChange={(e) => handleBankFormChange('accountNumber', e.target.value)}
                                    placeholder="Enter your bank account Number"
                                    className="w-full py-2 px-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#F1437E] text-[14px] focus:border-transparent placeholder-gray-400"
                                />
                            </div>

                            {/* Bank Number */}
                            <div>
                                <label className="block text-[13px] font-normal text-[#000] mb-1.5">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    value={bankForm.bankName}
                                    onChange={(e) => handleBankFormChange('bankName', e.target.value)}
                                    placeholder="Enter your bank name"
                                    className="w-full py-2 px-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#F1437E] text-[14px] focus:border-transparent placeholder-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-normal text-[#000] mb-1.5">
                                    Branch
                                </label>
                                <input
                                    type="text"
                                    value={bankForm.branch}
                                    onChange={(e) => handleBankFormChange('branch', e.target.value)}
                                    placeholder="Enter your branch name"
                                    className="w-full py-2 px-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#F1437E] text-[14px] focus:border-transparent placeholder-gray-400"
                                />
                            </div>

                            {/* IFSC Code */}
                            <div>
                                <label className="block text-[13px] font-normal text-[#000] mb-1.5">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    value={bankForm.ifscCode}
                                    onChange={(e) => handleBankFormChange('ifscCode', e.target.value)}
                                    placeholder="Enter IFSC Number"
                                    className="w-full py-2 px-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#F1437E] text-[14px] focus:border-transparent placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSaveBankAccount}
                            className="w-full bg-[#F1437E] hover:bg-pink-600 text-white font-medium py-3 rounded-lg mt-6 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div> :
            <div className='mx-auto bg-white max-w-[448px] font-inter'>
                <div style={{
                boxShadow: '0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)'
            }} className="absolute max-w-[448px] mx-auto bottom-0 left-0 right-0 bg-white rounded-t-3xl transform transition-transform duration-300 ease-out translate-y-0">
                    {/* Handle Bar */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                    </div>

                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 pt-4 pb-1">
                        <h2 className="text-[15px] font-bold text-[#000]">Add UPI</h2>
   
                    </div>
                                         <button
                            onClick={handleCloseBankModal}
                            className="p-1 hover:bg-gray-100 absolute top-4 right-4 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>

                    {/* Modal Content */}
                    <div className="px-6 pb-8 max-h-[80vh] overflow-y-auto">
                        <p className="text-[12px] text-[#000] mb-6">
                            Kindly provide your UPI information to add an account.
                        </p>

                        <div className="space-y-4">
                            {/* Account Holder Name */}
                            <div>
                                <label className="block text-[13px] font-normal text-[#000] mb-1.5">
                                    Enter Receiver Name
                                </label>
                                <input
                                    type="text"
                                    value={upiForm.receiver_name}
                                    onChange={(e) => handleUpiChange('receiver_name', e.target.value)}
                                    placeholder="Enter UPI ID"
                                    className="w-full py-2 px-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#F1437E] text-[14px] focus:border-transparent placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-normal text-[#000] mb-1.5">
                                    Enter UPI ID
                                </label>
                                <input
                                    type="text"
                                    value={upiForm.upiId}
                                    onChange={(e) => handleUpiChange('upiId', e.target.value)}
                                    placeholder="Enter UPI ID"
                                    className="w-full py-2 px-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#F1437E] text-[14px] focus:border-transparent placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSaveUPIAccount}
                            className="w-full bg-[#F1437E] hover:bg-pink-600 text-white font-medium py-3 rounded-lg mt-6 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
    )
}

export default PopUpModal
