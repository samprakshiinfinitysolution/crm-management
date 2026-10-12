-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "leadCode" SET DEFAULT concat('CRM-', lpad(nextval('lead_code_seq'::regclass)::text, 6, '0'));
