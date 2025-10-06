import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ProductGrid } from './ProductsMapping'
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

// Example usage with sample data
const sampleProducts: Products[] = [
  {
    storeIcon: "/static/AjioLogo.jpg",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop",
    commission: "Upto 7.0% Commissions",
    title: "Women Floral Printed Stranded Sleeves A-line",
    actualPrice: 1509,
    discountedPrice: 529,
    discount: "65% Off"
  },
  {
    storeIcon: "/static/AjioLogo.jpg",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=600&fit=crop",
    commission: "Upto 7.65% Commissions",
    title: "Women Floral Printed Stranded Sleeves A-line",
    actualPrice: 1509,
    discountedPrice: 529,
    discount: "65% Off"
  },
  {
    storeIcon: "/static/AjioLogo.jpg",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=600&fit=crop",
    commission: "Upto 7.0% Commissions",
    title: "Women Floral Printed Stranded Sleeves A-line",
    actualPrice: 1509,
    discountedPrice: 529,
    discount: "65% Off"
  },
  {
    storeIcon: "/static/AjioLogo.jpg",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=600&fit=crop",
    commission: "Upto 7.65% Commissions",
    title: "Women Floral Printed Stranded Sleeves A-line",
    actualPrice: 1509,
    discountedPrice: 529,
    discount: "65% Off"
  }
];

const FashionCategory = () => {
  const [getDeals, { isLoading }] = useGetDealsMutation();
  const [deals, setDeals] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const getDealsData = useCallback(async () => {
    try {
      const data = await getDeals({
        cat_arr: ['5'],
        page,
        sub_cat_arr: [
          '501', '502', '503', '504', '506', '507', '508',
          '509', '510', '514', '515', '516', '517', '505',
          '511', '512', '513'
        ]
      }).unwrap();

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
    <div className="flex flex-col items-start justify-start w-full px-[15px] mt-6">
      <div className="w-full flex items-end justify-between">
        <p className="leading-[19px] text-[#000] text-[14px] font-inter font-medium">
          Save More, Shop Smart
        </p>

      </div>

      <ProductGrid products={deals} />

      {/* Infinite scroll target element */}
      <div ref={observerRef} className="h-10 w-full flex justify-center items-center mt-4">
        {isLoading && <span className="text-sm text-gray-500">Loading more...</span>}
        {!hasMore && <span className="text-sm text-gray-400">No more products</span>}
      </div>
    </div>
  );
};


export default FashionCategory
