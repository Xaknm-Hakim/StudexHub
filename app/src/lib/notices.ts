import fs from "node:fs/promises";
import path from "node:path";

const NOTICE_TEMPLATE_DIR = path.join(process.cwd(), "infra", "notices-template");

function validateTemplateFilename(filename: string): void {
  if (!filename) {
    throw new Error("Template filename is required.");
  }

  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    throw new Error("Invalid template filename.");
  }

  if (!filename.endsWith(".txt")) {
    throw new Error("Only .txt notice templates are allowed.");
  }
}

export async function listNoticeTemplates(): Promise<string[]> {
  await fs.mkdir(NOTICE_TEMPLATE_DIR, { recursive: true });

  const entries = await fs.readdir(NOTICE_TEMPLATE_DIR, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

export async function readNoticeTemplate(filename: string): Promise<string> {
  validateTemplateFilename(filename);

  const fullPath = path.join(NOTICE_TEMPLATE_DIR, filename);
  const body = await fs.readFile(fullPath, "utf8");

  if (!body.trim()) {
    throw new Error(`Template "${filename}" is empty.`);
  }

  return body.trim();
}
