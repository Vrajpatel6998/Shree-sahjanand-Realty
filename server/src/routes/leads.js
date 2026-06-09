import express from 'express';
import XLSX from 'xlsx';
import prisma from '../utils/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Helper to log lead action
const logLeadHistory = async (leadId, userId, action, details) => {
  await prisma.leadHistory.create({
    data: {
      leadId,
      userId,
      action,
      details,
    },
  });
};

// 1. PUBLIC ROUTE: CREATE WEBSITE LEAD (Public website modal submit)
router.post('/public', async (req, res) => {
  const { firstName, lastName, contactNumber, alternateNumber, interestedService, occupation, budget, inquiryType, reference } = req.body;

  if (!firstName || !lastName || !contactNumber || !interestedService || !inquiryType) {
    return res.status(400).json({ message: 'Required fields missing: firstName, lastName, contactNumber, interestedService, inquiryType' });
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        source: 'WEBSITE',
        firstName,
        lastName,
        contactNumber,
        alternateNumber,
        interestedService,
        occupation: occupation || 'Other',
        budget: budget || 'Under ₹25 Lakhs',
        inquiryType: inquiryType === 'realbuyer' || inquiryType === 'Real Buyer' ? 'Real Buyer' : 'Investor',
        reference,
        status: 'NEW_LEAD',
      },
    });

    await logLeadHistory(lead.id, null, 'Lead Created', 'Created through website quick inquiry form');

    // Notify all Admins about new website lead
    const admins = await prisma.user.findMany({
      where: { role: { name: 'Admin' } },
    });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Website Lead',
          message: `New website inquiry from ${firstName} ${lastName} for ${interestedService}.`,
        },
      });
    }

    return res.status(201).json({ message: 'Inquiry submitted successfully', leadId: lead.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. EXPORT LEADS (Must be defined BEFORE /:id to prevent routing clash)
router.get('/export', authenticateToken, requirePermission('export_leads'), async (req, res) => {
  const { format, source, status, service, staffId, startDate, endDate } = req.query;

  try {
    const where = {};
    if (source) where.source = source;
    if (status) where.status = status;
    if (service) where.interestedService = service;
    if (staffId) where.allocatedStaffId = parseInt(staffId);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        allocatedStaff: {
          select: { fullName: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format data for sheet export
    const exportData = leads.map((l) => ({
      'Lead ID': `L-${l.id}`,
      Source: l.source,
      'First Name': l.firstName,
      'Last Name': l.lastName,
      'Contact Number': l.contactNumber,
      'Alternate Number': l.alternateNumber || '-',
      'Interested Service': l.interestedService,
      Occupation: l.occupation,
      Budget: l.budget,
      'Inquiry Type': l.inquiryType,
      'Interested Area': l.interestedArea || '-',
      'Allocated Staff': l.allocatedStaff ? l.allocatedStaff.fullName : 'Unallocated',
      'Site Visit Interested': l.interestedForSiteVisit ? 'Yes' : 'No',
      Reference: l.reference || '-',
      Status: l.status,
      'Follow-Up Date': l.followUpDate ? l.followUpDate.toISOString().split('T')[0] : '-',
      Notes: l.notes || '-',
      'Created Date': l.createdAt.toISOString().split('T')[0],
    }));

    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      res.setHeader('Content-Disposition', 'attachment; filename="leads_export.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvOutput);
    } else {
      // Default XLSX
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename="leads_export.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error while exporting' });
  }
});

// 3. GET DASHBOARD METRICS SUMMARY
router.get('/summary', authenticateToken, requirePermission('view_leads'), async (req, res) => {
  try {
    // Basic counts
    const totalWebsite = await prisma.lead.count({ where: { source: 'WEBSITE' } });
    const totalReception = await prisma.lead.count({ where: { source: 'RECEPTION' } });
    const totalStaff = await prisma.user.count({ where: { isActive: true } });
    const totalServices = await prisma.service.count();
    
    // Monthly inquiries
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyInquiries = await prisma.lead.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    });

    // Unique Categories
    const categoriesCount = await prisma.service.count();

    // Service-wise Inquiry Distribution
    const serviceDistribution = await prisma.lead.groupBy({
      by: ['interestedService'],
      _count: { id: true },
    });

    // Status distribution
    const statusDistribution = await prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Recent activities (Audit logs)
    const recentLogs = await prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, username: true } },
      },
    });

    // Recent leads
    const recentLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        allocatedStaff: { select: { fullName: true } },
      },
    });

    // Leads per day for charts (Last 7 days)
    const dailyLeadsRaw = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, count(id) as count 
      FROM "Lead" 
      WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC;
    `;

    return res.json({
      totalWebsite,
      totalReception,
      totalActiveStaff: totalStaff,
      totalServices,
      totalMonthlyInquiries: monthlyInquiries,
      totalPropertyCategories: categoriesCount,
      serviceDistribution: serviceDistribution.map((s) => ({
        service: s.interestedService,
        count: s._count.id,
      })),
      statusDistribution: statusDistribution.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      recentActivities: recentLogs.map((l) => ({
        id: l.id,
        user: l.user ? l.user.fullName : 'System',
        action: l.action,
        details: l.details,
        time: l.createdAt,
      })),
      recentLeads: recentLeads.map((l) => ({
        id: l.id,
        name: `${l.firstName} ${l.lastName}`,
        service: l.interestedService,
        source: l.source,
        status: l.status,
        staff: l.allocatedStaff ? l.allocatedStaff.fullName : 'Unassigned',
        date: l.createdAt,
      })),
      dailyLeads: dailyLeadsRaw.map((row) => ({
        ...row,
        count: Number(row.count),
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error fetching metrics summary' });
  }
});

// 4. GET ALL LEADS (Filtered & Paginated)
router.get('/', authenticateToken, requirePermission('view_leads'), async (req, res) => {
  const {
    source,
    status,
    service,
    budget,
    occupation,
    inquiryType,
    staffId,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    const where = {};

    if (source) where.source = source;
    if (status) where.status = status;
    if (service) where.interestedService = service;
    if (budget) where.budget = budget;
    if (occupation) where.occupation = occupation;
    if (inquiryType) where.inquiryType = inquiryType;
    if (staffId) where.allocatedStaffId = parseInt(staffId);

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      const parsedId = parseInt(search.replace(/L-/gi, ''));
      const idFilter = !isNaN(parsedId) ? { id: parsedId } : undefined;

      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { contactNumber: { contains: search, mode: 'insensitive' } },
        { interestedService: { contains: search, mode: 'insensitive' } },
        { interestedArea: { contains: search, mode: 'insensitive' } },
        ...(idFilter ? [idFilter] : []),
      ];
    }

    const [leads, total] = await prisma.$transaction([
      prisma.lead.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          allocatedStaff: {
            select: { id: true, fullName: true, username: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.count({ where }),
    ]);

    return res.json({
      leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error fetching leads' });
  }
});

// 5. GET SINGLE LEAD DETAILS & TIMELINE
router.get('/:id', authenticateToken, requirePermission('view_leads'), async (req, res) => {
  const leadId = parseInt(req.params.id);

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        allocatedStaff: {
          select: { id: true, fullName: true, email: true, mobileNumber: true },
        },
        history: {
          include: {
            user: { select: { fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        followUps: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    return res.json(lead);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 6. CREATE LEAD (CRM Panel input - Receptionist / Admin)
router.post('/', authenticateToken, requirePermission('create_leads'), async (req, res) => {
  const {
    source = 'RECEPTION',
    firstName,
    lastName,
    contactNumber,
    alternateNumber,
    interestedService,
    occupation,
    budget,
    inquiryType,
    interestedArea,
    allocatedStaffId,
    interestedForSiteVisit,
    reference,
    notes,
    followUpDate,
    status = 'NEW_LEAD',
  } = req.body;

  if (!firstName || !lastName || !contactNumber || !interestedService || !occupation || !budget || !inquiryType || interestedForSiteVisit === undefined) {
    return res.status(400).json({ message: 'Missing required reception lead parameters' });
  }

  try {
    const staffId = allocatedStaffId ? parseInt(allocatedStaffId) : null;

    const lead = await prisma.lead.create({
      data: {
        source,
        firstName,
        lastName,
        contactNumber,
        alternateNumber,
        interestedService,
        occupation,
        budget,
        inquiryType,
        interestedArea,
        allocatedStaffId: staffId,
        interestedForSiteVisit: interestedForSiteVisit === true || interestedForSiteVisit === 'Yes' || interestedForSiteVisit === 'true',
        reference,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        status,
      },
    });

    // Create lead history entry
    await logLeadHistory(lead.id, req.user.id, 'Lead Created', `Lead added by receptionist/staff user: ${req.user.fullName}`);

    // Create dynamic follow-up schedule if date is provided
    if (followUpDate) {
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          date: new Date(followUpDate),
          notes: 'Initial follow-up scheduled during lead creation',
        },
      });
    }

    // Notify allocated staff member
    if (staffId) {
      await prisma.notification.create({
        data: {
          userId: staffId,
          title: 'New Lead Allocated',
          message: `You have been allocated a new lead: ${firstName} ${lastName} for ${interestedService}.`,
        },
      });
    }

    // Notify admins about new receptionist lead
    const admins = await prisma.user.findMany({
      where: { role: { name: 'Admin' } },
    });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Reception Lead Added',
          message: `Staff member ${req.user.fullName} created a reception lead for ${firstName} ${lastName}.`,
        },
      });
    }

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_LEAD',
        details: `Created receptionist lead L-${lead.id} for ${firstName} ${lastName}`,
      },
    });

    return res.status(201).json(lead);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error while creating lead' });
  }
});

// 7. EDIT / UPDATE LEAD (CRM Panel Workflow updates)
router.put('/:id', authenticateToken, requirePermission('edit_leads'), async (req, res) => {
  const leadId = parseInt(req.params.id);
  const {
    firstName,
    lastName,
    contactNumber,
    alternateNumber,
    interestedService,
    occupation,
    budget,
    inquiryType,
    interestedArea,
    allocatedStaffId,
    interestedForSiteVisit,
    reference,
    notes,
    followUpDate,
    status,
  } = req.body;

  try {
    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!existingLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const staffId = allocatedStaffId ? parseInt(allocatedStaffId) : null;
    const oldStaffId = existingLead.allocatedStaffId;
    const oldStatus = existingLead.status;

    // Track status transitions or staff changes
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (contactNumber !== undefined) updates.contactNumber = contactNumber;
    if (alternateNumber !== undefined) updates.alternateNumber = alternateNumber;
    if (interestedService !== undefined) updates.interestedService = interestedService;
    if (occupation !== undefined) updates.occupation = occupation;
    if (budget !== undefined) updates.budget = budget;
    if (inquiryType !== undefined) updates.inquiryType = inquiryType;
    if (interestedArea !== undefined) updates.interestedArea = interestedArea;
    if (staffId !== undefined) updates.allocatedStaffId = staffId;
    if (interestedForSiteVisit !== undefined) {
      updates.interestedForSiteVisit = interestedForSiteVisit === true || interestedForSiteVisit === 'Yes' || interestedForSiteVisit === 'true';
    }
    if (reference !== undefined) updates.reference = reference;
    if (notes !== undefined) updates.notes = notes;
    if (followUpDate !== undefined) updates.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (status !== undefined) updates.status = status;

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: updates,
    });

    // Dynamic checks & logging
    // A. Status Changed
    if (status && status !== oldStatus) {
      await logLeadHistory(
        leadId,
        req.user.id,
        'Status Updated',
        `Lead status shifted from ${oldStatus} to ${status}`
      );
    }

    // B. Staff Assignment Changed
    if (staffId && staffId !== oldStaffId) {
      const newStaff = await prisma.user.findUnique({ where: { id: staffId } });
      await logLeadHistory(
        leadId,
        req.user.id,
        'Staff Reallocated',
        `Lead assigned to staff member: ${newStaff ? newStaff.fullName : 'Unassigned'}`
      );

      // Notify the new staff member
      await prisma.notification.create({
        data: {
          userId: staffId,
          title: 'Lead Assigned to You',
          message: `Lead L-${leadId} (${updatedLead.firstName} ${updatedLead.lastName}) was reallocated to your profile.`,
        },
      });
    }

    // C. Follow-up Scheduled
    if (followUpDate && new Date(followUpDate).getTime() !== existingLead.followUpDate?.getTime()) {
      await prisma.followUp.create({
        data: {
          leadId,
          date: new Date(followUpDate),
          notes: 'Follow-up updated/scheduled in lead details editor',
        },
      });

      if (staffId) {
        await prisma.notification.create({
          data: {
            userId: staffId,
            title: 'Lead Follow-up Set',
            message: `A follow-up reminder is set for L-${leadId} on ${followUpDate.split('T')[0]}.`,
          },
        });
      }
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_LEAD',
        details: `Edited details for lead L-${leadId} (${updatedLead.firstName} ${updatedLead.lastName})`,
      },
    });

    return res.json(updatedLead);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error while updating lead' });
  }
});

// 8. DELETE LEAD (Admin Only)
router.delete('/:id', authenticateToken, requirePermission('delete_leads'), async (req, res) => {
  const leadId = parseInt(req.params.id);

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Delete related child records first to ensure referential integrity regardless of DB cascade support
    await prisma.leadHistory.deleteMany({ where: { leadId } });
    await prisma.followUp.deleteMany({ where: { leadId } });

    await prisma.lead.delete({
      where: { id: leadId },
    });

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_LEAD',
        details: `Deleted lead record L-${leadId} (${lead.firstName} ${lead.lastName})`,
      },
    });

    return res.json({ message: 'Lead record deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
