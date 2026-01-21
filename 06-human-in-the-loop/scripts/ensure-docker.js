import { execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");

try {
  // Check if containers are running
  const result = execSync("docker compose ps --format json", {
    cwd: rootDir,
    encoding: "utf-8",
  });

  const containers = result
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  const postgresRunning = containers.some(
    (c) => c.Name === "ai-demo-postgres" && c.State === "running"
  );
  const redisRunning = containers.some(
    (c) => c.Name === "ai-demo-redis" && c.State === "running"
  );

  if (!postgresRunning || !redisRunning) {
    console.log("Starting Docker containers...");
    execSync("docker compose up -d", { cwd: rootDir, stdio: "inherit" });
    // Wait for services to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
} catch {
  console.log("Starting Docker containers...");
  execSync("docker compose up -d", { cwd: rootDir, stdio: "inherit" });
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
