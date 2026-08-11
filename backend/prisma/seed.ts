import { PrismaClient, Role, UserStatus, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const users = [
    { email: 'admin@parthmobiles.com', name: 'Admin', role: Role.ADMIN },
    { email: 'sales@parthmobiles.com', name: 'Sales One', role: Role.SALES },
    { email: 'sales2@parthmobiles.com', name: 'Sales Two', role: Role.SALES },
    { email: 'warehouse@parthmobiles.com', name: 'Warehouse', role: Role.WAREHOUSE },
    { email: 'accounts@parthmobiles.com', name: 'Accounts', role: Role.ACCOUNTS },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash, status: UserStatus.ACTIVE },
      create: { email: user.email, name: user.name, role: user.role, passwordHash, status: UserStatus.ACTIVE },
    });
  }

  const admin = await prisma.user.findUnique({ where: { email: 'admin@parthmobiles.com' } });
  const sales = await prisma.user.findUnique({ where: { email: 'sales@parthmobiles.com' } });

  if (!admin || !sales) throw new Error('Failed to seed users');

  // 2. Customers
  const customerData = [
    { name: 'ABC Mobile Store', mobile: '9876543210', type: CustomerType.RETAIL },
    { name: 'Shree Telecom', mobile: '9876543211', type: CustomerType.WHOLESALE },
    { name: 'Raj Mobiles', mobile: '9876543212', type: CustomerType.RETAIL },
    { name: 'Digital World', mobile: '9876543213', type: CustomerType.DISTRIBUTOR },
    { name: 'City Mobile Hub', mobile: '9876543214', type: CustomerType.RETAIL },
    { name: 'Kiran Mobile', mobile: '9876543215', type: CustomerType.WHOLESALE },
    { name: 'Patel Telecom', mobile: '9876543216', type: CustomerType.RETAIL },
    { name: 'Smart Phone Zone', mobile: '9876543217', type: CustomerType.RETAIL },
    { name: 'Mobile Planet', mobile: '9876543218', type: CustomerType.DISTRIBUTOR },
    { name: 'Prime Telecom', mobile: '9876543219', type: CustomerType.WHOLESALE },
  ];

  for (const c of customerData) {
    await prisma.customer.upsert({
      where: { id: c.mobile }, // Using mobile temporarily for upsert uniqueness logic if needed, but since id is uuid, we can just clear/reseed or findFirst
      update: {},
      create: {
        customerName: c.name,
        businessName: c.name,
        mobile: c.mobile,
        customerType: c.type,
        address: '123 Test Street, India',
        status: CustomerStatus.ACTIVE,
      }
    });
  }

  // Find some customers for challans
  const firstCustomer = await prisma.customer.findFirst({ where: { mobile: '9876543210' } });
  const secondCustomer = await prisma.customer.findFirst({ where: { mobile: '9876543211' } });

  // 3. Products
  const products = [
    { name: 'iPhone 15', sku: 'IP15-128-BLK', cat: 'Smartphones', price: 59999, stock: 20, min: 5 },
    { name: 'iPhone 15 Pro', sku: 'IP15P-256-NT', cat: 'Smartphones', price: 109999, stock: 15, min: 5 },
    { name: 'Samsung Galaxy S24', sku: 'SGS24-256-GRY', cat: 'Smartphones', price: 69999, stock: 15, min: 5 },
    { name: 'Samsung Galaxy A55', sku: 'SGA55-128-LBL', cat: 'Smartphones', price: 34999, stock: 25, min: 10 },
    { name: 'OnePlus 12', sku: 'OP12-256-GRN', cat: 'Smartphones', price: 55999, stock: 12, min: 5 },
    { name: 'OnePlus Nord CE', sku: 'OPNCE-128-BLK', cat: 'Smartphones', price: 22999, stock: 30, min: 10 },
    { name: 'Vivo V30', sku: 'VV30-128-BLU', cat: 'Smartphones', price: 29999, stock: 3, min: 5 }, // Low stock
    { name: 'Oppo Reno 12', sku: 'OPR12-128-SLV', cat: 'Smartphones', price: 27999, stock: 8, min: 5 },
    { name: 'Realme 12 Pro', sku: 'RM12P-128-BEG', cat: 'Smartphones', price: 24999, stock: 10, min: 5 },
    { name: 'Google Pixel 8', sku: 'GP8-128-OBS', cat: 'Smartphones', price: 65999, stock: 2, min: 5 }, // Low stock
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { currentStock: p.stock, unitPrice: p.price },
      create: {
        productName: p.name,
        sku: p.sku,
        category: p.cat,
        unitPrice: p.price,
        currentStock: p.stock,
        minimumStock: p.min,
        warehouseLocation: 'WH-01',
      }
    });
  }

  const pIphone = await prisma.product.findUnique({ where: { sku: 'IP15-128-BLK' } });
  const pSamsung = await prisma.product.findUnique({ where: { sku: 'SGS24-256-GRY' } });
  const pVivo = await prisma.product.findUnique({ where: { sku: 'VV30-128-BLU' } });

  // 4. Stock Movements
  if (pIphone && pSamsung && pVivo) {
    const movements = await prisma.stockMovement.count();
    if (movements === 0) {
      await prisma.stockMovement.createMany({
        data: [
          { productId: pIphone.id, quantity: 30, movementType: MovementType.IN, reason: 'Initial Stock', createdById: admin.id },
          { productId: pSamsung.id, quantity: 20, movementType: MovementType.IN, reason: 'Initial Stock', createdById: admin.id },
          { productId: pVivo.id, quantity: 10, movementType: MovementType.IN, reason: 'Initial Stock', createdById: admin.id },
          // A few out movements to justify current stock
          { productId: pIphone.id, quantity: 10, movementType: MovementType.OUT, reason: 'Sales Challan SC-2026-0001', createdById: sales.id },
          { productId: pSamsung.id, quantity: 5, movementType: MovementType.OUT, reason: 'Sales Challan SC-2026-0002', createdById: sales.id },
          { productId: pVivo.id, quantity: 7, movementType: MovementType.OUT, reason: 'Retail Sales', createdById: sales.id },
        ]
      });
    }
  }

  // 5. Challans
  if (firstCustomer && secondCustomer && pIphone && pSamsung) {
    const challanExists = await prisma.challan.findUnique({ where: { challanNumber: 'SC-2026-0001' } });
    if (!challanExists) {
      const challan1 = await prisma.challan.create({
        data: {
          challanNumber: 'SC-2026-0001',
          customerId: firstCustomer.id,
          totalQuantity: 3,
          status: ChallanStatus.CONFIRMED,
          createdById: sales.id,
        }
      });

      await prisma.challanItem.createMany({
        data: [
          { challanId: challan1.id, productId: pIphone.id, productName: pIphone.productName, sku: pIphone.sku, unitPrice: pIphone.unitPrice, quantity: 2 },
          { challanId: challan1.id, productId: pSamsung.id, productName: pSamsung.productName, sku: pSamsung.sku, unitPrice: pSamsung.unitPrice, quantity: 1 }
        ]
      });

      const challan2 = await prisma.challan.create({
        data: {
          challanNumber: 'SC-2026-0002',
          customerId: secondCustomer.id,
          totalQuantity: 10,
          status: ChallanStatus.DRAFT,
          createdById: sales.id,
        }
      });

      await prisma.challanItem.create({
        data: { challanId: challan2.id, productId: pIphone.id, productName: pIphone.productName, sku: pIphone.sku, unitPrice: pIphone.unitPrice, quantity: 10 }
      });
    }
  }

  // 6. Follow-ups
  if (firstCustomer && secondCustomer) {
    const followUps = await prisma.customerFollowUp.count();
    if (followUps === 0) {
      await prisma.customerFollowUp.createMany({
        data: [
          { customerId: firstCustomer.id, note: 'Interested in 10 iPhone 15 units.', followUpDate: new Date(Date.now() + 86400000), createdById: sales.id },
          { customerId: secondCustomer.id, note: 'Discuss Samsung bulk order.', followUpDate: new Date(Date.now() + 172800000), createdById: sales.id },
        ]
      });
    }
  }

  console.log('Database seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
