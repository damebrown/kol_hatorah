import { ScopeNode, ScopeNodeType, ScopeConstraint, WorkRegistry } from "../types";
import { TANAKH_HEB_TO_CANONICAL } from "./mappings/tanakhBooks";
import { TANAKH_DIVISIONS } from "./mappings/tanakhDivisions";
import { MISHNAH_TRACTATES_HEB_TO_CANONICAL } from "./mappings/mishnahTractates";
import { BAVLI_TRACTATES_HEB_TO_CANONICAL } from "./mappings/bavliTractates";
import { SEDER_MAP } from "./mappings/sedarim";

function normalizeKey(s: string): string {
  return s.trim().toLowerCase();
}

function resolveWorkAgainstRegistry(input: string, registry: WorkRegistry): string | undefined {
  const key = normalizeKey(input);
  for (const [, works] of registry.entries()) {
    for (const w of works) {
      if (normalizeKey(w) === key) return w;
    }
  }
  const heMaps = [TANAKH_HEB_TO_CANONICAL, MISHNAH_TRACTATES_HEB_TO_CANONICAL, BAVLI_TRACTATES_HEB_TO_CANONICAL];
  for (const m of heMaps) {
    if (m[input]) return m[input];
  }
  return undefined;
}

export function resolveScopeNode(raw: string, registry: WorkRegistry): { node?: ScopeNode; workName?: string } {
  const value = raw.trim();
  const tryResolve = (candidate: string) => {
    if (candidate === "תנ\"ך" || candidate === "תנך") return { node: { type: ScopeNodeType.CORPUS, name: "tanakh" } };
    if (candidate === "תורה" || candidate === "נביאים" || candidate === "כתובים") {
      return { node: { type: ScopeNodeType.SUBCORPUS, name: candidate } };
    }
    if (candidate.startsWith("סדר ")) {
      const seder = candidate.replace("סדר ", "");
      if (SEDER_MAP[seder] !== undefined) {
        return { node: { type: ScopeNodeType.SUBCORPUS, name: seder } };
      }
    }
    const workName = resolveWorkAgainstRegistry(candidate, registry);
    if (workName) {
      return { node: { type: ScopeNodeType.WORK, name: workName }, workName };
    }
    return {};
  };

  const primary = tryResolve(value);
  if (primary.node || primary.workName) return primary;

  if (value.startsWith("ב") && value.length > 1) {
    const stripped = value.slice(1);
    const secondary = tryResolve(stripped);
    if (secondary.node || secondary.workName) return secondary;
  }

  return {};
}

export function getWorkInForNode(node: ScopeNode, registry: WorkRegistry): string[] | undefined {
  if (node.type === ScopeNodeType.SUBCORPUS) {
    if (node.name === "תורה" || node.name === "נביאים" || node.name === "כתובים") {
      const base = TANAKH_DIVISIONS[node.name] || [];
      const present = registry.get("tanakh") || new Set<string>();
      return base.filter((w) => present.has(w));
    }
    if (SEDER_MAP[node.name] !== undefined) {
      const base = SEDER_MAP[node.name] || [];
      const present = registry.get("mishnah") || new Set<string>();
      return base.filter((w) => present.has(w));
    }
  }
  return undefined;
}
