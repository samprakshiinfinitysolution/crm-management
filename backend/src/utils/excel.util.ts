import ExcelJS from "exceljs";

export interface LeadExportRow {
  leadCode: string;
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  companyName?: string | null;
  city?: string | null;
  state?: string | null;
  requirement: string;
  productService?: string | null;
  budget?: number | string | null;
  leadSource?: string | null;
  priority: string;
  status: string;
  assignedToName?: string | null;
  assignedByName?: string | null;
  assignedAt?: Date | string | null;
  createdAt: Date | string;
}

/**
 * Prevents spreadsheet formula injection.
 *
 * Excel/LibreOffice may interpret cells beginning with:
 * =, +, -, @
 * as formulas when the exported file is opened.
 *
 * Prefixing with an apostrophe forces the value to be treated as text.
 */
/**
 * Prevents spreadsheet formula injection.
 *
 * Excel/LibreOffice may interpret cells beginning with:
 * =, +, -, @
 * as formulas when the exported file is opened.
 *
 * Prefixing with an apostrophe forces the value to be treated as text.
 */
export const sanitizeSpreadsheetCell = (value: string | null | undefined): string => {
  if (value == null) {
    return "";
  }

  const normalized = String(value);

  if (/^[=+\-@]/.test(normalized)) {
    return `'${normalized}`;
  }

  return normalized;
};

export const sanitizeFormula = sanitizeSpreadsheetCell;

/**
 * Generates a professionally formatted Excel workbook buffer for Leads export.
 */
export const generateLeadsExcelBuffer = async (
  leads: LeadExportRow[],
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "CRM System";
  workbook.lastModifiedBy = "CRM System";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Leads Export", {
    views: [{ showGridLines: true }],
  });

  worksheet.columns = [
    { header: "Lead Code", key: "leadCode", width: 16 },
    { header: "Customer Name", key: "customerName", width: 24 },
    { header: "Mobile Number", key: "mobile", width: 16 },
    { header: "Alternate Mobile", key: "alternateMobile", width: 18 },
    { header: "Email Address", key: "email", width: 28 },
    { header: "Company Name", key: "companyName", width: 24 },
    { header: "City", key: "city", width: 16 },
    { header: "State", key: "state", width: 16 },
    { header: "Requirement", key: "requirement", width: 32 },
    { header: "Product / Service", key: "productService", width: 22 },
    { header: "Budget (INR)", key: "budget", width: 16 },
    { header: "Lead Source", key: "leadSource", width: 16 },
    { header: "Priority", key: "priority", width: 14 },
    { header: "Status", key: "status", width: 20 },
    { header: "Assigned Executive", key: "assignedToName", width: 22 },
    { header: "Assigned By", key: "assignedByName", width: 20 },
    { header: "Assigned At", key: "assignedAt", width: 20 },
    { header: "Created At", key: "createdAt", width: 20 },
  ];

  // Header row formatting
  const headerRow = worksheet.getRow(1);

  headerRow.height = 28;

  headerRow.font = {
    name: "Segoe UI",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E40AF" },
  };

  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  // Add lead data rows
  for (const lead of leads) {
    const row = worksheet.addRow({
      leadCode: sanitizeSpreadsheetCell(lead.leadCode),
      customerName: sanitizeSpreadsheetCell(lead.customerName),
      mobile: sanitizeSpreadsheetCell(lead.mobile),
      alternateMobile: sanitizeSpreadsheetCell(lead.alternateMobile || "—"),
      email: sanitizeSpreadsheetCell(lead.email || "—"),
      companyName: sanitizeSpreadsheetCell(lead.companyName || "—"),
      city: sanitizeSpreadsheetCell(lead.city || "—"),
      state: sanitizeSpreadsheetCell(lead.state || "—"),
      requirement: sanitizeSpreadsheetCell(lead.requirement),
      productService: sanitizeSpreadsheetCell(lead.productService || "—"),
      budget: lead.budget ? Number(lead.budget) : null,
      leadSource: sanitizeSpreadsheetCell(lead.leadSource || "Direct"),
      priority: sanitizeSpreadsheetCell(lead.priority),
      status: sanitizeSpreadsheetCell(lead.status.replace(/_/g, " ")),
      assignedToName: sanitizeSpreadsheetCell(
        lead.assignedToName || "Unassigned",
      ),
      assignedByName: sanitizeSpreadsheetCell(lead.assignedByName || "—"),
      assignedAt: lead.assignedAt ? new Date(lead.assignedAt) : null,
      createdAt: new Date(lead.createdAt),
    });

    row.height = 20;

    row.font = {
      name: "Segoe UI",
      size: 10,
    };

    row.alignment = {
      vertical: "middle",
    };
  }

  // Column-specific formatting
  const budgetCol = worksheet.getColumn("budget");

  budgetCol.numFmt = "#,##0.00";

  budgetCol.alignment = {
    vertical: "middle",
    horizontal: "right",
  };

  const assignedAtCol = worksheet.getColumn("assignedAt");

  assignedAtCol.numFmt = "yyyy-mm-dd hh:mm";

  assignedAtCol.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  const createdAtCol = worksheet.getColumn("createdAt");

  createdAtCol.numFmt = "yyyy-mm-dd hh:mm";

  createdAtCol.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  const leadCodeCol = worksheet.getColumn("leadCode");

  leadCodeCol.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  const priorityCol = worksheet.getColumn("priority");

  priorityCol.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  const statusCol = worksheet.getColumn("status");

  statusCol.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
};

/**
 * Generates a CSV string for Leads export using json-2-csv.
 */
export const generateLeadsCsvString = (leads: LeadExportRow[]): string => {
  const { json2csv } = require("json-2-csv");

  const formattedLeads = leads.map((lead) => ({
    "Lead Code": sanitizeSpreadsheetCell(lead.leadCode),
    "Customer Name": sanitizeSpreadsheetCell(lead.customerName),
    "Mobile Number": sanitizeSpreadsheetCell(lead.mobile),
    "Alternate Mobile": sanitizeSpreadsheetCell(lead.alternateMobile),
    "Email Address": sanitizeSpreadsheetCell(lead.email),
    "Company Name": sanitizeSpreadsheetCell(lead.companyName),
    City: sanitizeSpreadsheetCell(lead.city),
    State: sanitizeSpreadsheetCell(lead.state),
    Requirement: sanitizeSpreadsheetCell(lead.requirement),
    "Product / Service": sanitizeSpreadsheetCell(lead.productService),
    "Budget (INR)": lead.budget ?? "",
    "Lead Source": sanitizeSpreadsheetCell(lead.leadSource || "Direct"),
    Priority: sanitizeSpreadsheetCell(lead.priority),
    Status: sanitizeSpreadsheetCell(lead.status.replace(/_/g, " ")),
    "Assigned Executive": sanitizeSpreadsheetCell(
      lead.assignedToName || "Unassigned",
    ),
    "Assigned By": sanitizeSpreadsheetCell(lead.assignedByName),
    "Assigned At": lead.assignedAt
      ? new Date(lead.assignedAt).toISOString()
      : "",
    "Created At": new Date(lead.createdAt).toISOString(),
  }));

  return json2csv(formattedLeads, {
    emptyFieldValue: "",
    excelBOM: true,
  });
};

/**
 * Generates a CSV string for Executive Performance Matrix and CRM Intelligence Reports using json-2-csv.
 */
export const generateReportCsvString = (report: ReportExportData): string => {
  const { json2csv } = require("json-2-csv");

  if (report.executives && report.executives.length > 0) {
    const formattedRows = report.executives.map((exec) => ({
      "Executive Name": sanitizeSpreadsheetCell(exec.name),
      "Email Address": sanitizeSpreadsheetCell(exec.email),
      "Total Leads Assigned": exec.totalLeads,
      "Active In-Progress Leads": exec.activeLeads,
      "Won Deals": exec.wonLeads,
      "Lost Deals": exec.lostLeads,
      "Conversion Rate (%)": `${exec.conversionRate}%`,
      "Avg Response Time (Hours)": `${exec.avgResponseHours}h`,
      "SLA Breaches": exec.slaBreaches,
    }));

    return json2csv(formattedRows, {
      emptyFieldValue: "",
      excelBOM: true,
    });
  }

  if (report.leads && report.leads.length > 0) {
    return generateLeadsCsvString(report.leads);
  }

  const summaryRows = [
    {
      "Report Title": "CRM Performance & Intelligence Summary",
      "Time Range": report.timeRangeLabel,
      "Generated By": report.generatedBy,
      "Generated At": report.generatedAt,
      "Total Intake": report.kpis.totalIntake,
      "Won Deals": report.kpis.wonDealsCount,
      "Conversion Rate (%)": `${report.kpis.conversionRate}%`,
      "Pipeline Value (INR)": report.kpis.pipelineValue,
      "Avg Cycle Time (Hours)": `${report.kpis.avgCycleTimeHours}h`,
      "SLA Compliance (%)": `${report.kpis.slaComplianceRate}%`,
    },
  ];

  return json2csv(summaryRows, {
    emptyFieldValue: "",
    excelBOM: true,
  });
};

export interface ReportExportData {
  timeRangeLabel: string;
  generatedAt: string;
  generatedBy: string;
  kpis: {
    totalIntake: number;
    intakeChangePercent: number;
    conversionRate: number;
    avgCycleTimeHours: number;
    slaComplianceRate: number;
    wonDealsCount: number;
    pipelineValue: number;
  };
  funnel: {
    stage: string;
    count: number;
    conversionPercentage: number;
  }[];
  sources: {
    name: string;
    count: number;
    percentage: number;
  }[];
  executives: {
    name: string;
    email: string;
    totalLeads: number;
    activeLeads: number;
    wonLeads: number;
    lostLeads: number;
    conversionRate: number;
    avgResponseHours: number;
    slaBreaches: number;
  }[];
  leads?: LeadExportRow[];
}

const autoFitColumns = (worksheet: ExcelJS.Worksheet) => {
  worksheet.columns?.forEach((column) => {
    let maxLength = 0;

    column?.eachCell?.({ includeEmpty: true }, (cell) => {
      let value = "";

      if (cell.value !== null && cell.value !== undefined) {
        if (typeof cell.value === "object" && "richText" in cell.value) {
          value = cell.value.richText.map((item) => item.text).join("");
        } else {
          value = String(cell.value);
        }
      }

      maxLength = Math.max(maxLength, value.length);
    });

    // Header/content width + small padding
    if (column) {
      column.width = Math.max(maxLength + 3, 10);
    }
  });
};

const accentHeaderFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF4F46E5" },
};

const primaryHeaderFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF4F46E5" },
};

const headerFont: Partial<ExcelJS.Font> = {
  name: "Segoe UI",
  size: 11,
  bold: true,
  color: { argb: "FFFFFFFF" },
};

/**
 * Generates a comprehensive multi-tab Excel report workbook containing
 * Executive Summary, Performance Matrix, Pipeline Funnel, Sources, and Lead breakdown.
 */
export const generateReportExcelBuffer = async (
  report: ReportExportData,
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheetsToAutoFit: ExcelJS.Worksheet[] = [];
  workbook.creator = "CRM Intelligence System";
  workbook.lastModifiedBy = "CRM Intelligence System";
  workbook.created = new Date();
  workbook.modified = new Date();

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "#FFE2E8F0" } },
    left: { style: "thin", color: { argb: "#FFE2E8F0" } },
    bottom: { style: "thin", color: { argb: "#FFE2E8F0" } },
    right: { style: "thin", color: { argb: "#FFE2E8F0" } },
  };

  // -------------------------------------------------------------
  // Sheet 1: Executive Summary & KPIs
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet("Executive Summary", {
    views: [{ showGridLines: true }],
  });

  sheetsToAutoFit.push(summarySheet);

  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 32 },
    { header: "Value", key: "value", width: 22 },
    { header: "Context / Description", key: "description", width: 44 },
  ];

  // Title Block
  summarySheet.spliceRows(
    1,
    0,
    ["CRM PERFORMANCE & INTELLIGENCE REPORT", "", ""],
    [
      `Time Range: ${report.timeRangeLabel}`,
      `Generated By: ${report.generatedBy}`,
      `Export Date: ${report.generatedAt}`,
    ],
    ["", "", ""],
  );

  summarySheet.mergeCells("A1:C1");
  const titleRow = summarySheet.getRow(1);
  titleRow.height = 32;
  titleRow.font = {
    name: "Segoe UI",
    size: 14,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleRow.fill = accentHeaderFill;
  titleRow.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  const metaRow = summarySheet.getRow(2);
  metaRow.height = 20;
  metaRow.font = {
    name: "Segoe UI",
    size: 10,
    italic: true,
    color: { argb: "FF64748B" },
  };

  // Headers for KPI Table (Row 4)
  const kpiHeaderRow = summarySheet.getRow(4);
  kpiHeaderRow.height = 26;
  kpiHeaderRow.values = [
    "Core Performance Indicator",
    "Reported Value",
    "Metric Definition",
  ];
  kpiHeaderRow.eachCell((cell) => {
    cell.font = headerFont;
    cell.fill = primaryHeaderFill;
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });

  const kpis = report.kpis;
  const kpiRows = [
    {
      metric: "Total Lead Intake",
      value: kpis.totalIntake,
      description: "Total newly captured leads within this period",
    },
    {
      metric: "Intake Velocity Change",
      value: `${kpis.intakeChangePercent >= 0 ? "+" : ""}${kpis.intakeChangePercent}%`,
      description: "Change compared to previous matching timeframe",
    },
    {
      metric: "Deals Won / Closed",
      value: kpis.wonDealsCount,
      description: "Total leads successfully converted into WON/SOLD deals",
    },
    {
      metric: "Overall Conversion Rate",
      value: `${kpis.conversionRate}%`,
      description: "Percentage of leads successfully closed",
    },
    {
      metric: "Active Pipeline Value",
      value: `INR ${kpis.pipelineValue.toLocaleString("en-IN")}`,
      description: "Aggregate budget of non-lost active prospects",
    },
    {
      metric: "Average Cycle Time",
      value: `${kpis.avgCycleTimeHours} hrs`,
      description: "Average response and first-touch resolution speed",
    },
    {
      metric: "SLA Adherence Rate",
      value: `${kpis.slaComplianceRate}%`,
      description: "Percentage of follow-ups executed without deadline breach",
    },
  ];

  kpiRows.forEach((row, idx) => {
    const r = summarySheet.addRow(row);
    r.height = 22;
    r.eachCell((cell, colNumber) => {
      cell.border = thinBorder;
      cell.font = { name: "Segoe UI", size: 10, bold: colNumber === 1 };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 2 ? "center" : "left",
      };
      if (idx % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    });
  });

  // -------------------------------------------------------------
  // Sheet 2: Executive Performance Matrix
  // -------------------------------------------------------------
  const execSheet = workbook.addWorksheet("Executive Performance", {
    views: [{ showGridLines: true }],
  });

  execSheet.columns = [
    { header: "Sales Executive", key: "name", width: 26 },
    { header: "Email Address", key: "email", width: 30 },
    { header: "Total Assigned", key: "totalLeads", width: 16 },
    { header: "Active Pipeline", key: "activeLeads", width: 16 },
    { header: "Won Deals", key: "wonLeads", width: 14 },
    { header: "Lost Deals", key: "lostLeads", width: 14 },
    { header: "Win Rate (%)", key: "conversionRate", width: 16 },
    { header: "Avg Response (hrs)", key: "avgResponseHours", width: 20 },
    { header: "SLA Breaches", key: "slaBreaches", width: 16 },
  ];

  const execHeaderRow = execSheet.getRow(1);
  execHeaderRow.height = 26;
  execHeaderRow.eachCell((cell) => {
    cell.font = headerFont;
    cell.fill = primaryHeaderFill;
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };
  });

  report.executives.forEach((exec, idx) => {
    const row = execSheet.addRow({
      name: sanitizeSpreadsheetCell(exec.name),
      email: sanitizeSpreadsheetCell(exec.email),
      totalLeads: exec.totalLeads,
      activeLeads: exec.activeLeads,
      wonLeads: exec.wonLeads,
      lostLeads: exec.lostLeads,
      conversionRate: `${exec.conversionRate}%`,
      avgResponseHours: exec.avgResponseHours,
      slaBreaches: exec.slaBreaches,
    });
    row.height = 20;
    row.eachCell((cell, colNum) => {
      cell.border = thinBorder;
      cell.font = { name: "Segoe UI", size: 10 };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNum <= 2 ? "left" : "center",
      };
      if (idx % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    });
  });

  // -------------------------------------------------------------
  // Sheet 3: Funnel & Pipeline
  // -------------------------------------------------------------
  const funnelSheet = workbook.addWorksheet("Funnel Breakdown", {
    views: [{ showGridLines: true }],
  });

  sheetsToAutoFit.push(funnelSheet);

  funnelSheet.columns = [
    { header: "Funnel Stage", key: "stage", width: 28 },
    { header: "Lead Volume", key: "count", width: 18 },
    {
      header: "Conversion to Intake (%)",
      key: "conversionPercentage",
      width: 26,
    },
  ];

  const funnelHeaderRow = funnelSheet.getRow(1);
  funnelHeaderRow.height = 26;
  funnelHeaderRow.eachCell((cell) => {
    cell.font = headerFont;
    cell.fill = primaryHeaderFill;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  report.funnel.forEach((f, idx) => {
    const row = funnelSheet.addRow({
      stage: f.stage,
      count: f.count,
      conversionPercentage: `${f.conversionPercentage}%`,
    });
    row.height = 20;
    row.eachCell((cell, colNum) => {
      cell.border = thinBorder;
      cell.font = { name: "Segoe UI", size: 10 };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNum === 1 ? "left" : "center",
      };
      if (idx % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    });
  });

  // -------------------------------------------------------------
  // Sheet 4: Lead Sources Breakdown
  // -------------------------------------------------------------
  const sourcesSheet = workbook.addWorksheet("Lead Sources", {
    views: [{ showGridLines: true }],
  });

  sheetsToAutoFit.push(sourcesSheet);
  sourcesSheet.columns = [
    { header: "Source Channel", key: "name", width: 28 },
    { header: "Lead Count", key: "count", width: 18 },
    { header: "Share of Total (%)", key: "percentage", width: 22 },
  ];

  const sourcesHeaderRow = sourcesSheet.getRow(1);
  sourcesHeaderRow.height = 26;
  sourcesHeaderRow.eachCell((cell) => {
    cell.font = headerFont;
    cell.fill = primaryHeaderFill;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  report.sources.forEach((s, idx) => {
    const row = sourcesSheet.addRow({
      name: sanitizeSpreadsheetCell(s.name),
      count: s.count,
      percentage: `${s.percentage}%`,
    });
    row.height = 20;
    row.eachCell((cell, colNum) => {
      cell.border = thinBorder;
      cell.font = { name: "Segoe UI", size: 10 };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNum === 1 ? "left" : "center",
      };
      if (idx % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    });
  });

  // -------------------------------------------------------------
  // Sheet 5: Lead Records Detail (if leads provided)
  // -------------------------------------------------------------
  if (report.leads && report.leads.length > 0) {
    const leadsSheet = workbook.addWorksheet("Detailed Leads", {
      views: [{ showGridLines: true }],
    });

    sheetsToAutoFit.push(leadsSheet);

    leadsSheet.columns = [
      { header: "Lead Code", key: "leadCode", width: 16 },
      { header: "Customer Name", key: "customerName", width: 24 },
      { header: "Mobile Number", key: "mobile", width: 16 },
      { header: "Email Address", key: "email", width: 28 },
      { header: "Company Name", key: "companyName", width: 24 },
      { header: "City", key: "city", width: 16 },
      { header: "Requirement", key: "requirement", width: 30 },
      { header: "Budget (INR)", key: "budget", width: 16 },
      { header: "Lead Source", key: "leadSource", width: 16 },
      { header: "Priority", key: "priority", width: 14 },
      { header: "Status", key: "status", width: 20 },
      { header: "Assigned Executive", key: "assignedToName", width: 22 },
      { header: "Created Date", key: "createdAt", width: 18 },
    ];

    const leadsHeaderRow = leadsSheet.getRow(1);
    leadsHeaderRow.height = 26;
    leadsHeaderRow.eachCell((cell) => {
      cell.font = headerFont;
      cell.fill = primaryHeaderFill;
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    report.leads.forEach((l, idx) => {
      const row = leadsSheet.addRow({
        leadCode: sanitizeSpreadsheetCell(l.leadCode),
        customerName: sanitizeSpreadsheetCell(l.customerName),
        mobile: sanitizeSpreadsheetCell(l.mobile),
        email: sanitizeSpreadsheetCell(l.email),
        companyName: sanitizeSpreadsheetCell(l.companyName),
        city: sanitizeSpreadsheetCell(l.city),
        requirement: sanitizeSpreadsheetCell(l.requirement),
        budget: l.budget ?? "",
        leadSource: sanitizeSpreadsheetCell(l.leadSource || "Direct"),
        priority: sanitizeSpreadsheetCell(l.priority),
        status: sanitizeSpreadsheetCell(l.status.replace(/_/g, " ")),
        assignedToName: sanitizeSpreadsheetCell(
          l.assignedToName || "Unassigned",
        ),
        createdAt: l.createdAt
          ? new Date(l.createdAt).toISOString().split("T")[0]
          : "",
      });
      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.border = thinBorder;
        cell.font = { name: "Segoe UI", size: 10 };
        cell.alignment = {
          vertical: "middle",
          horizontal: colNum <= 2 ? "left" : "center",
        };
        if (idx % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }
      });
    });
  }

  // Auto-fit every worksheet after all data has been populated.
  sheetsToAutoFit.forEach(autoFitColumns);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
