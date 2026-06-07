import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// 1. GET ALL STAFF
router.get('/', authenticateToken, requirePermission('manage_staff'), async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: { id: 'asc' },
    });
    // Remove passwords before sending
    const sanitized = staff.map((u) => {
      const { password, refreshToken, ...rest } = u;
      return rest;
    });
    return res.json(sanitized);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. CREATE STAFF
router.post('/', authenticateToken, requirePermission('manage_staff'), async (req, res) => {
  const { username, password, fullName, email, mobileNumber, roleId } = req.body;

  if (!username || !password || !fullName || !email || !roleId) {
    return res.status(400).json({ message: 'All fields (username, password, fullName, email, roleId) are required' });
  }

  try {
    // Check if username/email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already in use' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        email,
        mobileNumber,
        roleId: parseInt(roleId),
        isActive: true,
      },
    });

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_STAFF',
        details: `Created staff account: ${username} (${fullName})`,
      },
    });

    // Notify admins about new staff
    // Find admins to notify
    const admins = await prisma.user.findMany({
      where: { role: { name: 'Admin' } },
    });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Staff Created',
          message: `Staff member ${fullName} (${username}) has been registered.`,
        },
      });
    }

    const { password: _, refreshToken: __, ...sanitized } = user;
    return res.status(201).json(sanitized);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. UPDATE STAFF
router.put('/:id', authenticateToken, requirePermission('manage_staff'), async (req, res) => {
  const staffId = parseInt(req.params.id);
  const { fullName, email, mobileNumber, roleId, isActive } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Prevent deactivating own account
    if (staffId === req.user.id && isActive === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own admin account.' });
    }

    const updated = await prisma.user.update({
      where: { id: staffId },
      data: {
        fullName,
        email,
        mobileNumber,
        roleId: roleId ? parseInt(roleId) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_STAFF',
        details: `Updated staff profile for: ${user.username}`,
      },
    });

    const { password: _, refreshToken: __, ...sanitized } = updated;
    return res.json(sanitized);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. RESET STAFF PASSWORD
router.post('/:id/reset-password', authenticateToken, requirePermission('manage_staff'), async (req, res) => {
  const staffId = parseInt(req.params.id);
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await prisma.user.update({
      where: { id: staffId },
      data: {
        password: hashedPassword,
        refreshToken: null, // Log out existing sessions
      },
    });

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'RESET_STAFF_PASSWORD',
        details: `Reset password for staff: ${user.username}`,
      },
    });

    return res.json({ message: `Password for ${user.username} was reset successfully.` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 5. DELETE STAFF
router.delete('/:id', authenticateToken, requirePermission('manage_staff'), async (req, res) => {
  const staffId = parseInt(req.params.id);

  if (staffId === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own admin account.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    await prisma.user.delete({
      where: { id: staffId },
    });

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_STAFF',
        details: `Deleted staff account: ${user.username}`,
      },
    });

    return res.json({ message: 'Staff account deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
