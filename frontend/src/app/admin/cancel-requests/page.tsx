"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Loader2, PackageX, User, AlertCircle, CheckCircle2 } from "lucide-react";

interface CancelRequest {
    _id: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    paymentMethod: string;
    user: {
        name: string;
        email: string;
        phone?: string;
    };
}

export default function CancelRequests() {
    const [requests, setRequests] = useState<CancelRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCancelRequests();
    }, []);

    const fetchCancelRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get("/orders/cancel-requests");
            if (res.data.success) {
                setRequests(res.data.requests);
            }
        } catch (err) {
            console.error("Failed to load cancel requests", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm("Are you sure you want to approve this cancellation?")) return;
        
        try {
            setApprovingId(id);
            const res = await api.put(`/orders/${id}/approve-cancel`);
            if (res.data.success) {
                setRequests(requests.filter(r => r._id !== id));
            }
        } catch (err) {
            console.error("Failed to approve cancellation", err);
            alert("Failed to approve cancellation request");
        } finally {
            setApprovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 text-myntra-pink animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <div>
                  <h1 className="text-2xl font-black text-myntra-dark tracking-tight">Cancellation Requests</h1>
                  <p className="text-gray-500 font-medium mt-1">Review and approve order cancellation requests from customers.</p>
               </div>
               <div className="h-12 w-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center border border-orange-100">
                  <PackageX className="h-6 w-6" />
               </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {requests.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <h3 className="text-lg font-bold text-myntra-dark">No Pending Requests</h3>
                        <p className="text-[14px]">You're all caught up! There are no order cancellations pending approval.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-myntra-dark font-bold text-[12px] uppercase tracking-wider">
                                    <th className="p-4">Order Details</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Requested On</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-[14px] text-myntra-dark">
                                {requests.map((request) => (
                                    <tr key={request._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold">ID: {request._id.slice(-8).toUpperCase()}</div>
                                            <div className="text-[12px] text-gray-500 flex items-center mt-1">
                                                <span className="uppercase tracking-widest text-[#03a685] font-bold border border-[#03a685]/30 bg-[#03a685]/10 px-2 py-0.5 rounded text-[10px]">{request.paymentMethod === 'cod' ? 'COD' : 'Prepaid'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold flex items-center space-x-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span>{request.user?.name || 'Unknown'}</span>
                                            </div>
                                            <div className="text-[12px] text-gray-500 mt-1">{request.user?.email}</div>
                                            {request.user?.phone && <div className="text-[12px] text-gray-500">{request.user.phone}</div>}
                                        </td>
                                        <td className="p-4 text-gray-500 font-medium">
                                            {new Date(request.updatedAt).toLocaleDateString()} <br />
                                            <span className="text-[12px] text-orange-500 font-bold uppercase">Pending</span>
                                        </td>
                                        <td className="p-4 font-bold text-myntra-dark">
                                            ₹{request.totalPrice}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleApprove(request._id)}
                                                disabled={approvingId === request._id}
                                                className="bg-myntra-dark text-white px-4 py-2 rounded-lg font-bold text-[12px] uppercase tracking-wider hover:bg-black transition-colors shadow-md shadow-gray-200 flex items-center justify-center space-x-2 mx-auto disabled:opacity-50"
                                            >
                                                {approvingId === request._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>Approve</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
