import express from 'express';
import prisma from '../utils/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Future-Ready: AWS S3 Upload Scaffolding
// In production, you would import the AWS SDK and upload the backup buffer
/*
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const uploadToS3 = async (fileName, dataBuffer) => {
  const s3 = new S3Client({ region: process.env.AWS_REGION });
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_BACKUPS_BUCKET,
    Key: `db-backups/${fileName}`,
    Body: dataBuffer,
    ContentType: "application/json"
  }));
};
*/

// 1. EXPORT DATABASE BACKUP (JSON Format - download direct)
router.get('/export', authenticateToken, requirePermission('manage_backups'), async (req, res) => {
  try {
    // Collect all data from database tables
    const roles = await prisma.role.findMany();
    const permissions = await prisma.permission.findMany();
    const rolePermissions = await prisma.rolePermission.findMany();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        roleId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const leads = await prisma.lead.findMany();
    const leadHistory = await prisma.leadHistory.findMany();
    const followUps = await prisma.followUp.findMany();
    const activityLogs = await prisma.activityLog.findMany();
    const notifications = await prisma.notification.findMany();
    const services = await prisma.service.findMany();
    const settings = await prisma.setting.findMany();

    const backupData = {
      meta: {
        exportedAt: new Date().toISOString(),
        exportedBy: req.user.username,
        version: '1.0.0',
        system: 'Shree Sahjanand Realty CRM Backup',
      },
      data: {
        roles,
        permissions,
        rolePermissions,
        users,
        leads,
        leadHistory,
        followUps,
        activityLogs,
        notifications,
        services,
        settings,
      },
    };

    const backupString = JSON.stringify(backupData, null, 2);
    const backupBuffer = Buffer.from(backupString, 'utf-8');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `ssr-crm-backup-${timestamp}.json`;

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'EXPORT_BACKUP',
        details: `Created and downloaded database backup: ${fileName}`,
      },
    });

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/json');
    return res.send(backupBuffer);
  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({ message: 'Internal server error during database backup generation' });
  }
});

export default router;
