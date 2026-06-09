import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Permissions
  const permissionsData = [
    { id: 'view_leads', name: 'View Leads', description: 'Can view lead lists and details' },
    { id: 'create_leads', name: 'Create Leads', description: 'Can create new leads' },
    { id: 'edit_leads', name: 'Edit Leads', description: 'Can edit existing leads' },
    { id: 'delete_leads', name: 'Delete Leads', description: 'Can delete leads' },
    { id: 'export_leads', name: 'Export Leads', description: 'Can export leads to Excel/CSV' },
    { id: 'manage_staff', name: 'Manage Staff', description: 'Can add, edit, and deactivate staff' },
    { id: 'manage_content', name: 'Manage Content', description: 'Can edit website service text and features' },
    { id: 'manage_images', name: 'Manage Images', description: 'Can upload and replace services images' },
    { id: 'manage_roles', name: 'Manage Roles', description: 'Can manage user roles and permission sets' },
    { id: 'view_logs', name: 'View Logs', description: 'Can view chronological system activity audits' },
    { id: 'manage_settings', name: 'Manage Settings', description: 'Can edit company contact details and social links' },
    { id: 'manage_backups', name: 'Manage Backups', description: 'Can export and download database backups' },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { id: perm.id },
      update: { name: perm.name, description: perm.description },
      create: perm,
    });
  }
  console.log('Permissions seeded.');

  // 2. Seed Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Super administrator with full access',
    },
  });

  const receptionistRole = await prisma.role.upsert({
    where: { name: 'Receptionist' },
    update: {},
    create: {
      name: 'Receptionist',
      description: 'Receptionist portal user with limited CRM features',
    },
  });

  console.log('Roles seeded.');

  // 3. Link permissions to Roles
  // Admin gets all permissions
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Receptionist gets limited permissions: view, create, edit leads
  const receptionistPermIds = ['view_leads', 'create_leads', 'edit_leads'];
  for (const permId of receptionistPermIds) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: receptionistRole.id,
          permissionId: permId,
        },
      },
      update: {},
      create: {
        roleId: receptionistRole.id,
        permissionId: permId,
      },
    });
  }
  console.log('Permissions mapped to roles.');

  // 4. Seed default Users
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const receptionistPasswordHash = bcrypt.hashSync('receptionist123', salt);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      mobileNumber: '9909421050',
      password: adminPasswordHash,
    },
    create: {
      username: 'admin',
      password: adminPasswordHash,
      fullName: 'Super Admin',
      email: 'admin@shreesahjanandrealty.com',
      mobileNumber: '9909421050',
      roleId: adminRole.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'reception' },
    update: {
      mobileNumber: '9909421050',
      password: receptionistPasswordHash,
    },
    create: {
      username: 'reception',
      password: receptionistPasswordHash,
      fullName: 'Receptionist Executive',
      email: 'reception@shreesahjanandrealty.com',
      mobileNumber: '9909421050',
      roleId: receptionistRole.id,
      isActive: true,
    },
  });
  console.log('Default users seeded.');

  // 5. Seed default Site Settings
  const defaultSettings = {
    companyName: 'Shree Sahjanand Realty',
    tagline: 'Trusted Real Estate Partner Since 2007',
    subtagline: 'Helping Families and Businesses Find Their Perfect Property',
    phone: '+91 99094 21050',
    phone2: '',
    email: 'info@shreesahjanandrealty.com',
    email2: 'support@shreesahjanandrealty.com',
    address: '123, Business Hub, Near Sardar Patel Stadium, Navrangpura, Ahmedabad - 380009, Gujarat',
    facebook: 'https://www.facebook.com/share/1GoXXCisGY/',
    instagram: 'https://www.instagram.com/sahjanand_realty_1?igsh=cmRjNWx4azJuc3hx',
    twitter: 'https://twitter.com/shreesahjanandrealty',
    youtube: 'https://youtube.com/@shreesahjanandrealty',
    linkedin: 'https://linkedin.com/company/shreesahjanandrealty',
    whatsapp: 'https://wa.me/919909421050',
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log('Site settings seeded.');

  // 6. Seed Services
  const defaultServices = [
    {
      id: 'residential',
      title: 'Residential Properties',
      shortDesc: 'Luxury homes, apartments & villas for families and individuals.',
      description: 'We offer a wide range of residential properties including luxury homes, premium apartments, and villas. Our extensive portfolio ensures you find the perfect home that matches your lifestyle, preferences, and budget.',
      features: [
        '2, 3 & 4 BHK Apartments',
        'Independent Villas & Bungalows',
        'Gated Community Projects',
        'Ready-to-Move & Under Construction',
        'RERA Approved Properties',
        'Easy Loan Assistance',
      ],
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      dimensions: '1200 x 800 px',
    },
    {
      id: 'commercial',
      title: 'Commercial Properties',
      shortDesc: 'Premium office spaces, shops & business centers.',
      description: 'Grow your business with our premium commercial properties. From state-of-the-art office spaces to strategic retail locations, we help you find the commercial property that drives your business forward.',
      features: [
        'Office Spaces & IT Parks',
        'Retail Shops & Showrooms',
        'Business Centers & Co-working',
        'Shopping Malls & Complexes',
        'Strategic Locations',
        'High ROI Properties',
      ],
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      dimensions: '1200 x 800 px',
    },
    {
      id: 'industrial',
      title: 'Industrial Properties',
      shortDesc: 'Warehouses, factories & industrial plots for businesses.',
      description: 'We specialize in industrial real estate including warehouses, manufacturing units, and industrial plots. Our team helps businesses secure the ideal industrial property for their operational needs.',
      features: [
        'Warehouses & Godowns',
        'Manufacturing Units',
        'Industrial Plots & Sheds',
        'Logistics Parks',
        'GIDC Approved Properties',
        'Clear Title Properties',
      ],
      image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
      dimensions: '1200 x 800 px',
    },
    {
      id: 'land',
      title: 'Land Properties',
      shortDesc: 'Prime agricultural, residential & commercial plots.',
      description: 'Invest in land with confidence. We offer a comprehensive range of plots and land properties across prime locations for residential development, commercial use, agriculture, and investment purposes.',
      features: [
        'Residential Plots',
        'Commercial Plots',
        'Agricultural Land',
        'NA / NTP Plots',
        'Development Land',
        'Investment Opportunities',
      ],
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
      dimensions: '1200 x 800 px',
    },
    {
      id: 'loans',
      title: 'Real Estate Loans',
      shortDesc: 'Home, commercial & construction loans at best rates.',
      description: 'Our dedicated loan advisory team assists you in securing the best real estate financing options. We work with leading banks and financial institutions to get you the most favorable loan terms.',
      features: [
        'Home Loans',
        'Commercial Loans',
        'Construction Loans',
        'Property Loans',
        'Mortgage Loans',
        'Lowest Interest Rates',
      ],
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
      dimensions: '1200 x 800 px',
    },
    {
      id: 'interior',
      title: 'Interior Solutions',
      shortDesc: 'Premium interior design for homes, offices & commercial spaces.',
      description: 'Transform your property into a stunning masterpiece with our interior design services. Our expert designers create personalized spaces that reflect your style while maximizing functionality and aesthetics.',
      features: [
        'Residential Interiors',
        'Commercial Interiors',
        'Office Interiors',
        'Space Planning',
        'Renovation Services',
        '3D Design Visualization',
      ],
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      dimensions: '1200 x 800 px',
    },
  ];

  for (const service of defaultServices) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: service,
    });
  }
  console.log('Services seeded.');

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
