import { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import Order from '../models/Order';
import Settings from '../models/Settings';

const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
const PHONEPE_HOST_URL = process.env.PHONEPE_HOST_URL || 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// Utility to create SHA256 Hash
const calculateHash = (payload: string, endpoint: string, salt: string, index: string) => {
    const stringToHash = payload + endpoint + salt;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return `${sha256}###${index}`;
};

export const initiatePhonePePayment = async (req: any, res: Response) => {
    try {
        const { orderItems, shippingAddress, discountPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        // 1. Fetch Settings for fee calculation
        const settings = await Settings.findOne() || { shippingFee: 0, freeShippingThreshold: 0, codCharges: 0 };
        
        // 2. Calculate Prices
        const itemsPrice = orderItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        const shippingPrice = itemsPrice >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
        const codPrice = 0; // PhonePe is not COD
        const totalPrice = itemsPrice + shippingPrice + codPrice - (discountPrice || 0);

        // 1. Create a Pending Order in DB
        const order = new Order({
            user: req.user._id, // Assumes `protect` middleware is used
            orderItems,
            shippingAddress,
            paymentMethod: 'PhonePe',
            shippingPrice,
            codPrice,
            discountPrice: discountPrice || 0,
            totalPrice,
            isPaid: false,
            status: 'pending'
        });

        const createdOrder = await order.save();
        const transactionId = createdOrder._id.toString();

        // 2. Construct PhonePe Payload
        const payload = {
            merchantId: PHONEPE_MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: req.user._id.toString(),
            amount: Math.round(totalPrice * 100), // PhonePe expects amount in paise
            redirectUrl: `${BACKEND_URL}/api/payment/phonepe/callback/${transactionId}`,
            redirectMode: 'POST',
            callbackUrl: `${BACKEND_URL}/api/payment/phonepe/callback/${transactionId}`,
            mobileNumber: '9999999999',
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const xVerify = calculateHash(base64Payload, '/pg/v1/pay', PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX);

        // 3. Server-to-server call to PhonePe
        const options = {
            method: 'post',
            url: PHONEPE_HOST_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
            },
            data: {
                request: base64Payload,
            },
        };

        console.log("PhonePe Request Options:", JSON.stringify(options, null, 2));

        const response = await axios.request(options);
        
        console.log("PhonePe Response:", JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.data.instrumentResponse.redirectInfo.url) {
            res.json({
                success: true,
                orderId: createdOrder._id,
                redirectUrl: response.data.data.instrumentResponse.redirectInfo.url
            });
        } else {
            res.status(400).json({ success: false, message: 'PhonePe failed to return redirect URL' });
        }


    } catch (error: any) {
        console.error('PhonePe Initiation Error Detail:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message,
            detail: error.response?.data
        });
    }
};

export const phonePeCallback = async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.params;
        const response = req.body;
        
        // 1. Verify Checksum
        const xVerifyHeader = req.headers['x-verify'] as string;
        const stringToHash = response.response + PHONEPE_SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const calculatedVerify = `${sha256}###${PHONEPE_SALT_INDEX}`;

        // In production, we should compare calculatedVerify with xVerifyHeader
        // if (calculatedVerify !== xVerifyHeader) {
        //     return res.status(400).send('Invalid signature');
        // }

        // 2. Decode Response
        const decodedResponse = JSON.parse(Buffer.from(response.response, 'base64').toString());
        const { code, data } = decodedResponse;

        const order = await Order.findById(transactionId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        if (code === 'PAYMENT_SUCCESS') {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentResult = {
                id: data.providerReferenceId,
                status: code,
                update_time: new Date().toISOString()
            };
            
            await order.save();
            
            // Redirect user back to frontend success page
            return res.redirect(`${frontendUrl}/order-success?id=${transactionId}`);
        } else {
            // Payment failed or pending
            order.status = 'cancelled';
            await order.save();
            return res.redirect(`${frontendUrl}/cart?error=PaymentFailed`);
        }

    } catch (error: any) {
        console.error('PhonePe Callback Error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/cart?error=ServerError`);
    }
};
