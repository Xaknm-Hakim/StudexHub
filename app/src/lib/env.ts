export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`${name} is missing`);
  }

  return value;
}

export function getAuthSecret(): string {
  return getRequiredEnv("AUTH_SECRET");
}

export function getDatabaseUrl(): string {
  return getRequiredEnv("DATABASE_URL");
}
