import express from 'express';
import prisma from '../utils/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// 1. GET ALL SYSTEM AUDIT LOGS (Admin only)
router.get('/', authenticateToken, requirePermission('view_logs'), async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    const where = {};

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [logs, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: { id: true, fullName: true, username: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return res.json({
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error fetching activity logs' });
  }
});

export default router;
