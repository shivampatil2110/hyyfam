"use client";
import Footer from "@/components/postLogin/footer";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/redux/store";
import {
  checkAuth,
  checkInstaAuth,
  toggleModal,
  setLoading,
} from "@/redux/features/authSlice";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ProgressBarLoading } from "@/components/postLogin/LoadingStatesAndModals/CommonLoading";
import FixedWidthModal from "@/components/postLogin/popups/LinkConfirmationModal";

const protectedRoutes = [
  "/create/collection_generator",
  "/create/autoDM",
  "/profile/create_post",
  "/profile/select_post",
  "/profile/collection_view",
  "/profile/edit_collection",
  "/profile/edit_post",
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDynamicRoute = pathname.includes("/profile/create_post");
  const isDynamicRoute2 = pathname.includes("/profile/select_post");
  const isDynamicRoute3 = pathname.includes("/profile/edit_collection");
  const isNotification = pathname.includes("/notifications");
  const isCreateSubRoute = pathname.includes("/create/");
  const isSettingNestedRoute = pathname.includes("/settings/");
  const isBankOffers = pathname.includes("/bank-offers");
  const isEditPost = pathname.includes("/edit_post");
  const isReports = pathname.includes("/reports");
  const isSettings = pathname.includes("/settings");
  const isVerification = pathname.includes("/verification");
  const isDealsOffers = pathname.includes("/deals&offers");
  const isPartnerBrands = pathname.includes('/partner-brands');
  const isProfile = pathname.includes('/profile');
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const {
    isInstaAuthenticated,
    isInstagramFollowersSatisfied,
    isInstagramPermissionsSatisfied,
    loading,
  } = useSelector((s: any) => s.auth);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        dispatch(setLoading(true));
        const res = await dispatch(checkAuth());

        if (res.payload.code !== 200) {
          setIsAuthenticated(false);
          router.push("/login");
        } else {
          setIsAuthenticated(true);
          const response = await dispatch(checkInstaAuth());
        }
      } catch (error) {
        setIsAuthenticated(false);
        router.push("/login");
      } finally {
        dispatch(setLoading(false));
        setInitialLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (!initialLoading && isAuthenticated && isProtectedRoute) {
      const hasFullInstaAuth =
        isInstaAuthenticated &&
        isInstagramFollowersSatisfied 
        isInstagramPermissionsSatisfied;

      if (!hasFullInstaAuth) {
        router.push("/home");
      }
    }
  }, [
    isInstaAuthenticated,
    isInstagramFollowersSatisfied,
    isInstagramPermissionsSatisfied,
    initialLoading,
    isAuthenticated,
    isProtectedRoute,
    pathname,
  ]);

  useEffect(() => {
    if (
      !initialLoading &&
      isAuthenticated &&
      !(
        isInstaAuthenticated &&
        isInstagramFollowersSatisfied &&
        isInstagramPermissionsSatisfied
      )
    ) {
      dispatch(toggleModal(true));
    }
  }, [
    isInstaAuthenticated,
    isInstagramFollowersSatisfied,
    isInstagramPermissionsSatisfied,
    initialLoading,
    isAuthenticated,
  ]);

  if (loading || initialLoading) {
    return (
      <div className="bg-gray-200 w-full h-full">
        <div className="max-w-[450px] mx-auto min-h-screen bg-[#fff] flex items-center justify-center">
          <ProgressBarLoading isLoading={true} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-200 w-full h-full">
        <div className="max-w-[450px] mx-auto min-h-screen bg-[#fff] flex items-center justify-center">
          <ProgressBarLoading isLoading={true} />
        </div>
      </div>
    ); 
  }

  const shouldRenderChildren = () => {
    if (isProtectedRoute) {
      return (
        isInstaAuthenticated &&
        isInstagramFollowersSatisfied &&
        isInstagramPermissionsSatisfied
      );
    }
    return true;
  };

  return (
    <div className=" h-fit bg-gray-200 w-full">
      <div className="max-w-[448px] min-h-screen bg-[#fff] mx-auto">
        {shouldRenderChildren() ? (
          children
        ) : (
          <div className="flex items-center justify-center h-full">
            <ProgressBarLoading isLoading={true} />
          </div>
        )}

        {!(
          isDynamicRoute ||
          isDynamicRoute2 ||
          isNotification ||
          isCreateSubRoute ||
          isSettingNestedRoute ||
          isBankOffers ||
          isDynamicRoute3 ||
          isEditPost ||
          isReports ||
          isSettings ||
          isVerification ||
          isDealsOffers ||
          isPartnerBrands ||
          isProfile
        ) && <Footer />}
      </div>
      <FixedWidthModal />
    </div>
  );
}
