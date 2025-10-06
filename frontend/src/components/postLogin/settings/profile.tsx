"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Edit3 } from 'lucide-react';
import { useGetUserProfileQuery, useUpdateProfileMutation, useUpdateProfilePictureMutation, useSendverificationemailMutation } from "@/redux/api/pointsApi";
import { CDN_URL } from "@/appConstants/baseURL";
import { showToast } from "@/components/Toast/Toast";
import { CropDialog } from "./CropDialog";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];


const profile = ({changeTab}: any) => {
  const router = useRouter();
  const [isEmailValid, setIsEmailValid] = useState(false);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [emailInputValue, setEmailInputValue] = useState('');
  const [previewUrl, setPreviewUrl] = useState<any>('');
  const [userProfile, setUserProfile] = useState<any>({
    name: '',
    gender: '',
    birthday: '',
    phone: '',
    email: '',
    isEmailVerified: 0,
    state: '',
    username: ''
  })
  const fileInputRef: any = useRef(null);

  const { data, isLoading } = useGetUserProfileQuery()
  const [updateProfile, updateProfileState] = useUpdateProfileMutation()
  const [updateProfilePic, updateProfilePicState] = useUpdateProfilePictureMutation()
  const [sendVerificationMail, sendVerificationMailState] = useSendverificationemailMutation()

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (data?.length) {
      let profile = data[0]
      setUserProfile({
        name: profile.name,
        gender: profile.gender,
        birthday: profile.birthday,
        phone: profile.mobile,
        email: profile.email,
        isEmailVerified: profile.isEmailVerified,
        state: profile.state,
        username: profile.username
      })
      setPreviewUrl(profile.profile_image || '')
    }
  }, [data])

  const handleContinue = async (): Promise<void> => {
    let obj: any = {}
    obj.name = userProfile.name
    obj.bday = userProfile.birthday
    obj.gender = userProfile.gender
    obj.email = userProfile.email
    obj.state = userProfile.state
    await updateProfile(obj).unwrap().then(() => {
      showToast({
        message: "Profile updated successfully.",
        type: "success"
      })
    })
      .catch(() => {
        showToast({
          message: "Error updating profile",
          type: "error"
        })
      })

      changeTab("Settings")
  };

  const handleFileChange = (e: any) => {
  const file = e.target.files[0];
  if (file) setSelectedFile(file); // open crop modal
  
  // Clear the input value to allow selecting the same file again
  e.target.value = '';
};



  const handleCroppedSave = async (croppedFile: File) => {
  await handleUpload(croppedFile); // your existing upload
  setPreviewUrl(URL.createObjectURL(croppedFile)); // update preview immediately
};

// Image compression function
const compressImage = (file: File, maxSizeMB: number = 2, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions to reduce file size
      let { width, height } = img;
      const maxDimension = 1200; // Reduced max dimension for smaller file sizes
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas to Blob conversion failed'));
            return;
          }
          
          // Create new file with compressed data
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          
          // Check if still too large, reduce quality further
          if (compressedFile.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
            // Recursively compress with lower quality
            compressImage(file, maxSizeMB, quality - 0.1)
              .then(resolve)
              .catch(reject);
          } else {
            resolve(compressedFile);
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
};

// Updated handleUpload function
const handleUpload = async (file: any) => {
  if (!file) return;
  
  const maxSizeMB = 2; // Updated to 2MB
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  try {
    let processedFile = file;
    
    // Check if file is larger than 2MB
    if (file.size > maxSizeBytes) {
      processedFile = await compressImage(file, maxSizeMB);
    }
    
    const formData = new FormData();
    formData.append('image', processedFile);
    
    const res = await updateProfilePic(formData).unwrap();
  } catch (err) {
    console.error('Upload error:', err);
    showToast({
      type: 'error',
      message: 'Error uploading profile image'
    });
  }
};

  const handleEditClick = () => {
  // Optional: Clear the input value before clicking (extra safety)
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
  fileInputRef.current?.click();
};

const handleChange = (e: any, field: string) => {
  const value = e.target.value;
  
  // If the field is email, handle it specially
  if (field === 'email') {
    // Always update the input value to show what user is typing
    setEmailInputValue(value);
    
    const isValid = emailRegex.test(value);
    setIsEmailValid(isValid);
    
    // Only update userProfile if email is valid or empty
    if (isValid || value === '') {
      setUserProfile((prev: any) => ({
        ...prev,
        [field]: value
      }));
    }
  } else {
    // For non-email fields, update normally
    setUserProfile((prev: any) => ({
      ...prev,
      [field]: value
    }));
  }
};

  function getDateWithOffset(isoDateStr: string, offsetMinutes = 330) {
    const date = new Date(isoDateStr);

    date.setMinutes(date.getMinutes() + offsetMinutes);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months 0-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const verifyEmail = async () => {
    let obj: any = {}
    obj.email = userProfile.email
    await sendVerificationMail(obj).unwrap()
      .then(() => {
        showToast({
          message: "Email sent. Please Verify",
          type: "success"
        })
      })
      .catch(() => {
        showToast({
          message: "Error sending mail.",
          type: "error"
        })
      })
  }

  return (
    <div className="min-h-screen font-inter">
      <div className="pb-20  flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-start gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <svg
            onClick={() => changeTab("Settings")}
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
            My Profile
          </p>
        </div>

        <div className=" py-5 w-full flex flex-col items-center justify-center gap-[26px]">
          {/* Profile Header with Background and Avatar */}
          <div className="px-[15px] w-full">
            <div
              style={{
                background:
                  "linear-gradient(106deg, #FFBAD1 -26.81%, #FFFAFA 57.21%)",
              }}
              className="flex flex-col items-center justify-center gap-3 rounded-[8px] p-[14px] w-full "
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={previewUrl == '' ? "/images/profileImage.webp" : `${CDN_URL + "/images" + previewUrl}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Edit Button */}
                <button
                  onClick={handleEditClick}
                  className="absolute -bottom-1 -right-1 cursor-pointer bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:bg-gray-50"
                  aria-label="Edit profile picture"
                >
                  <Edit3 size={16} className="text-gray-600" />
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="flex flex-col items-center justify-center w-full">
                <h3 className="text-[#000] text-[16px] font-medium font-inter leading-normal m-0 ">
                  {userProfile.name}
                </h3>
                <p className="text-[#000] text-[14px] font-medium font-inter leading-normal m-0 ">
                  {userProfile.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form className="space-y-4 w-full px-[15px]">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                onChange={(e) => handleChange(e, 'name')}
                value={userProfile.name || ''}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    onChange={(e) => handleChange(e, 'gender')}
                    type="radio"
                    name="gender"
                    value="female"
                    checked={userProfile.gender === 'female'}
                    className="h-4 w-4 text-[rgba(222,44,109,1)]"
                  />
                  <span className="ml-2 text-sm">Female</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    onChange={(e) => handleChange(e, 'gender')}
                    name="gender"
                    value="male"
                    checked={userProfile.gender === 'male'}
                    className="h-4 w-4 text-[rgba(222,44,109,1)]"
                  />
                  <span className="ml-2 text-sm">Male</span>
                </label>
              </div>
            </div>

            {/* Email */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email id
  </label>
  <input
    type="email"
    onChange={(e) => handleChange(e, 'email')}
    value={emailInputValue || userProfile.email || ''}
    className="w-full p-2 border border-gray-300 rounded"
    placeholder="Add your E-mail address"
    disabled={userProfile.isEmailVerified}
  />
  
  {/* Show verification option only if email is valid and not verified */}
  {userProfile.isEmailVerified == 0 && isEmailValid && userProfile.email ? (
    <div>
      <span className="text-[14px]">Email Not Verified.{' '}</span>
      <button
        type="button"
        onClick={verifyEmail}
        disabled={!isEmailValid}
        className={`text-[14px] underline ${
          isEmailValid 
            ? "cursor-pointer text-[rgba(222,44,109,1)]" 
            : "cursor-not-allowed text-gray-400 opacity-50"
        }`}
      >
        Verify Now
      </button>
    </div>
  ) : null}
  
  {/* Show error message if email format is incorrect */}
  {emailInputValue && !isEmailValid && (
    <div>
      <span className="text-red-500 text-[14px]">
        The email you entered is not correct
      </span>
    </div>
  )}
</div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                disabled
                value={userProfile.phone}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Add your website link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthday
              </label>
              <input
                type="date"
                onChange={(e) => handleChange(e, 'birthday')}
                value={
                  userProfile.birthday
                    ? getDateWithOffset(userProfile.birthday)
                    : ""
                }
                max={new Date().toISOString().split("T")[0]} // disables future dates
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Select your birthday"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={userProfile.state || ''}
                onChange={(e) => handleChange(e, 'state')}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select your state</option>
                {indianStates.map((state: any) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </form>

          <div className="w-full flex flex-col items-start justify-center gap-[14px] px-[15px] pt-5 pb-[53px] bg-[#f9f8f4] rounded-[14px]">
            <h3 className="text-[14px] font-medium leading-[10px] font-inter text-[#000]">
              Social Media Links
            </h3>

            <div className="flex flex-col items-start justify-center gap-[5px] w-full">
              <label className="text-[#000] text-[13px] font-normal font-inter leading-normal">
                Instagram
              </label>
              <div className="flex items-center justify-start gap-3 border-[0.5px] border-[#000] rounded-[5px] p-2 bg-[#fff] w-full overflow-hidden cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-pink-500"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                {
                  userProfile.username ?
                    <span>@{userProfile.username}</span>
                    :
                    <span className="cursor-pointer" onClick={() => router.push("/verification")}>Connect Your Instagram</span>
                }
              </div>
            </div>
          </div>

          <div
            style={{
              boxShadow: "0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)",
            }}
            className="w-full fixed bottom-0 max-w-[450px] px-[15px] py-[21px] rounded-t-[14px] bg-[#fff] z-50 "
          >
            <button
              onClick={handleContinue}
              className={
                " py-3 w-full rounded-[7px] text-white text-[16px] font-semibold font-inter leading-normal bg-[rgba(222,44,109,1)] hover:bg-[#e03d73] transition-color cursor-pointer"
              }
              type="button"
            >
              Update Profile
            </button>
          </div>
        </div>
        <CropDialog
  file={selectedFile}
  onClose={() => setSelectedFile(null)}
  onSave={handleCroppedSave}
/>
      </div >
    </div >
  );
};

export default profile;
