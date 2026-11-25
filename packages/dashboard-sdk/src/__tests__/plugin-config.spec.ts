import fs from "fs"
import os from "os"
import path from "path"
import { afterEach, expect, test } from "vitest"
import { mercurDashboardPlugin } from "../plugin"
import { RESOLVED_CONFIG_MODULE } from "../constants"
import type { MercurConfig } from "../types"

const roots: string[] = []

/** Reads the configuration delivered to dashboard components by the plugin. */
const dashboardConfig = async (options: Partial<MercurConfig> = {}) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dashboard-config-"))
  roots.push(root)
  fs.mkdirSync(path.join(root, "src"))
  fs.writeFileSync(path.join(root, "medusa-config.cjs"), "module.exports = {}")
  const plugin = mercurDashboardPlugin({ medusaConfigPath: "medusa-config.cjs", ...options })
  if (typeof plugin.config !== "function" || typeof plugin.load !== "function") {
    throw new Error("Expected dashboard configuration and load hooks")
  }
  await plugin.config.call({} as never, { root, mode: "production" }, { command: "build", mode: "production" })
  const source = await plugin.load.call({} as never, RESOLVED_CONFIG_MODULE, {})
  return JSON.parse(String(source).replace(/^export default /, "")) as MercurConfig
}

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true })
})

test("unconfigured uploads retain the built-in image formats", async () => {
  expect((await dashboardConfig()).imageFormats).toEqual({
    "image/jpeg": [".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/heic": [".heic"],
    "image/svg+xml": [".svg"],
  })
})

test("the host selects MIME types and their displayed extensions together", async () => {
  expect((await dashboardConfig({ imageFormats: { "image/png": [".png"] } })).imageFormats).toEqual({
    "image/png": [".png"],
  })
})
