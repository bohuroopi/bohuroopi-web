"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Heart, Star, MapPin, Tag, Loader2, ArrowLeft, Plus, Minus } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [product, setProduct] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");

  // Delivery check state
  const [pincode, setPincode] = useState("");
  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { items, addItem: addToCart, updateQuantity, removeItem: removeFromCart } = useCartStore();

  const isWishlisted = product ? isInWishlist(product._id) : false;
  const cartItem = product ? items.find(i => i._id === product._id) : null;

  const handleIncrease = () => {
    if (cartItem && product) {
      updateQuantity(product._id, cartItem.quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (cartItem && product) {
      if (cartItem.quantity > 1) {
        updateQuantity(product._id, cartItem.quantity - 1);
      } else {
        removeFromCart(product._id);
      }
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.images?.[0]?.url || "",
        slug: product.slug
      });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price,
      mrp: product.price,
      image: product.images?.[0]?.url || "",
      slug: product.slug,
      color: product.colorFinish || product.variants?.[0]?.color || "Standard",
      quantity: 1
    });
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        if (res.data.success) {
          setProduct(res.data.product);
          setMainImage(res.data.product.images?.[0]?.url || "");
          
          // Fetch similar products based on tags
          const simRes = await api.get(`/products/${slug}/similar`);
          if (simRes.data.success) {
            setRecommendations(simRes.data.products);
          }
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProductData();
  }, [slug]);

  const handlePincodeCheck = async () => {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setPincodeError("Please enter a valid 6-digit Pincode");
      return;
    }
    
    try {
      setCheckingPincode(true);
      setPincodeError(null);
      setDeliveryData(null);
      
      const res = await api.get(`/shiprocket/serviceability?pincode=${pincode}&weight=${product?.weight || 0.5}`);
      
      if (res.data.success && res.data.data.status === 200) {
         const courierInfo = res.data.data.data?.available_courier_companies?.[0];
         if (courierInfo) {
            setDeliveryData({
               etd: courierInfo.etd,
               city: courierInfo.city,
               codAvailable: courierInfo.cod === 1
            });
         } else {
            setPincodeError("Currently not serviceable in this area.");
         }
      } else {
         setPincodeError("Serviceability failed. Please check the pincode.");
      }
    } catch (err) {
       console.error("Pincode check error", err);
       setPincodeError("Unable to check right now. Try again later.");
    } finally {
       setCheckingPincode(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-myntra-pink">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="font-black uppercase tracking-[0.2em] text-xs text-myntra-dark">Loading Premium Jewellery...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-black text-myntra-dark mb-4">WE COULDN'T FIND THAT PIECE</h2>
        <p className="text-gray-500 mb-8">It might have been removed or the link is incorrect.</p>
        <Link href="/" className="bg-myntra-dark text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black transition-all">
          Back to Collections
        </Link>
      </div>
    );
  }

  // Deterministic random rating based on product ID
  const getRatingData = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
       hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const normalized = Math.abs(hash) / 2147483648;
    const rating = (3.8 + normalized * 1.2).toFixed(1); 
    const count = 15 + (Math.abs(~hash) % 850); 
    return { rating, count };
  };
  
  const ratingData = getRatingData(product._id);

  const discountPercent = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
      {/* Breadcrumbs */}
      <div className="text-[14px] text-myntra-dark mb-6 flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
         <Link href="/" className="text-gray-500 hover:text-myntra-pink transition-colors">Home</Link>
         <span className="text-gray-300 mx-2">/</span>
         {product.category ? (
           <Link href={`/category/${product.category.slug}`} className="text-gray-500 hover:text-myntra-pink transition-colors capitalize">
             {product.category.name}
           </Link>
         ) : (
           <span className="text-gray-500">Collection</span>
         )}
         <span className="text-gray-300 mx-2">/</span>
         <span className="font-bold text-myntra-dark capitalize">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Product Images Display */}
        <div className="w-full lg:w-[45%] space-y-3">
           {/* Main Image View */}
           <div className="relative aspect-square bg-myntra-light-gray rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group">
              {mainImage ? (
                <img src={mainImage} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-300">No Image Available</div>
              )}
           </div>
           
           {/* Thumbnails Grid */}
           <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {product.images?.map((img: any, idx: number) => (
                <div 
                   key={idx}
                   onClick={() => setMainImage(img.url)}
                   className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${mainImage === img.url ? 'border-myntra-pink shadow-lg' : 'border-gray-100 opacity-70 hover:opacity-100'}`}
                >
                   <img src={img.url} className="h-full w-full object-cover" alt="" />
                </div>
              ))}
           </div>
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-[55%] space-y-6 sticky top-28 h-fit pb-12">
          <div className="border-b border-gray-100 pb-4">
             <h1 className="text-2xl font-black text-myntra-dark tracking-tighter uppercase leading-tight mb-1">{product.name}</h1>
             {(product.shortDescription || product.description) && (
               <p className="text-[15px] text-gray-400 font-medium tracking-wide leading-relaxed mt-1">
                 {product.shortDescription || product.description}
               </p>
             )}
             
             {/* Rating Badge Mock (Can be dynamic if you add a reviews system) */}
             <div className="mt-4 flex items-center border border-gray-200 w-fit px-3 py-1 rounded-lg hover:border-myntra-pink cursor-pointer transition-all group">
                <span className="text-[13px] font-black text-myntra-dark flex items-center">
                   {ratingData.rating} <Star className="h-3.5 w-3.5 fill-teal-600 text-teal-600 ml-1 group-hover:scale-110 transition-transform" />
                </span>
                <span className="text-gray-200 mx-3">|</span>
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{ratingData.count} Ratings</span>
             </div>
          </div>

          {/* Pricing */}
          <div className="space-y-1">
             <div className="flex items-baseline space-x-4">
                <span className="text-2xl font-black text-myntra-dark">₹{product.discountPrice || product.price}</span>
                {product.discountPrice && (
                  <>
                    <span className="text-[18px] text-gray-400 line-through decoration-myntra-pink/50 decoration-2">MRP ₹{product.price}</span>
                    <span className="font-black text-pink-500 text-[16px] tracking-tight">({discountPercent}% OFF)</span>
                  </>
                )}
             </div>
             <p className="text-[#03a685] font-black uppercase text-[11px] tracking-[0.2em] pt-2">inclusive of all taxes</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
             {cartItem ? (
               <div className="flex-2 flex items-center justify-between bg-myntra-pink text-white rounded-[1.2rem] shadow-xl shadow-pink-100 p-1">
                 <button 
                   onClick={handleDecrease}
                   className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                 >
                    <Minus className="h-5 w-5" />
                 </button>
                 <span className="font-black text-[15px] uppercase tracking-widest">{cartItem.quantity} In Bag</span>
                 <button 
                   onClick={handleIncrease}
                   className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                 >
                    <Plus className="h-5 w-5" />
                 </button>
               </div>
             ) : (
               <button 
                 onClick={handleAddToCart}
                 className="flex-2 myntra-pink-btn py-4 flex flex-row items-center justify-center space-x-3 rounded-[1.2rem] shadow-xl shadow-pink-100 hover:scale-[1.02] active:scale-95 transition-all"
               >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="uppercase text-[12px] font-black tracking-[0.2em]">Add to Bag</span>
               </button>
             )}
             <button 
               onClick={toggleWishlist}
               className={`flex-1 py-4 flex flex-row items-center justify-center space-x-3 rounded-[1.2rem] transition-all border ${isWishlisted ? 'border-myntra-pink bg-pink-50 text-myntra-pink' : 'bg-white border-gray-200 hover:border-myntra-pink text-myntra-dark'}`}
             >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-myntra-pink' : ''}`} />
                <span className="uppercase text-[12px] font-black tracking-[0.2em]">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
             </button>
          </div>

          {/* Delivery Options */}
          <div className="pt-10 space-y-6">
             <div className="flex items-center space-x-3 font-black text-myntra-dark uppercase text-[12px] tracking-widest">
                <span>CHECK DELIVERY</span> <MapPin className="h-4 w-4 text-myntra-pink" />
             </div>
             <div className="flex flex-col gap-2">
                <div className={`relative border-2 rounded-2xl overflow-hidden flex w-full max-w-sm group transition-colors ${pincodeError ? 'border-red-300' : deliveryData ? 'border-[#03a685]' : 'border-gray-100 focus-within:border-myntra-pink'}`}>
                   <input 
                      type="text" 
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePincodeCheck()}
                      placeholder="Enter Pincode" 
                      className="flex-grow p-4 text-sm font-bold outline-none bg-transparent"
                      maxLength={6}
                   />
                   <button 
                      onClick={handlePincodeCheck}
                      disabled={checkingPincode}
                      className="text-myntra-pink font-black text-[11px] uppercase tracking-widest px-6 bg-white hover:bg-pink-50 transition-colors disabled:opacity-50"
                   >
                      {checkingPincode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
                   </button>
                </div>
                
                {pincodeError && (
                   <p className="text-red-500 text-[11px] font-bold tracking-wide">{pincodeError}</p>
                )}
                
                {deliveryData && (
                   <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 max-w-sm mt-2 animate-fade-in">
                       <p className="text-[#03a685] font-black text-[14px]">Get it by {new Date(deliveryData.etd).toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric'})}</p>
                       <div className="text-[12px] font-bold text-gray-500 mt-1">Delivery to <span className="uppercase text-myntra-dark">{deliveryData.city}</span> ({pincode})</div>
                       {!deliveryData.codAvailable && <p className="text-amber-600 text-[11px] font-bold mt-2">Note: Pay on Delivery (COD) is not available.</p>}
                   </div>
                )}
             </div>
             
             <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] font-medium text-gray-500 pt-2">
                <li className="flex items-center space-x-3"><div className="h-1.5 w-1.5 rounded-full bg-pink-300"></div><span>100% Handcrafted</span></li>
                <li className="flex items-center space-x-3"><div className="h-1.5 w-1.5 rounded-full bg-pink-300"></div><span>Pay on Delivery Available</span></li>
                <li className="flex items-center space-x-3"><div className="h-1.5 w-1.5 rounded-full bg-pink-300"></div><span>Premium Luxury Packaging</span></li>
                <li className="flex items-center space-x-3"><div className="h-1.5 w-1.5 rounded-full bg-pink-300"></div><span>Easy 14 Days Returns</span></li>
             </ul>
          </div>

          {/* Product Details Section */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
             <div className="flex items-center space-x-3 font-black text-myntra-dark uppercase text-[11px] tracking-widest">
                <span>CRAFTSMANSHIP & DETAILS</span> <Tag className="h-3.5 w-3.5 text-myntra-gray" />
             </div>
             {(product.longDescription || product.description) && (
               <p className="text-[13px] text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                 {product.longDescription || product.description}
               </p>
             )}
             
             <div className="space-y-4 pt-2">
                <h4 className="font-black text-[11px] uppercase tracking-widest text-myntra-dark border-b border-gray-100 pb-2">Specifications</h4>
                <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Primary Material</p>
                        <p className="text-[13px] font-bold text-myntra-dark">{product.primaryMaterial || product.variants?.[0]?.material || "—"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Color / Finish</p>
                        <p className="text-[13px] font-bold text-myntra-dark">{product.colorFinish || product.variants?.[0]?.color || "—"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Weight</p>
                        <p className="text-[13px] font-bold text-myntra-dark">{product.weight || "—"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Occasion</p>
                        <p className="text-[13px] font-bold text-myntra-dark">{product.occasion?.join(", ") || "—"}</p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Similar Products Carousel */}
      {recommendations.length > 0 && (
          <section className="mt-16 pt-16 border-t border-gray-100">
             <div className="flex justify-between items-end mb-10">
                <div>
                   <h2 className="text-2xl font-black text-myntra-dark uppercase tracking-tight">SIMILAR PRODUCTS</h2>
                   <p className="text-gray-400 font-medium mt-1">Pieces that share a similar essence and craftsmanship</p>
                </div>
                <Link href="/" className="text-myntra-pink font-black uppercase tracking-widest text-xs hover:underline border border-pink-100 px-4 py-2 rounded-full">
                   explore more
                </Link>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
               {recommendations.map(rec => (
                 <ProductCard key={rec._id} product={rec} />
               ))}
             </div>
          </section>
      )}
      {/* Floating Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] lg:hidden flex items-center gap-3">
         <button 
           onClick={toggleWishlist}
           className={`h-14 w-14 flex items-center justify-center rounded-2xl transition-all border ${isWishlisted ? 'border-myntra-pink bg-pink-50 text-myntra-pink' : 'bg-white border-gray-200 text-myntra-dark'}`}
         >
            <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-myntra-pink' : ''}`} />
         </button>
         {cartItem ? (
           <div className="flex-1 h-14 bg-myntra-pink text-white rounded-2xl shadow-lg shadow-pink-100 flex items-center justify-between p-1">
             <button 
               onClick={handleDecrease}
               className="h-full px-4"
             >
                <Minus className="h-5 w-5" />
             </button>
             <span className="font-black text-[13px] uppercase tracking-widest">{cartItem.quantity} In Bag</span>
             <button 
               onClick={handleIncrease}
               className="h-full px-4"
             >
                <Plus className="h-5 w-5" />
             </button>
           </div>
         ) : (
           <button 
             onClick={handleAddToCart}
             className="flex-1 h-14 myntra-pink-btn flex items-center justify-center space-x-3 rounded-2xl shadow-lg shadow-pink-100 active:scale-95 transition-all"
           >
              <ShoppingBag className="h-5 w-5" />
              <span className="uppercase text-[13px] font-black tracking-[0.1em]">Add to Bag</span>
           </button>
         )}
      </div>
    </div>
  );
}
