import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ProductGrid } from './ProductsMapping';
import { useGetDealsMutation } from '@/redux/api/productsApi';

interface Products {
  storeIcon: string;
  image: string;
  commission: string;
  title: string;
  actualPrice: number;
  discountedPrice: number;
  discount: string;
}

const ElectronicsCategory = () => {
  const [getDeals, { isLoading }] = useGetDealsMutation()
  const [deals, setDeals] = useState<any[]>([])

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const getDealsData = useCallback(async () => {
    try {
      const data = await getDeals({
        cat_arr: ["4"],
        page: page,
        sub_cat_arr: ["401", "402", "403", "404", "405", "406"]
      }).unwrap()

      if (data.data.length === 0) {
        setHasMore(false);
      } else {
        setDeals(prev => [...prev, ...data.data]);
      }
    } catch (err) {
      setHasMore(false);
    }
  }, [page, getDeals]);

  useEffect(() => {
    getDealsData();
  }, [getDealsData]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    }, {
      threshold: 1.0,
    });

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoading]);


  return (
    <div className="flex flex-col items-start justify-start  w-full px-[15px] mt-6">


      <div className="w-full flex items-end justify-between">
        <p className="leading-[19px] text-[#000] text-[14px] font-inter font-medium ">
          Save More, Shop Smart
        </p>

      </div>
      <ProductGrid products={deals} />
      <div ref={observerRef} className="h-10 w-full flex justify-center items-center mt-4">
        {isLoading && <span className="text-sm text-gray-500">Loading more...</span>}
        {!hasMore && <span className="text-sm text-gray-400">No more products</span>}
      </div>
    </div>
  )
}

export default ElectronicsCategory
