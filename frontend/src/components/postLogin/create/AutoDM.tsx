"use client";
import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Switch from "@mui/material/Switch";
import { styled, useTheme } from "@mui/material/styles";
import { X, Plus } from "lucide-react";
import {
  useGetUserSettingQuery,
  useUpdateUserSettingMutation,
} from "@/redux/api/postsApi";
import { ProgressBarLoading } from "../LoadingStatesAndModals/CommonLoading";
import { showToast } from "@/components/Toast/Toast";

interface TagInputProps {
  initialTags?: string[];
  placeholder?: string;
  onTagsChange?: (tags: string[]) => void;
  maxTags?: number;
  tags: any;
  setTags: (value: any) => void;
}

interface ReplyInputProps {
  initialTags?: string[];
  placeholder?: string;
  onTagsChange?: (tags: string[]) => void;
  maxTags?: number;
  autoReply: any;
  setAutoReply: (value: any) => void;
}

const ToggleSwitch = styled(Switch)(({ theme }) => ({
  width: 50,
  height: 22,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 28,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(26px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(26px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "rgba(222,44,109,1) !important",
        opacity: "1 !important", // Force full opacity
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    width: 18,
    height: 18,
    borderRadius: "50%",
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 34 / 2,
    backgroundColor: "#b0b0b0",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    "&.Mui-checked": {
      backgroundColor: "rgba(222,44,109,1) !important",
      opacity: "1 !important",
    },
  },
}));

const TagInput = ({
  initialTags = [],
  placeholder = "Add word",
  onTagsChange,
  maxTags = 10,
  tags,
  setTags,
}: TagInputProps) => {
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
    setTags(tags.filter((_: any, index: any) => index !== indexToRemove));
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
      <div className="flex items-center justify-start gap-3 w-full">
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
              // addTag();
              setInputValue("");
            }}
            className="flex-shrink-0 ml-2 text-[#000] bg-[#eaeaea] p-1 rounded-[21px] cursor-pointer transition-colors"
            aria-label="Add tag"
          >
            <X size={12} />
          </button>
        </div>

        <svg
          onClick={(e) => {
            e.stopPropagation();
            addTag();
          }}
          className="scale-125 cursor-pointer"
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
      </div>

      {/* Tags container */}
      {tags.length > 0 && (
        <div className="flex gap-2 items-center justify-start overflow-hidden overflow-x-scroll [&::-webkit-scrollbar]:hidden  scroll-smooth mt-2">
          {tags.map((tag: any, index: any) => (
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
const ReplyInput = ({
  initialTags = [],
  placeholder = "Add word",
  onTagsChange,
  maxTags = 10,
  autoReply,
  setAutoReply,
}: ReplyInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onTagsChange) {
      onTagsChange(autoReply);
    }
  }, [autoReply, onTagsChange]);

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (
      trimmedValue &&
      !autoReply.includes(trimmedValue) &&
      autoReply.length < maxTags
    ) {
      const newTags = [...autoReply, trimmedValue];
      setAutoReply(newTags);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setAutoReply(
      autoReply.filter((_: any, index: any) => index !== indexToRemove)
    );
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
      <div className="flex items-center justify-start gap-3 w-full">
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
              // addTag();
              setInputValue("");
            }}
            className="flex-shrink-0 ml-2 text-[#000] bg-[#eaeaea] p-1 rounded-[21px] cursor-pointer transition-colors"
            aria-label="Add tag"
          >
            <X size={12} />
          </button>
        </div>

        <svg
          onClick={(e) => {
            e.stopPropagation();
            addTag();
          }}
          className="scale-125 cursor-pointer"
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
      </div>

      {/* Tags container */}
      {autoReply.length > 0 && (
        <div className="flex gap-2 items-center justify-start overflow-hidden overflow-x-scroll [&::-webkit-scrollbar]:hidden  scroll-smooth mt-2">
          {autoReply.map((tag: any, index: any) => (
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

const AutoDM = () => {
  const router = useRouter();
  const [activeStates, setActiveStates] = useState<any>({
    engage_dm: true,
    engage_comment: false,
    engage_post_dm: true
  });
  const [tags, setTags] = useState<string[]>(['Drop Link', 'Link Please', 'DM Please']);
  const [autoReply, setAutoReply] = useState<string[]>(['Check your DM', 'Sent']);

  const { data, isLoading, isFetching } = useGetUserSettingQuery();
  const [updateSetting, updateSettingState] = useUpdateUserSettingMutation();

  useEffect(() => {
    if (data?.length) {
      let res = data[0];
      setActiveStates({
        engage_dm: res.auto_dm == 1 ? true : false,
        engage_comment: res.auto_comment == 1 ? true : false,
        engage_post_dm: res.auto_dm_post == 1 ? true : false,
      });
      setTags(JSON.parse(res.keywords));
      setAutoReply(JSON.parse(res.auto_comment_reply));
    }
  }, [data]);

  const update = async () => {
    let obj: any = {};
    obj.auto_dm = activeStates.engage_dm;
    obj.auto_comment = activeStates.engage_comment;
    obj.auto_dm_post = activeStates.engage_post_dm;
    obj.keywords = JSON.stringify(tags);
    obj.auto_comment_reply = JSON.stringify(autoReply);
    await updateSetting(obj).unwrap()
      .then(() => {
        showToast({
          message: "Engage settings updated successfully.",
          type: "success"
        })
      })
      .catch(() => {
        showToast({
          message: "Error updating engage settings.",
          type: "error"
        })
      })
    router.push("/create")
  };

  const handleTagsChange = async (newTags: string[]) => {
    setTags(newTags);
  };

  const handleReplyChange = async (newTags: string[]) => {
    setAutoReply(newTags);
  };

  const handleToggleChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const newActiveState = event.target.checked;
    if (type == "comment") {
      setActiveStates((prev: any) => ({
        ...prev,
        engage_comment: newActiveState,
      }));
    }
    else if (type == "post_dm") {
      setActiveStates((prev: any) => ({
        ...prev,
        engage_post_dm: newActiveState,
      }));
    }
    else {
      setActiveStates((prev: any) => ({
        ...prev,
        engage_dm: newActiveState,
      }));
    }
  };

  if (isLoading || isFetching) {
    return <ProgressBarLoading isLoading={true} />
  }

  return (
    <div className="min-h-screen font-inter">
      <div className="pb-5  flex flex-col items-center justify-start w-full">
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
            Engage Settings
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-[30px] w-full pt-[15px] relative">
          <div className="flex items-center justify-between px-[15px] w-full gap-16">
            <div className="flex flex-col items-start justify-center gap-[3px]">
              <h1 className="m-0 text-[#000] text-[16px] font-bold font-inter leading-normal mb-1 ">
                Auto DMs
              </h1>
              <h2 className="m-0 text-[#000] text-[13px] font-medium font-inter leading-normal ">
                ( Set up auto DM to send product links to users who comment on your post. )
              </h2>
              <p className="m-0 text-[rgba(222,44,109,1)] text-[13px] font-bold font-inter leading-normal ">
                Reach Fast, Engage More, Sell More.
              </p>
            </div>

            <Image
              src={"/images/AutoDm.png"}
              alt="autodm"
              height={40}
              width={60}
            />
          </div>

          <div className="w-full px-[15px] relative">
            <Image
              className="w-full"
              src={"/images/autoDM2.png"}
              alt="bg"
              height={60}
              width={150}
            />
            <h3 className="absolute bottom-7 px-[15px] text-[14px] font-bold font-inter leading-normal text-[#fff]">
              Reach your audience at the right time to maximize engagement and
              profits.
            </h3>
          </div>

          <div className="absolute bottom-0 bg-[rgba(222,44,109,1)] py-[2px] flex items-center justify-center w-full">
            <p className="text-[#fff] text-[9px] font-bold font-inter leading-normal text-center w-full">
              Instant Engagement • Automation Efficiency • Message Fast • Engage
              Strong
            </p>
          </div>
        </div>

        <div className="w-full mt-6 px-[15px] flex flex-col items-center justify-center gap-5  ">
          <div className="grid grid-cols-2 items-center justify-between gap-4 ">
            <div
              style={{
                background:
                  "linear-gradient(147deg, #FFFDFC 28.17%, #FFF2EB 80.11%)",
              }}
              className="flex flex-col items-start justify-center gap-3 rounded-[6px] border-[1px] border-[rgba(222,44,109,1)] p-[14px] w-full h-[145px]"
            >
              <div className="flex items-center justify-between w-full gap-2">
                <h3 className="text-[#000] text-[14px] font-bold font-inter leading-normal m-0 w-2/5">
                  Engage DMs
                </h3>
                <ToggleSwitch
                  checked={activeStates.engage_dm}
                  onChange={(e) => handleToggleChange(e, "dm")}
                />
              </div>
              <p className="m-0 text-[12px] text-[#000] font-normal leading-normal">
                Send product link automatically in DMs when users request it in the comment.
              </p>
            </div>

            <div
              style={{
                background:
                  "linear-gradient(147deg, #FFFDFC 28.17%, #FFF2EB 80.11%)",
              }}
              className="flex flex-col items-start justify-center gap-3 rounded-[6px] border-[1px] border-[rgba(222,44,109,1)] p-[14px] w-full h-[145px]"
            >
              <div className="flex items-center justify-between w-full gap-2">
                <h3 className="text-[#000] text-[14px] font-bold font-inter leading-normal m-0">
                  Auto Replies
                </h3>
                <ToggleSwitch
                  checked={activeStates.engage_comment}
                  onChange={(e) => handleToggleChange(e, "comment")}
                />
              </div>
              <p className="m-0 text-[12px] text-[#000] font-normal leading-normal">
                Enable auto-replies to send a preset text to every new comment on your post.
              </p>
            </div>
          </div>
          <div
            style={{
              background:
                "linear-gradient(147deg, #FFFDFC 28.17%, #FFF2EB 80.11%)",
            }}
            className="flex flex-col items-start justify-center gap-3 rounded-[6px] border-[1px] border-[rgba(222,44,109,1)] p-[14px] w-full"
          >
            <div className="flex items-center justify-between w-full gap-2">
              <h3 className="text-[#000] text-[14px] font-bold font-inter leading-normal m-0">
                Share post in DM
              </h3>
              <ToggleSwitch
                checked={activeStates.engage_post_dm}
                onChange={(e) => handleToggleChange(e, "post_dm")}
              />
            </div>
            <p className="m-0 text-[12px] text-[#000] font-normal leading-normal">
              Share the product link when users send posts in your DM.
            </p>
          </div>

          <div
            style={{
              background:
                "linear-gradient(147deg, #FFFDFC 28.17%, #FFF2EB 80.11%)",
            }}
            className="flex flex-col items-start justify-center gap-3 rounded-[6px] border-[1px] border-[rgba(222,44,109,1)] p-[14px] w-full"
          >
            <div className="flex flex-col items-start justify-center w-full gap-2">
              <h3 className="text-[#000] text-[14px] font-bold font-inter leading-normal m-0 ">
                Trigger Keywords
              </h3>

              <p className="m-0 text-[12px] text-[#000] font-normal leading-normal w-4/5">
                (DMs will be sent to users only when these keywords are found in the comment section of your post. )
              </p>
            </div>

            <TagInput
              initialTags={tags}
              onTagsChange={handleTagsChange}
              tags={tags}
              setTags={setTags}
            />
          </div>

          <div
            style={{
              background:
                "linear-gradient(147deg, #FFFDFC 28.17%, #FFF2EB 80.11%)",
            }}
            className="flex flex-col items-start justify-center gap-3 rounded-[6px] border-[1px] border-[rgba(222,44,109,1)] p-[14px] w-full"
          >
            <div className="flex flex-col items-start justify-center w-full gap-2">
              <h3 className="text-[#000] text-[14px] font-bold font-inter leading-normal m-0 ">
                Set Auto Comment Reply
              </h3>

              <p className="m-0 text-[12px] text-[#000] font-normal leading-normal w-4/5">
                (Customize the comment that gets posted automatically after DM
                is sent.)
              </p>
            </div>

            <ReplyInput
              initialTags={autoReply}
              onTagsChange={handleReplyChange}
              autoReply={autoReply}
              setAutoReply={setAutoReply}
            />
          </div>

          <button onClick={update} className="bg-pink-500 text-white px-4 py-2 rounded w-[100%] cursor-pointer">
            Save
          </button>

        </div>
      </div>
    </div>
  );
};

export default AutoDM;
