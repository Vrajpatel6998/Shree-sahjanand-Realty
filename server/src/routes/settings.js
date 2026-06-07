import express from 'express';
import prisma from '../utils/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// 1. GET ALL SETTINGS (Public)
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    // Convert to a key-value object
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    // Structure it to look like the static siteInfo
    const siteInfo = {
      name: settingsObj.companyName || 'Shree Sahjanand Realty',
      tagline: settingsObj.tagline || 'Trusted Real Estate Partner Since 2007',
      subtagline: settingsObj.subtagline || 'Helping Families and Businesses Find Their Perfect Property',
      phone: settingsObj.phone || '+91 98765 43210',
      phone2: settingsObj.phone2 || '+91 98765 43211',
      email: settingsObj.email || 'info@shreesahjanandrealty.com',
      email2: settingsObj.email2 || 'support@shreesahjanandrealty.com',
      address: settingsObj.address || 'Ahmedabad, Gujarat',
      social: {
        facebook: settingsObj.facebook || '',
        instagram: settingsObj.instagram || '',
        twitter: settingsObj.twitter || '',
        youtube: settingsObj.youtube || '',
        linkedin: settingsObj.linkedin || '',
        whatsapp: settingsObj.whatsapp || '',
      },
    };

    return res.json(siteInfo);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. UPDATE SETTINGS
router.put('/', authenticateToken, requirePermission('manage_settings'), async (req, res) => {
  const settingsData = req.body; // Key-value pairs of settings

  try {
    const operations = Object.entries(settingsData).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await prisma.$transaction(operations);

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_SETTINGS',
        details: `Updated site settings: ${Object.keys(settingsData).join(', ')}`,
      },
    });

    return res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
