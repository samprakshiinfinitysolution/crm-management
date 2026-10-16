import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { ExportService } from '../services/export.service.js';
import { getAuthUser } from '../utils/auth.helper.js';
import AuditService from '../services/audit.service.js';

/**
 * Controller endpoint: POST /api/exports/leads
 * Exports filtered or selected leads into an Excel (.xlsx) file.
 */
export const exportLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = getAuthUser(req);
    const filterInput = req.body || {};

    const { buffer, contentType, fileName, count } = await ExportService.exportLeadsToExcel(
      filterInput,
      { id: user.id, role: user.role }
    );

    // Record audit log for data export
    await AuditService.log({
      actorUserId: user.id,
      action: 'EXPORT',
      entityType: 'Lead',
      ipAddress: req.ip || req.socket.remoteAddress,
      newValue: {
        count,
        fileName: fileName || 'leads.xlsx',
        format: filterInput.format || 'xlsx',
        filter: filterInput,
      },
    });

    res.setHeader(
      'Content-Type',
      contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName || 'leads.xlsx'}"`
    );
    res.setHeader('Content-Length', buffer.length);

    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};


export const exportReports = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = getAuthUser(req);
    const { timeRange, format } = req.query;
    const filterInput = req.body || {};

    const { buffer, contentType, fileName, count } = await ExportService.exportReportsToExcel(
      {
        timeRange: (timeRange as string) || filterInput.timeRange,
        format: ((format as string) || filterInput.format || 'xlsx') as 'xlsx' | 'csv',
        ...filterInput,
      },
      { id: user.id, role: user.role }
    );

    // Record audit log for data export
    await AuditService.log({
      actorUserId: user.id,
      action: 'EXPORT',
      entityType: 'Report',
      ipAddress: req.ip || req.socket.remoteAddress,
      newValue: {
        count,
        fileName: fileName || 'reports.xlsx',
        format: filterInput.format || 'xlsx',
        filter: filterInput,
      },
    });

    res.setHeader(
      'Content-Type',
      contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName || 'reports.xlsx'}"`
    );
    res.setHeader('Content-Length', buffer.length);

    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};