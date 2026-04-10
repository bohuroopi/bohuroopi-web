import { Request, Response } from 'express';
import Popup from '../models/Popup';

export const getPopups = async (req: Request, res: Response) => {
  try {
    const popups = await Popup.find().sort('order');
    res.json({ success: true, popups });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivePopup = async (req: Request, res: Response) => {
  try {
    const popup = await Popup.findOne({ isActive: true }).sort('order');
    res.json({ success: true, popup });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPopup = async (req: Request, res: Response) => {
  try {
    const popup = await Popup.create(req.body);
    res.status(201).json({ success: true, popup });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePopup = async (req: Request, res: Response) => {
  try {
    const popup = await Popup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (popup) {
      // If this popup was activated, deactivate others (only one active at a time)
      if (req.body.isActive) {
        await Popup.updateMany({ _id: { $ne: popup._id } }, { isActive: false });
      }
      res.json({ success: true, popup });
    } else {
      res.status(404).json({ success: false, message: 'Popup not found' });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePopup = async (req: Request, res: Response) => {
  try {
    const popup = await Popup.findByIdAndDelete(req.params.id);
    if (popup) {
      res.json({ success: true, message: 'Popup deleted' });
    } else {
      res.status(404).json({ success: false, message: 'Popup not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkUpdateOrder = async (req: Request, res: Response) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: 'Orders must be an array' });
    }

    const bulkOps = orders.map((item: any) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { order: item.order }
      }
    }));

    await Popup.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Orders updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
