import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sizeOf from 'image-size';
import prisma from '../utils/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Max Size
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images of format JPG, JPEG, PNG, or WEBP are allowed'));
    }
  },
});

// 1. GET ALL SERVICES (Public)
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { id: 'asc' },
    });
    return res.json(services);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. UPDATE SERVICE INFO
router.put('/:id', authenticateToken, requirePermission('manage_content'), async (req, res) => {
  const serviceId = req.params.id;
  const { title, shortDesc, description, features } = req.body;

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ message: 'Service category not found' });
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: {
        title,
        shortDesc,
        description,
        features: Array.isArray(features) ? features : undefined,
      },
    });

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_SERVICE',
        details: `Updated service text details for: ${serviceId}`,
      },
    });

    return res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. UPLOAD / REPLACE SERVICE IMAGE
router.post('/:id/image', authenticateToken, requirePermission('manage_images'), (req, res) => {
  const serviceId = req.params.id;

  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const filePath = req.file.path;

    try {
      // Dimension Validation: Check if it matches exactly 1200 x 800 px (or similar)
      const dimensions = sizeOf(filePath);
      if (dimensions.width !== 1200 || dimensions.height !== 800) {
        // Delete uploaded file if it does not match
        fs.unlinkSync(filePath);
        return res.status(400).json({
          message: `Image dimensions must be exactly 1200 x 800 pixels. Got ${dimensions.width} x ${dimensions.height} px.`,
        });
      }

      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        fs.unlinkSync(filePath);
        return res.status(404).json({ message: 'Service not found' });
      }

      // Delete old file if it was a local upload
      if (service.image && service.image.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), service.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const relativeUrl = `/uploads/${req.file.filename}`;

      await prisma.service.update({
        where: { id: serviceId },
        data: {
          image: relativeUrl,
        },
      });

      // Audit Log
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'UPLOAD_SERVICE_IMAGE',
          details: `Uploaded new image for service ${serviceId}: ${relativeUrl}`,
        },
      });

      return res.json({
        message: 'Image uploaded and updated successfully',
        image: relativeUrl,
      });
    } catch (error) {
      // Cleanup file if DB operations fail
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.error(error);
      return res.status(500).json({ message: 'Internal server error while processing image upload' });
    }
  });
});

// 4. DELETE SERVICE IMAGE (Reverts to a default Unsplash placeholder link)
router.delete('/:id/image', authenticateToken, requirePermission('manage_images'), async (req, res) => {
  const serviceId = req.params.id;

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.image && service.image.startsWith('/uploads/')) {
      const oldPath = path.join(process.cwd(), service.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Set back a placeholder image based on category
    let defaultUrl = '/uploads/default-residential.jpg';
    if (serviceId === 'commercial') defaultUrl = '/uploads/default-commercial.jpg';
    if (serviceId === 'industrial') defaultUrl = '/uploads/default-industrial.jpg';
    if (serviceId === 'land') defaultUrl = '/uploads/default-land.jpg';
    if (serviceId === 'loans') defaultUrl = '/uploads/default-loans.jpg';
    if (serviceId === 'interior') defaultUrl = '/uploads/default-interior.jpg';

    await prisma.service.update({
      where: { id: serviceId },
      data: {
        image: defaultUrl,
      },
    });

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_SERVICE_IMAGE',
        details: `Deleted custom service image for ${serviceId}, reverted to default`,
      },
    });

    return res.json({ message: 'Service image deleted and reset to default placeholder', image: defaultUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
