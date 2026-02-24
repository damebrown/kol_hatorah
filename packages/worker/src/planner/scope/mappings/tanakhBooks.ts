/** Common Mishnah-style abbreviations and variants. */
const TANAKH_ALIASES: Record<string, string> = {
  "דהי״א": "דברי הימים א",
  "דהיא": "דברי הימים א",
  "דהי״ב": "דברי הימים ב",
  "דהיב": "דברי הימים ב",
};

export const TANAKH_HEB_TO_CANONICAL: Record<string, string> = {
  "בראשית": "Genesis",
  "שמות": "Exodus",
  "ויקרא": "Leviticus",
  "במדבר": "Numbers",
  "דברים": "Deuteronomy",
  "יהושע": "Joshua",
  "שופטים": "Judges",
  "שמואל א": "I Samuel",
  "שמואל ב": "II Samuel",
  "מלכים א": "I Kings",
  "מלכים ב": "II Kings",
  "ישעיה": "Isaiah",
  "ירמיה": "Jeremiah",
  "יחזקאל": "Ezekiel",
  "הושע": "Hosea",
  "יואל": "Joel",
  "עמוס": "Amos",
  "עובדיה": "Obadiah",
  "יונה": "Jonah",
  "מיכה": "Micah",
  "נחום": "Nahum",
  "חבקוק": "Habakkuk",
  "צפניה": "Zephaniah",
  "חגי": "Haggai",
  "זכריה": "Zechariah",
  "מלאכי": "Malachi",
  "תהילים": "Psalms",
  "משלי": "Proverbs",
  "איוב": "Job",
  "שיר השירים": "Song of Songs",
  "רות": "Ruth",
  "איכה": "Lamentations",
  "קהלת": "Ecclesiastes",
  "אסתר": "Esther",
  "דניאל": "Daniel",
  "עזרא": "Ezra",
  "נחמיה": "Nehemiah",
  "דברי הימים א": "I Chronicles",
  "דברי הימים ב": "II Chronicles",
};

/** Expand Mishnah-style abbreviations before lookup. */
export function expandTanakhAlias(inner: string): string {
  let s = inner.trim();
  for (const [alias, full] of Object.entries(TANAKH_ALIASES)) {
    if (s.startsWith(alias)) {
      return full + s.slice(alias.length);
    }
  }
  return s;
}
