import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET || 'shree-sahjanand-realty-secret-key-2026-safe',
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || 'shree-sahjanand-realty-refresh-secret-key-2026-safe',
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

// Log helper
const logActivity = async (userId, action, details, req) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// 1. LOGIN
router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact administrator.' });
    }

    // Check account lock
    const now = new Date();
    if (user.lockUntil && user.lockUntil > now) {
      const minutesLeft = Math.ceil((user.lockUntil - now) / 60000);
      return res.status(403).json({
        message: `Account is temporarily locked. Try again in ${minutesLeft} minutes.`,
      });
    }

    // Compare passwords
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      const newAttempts = user.failedAttempts + 1;
      let lockUntil = null;
      let message = 'Invalid credentials';

      if (newAttempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        message = 'Too many failed login attempts. Account locked for 15 minutes.';
      } else {
        message = `Invalid credentials. ${5 - newAttempts} attempts remaining before account lock.`;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: newAttempts,
          lockUntil,
        },
      });

      return res.status(401).json({ message });
    }

    // Reset login failures on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockUntil: null,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Set refresh token in HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log Activity
    await logActivity(user.id, 'LOGIN', 'User logged in successfully', req);

    return res.json({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions.map((p) => p.permissionId),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. REFRESH TOKEN
router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'shree-sahjanand-realty-refresh-secret-key-2026-safe');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== token || !user.isActive) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user);
    return res.json({ accessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

// 3. LOGOUT
router.post('/logout', async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  try {
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.userId) {
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { refreshToken: null },
        });
        await logActivity(decoded.userId, 'LOGOUT', 'User logged out', req);
      }
    }
  } catch (e) {
    // Ignore error
  }

  res.clearCookie('refreshToken');
  return res.json({ message: 'Logged out successfully' });
});

// 4. GET CURRENT USER
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Session invalid' });
    }

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions.map((p) => p.permissionId),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 5. CHANGE PASSWORD
router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isCurrentValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isCurrentValid) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
        refreshToken: null, // Force re-login on refresh
      },
    });

    await logActivity(user.id, 'PASSWORD_CHANGE', 'User changed their password', req);

    return res.json({ message: 'Password updated successfully. Please login again.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 6. FORGOT PASSWORD (PUBLIC SIMULATED)
router.post('/forgot-password', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // We return success even if user not found for security reasons
    if (user) {
      await logActivity(user.id, 'FORGOT_PASSWORD_REQUEST', 'Simulated password reset request', req);
    }

    return res.json({
      message: 'If the username exists, reset instructions have been logged. Please contact your system admin to reset your password.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
