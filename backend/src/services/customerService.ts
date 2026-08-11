import prisma from '../config/database';
import { CustomerType, CustomerStatus, Prisma } from '@prisma/client';

export const getCustomers = async ({
  page = 1,
  limit = 10,
  search,
  status,
  customerType,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = {};

  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { businessName: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search } },
    ];
  }

  if (status && status !== 'ALL') {
    where.status = status as CustomerStatus;
  }

  if (customerType && customerType !== 'ALL') {
    where.customerType = customerType as CustomerType;
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCustomerById = async (id: string) => {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      followUps: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, role: true },
          },
        },
      },
    },
  });
};

export const createCustomer = async (data: any) => {
  return prisma.customer.create({
    data: {
      customerName: data.customerName,
      mobile: data.mobile,
      email: data.email || null,
      businessName: data.businessName,
      gstNumber: data.gstNumber || null,
      customerType: data.customerType,
      address: data.address,
      status: data.status,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      notes: data.notes || null,
    },
  });
};

export const updateCustomer = async (id: string, data: any) => {
  const updateData: any = { ...data };
  if (data.followUpDate) {
    updateData.followUpDate = new Date(data.followUpDate);
  } else if (data.followUpDate === '') {
    updateData.followUpDate = null;
  }
  
  if (data.email === '') updateData.email = null;
  if (data.gstNumber === '') updateData.gstNumber = null;
  if (data.notes === '') updateData.notes = null;

  return prisma.customer.update({
    where: { id },
    data: updateData,
  });
};

export const addFollowUp = async (customerId: string, createdById: string, data: any) => {
  return prisma.customerFollowUp.create({
    data: {
      customerId,
      createdById,
      note: data.note,
      followUpDate: new Date(data.followUpDate),
    },
  });
};
