import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuditLogParams {
  action: string
  targetType?: string
  targetId?: string
  targetName?: string
  oldValue?: string
  newValue?: string
  adminId?: string
  adminName?: string
  adminUserId?: string
  ipAddress?: string
  details?: string
}

export async function logAudit(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        targetType: params.targetType || null,
        targetId: params.targetId || null,
        targetName: params.targetName || null,
        oldValue: params.oldValue || null,
        newValue: params.newValue || null,
        adminId: params.adminId || null,
        adminName: params.adminName || null,
        adminUserId: params.adminUserId || null,
        ipAddress: params.ipAddress || null,
        details: params.details || null,
      },
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}

export async function getAuditLogs(filters?: {
  action?: string
  targetType?: string
  adminId?: string
  limit?: number
  offset?: number
}) {
  const where: any = {}
  if (filters?.action) where.action = { contains: filters.action }
  if (filters?.targetType) where.targetType = filters.targetType
  if (filters?.adminId) where.adminId = filters.adminId

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total }
}
