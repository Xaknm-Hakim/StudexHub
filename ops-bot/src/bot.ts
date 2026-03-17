import { Telegraf } from "telegraf";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;
const INTERNAL_CRON_SECRET = process.env.INTERNAL_CRON_SECRET;

if (!BOT_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN");
if (!ADMIN_TELEGRAM_ID) throw new Error("Missing ADMIN_TELEGRAM_ID");
if (!INTERNAL_CRON_SECRET) throw new Error("Missing INTERNAL_CRON_SECRET");

const bot = new Telegraf(BOT_TOKEN);

let restartWebPending = false;
let restartWebExpire = 0;

function isAuthorized(userId: number | undefined): boolean {
  return String(userId) === ADMIN_TELEGRAM_ID;
}

async function runCommand(command: string, args: string[]): Promise<string> {
  const { stdout, stderr } = await execFileAsync(command, args, {
    timeout: 60_000,
    maxBuffer: 4 * 1024 * 1024,
  });

  const output = `${stdout}${stderr}`.trim();
  return output || "Command finished.";
}

function now(): string {
  return new Date().toLocaleString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    hour12: false,
  });
}

function helpText(): string {
  return [
    "StudexHub Ops Bot",
    "",
    "/help - show command list",
    "/status - check web and database health",
    "/system - show CPU load, RAM, disk, and containers",
    "/invite - generate a new invite code",
    "/notifications - manually trigger notification job",
    "/backup - create PostgreSQL backup",
    "/restartweb - restart the web container",
  ].join("\n");
}

function clearRestartWebState(): void {
  restartWebPending = false;
  restartWebExpire = 0;
}

bot.use(async (ctx, next) => {
  if (ctx.chat?.type !== "private") {
    await ctx.reply("Commands are only allowed in private chat.");
    return;
  }

  if (!isAuthorized(ctx.from?.id)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  return next();
});

bot.start(async (ctx) => {
  await ctx.reply(helpText());
});

bot.command("help", async (ctx) => {
  await ctx.reply(helpText());
});

bot.command("status", async (ctx) => {
  await ctx.reply("Checking status...");

  let web = "unknown";
  let db = "unknown";
  let app = "unknown";
  let dbHealth = "unknown";

  try {
    web = (
      await runCommand("docker", [
        "inspect",
        "-f",
        "{{.State.Status}}",
        "baruashub-web",
      ])
    ).trim();
  } catch {
    web = "not found";
  }

  try {
    db = (
      await runCommand("docker", [
        "inspect",
        "-f",
        "{{.State.Status}}",
        "baruashub-db",
      ])
    ).trim();
  } catch {
    db = "not found";
  }

  if (web === "running") {
    try {
      const res = await runCommand("curl", [
        "-sS",
        "http://localhost:3000/api/internal/health",
        "-H",
        `x-internal-cron-secret: ${INTERNAL_CRON_SECRET}`,
      ]);

      const json = JSON.parse(res);
      app = json.checks?.app ? "OK" : "FAIL";
      dbHealth = json.checks?.db ? "OK" : "FAIL";
    } catch (error) {
      console.error("Status health check failed:", error);
      app = "unreachable";
      dbHealth = "unknown";
    }
  } else {
    app = "offline";
    dbHealth = "unknown";
  }

  const msg = [
    "StudexHub System Status",
    "",
    `Web container: ${web}`,
    `Database container: ${db}`,
    "",
    `App health: ${app}`,
    `Database health: ${dbHealth}`,
    "",
    `Time: ${now()}`,
  ].join("\n");

  await ctx.reply(msg);
});

bot.command("system", async (ctx) => {
  await ctx.reply("Checking system resources...");

  try {
    const load = (
      await runCommand("sh", [
        "-c",
        "cat /proc/loadavg | awk '{print $1,$2,$3}'",
      ])
    ).trim();

    const ram = (
      await runCommand("sh", [
        "-c",
        "free -h | awk '/Mem:/ {print $3\" / \"$2}'",
      ])
    ).trim();

    const disk = (
      await runCommand("sh", [
        "-c",
        "df -h / | awk 'NR==2 {print $3\" / \"$2\" (\"$5\")\"}'",
      ])
    ).trim();

    const containers = (
      await runCommand("sh", [
        "-c",
        "docker ps --format '{{.Names}}: {{.Status}}'",
      ])
    ).trim();

    const msg = [
      "System Resources",
      "",
      `CPU load avg (1m 5m 15m): ${load}`,
      `RAM usage: ${ram}`,
      `Disk usage: ${disk}`,
      "",
      "Containers:",
      containers || "No running containers.",
      "",
      `Time: ${now()}`,
    ].join("\n");

    await ctx.reply(msg);
  } catch (error) {
    console.error("System check failed:", error);
    await ctx.reply("System check failed.");
  }
});

bot.command("invite", async (ctx) => {
  await ctx.reply("Generating invite...");

  try {
    const out = await runCommand("docker", [
      "exec",
      "baruashub-web",
      "npx",
      "tsx",
      "scripts/create-invite.ts",
    ]);

    await ctx.reply(out);
  } catch (error) {
    console.error("Invite generation failed:", error);
    await ctx.reply("Invite generation failed.");
  }
});

bot.command("notifications", async (ctx) => {
  await ctx.reply("Triggering notifications...");

  try {
    const out = await runCommand("curl", [
      "-sS",
      "-X",
      "POST",
      "http://localhost:3000/api/internal/notifications/run",
      "-H",
      `x-internal-cron-secret: ${INTERNAL_CRON_SECRET}`,
    ]);

    await ctx.reply(out);
  } catch (error) {
    console.error("Notification trigger failed:", error);
    await ctx.reply("Notification trigger failed.");
  }
});

bot.command("backup", async (ctx) => {
  await ctx.reply("Creating backup...");

  try {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const file = `baruashub-${ts}.sql`;

    const out = await runCommand("sh", [
      "-c",
      `docker exec -i baruashub-db pg_dump -U postgres baruashub > /backups/${file} && echo "Backup created: ${file}"`,
    ]);

    await ctx.reply(out);
  } catch (error) {
    console.error("Backup failed:", error);
    await ctx.reply("Backup failed.");
  }
});

bot.command("restartweb", async (ctx) => {
  restartWebPending = true;
  restartWebExpire = Date.now() + 60_000;

  await ctx.reply(
    [
      "⚠️ Restart the web service?",
      "",
      "Type exactly: Yes",
      "",
      "Confirmation expires in 60 seconds.",
    ].join("\n")
  );
});

bot.on("text", async (ctx, next) => {
  const text = ctx.message.text.trim();

  if (text.startsWith("/")) {
    return next();
  }

  if (!restartWebPending) {
    return next();
  }

  if (Date.now() > restartWebExpire) {
    clearRestartWebState();
    await ctx.reply("Restart confirmation expired.");
    return;
  }

  if (text !== "Yes") {
    clearRestartWebState();
    await ctx.reply("Restart cancelled.");
    return;
  }

  clearRestartWebState();

  await ctx.reply("Restarting web container...");

  try {
    const out = await runCommand("docker", ["restart", "baruashub-web"]);
    await ctx.reply(`Web container restarted:\n${out}`);
  } catch (error) {
    console.error("Web restart failed:", error);
    await ctx.reply("Web restart failed.");
  }
});

bot.catch((error) => {
  console.error("Telegram bot error:", error);
});

bot.launch().then(() => {
  console.log("StudexHub Ops Bot started");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
