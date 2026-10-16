import { getToken } from '@/lib/utils';
import type { ExportLeadsPayload } from '@/types/api.types';
import { toast } from 'sonner';

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  const backend = (
    process.env.INTERNAL_BACKEND_URL ||
    process.env.BACKEND_URL ||
    'http://localhost:5000'
  )
    .replace(/\/api\/?$/, '')
    .replace(/\/+$/, '');

  return `${backend}/api`;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Downloads leads export file (.xlsx or .csv) from the backend API.
 * Automatically handles token authentication, Content-Disposition filename extraction,
 * and browser file download triggering.
 */
export async function downloadLeadsExport(payload: ExportLeadsPayload = {}): Promise<boolean> {
  const toastId = toast.loading('Generating leads export file...');

  try {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/exports/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to export leads';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Response was not JSON
      }
      toast.error(errorMessage, { id: toastId });
      return false;
    }

    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `leads_export_${new Date().toISOString().split('T')[0]}.${payload.format || 'xlsx'}`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        fileName = match[1].trim();
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(blobUrl);

    toast.success(`Successfully downloaded ${fileName}`, { id: toastId });
    return true;
  } catch (error) {
    console.error('Error exporting leads:', error);
    toast.error('Network error occurred while exporting leads. Please try again.', {
      id: toastId,
    });
    return false;
  }
}

/**
 * Downloads import batch error logs (.xlsx) from the backend API.
 * Endpoint: GET /api/imports/batches/:id/errors/export
 */
export async function downloadImportErrors(batchId: string, fallbackFileName?: string): Promise<boolean> {
  const toastId = toast.loading('Generating error logs export...');

  try {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/imports/batches/${batchId}/errors/export`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = 'Failed to export import errors';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Response was not JSON
      }
      toast.error(errorMessage, { id: toastId });
      return false;
    }

    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = fallbackFileName ? `import-errors-${fallbackFileName}.xlsx` : `import-errors-${batchId.slice(0, 8)}.xlsx`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        fileName = match[1].trim();
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(blobUrl);

    toast.success(`Successfully downloaded error logs: ${fileName}`, { id: toastId });
    return true;
  } catch (error) {
    console.error('Error exporting import error logs:', error);
    toast.error('Network error occurred while downloading error logs.', {
      id: toastId,
    });
    return false;
  }
}

/**
 * Downloads official CRM leads import template (.xlsx) from the backend API.
 * Endpoint: GET /api/imports/template?sample=true
 */
export async function downloadImportTemplate(includeSample: boolean = true): Promise<boolean> {
  const toastId = toast.loading('Preparing sample template...');

  try {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/imports/template?sample=${includeSample}`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = 'Failed to download template';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Response was not JSON
      }
      toast.error(errorMessage, { id: toastId });
      return false;
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = 'CRM_Leads_Template.xlsx';

    if (contentDisposition) {
      const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        fileName = match[1].trim();
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(blobUrl);

    toast.success(`Successfully downloaded ${fileName}`, { id: toastId });
    return true;
  } catch (error) {
    console.error('Error downloading import template:', error);
    toast.error('Network error occurred while downloading template.', {
      id: toastId,
    });
    return false;
  }
}

export interface ExportReportsPayload {
  timeRange?: string;
  executiveId?: string;
  assignedToUserId?: string;
  source?: string;
  status?: string;
  priority?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  format?: 'xlsx' | 'csv';
}

/**
 * Downloads comprehensive CRM intelligence and performance reports (.xlsx) from the backend API.
 * Endpoint: POST /api/exports/reports or GET /api/exports/reports
 */
export async function downloadReportsExport(payload: ExportReportsPayload = {}): Promise<boolean> {
  const isCsv = payload.format === 'csv';
  const toastId = toast.loading(`Generating executive performance & intelligence report (${isCsv ? 'CSV' : 'Excel'})...`);

  try {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/exports/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to export reports';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Response was not JSON
      }
      toast.error(errorMessage, { id: toastId });
      return false;
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `crm_report_${payload.timeRange || '7d'}_${new Date().toISOString().split('T')[0]}.${isCsv ? 'csv' : 'xlsx'}`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        fileName = match[1].trim();
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(blobUrl);

    toast.success(`Successfully downloaded ${fileName}`, { id: toastId });
    return true;
  } catch (error) {
    console.error('Error exporting report:', error);
    toast.error('Network error occurred while generating report export. Please try again.', {
      id: toastId,
    });
    return false;
  }
}



