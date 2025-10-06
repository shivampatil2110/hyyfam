"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useGetCollectionsQuery, useLazyGetCollectionLinksQuery, useLazyGetCollectionsQuery } from "@/redux/api/collectionApi";

interface Product {
  id: number;
  img_url: string;
  name: string;
  org_link: string;
}

interface ProductCollectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selected: any, previouslySelected: any) => any;
  previouslySelectedFromPopup: any;
  setUnselectedPro: (item: any) => void;
  setSelectedPro: (item: any) => void;
  products: any;
  selectedPro: any;
  unselectedPro:any;
}

const ProductCollectionPopup: React.FC<ProductCollectionPopupProps> = ({
  isOpen,
  onClose,
  onAdd,
  previouslySelectedFromPopup,
  setSelectedPro,
  setUnselectedPro,
  products,
  selectedPro,
  unselectedPro
}) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const previouslySelectedLinks = previouslySelectedFromPopup.map((p: any) => p.org_link);
  const [collections, setCollection] = useState<any>([]);
  const [page, setPage] = useState(1)
  const [hasMoreCollection, hasMoreCollectionState] = useState(true)
  const [getMoreCollection, getMoreCollectionState] = useLazyGetCollectionsQuery()
  const [collectionId, setCollectionId] = useState<any>([])

  const { data = [], isLoading, error } = useGetCollectionsQuery({
    search: "",
    page: 1
  });
  useEffect(() => {
    if (data.length) {
      setCollection(data);
    }
  }, [data]);

  useEffect(() => {
    getCollection()
  }, [page])

  const getCollection = async () => {
    let data = await getMoreCollection({
      search: "",
      page
    }).unwrap()

    setCollection((prev: any) => {
      const existingIds = new Set(prev.map((item: any) => item.id));
      const newItems = data.filter((item: any) => !existingIds.has(item.id));
      return [...prev, ...newItems];
    });


    if (data.length < 10) {
      hasMoreCollectionState(false)
    }
  }

  useEffect(() => {
    if (collections.length) {
      const allProducts = collections.flatMap((col: any) => col.products);
      const matched = allProducts.filter((product: Product) =>
        previouslySelectedLinks.includes(product.org_link)
      );
      setSelectedProducts(matched);
    }
  }, [collections, previouslySelectedFromPopup]);

  const handleSelect = (product: Product) => {
    const exists = selectedProducts.find(
      (p) => p.org_link === product.org_link
    );
    if (exists) {
      setSelectedProducts((prev) =>
        prev.filter(
          (p) => !(p.id === product.id || p.org_link === product.org_link)
        )
      );
      setSelectedPro((prev: any) => {
        const newSet = new Set(prev);
        newSet.delete(product.org_link);
        return newSet;
      });

      setUnselectedPro((prev: any) => {
        if (!prev.has(product.org_link)) {
          const newSet = new Set(prev);
          newSet.add(product.org_link);
          return newSet;
        }
        return prev;
      });
    } else if (
      selectedProducts.length <= 10 &&
      getDistinctOrgLinkCount(products, selectedProducts)
    ) {
      setSelectedProducts((prev) => [...prev, product]);
      setSelectedPro((prev: any) => {
        const newSet = new Set(prev);
        newSet.add(product.org_link);
        return newSet;
      });

      setUnselectedPro((prev: any) => {
        if (prev.has(product.org_link)) {
          const newSet = new Set(prev);
          newSet.delete(product.org_link);
          return newSet;
        }
        return prev;
      });
    }
  };

  const getDistinctOrgLinkCount = (arr: any, excludeArr: any) => {
    const excludeSet = new Set();

    excludeArr.forEach((obj: any) => {
      if (obj.org_link) {
        excludeSet.add(obj.org_link);
      }
    });

    const orgLinks = new Set();

    arr.forEach((obj: any) => {
      if (obj.org_link && !excludeSet.has(obj.org_link) && !unselectedPro.has(obj.org_link)) {
        orgLinks.add(obj.org_link);
      }
    });

    return orgLinks.size + excludeSet.size < 10;
  };

  const [trigger, result] = useLazyGetCollectionLinksQuery();


  const getAllCollectionLinks = async (e: any, collection: any) => {
    e.preventDefault();
    let id = collection.id;
    setCollectionId((prev: any) => [...prev, id])
    let res = await trigger(id).unwrap();
    const updated = collections.map((col: any) =>
      col.id === id ? { ...col, products: res } : col
    );
    setCollection(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white min-h-[80vh] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden rounded-t-2xl shadow-2xl border-t border-gray-200 z-50  max-w-[450px] min-w-[450px] mx-auto">
      <div className="flex flex-col items-center justify-center w-full p-4 relative z-20">
        <div className="flex justify-between items-center mb-6 w-full">
          <h2 className="text-[14px] font-bold font-inter">
            Add Products from Collection
          </h2>
          <button className="cursor-pointer" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {collections.map((col: any, i: number) => (
          <div
            key={i}
            className="mb-4 flex flex-col items-start justify-center gap-[5px]"
          >
            <h3 className="font-medium text-[#000] text-[14px] font-inter ">
              {col.name}
            </h3>
            <div className="grid grid-cols-5 gap-2 p-[9px] bg-[#fcfcfc] border-[0.5px] border-[#eaeaea] rounded-sm ">
              {col.products.map((product: Product) => {
                const isSelected = selectedProducts.some(
                  (p) => p.org_link === product.org_link
                );
                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className={`cursor-pointer p-1 border rounded-md relative bg-[#fff]  ${isSelected ? "border-pink-500" : "border-0"
                      }`}
                  >
                    <img
                      src={product.img_url}
                      alt={product.name}
                      className="w-full h-[100px] object-contain rounded "
                    />
                    {/* {isSelected && (
                      <div className="absolute top-1 left-1 bg-pink-500 text-white text-xs rounded-full px-1">
                        {selectedProducts.findIndex(
                          (p: any) => p.org_link === product.org_link
                        ) + 1}
                      </div>
                    )} */}
                  </div>
                );
              })}
            </div>
            {
              col.products.length >= 5 && !collectionId.includes(col.id) &&
              <p
                className="cursor-pointer"
                onClick={(e) => {
                  getAllCollectionLinks(e, col);
                }}
              >
                View More
              </p>
            }
          </div>
        ))}
        {
          hasMoreCollection &&
          <p className="cursor-pointer mb-24" onClick={() => setPage((prev) => prev + 1)}>View more collections</p>
        }
      </div>
      <div
        style={{
          boxShadow: "0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)",
        }}
        className="w-full flex items-center jusity-center px-4 py-5 rounded-t-[10px] fixed bottom-0 max-w-[450px] z-50 bg-[#fff]"
      >
        <button
          onClick={() => {
            onAdd(selectedProducts, previouslySelectedLinks);
            onClose();
          }}
          className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold"
        >
          Add ({selectedProducts.length})
        </button>
      </div>
    </div>
  );
};

export default ProductCollectionPopup;
