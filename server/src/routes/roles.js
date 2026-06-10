import express from 'express';
import prisma from '../utils/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// 1. GET ALL ROLES (With their permissions)
router.get('/', authenticateToken, requirePermission('manage_roles'), async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
      },
      orderBy: { id: 'asc' },
    });
    return res.json(roles);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. GET ALL AVAILABLE PERMISSIONS
router.get('/permissions', authenticateToken, requirePermission('manage_roles'), async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany();
    return res.json(permissions);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. CREATE ROLE
router.post('/', authenticateToken, requirePermission('manage_roles'), async (req, res) => {
  const { name, description, permissionIds } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Role name is required' });
  }

  try {
    const existing = await prisma.role.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
      },
    });

    // Create permissions mapping
    if (permissionIds && Array.isArray(permissionIds)) {
      const mappings = permissionIds.map((permId) => ({
        roleId: role.id,
        permissionId: permId,
      }));

      await prisma.rolePermission.createMany({
        data: mappings,
      });
    }

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_ROLE',
        details: `Created role: ${name} with ${permissionIds?.length || 0} permissions`,
      },
    });

    return res.status(201).json(role);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. UPDATE ROLE
router.put('/:id', authenticateToken, requirePermission('manage_roles'), async (req, res) => {
  const roleId = parseInt(req.params.id);
  const { name, description, permissionIds } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Role name is required' });
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (role.name === 'Admin' && name !== 'Admin') {
      return res.status(400).json({ message: 'Cannot rename the Admin role' });
    }

    // Update role metadata
    await prisma.role.update({
      where: { id: roleId },
      data: {
        name,
        description,
      },
    });

    // Reset and rebuild permissions mappings
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    if (permissionIds && Array.isArray(permissionIds)) {
      const mappings = permissionIds.map((permId) => ({
        roleId,
        permissionId: permId,
      }));

      await prisma.rolePermission.createMany({
        data: mappings,
      });
    }

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_ROLE',
        details: `Updated role: ${name}. Set ${permissionIds?.length || 0} permissions`,
      },
    });

    return res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 5. DELETE ROLE
router.delete('/:id', authenticateToken, requirePermission('manage_roles'), async (req, res) => {
  const roleId = parseInt(req.params.id);

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true,
      },
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'receptionist') {
      return res.status(400).json({ message: 'Cannot delete core system roles (Admin, Receptionist)' });
    }

    if (role.users.length > 0) {
      return res.status(400).json({
        message: `Cannot delete role. There are ${role.users.length} staff member(s) assigned to this role.`,
      });
    }

    await prisma.role.delete({
      where: { id: roleId },
    });

    // Audit Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_ROLE',
        details: `Deleted role: ${role.name}`,
      },
    });

    return res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
