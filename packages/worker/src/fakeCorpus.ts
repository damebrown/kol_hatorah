import { Chunk, TextType, createChunkId } from "@kol-hatorah/core";

interface FakeTextData {
  text: string;
  type: TextType;
  work: string;
  ref: string;
  source: string;
  lang: "he";
  normalizedRef: string;
  section?: string;
  segment?: string;
  versionTitle?: string;
  license?: string;
  attribution?: string;
  url?: string;
  createdAt: string;
}

const fakeTexts: FakeTextData[] = [
  {
    text: "בראשית ברא אלהים את השמים ואת הארץ. והארץ היתה תהו ובהו, וחשך על פני תהום, ורוח אלהים מרחפת על פני המים.",
    type: "tanakh",
    work: "Genesis",
    ref: "Genesis 1:1-2",
    source: "fake",
    lang: "he",
    normalizedRef: "Genesis 1:1-2",
    createdAt: new Date().toISOString(),
  },
  {
    text: "ויהי אור. וירא אלהים את האור כי טוב, ויבדל אלהים בין האור ובין החשך.",
    type: "tanakh",
    work: "Genesis",
    ref: "Genesis 1:3-4",
    source: "fake",
    lang: "he",
    normalizedRef: "Genesis 1:3-4",
    createdAt: new Date().toISOString(),
  },
  {
    text: "ויאמר אלהים נעשה אדם בצלמנו כדמותנו, וירדו בדגת הים ובעוף השמים ובבהמה ובכל הארץ ובכל הרמש הרומש על הארץ.",
    type: "tanakh",
    work: "Genesis",
    ref: "Genesis 1:26",
    source: "fake",
    lang: "he",
    normalizedRef: "Genesis 1:26",
    createdAt: new Date().toISOString(),
  },
  {
    text: "שמע ישראל יהוה אלהינו יהוה אחד.",
    type: "tanakh",
    work: "Deuteronomy",
    ref: "Deuteronomy 6:4",
    source: "fake",
    lang: "he",
    normalizedRef: "Deuteronomy 6:4",
    createdAt: new Date().toISOString(),
  },
  {
    text: "משה קבל תורה מסיני ומסרה ליהושע ויהושע לזקנים וזקנים לנביאים ונביאים מסרוה לאנשי כנסת הגדולה. הם אמרו שלשה דברים: הוו מתונים בדין, והעמידו תלמידים הרבה, ועשו סייג לתורה.",
    type: "mishnah",
    work: "Avot",
    ref: "Avot 1:1",
    source: "fake",
    lang: "he",
    normalizedRef: "Avot 1:1",
    createdAt: new Date().toISOString(),
  },
  {
    text: "שמעון הצדיק היה משירי כנסת הגדולה. הוא היה אומר: על שלשה דברים העולם עומד: על התורה ועל העבודה ועל גמילות חסדים.",
    type: "mishnah",
    work: "Avot",
    ref: "Avot 1:2",
    source: "fake",
    lang: "he",
    normalizedRef: "Avot 1:2",
    createdAt: new Date().toISOString(),
  },
  {
    text: "מאימתי קורין את שמע בערבין? משעה שהכהנים נכנסים לאכול בתרומתן, עד סוף האשמורה הראשונה, דברי רבי אליעזר.",
    type: "mishnah",
    work: "Berakhot",
    ref: "Berakhot 1:1",
    source: "fake",
    lang: "he",
    normalizedRef: "Berakhot 1:1",
    createdAt: new Date().toISOString(),
  },
  {
    text: "תנו רבנן, מאימתי קורין את שמע בערבית? אמר רבי יוחנן משעה שהכהנים נכנסים לאכול בתרומתן. מאי שנא תרומה? דכתיב: ובא השמש וטהר ואחר יאכל מן הקדשים.",
    type: "bavli",
    work: "Berakhot",
    ref: "Berakhot 2a:1",
    source: "fake",
    lang: "he",
    normalizedRef: "Berakhot 2a:1",
    createdAt: new Date().toISOString(),
  },
  {
    text: "אמר רבא: האי מאן דאמר מילתא דבדיחותא - ביום טוב, בטבלא ובכינור - אסור.",
    type: "bavli",
    work: "Shabbat",
    ref: "Shabbat 31a:1",
    source: "fake",
    lang: "he",
    normalizedRef: "Shabbat 31a:1",
    createdAt: new Date().toISOString(),
  },
  {
    text: "אמר רב יהודה אמר רב: מנין שמצוה ללמוד תורה? שנאמר: ואתם הדבקים ביהוה אלהיכם חיים כולכם היום.",
    type: "bavli",
    work: "Berakhot",
    ref: "Berakhot 2a:3",
    source: "fake",
    lang: "he",
    normalizedRef: "Berakhot 2a:3",
    createdAt: new Date().toISOString(),
  },
];

export function getFakeChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  const createdAt = new Date().toISOString();

  for (let i = 0; i < fakeTexts.length; i++) {
    const { text, type, work, ref, source, lang, normalizedRef, section, segment, versionTitle, license, attribution, url } = fakeTexts[i];

    const chunk: Chunk = {
      id: createChunkId({ source, ref, lang, text }),
      text,
      source,
      type,
      work,
      ref,
      normalizedRef,
      lang,
      section,
      segment,
      versionTitle: versionTitle || "Fake Version",
      license: license || "N/A (fake)",
      attribution: attribution || "Generated for testing",
      url: url || `https://example.com/fake/${type}/${work}/${ref}`.replace(/\s/g, "-"),
      createdAt,
    };
    chunks.push(chunk);
  }

  // Add some more chunks to reach 80-150 range
  while (chunks.length < 80) {
    const baseChunk = fakeTexts[chunks.length % fakeTexts.length];
    const newText = `(Additional) ${baseChunk.text} - ${chunks.length}`;
    const newRef = `${baseChunk.ref}.${chunks.length}`;
    const chunk: Chunk = {
      id: createChunkId({ source: baseChunk.source, ref: newRef, lang: baseChunk.lang, text: newText }),
      text: newText,
      source: baseChunk.source,
      type: baseChunk.type,
      work: baseChunk.work,
      ref: newRef,
      normalizedRef: newRef,
      lang: baseChunk.lang,
      section: baseChunk.section,
      segment: baseChunk.segment,
      versionTitle: baseChunk.versionTitle,
      license: baseChunk.license,
      attribution: baseChunk.attribution,
      url: baseChunk.url ? `${baseChunk.url}.${chunks.length}` : undefined,
      createdAt,
    };
    chunks.push(chunk);
  }

  return chunks;
}
