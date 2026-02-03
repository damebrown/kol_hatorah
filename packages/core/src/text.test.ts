import assert from "assert";
import { normalizeText } from "./text";

const cases: Array<{ input: string; plain: string; norm: string }> = [
  {
    input: "בְּרֵאשִׁית בָּרָא",
    plain: "בְּרֵאשִׁית בָּרָא",
    norm: "בראשית ברא",
  },
  {
    input: "שלום&nbsp;עולם &thinsp; \"אמר\"",
    plain: "שלום&nbsp;עולם  \"אמר\"",
    norm: "שלום עולם אמר",
  },
  {
    input: "לךָ םןףץ",
    plain: "לךָ םןףץ",
    norm: "לכ מנפצ",
  },
];

for (const c of cases) {
  const res = normalizeText(c.input);
  assert.strictEqual(res.textPlain, c.plain.trim());
  assert.strictEqual(res.textNorm, c.norm);
}

console.log("text normalization tests passed");
