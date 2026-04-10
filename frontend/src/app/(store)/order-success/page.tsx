"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle2 className="h-24 w-24 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-myntra-dark mb-4">Order Placed Successfully!</h1>
      <p className="text-gray-500 text-[14px] max-w-md mx-auto mb-8">
        Thank you for shopping with Bohuroopi. Your order has been successfully placed.
        {orderId && (
          <span className="block mt-2 font-bold text-myntra-dark">
            Order ID: {orderId}
          </span>
        )}
      </p>
      
      <div className="flex justify-center space-x-4">
        <Link href="/profile/orders" className="myntra-pink-btn px-8 py-3 rounded-md font-bold text-[14px]">
          View Orders
        </Link>
        <Link href="/" className="border border-myntra-dark text-myntra-dark px-8 py-3 rounded-md font-bold text-[14px] hover:bg-gray-50">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-gray-500 animate-pulse">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
