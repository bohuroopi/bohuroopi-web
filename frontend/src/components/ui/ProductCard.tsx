import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { getImageUrl } from "@/lib/imageUtils";

interface ProductCardProps {
  product: {
    _id: string;
    slug: string;
    name: string;
    price: number;
    discountPrice?: number;
    images: { url: string; public_id: string }[];
    category?: { name: string };
    colorFinish?: string;
    variants?: { color: string }[];
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  
  const isDiscounted = !!product.discountPrice;
  const displayPrice = product.discountPrice || product.price;
  const discountPercent = isDiscounted 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) 
    : 0;

  const alreadyInWishlist = isInWishlist(product._id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (alreadyInWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: displayPrice,
        image: product.images?.[0]?.url || "",
        slug: product.slug
      });
    }
  };

  return (
    <div className="group relative w-full shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-xl transition-shadow duration-300 bg-white cursor-pointer rounded-2xl overflow-hidden pb-1">
      <div className="relative aspect-square bg-[#f5f5f6] overflow-hidden rounded-t-2xl">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          {/* Real Dynamic Image */}
          {product.images?.[0]?.url ? (
            <img 
              src={getImageUrl(product.images[0].url)} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-20">No Image</span>
            </div>
          )}

          {/* Rating Badge Mock */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center space-x-1 text-[10px] font-bold z-10">
             <span>4.2</span>
             <Star className="h-2.5 w-2.5 text-teal-600 fill-teal-600" />
             <span className="text-gray-400 pl-1 border-l border-gray-300">1.2k</span>
          </div>
        </Link>

        {/* Hover "Add to Bag" Overlay - OUTSIDE OF LINK */}
        <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
           <button 
             onClick={(e) => {
               e.preventDefault();
               addItem({
                 _id: product._id,
                 name: product.name,
                 price: product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price,
                 mrp: product.price,
                 image: getImageUrl(product.images?.[0]?.url) || "",
                 slug: product.slug,
                 color: product.colorFinish || product.variants?.[0]?.color || "Standard",
                 quantity: 1
               });
             }}
             className="w-full text-center py-3 text-[13px] font-bold text-myntra-pink border-t border-gray-200 hover:bg-myntra-pink hover:text-white transition-colors"
           >
              ADD TO BAG
           </button>
        </div>
      </div>
      
      {/* Wishlist Icon outside Link so you can click it without navigating */}
      <button 
        onClick={toggleWishlist}
        className={`absolute top-3 right-3 p-1.5 bg-white/80 rounded-full transition-all z-20 ${alreadyInWishlist ? 'text-myntra-pink opacity-100 shadow-md' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-myntra-pink'}`}
      >
         <Heart className={`h-4 w-4 ${alreadyInWishlist ? 'fill-myntra-pink' : ''}`} />
      </button>

      <Link href={`/product/${product.slug}`} className="block p-3 space-y-1">
         <h3 className="font-bold text-[14.5px] text-myntra-dark truncate leading-tight uppercase">{product.name}</h3>
         
         <div className="flex items-center space-x-2 pt-1 font-sans">
            <span className="font-bold text-[14px] text-myntra-dark">Rs. {displayPrice}</span>
            {isDiscounted && (
              <>
                <span className="text-[12px] text-myntra-gray line-through">Rs. {product.price}</span>
                <span className="text-[12px] font-bold text-[#ff905a]">({discountPercent}% OFF)</span>
              </>
            )}
         </div>
      </Link>
    </div>
  );
};

export default ProductCard;
