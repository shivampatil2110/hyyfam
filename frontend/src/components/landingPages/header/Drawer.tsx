"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SwipeableTemporaryDrawer({
  open,
  toggleDrawer,
}: {
  open: any;
  toggleDrawer: (open: boolean) => void;
}) {
  const router = useRouter();
  const list = (
    <Box
      sx={{
        width: 280,
        background:
          "linear-gradient(0deg, rgba(255, 255, 255, 0.40) 53.12%, rgba(255, 214, 228, 0.40) 100%)",
        height: "100%",
      }}
      className="font-inter"
      role="presentation"
      onClick={() => toggleDrawer(false)}
      onKeyDown={() => toggleDrawer(false)}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          width: "100%",
          padding: "13px 16px 10px 19px",
          // height:'100%'
        }}
      >

        <svg
          onClick={() => toggleDrawer(false)}
          className="cursor-pointer scale-90"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="22"
          viewBox="0 0 24 22"
          fill="none"
        >
          <path
            d="M23.3325 2.43858L2.59231 21.9472L-0.00021837 19.5086L20.74 5.28314e-06L23.3325 2.43858Z"
            fill="black"
          />
          <path
            d="M0.666992 2.49138L21.4072 22L23.9997 19.5614L3.25952 0.0528007L0.666992 2.49138Z"
            fill="black"
          />
        </svg>
      </Box>

      <Box
        sx={{
          paddingX: "27px",
          paddingTop: "60px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <p
          onClick={() => router.push("/")}
          className="m-0 font-inter text-[#000] text-[20px] font-semibold leading-normal w-[100%] text-center pb-[10px] hover:text-[rgba(222,44,109,1)]"
        >
          Creators
        </p>

        <p
          onClick={() => router.push("/brands")}
          className="m-0 font-inter text-[#000] text-[20px] font-semibold leading-normal w-[100%] text-center pb-[10px] hover:text-[rgba(222,44,109,1)]"
        >
          Brands
        </p>

        <p
          onClick={() => router.push("/about-us")}
          className="m-0 font-inter text-[#000] text-[20px] font-semibold leading-normal w-[100%] text-center pb-[10px] hover:text-[rgba(222,44,109,1)]"
        >
          About Us
        </p>

        <button onClick={() => router.push("/login")} className="bg-[rgba(222,44,109,1)] font-inter mt-10 cursor-pointer  relative text-white md:text-[14px] lg:text-[16px] xl:text-[18px] px-3 py-[6px] lg:px-4 lg:py-2  xl:py-3 rounded-[8px] font-medium flex items-center justify-center gap-[10px] lg:gap-3 xl:gap-4">
          <p className="m-0 font-[550] font-inter">GET STARTED NOW</p>
          <svg
            className="scale-75 lg:scale-100"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="33"
            viewBox="0 0 36 37"
            fill="none"
          >
            <path
              d="M1 18.5C1 4.5005 4.0005 1.5 18 1.5C31.9995 1.5 35 4.5005 35 18.5C35 32.4995 31.9995 35.5 18 35.5C4.0005 35.5 1 32.4995 1 18.5Z"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="M22.998 13.5006L12.332 24.1667"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M13.5938 12.8333H23.0064C23.3716 12.8333 23.6678 13.1296 23.6678 13.4949V22.9074"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Box>
      {/* <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
    </Box>
  );

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={() => toggleDrawer(false)}
      onOpen={() => toggleDrawer(true)}
      //   sx={{ background:'linear-gradient(0deg, rgba(255, 255, 255, 0.40) 53.12%, rgba(255, 214, 228, 0.40) 100%)'}}
    >
      {list}
    </SwipeableDrawer>
  );
}
