import Image from 'next/image'
import React from 'react'

const NoInternet = () => {
  return (
  <div className="h-screen relative overflow-x-scroll [&::-webkit-scrollbar]:hidden font-inter bg-[#FFF3F7] w-full flex flex-col items-center justify-center gap-5">

     
       <Image
         src={"/static/rabbit3.png"}
         alt="image-rabbit"
         width={220}
         height={300}
       />


       <div className="flex flex-col items-center justify-center gap-2 w-[75%] mx-auto">
         <h2 className="text-[18px] font-bold leading-6 text-center font-inter">
           Opps! No Internet
         </h2>
         <h3 className="text-[14px] font-medium leading-6 text-center font-inter mb-7">
           Looks like your internet went for a beauty nap. Check your Wifi or switch to a better internet service now!
         </h3>
 
       </div>

<button className='w-[90%] mx-auto bg-[rgba(222,44,109,1)] py-3 rounded-[7px] text-[#fff] text-[16px] font-medium font-inter '>
    Refresh
</button>
     </div>
  )
}

export default NoInternet