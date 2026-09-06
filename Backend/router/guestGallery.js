import express from "express";
import { prisma } from "../utils/prismaConnection.js";
import { requireSalesOrAdmin } from "../middleware/requireSalesOrAdmin.js";

const router = express.Router();

// Create a new gallery image
router.post(
  '/',
  requireSalesOrAdmin,
  async (req, res) => {
    try {
      const { imageUrl, caption, location, isActive, displayOrder } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ success: false, message: 'Image URL is required' });
      }

      const newGallery = await prisma.guestGallery.create({
        data: {
          imageUrl,
          caption,
          location,
          isActive: isActive !== undefined ? isActive : true,
          displayOrder: displayOrder || 0,
        }
      });

      res.status(201).json({
        success: true,
        data: newGallery
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// Get all gallery images
router.get(
  '/',
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      const where = {};
      if (req.query.isActive !== undefined) {
        where.isActive = req.query.isActive === 'true';
      }

      const [galleries, total] = await Promise.all([
        prisma.guestGallery.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            displayOrder: 'asc'
          }
        }),
        prisma.guestGallery.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: galleries,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// Update a gallery image
router.put(
  '/:id',
  requireSalesOrAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl, caption, location, isActive, displayOrder } = req.body;

      const gallery = await prisma.guestGallery.findUnique({ where: { id: parseInt(id) } });
      if (!gallery) {
        return res.status(404).json({ success: false, message: 'Gallery image not found' });
      }

      const updatedGallery = await prisma.guestGallery.update({
        where: { id: parseInt(id) },
        data: {
          imageUrl,
          caption,
          location,
          isActive,
          displayOrder
        }
      });

      res.status(200).json({
        success: true,
        data: updatedGallery
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// Delete a gallery image
router.delete(
  '/:id',
  requireSalesOrAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const gallery = await prisma.guestGallery.findUnique({ where: { id: parseInt(id) } });
      if (!gallery) {
        return res.status(404).json({ success: false, message: 'Gallery image not found' });
      }

      await prisma.guestGallery.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

export default router;
