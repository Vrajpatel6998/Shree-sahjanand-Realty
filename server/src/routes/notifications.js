import express from 'express';
import prisma from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. GET ALL USER NOTIFICATIONS
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. MARK ALL READ
router.put('/mark-read', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. MARK SINGLE READ
router.put('/:id/read', authenticateToken, async (req, res) => {
  const notifId = parseInt(req.params.id);

  try {
    const notif = await prisma.notification.findUnique({
      where: { id: notifId },
    });

    if (!notif || notif.userId !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id: notifId },
      data: { isRead: true },
    });

    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
