import { getConfig, createQdrantClient } from "@kol-hatorah/core";
async function main() {
  const config = getConfig();
  const client = createQdrantClient({ url: config.qdrant.url, apiKey: config.qdrant.apiKey });
  const col = config.qdrant.collectionPrefix + "_chunks_v2";
  const types = ["tanakh","mishnah","bavli","tanakh_commentary","midrash","philosophy","halacha","liturgy"];
  for (const t of types) {
    const r = await client.count(col, { filter: { must: [{ key: "type", match: { value: t } }] }, exact: false });
    console.log(t.padEnd(22), r.count.toLocaleString());
  }
}
main().catch(console.error);
