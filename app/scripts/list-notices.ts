import { listNoticeTemplates } from "@/src/lib/notices";

async function main() {
  const templates = await listNoticeTemplates();

  if (templates.length === 0) {
    console.log("No notice templates found in infra/notices-template.");
    return;
  }

  console.log(
    ["Available notice templates:", ...templates.map((t) => `- ${t}`)].join("\n")
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
