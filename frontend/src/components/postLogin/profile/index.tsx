'use client'
import React, { useState } from "react";
import MainSection from "./MainSection";
import NameSection from "../home/NameSection";
import { ProgressBarLoading } from "../LoadingStatesAndModals/CommonLoading";
import Footer from "../footer";
import EditPosts from "./EditPosts";
import EditCollectionView from "./EditCollectionView";

const Profile = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Profile");
  const [selectedPostId, setSelectedPostId] = useState<any>(0);
  const [imageUrl, setImageUrl] = useState<any>("");
  const [cid, setCid] = useState<number>(0);
  const [title, setTitle] = useState<string>("");

  const changeTab = (currentTab: string, dropdownId: any, url: any) => {
    setActiveTab(currentTab);
    setSelectedPostId(dropdownId);
    setImageUrl(url);
    // schedule === true ? setSchedule(false) : ""
  };

    const changeTabCollection = (currentTab: string, id: number, title: string) => {
    setActiveTab(currentTab);
    setCid(id);
    setTitle(title);
    // schedule === true ? setSchedule(false) : ""
  };

  return (
    <>
      {activeTab === "Profile" && (
        <div className="relative min-h-screen font-inter ">
          {loading && (
            <div className="absolute inset-0 z-[90] flex items-center justify-center bg-white/80">
              <ProgressBarLoading isLoading={loading} />
            </div>
          )}
          <NameSection />
          <MainSection changeTabCollection={changeTabCollection} changeTab={changeTab} setLoading={setLoading} />
          <Footer />
        </div>
      )}

      {activeTab === "Edit Post" && (
        <EditPosts imgUrl={imageUrl} postId={selectedPostId} changeTab={changeTab} />
      )}

      {activeTab === "Edit Collection" && (
        <EditCollectionView id={cid} collectioName={title} changeTab={changeTabCollection}   />
      )}
    </>
  );
};

export default Profile;
