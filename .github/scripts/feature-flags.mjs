import fs from 'node:fs';
import path from 'node:path';

function normalizeFeatureId(featureId) {
  // GitHub Actions output names must match /^[A-Za-z0-9_]+$/ in practice.
  // We keep it predictable by mapping all non-alphanumerics to underscores.
  return String(featureId)
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function coerceBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true' || v === '1' || v === 'yes' || v === 'y' || v === 'on') return true;
    if (v === 'false' || v === '0' || v === 'no' || v === 'n' || v === 'off') return false;
  }
  return fallback;
}

function writeGithubOutputLine(outputPath, name, value) {
  fs.appendFileSync(outputPath, `${name}=${value}\n`, 'utf8');
}

const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
const configPath =
  process.env.KICKSTART_CONFIG_PATH || path.join(workspace, '.github', 'template.config.json');

if (!fs.existsSync(configPath)) {
  console.error(`Feature flags config not found at: ${configPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(configPath, 'utf8');
let config;
try {
  config = JSON.parse(raw);
} catch (e) {
  console.error(`Failed to parse JSON config at ${configPath}`);
  throw e;
}

const features = config?.features;
if (!features || typeof features !== 'object') {
  console.error(`Config must contain an object at "features".`);
  process.exit(1);
}

const outputPath = process.env.GITHUB_OUTPUT;
if (!outputPath) {
  console.error(`GITHUB_OUTPUT is not set (this script is meant for GitHub Actions).`);
  process.exit(1);
}

// Also expose a compact JSON map for debugging / future needs.
/** @type {Record<string, boolean>} */
const enabledMap = {};

for (const [featureId, featureConfig] of Object.entries(features)) {
  const enabled = coerceBoolean(featureConfig?.enabled, false);
  enabledMap[featureId] = enabled;

  const outputName = `enabled_${normalizeFeatureId(featureId)}`;
  writeGithubOutputLine(outputPath, outputName, enabled ? 'true' : 'false');
}

writeGithubOutputLine(outputPath, 'features_json', JSON.stringify(enabledMap));
