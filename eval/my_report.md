# Graph-augmented retrieval evaluation

Generated: 2026-03-24T19:19:50.082Z

## How to read this report

- **Baseline:** `KOL_HATORAH_ENABLE_SEFARIA_GRAPH=0`
- **Graph:** `KOL_HATORAH_ENABLE_SEFARIA_GRAPH=1`
- **Vector top-k:** raw Qdrant hits before split expansion.
- **After expand split:** after `expandSplitChunks`, before graph.
- **Context pool:** order/scores passed to `shouldAnswer` / `buildRagPrompt`.
- **Heuristic labels** are rule-based only (see `graphAugmentEval.ts`).

---

### Question 1

- **Query:** איפה מופיע הרעיון שהעולם נברא בשביל התורה או בשביל ישראל, ואיך מפרשים אותו?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מופיע במקורות שונים, ובפרשנויות שונות.

1. **עבור התורה**: יש המפרשים שהעולם נברא כדי לאפשר את קיום התורה, שהיא תכלית הבריאה. רעיון זה מופיע במדרשים ובפרשנויות שונות, כמו במדרש שמדבר על כך שהתורה הייתה קיימת לפני בריאת העולם, ולכן הבריאה כולה נועדה לאפשר את קיום התורה.

2. **עבור ישראל**: יש המפרשים שהעולם נברא בשביל ישראל, העם שנבחר לקבל את התורה. לדוגמה, במדרש נאמר כי ישראל הם העם שקיבל את התורה מתוך החושך, ולכן עליהם יזרח ה' (ישעיה ס', ב') [Ohel Ya'akov on Torah, Ref: ec91309b7f81308f:Vayikra/19/0].

3. **פרשנויות נוספות**: יש המפרשים את הרעיון הזה גם בהקשרים של תכלית הבריאה, כמו שכתוב במקורות שונים על כך שעם ישראל הוא העם שמראה לעולם את יכולת הרוח האנושית לגבור על הטבע [Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible, Ref: a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19].

לסיכום, הרעיון שהעולם נברא בשביל התורה או בשביל ישראל הוא רעיון מרכזי במסורת היהודית, עם פרשנויות שונות שמדגישות את הקשר בין הבריאה, התורה ועם ישראל.
```


#### Graph answer

```
הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מופיע במספר מקורות בתורה ובמדרשים. אחד המקורות המפורסמים הוא במדרש שמדבר על כך שהתורה ניתנה מתוך החושך לישראל, ובזכות קבלת התורה, ישראל זוכים לאור אלוהי (אוהל יעקב על התורה, ויקרא 19).

בפרשנויות שונות, כמו של ה"קל יקר", ישנה התייחסות לכך שהמצוות, כמו שמיטת הארץ, נועדו להזכיר את חידוש העולם ואת תכליתו, שהיא הקשר עם ישראל (קל יקר על ויקרא 24). 

בנוסף, המדרש מדגיש את החשיבות של ישראל כעם הנושא את התורה, וכיצד הם מהווים אור לגויים (אוהל יעקב, סוף פרשתנו). 

לסיכום, הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מתבטא בהבנה שישראל הם העם הנבחר, והקשר שלהם עם התורה הוא מרכזי ומשמעותי בהבנת תכלית הבריאה.
```


#### Baseline refs (context pool)

- `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0`
- `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0`
- `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21`
- `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58`
- `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19`
- `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3`
- `Radak on Isaiah efc008ef9e7f4829:62/11/1`

#### Graph refs (context pool)

- `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0`
- `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0`
- `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21`
- `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58`
- `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19`
- `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3`
- `Radak on Isaiah efc008ef9e7f4829:62/11/1`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0` (score 0.5876, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0` (score 0.5822, type `tanakh_commentary`)
  - `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21` (score 0.5774, type `tanakh_commentary`)
  - `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58` (score 0.5772, type `tanakh_commentary`)
  - `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0` (score 0.5768, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` (score 0.5744, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3` (score 0.5743, type `tanakh_commentary`)
  - `Radak on Isaiah efc008ef9e7f4829:62/11/1` (score 0.5721, type `tanakh_commentary`)
  - `MeAvur HaAretz; on Joshua 397dd54519172937:%3CEMPTY_KEY%3E/5/11` (score 0.5712, type `tanakh_commentary`)
  - `Hadar Zekenim on Torah 44310b974eb63b59:Genesis/0/0/3` (score 0.5686, type `tanakh_commentary`)
  - `Rabbeinu Bahya 6f4658cddcc025b8:Bereshit/0/1/5` (score 0.5679, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/113` (score 0.5660, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0` (score 0.5876, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0` (score 0.5822, type `tanakh_commentary`)
  - `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21` (score 0.5774, type `tanakh_commentary`)
  - `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58` (score 0.5772, type `tanakh_commentary`)
  - `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0` (score 0.5768, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` (score 0.5744, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3` (score 0.5743, type `tanakh_commentary`)
  - `Radak on Isaiah efc008ef9e7f4829:62/11/1` (score 0.5721, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0` (score 0.5876, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0` (score 0.5822, type `tanakh_commentary`)
  - `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21` (score 0.5774, type `tanakh_commentary`)
  - `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58` (score 0.5772, type `tanakh_commentary`)
  - `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0` (score 0.5768, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` (score 0.5744, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3` (score 0.5743, type `tanakh_commentary`)
  - `Radak on Isaiah efc008ef9e7f4829:62/11/1` (score 0.5721, type `tanakh_commentary`)
  - `MeAvur HaAretz; on Joshua 397dd54519172937:%3CEMPTY_KEY%3E/5/11` (score 0.5712, type `tanakh_commentary`)
  - `Hadar Zekenim on Torah 44310b974eb63b59:Genesis/0/0/3` (score 0.5686, type `tanakh_commentary`)
  - `Rabbeinu Bahya 6f4658cddcc025b8:Bereshit/0/1/5` (score 0.5679, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/113` (score 0.5660, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0` (score 0.5876, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0` (score 0.5822, type `tanakh_commentary`)
  - `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21` (score 0.5774, type `tanakh_commentary`)
  - `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58` (score 0.5772, type `tanakh_commentary`)
  - `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0` (score 0.5768, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` (score 0.5744, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3` (score 0.5743, type `tanakh_commentary`)
  - `Radak on Isaiah efc008ef9e7f4829:62/11/1` (score 0.5721, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `e493f000f1fd5ef4:24/1/0` score 0.5876
  - `ec91309b7f81308f:Vayikra/19/0` score 0.5822
  - `c33fbee783cb0c47:Vezot%20Haberakha/21` score 0.5774
  - `37526edd4a4cc76d:Lech%20Lecha/58` score 0.5772
  - `5d07e4948670f23e:Numbers/18/9/0` score 0.5768
  - `a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` score 0.5744
  - `771e480a7bd1be4d:4/14/3` score 0.5743
  - `efc008ef9e7f4829:62/11/1` score 0.5721
- *Graph — reranked (graph score / retrieval score):*
  - `e493f000f1fd5ef4:24/1/0` graph 0.9400 / vec 0.5876
  - `ec91309b7f81308f:Vayikra/19/0` graph 0.9309 / vec 0.5822
  - `c33fbee783cb0c47:Vezot%20Haberakha/21` graph 0.9227 / vec 0.5774
  - `37526edd4a4cc76d:Lech%20Lecha/58` graph 0.9224 / vec 0.5772
  - `5d07e4948670f23e:Numbers/18/9/0` graph 0.9217 / vec 0.5768
  - `a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` graph 0.9176 / vec 0.5744
  - `771e480a7bd1be4d:4/14/3` graph 0.9175 / vec 0.5743
  - `efc008ef9e7f4829:62/11/1` graph 0.9137 / vec 0.5721
- *Graph — signals (per ref in pool before rerank):*
  - `e493f000f1fd5ef4:24/1/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `ec91309b7f81308f:Vayikra/19/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9309
  - `c33fbee783cb0c47:Vezot%20Haberakha/21` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9227
  - `37526edd4a4cc76d:Lech%20Lecha/58` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9224
  - `5d07e4948670f23e:Numbers/18/9/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9217
  - `a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9176
  - `771e480a7bd1be4d:4/14/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9175
  - `efc008ef9e7f4829:62/11/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9137

---

### Question 2

- **Query:** מי דן במשמעות של “נעשה אדם בצלמנו כדמותנו”, ואילו כיוונים פרשניים עולים?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
הביטוי "נעשה אדם בצלמנו כדמותנו" מעורר דיונים פרשניים רבים. כמה מהכיוונים העיקריים הם:

1. **דמיון לאל**: פרשנים כמו קאסוטו טוענים שהאדם נברא בדמות אלוהים, מה שמצביע על כך שהאדם נושא בתוכו את הכוחות והיכולות של האל, בניגוד לשאר בעלי החיים שיש להם כוחות מוגבלים. הוא מדגיש שהאדם הוא בעל הכנה לכל המידות והפעולות שבעולם, ולכן הוא נבדל משאר הבריות (קאסוטו על בראשית).

2. **הכנה רוחנית וגופנית**: הרמב"ן מציין שהאדם נברא עם חלק רוחני (נשמה) וחלק גופני, מה שמדגיש את השילוב בין החומר לרוח. הוא מציע שהאדם דומה לארץ בגופו ולעליונים בנשמתו (רמב"ן על בראשית).

3. **התדמות למידות עליונות**: פרשנים כמו הכתיב והקבלה מדברים על כך שהאדם מתבקש להתדמות למידות רוחניות עליונות, וככל שהוא מתעלה במידותיו, כך הוא מקבל יותר מהשפעת האל (הכתיב והקבלה על בראשית).

4. **תפקיד האדם**: חזקוני מציע שהאדם נברא כדי לשלוט על שאר הבריות, והוא נושא בתוכו את הדמיון לאלוהים כדי למלא את תפקידו זה (חזקוני על בראשית).

כל אחד מהכיוונים הללו מציע הבנה שונה של משמעות הביטוי, אך כולם מדגישים את המורכבות והייחודיות של האדם בבריאה.
```


#### Graph answer

```
ביטוי "נעשה אדם בצלמנו כדמותנו" נידון על ידי מספר פרשנים, וכל אחד מהם מציע כיוונים פרשניים שונים:

1. **רבי דוד קמחי (רד"ק)** מציע שהאדם נברא עם חלק גשמי (מהארץ) וחלק רוחני (מהאל), ולכן הוא דומה גם לארץ וגם לעליונים. הוא מדגיש את השילוב בין הגוף לנשמה [Kli Yakar on Genesis].

2. **אברהם אבן עזרא** מסביר שהאדם נבדל משאר בעלי החיים בכך שיש לו יכולת לכלול בתוכו את כל המידות והכוחות, מה שמקנה לו את היכולת לשלוט על שאר הבריות [Shadal on Genesis].

3. **הרמב"ן** מציע שהביטוי "כדמותנו" מתייחס לדמיון של האדם למלאכים, ומדגיש את יכולתו של האדם לרדות בבעלי חיים, מה שמצביע על מעמדו המיוחד [Chizkuni].

4. **הקטע מ"כתבי הקודש"** מציע שהאדם נברא בצורה מיוחדת, כאילו היה מלאכת מחשבת, מה שמצביע על חשיבותו וייחודו [Shadal on Genesis].

5. **חכמים אחרים** מדברים על כך שהאדם צריך לשאוף להתדמות למידות האלוהיות, וכך להעלות את נשמתו ולזכות לרוחניות גבוהה יותר [HaKtav VeHaKabalah].

לסיכום, הפרשנויות מצביעות על כך שהאדם נברא בצלם אלוהים כדי לשקף את המידות האלוהיות, לשלב בין גשמיות לרוחניות, ולזכות במעמד מיוחד בעולם.
```


#### Baseline refs (context pool)

- `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79`
- `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2`
- `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3`
- `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0`
- `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1`
- `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0`
- `Chizkuni 650644840ff5c406:Genesis/0/25/3`

#### Graph refs (context pool)

- `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79`
- `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2`
- `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3`
- `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0`
- `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1`
- `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0`
- `Chizkuni 650644840ff5c406:Genesis/0/25/3`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0` (score 0.6335, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` (score 0.6302, type `tanakh_commentary`)
  - `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2` (score 0.6215, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3` (score 0.6172, type `tanakh_commentary`)
  - `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` (score 0.6135, type `tanakh_commentary`)
  - `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` (score 0.6052, type `tanakh_commentary`)
  - `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0` (score 0.6047, type `tanakh_commentary`)
  - `Chizkuni 650644840ff5c406:Genesis/0/25/3` (score 0.6042, type `tanakh_commentary`)
  - `Siftei Chakhamim 545f1d52e3cb3225:Leviticus/26/8/0` (score 0.6018, type `tanakh_commentary`)
  - `Haamek Davar on Genesis 9deb879e253ee745:%3CEMPTY_KEY%3E/0/25/2` (score 0.5993, type `tanakh_commentary`)
  - `Rabbeinu Bahya 6f4658cddcc025b8:Bamidbar/11/2/0` (score 0.5982, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/45/17` (score 0.5955, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0` (score 0.6335, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` (score 0.6302, type `tanakh_commentary`)
  - `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2` (score 0.6215, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3` (score 0.6172, type `tanakh_commentary`)
  - `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` (score 0.6135, type `tanakh_commentary`)
  - `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` (score 0.6052, type `tanakh_commentary`)
  - `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0` (score 0.6047, type `tanakh_commentary`)
  - `Chizkuni 650644840ff5c406:Genesis/0/25/3` (score 0.6042, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0` (score 0.6335, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` (score 0.6302, type `tanakh_commentary`)
  - `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2` (score 0.6215, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3` (score 0.6172, type `tanakh_commentary`)
  - `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` (score 0.6135, type `tanakh_commentary`)
  - `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` (score 0.6052, type `tanakh_commentary`)
  - `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0` (score 0.6047, type `tanakh_commentary`)
  - `Chizkuni 650644840ff5c406:Genesis/0/25/3` (score 0.6042, type `tanakh_commentary`)
  - `Siftei Chakhamim 545f1d52e3cb3225:Leviticus/26/8/0` (score 0.6018, type `tanakh_commentary`)
  - `Haamek Davar on Genesis 9deb879e253ee745:%3CEMPTY_KEY%3E/0/25/2` (score 0.5993, type `tanakh_commentary`)
  - `Rabbeinu Bahya 6f4658cddcc025b8:Bamidbar/11/2/0` (score 0.5982, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/45/17` (score 0.5955, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0` (score 0.6335, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` (score 0.6302, type `tanakh_commentary`)
  - `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2` (score 0.6215, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3` (score 0.6172, type `tanakh_commentary`)
  - `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` (score 0.6135, type `tanakh_commentary`)
  - `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` (score 0.6052, type `tanakh_commentary`)
  - `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0` (score 0.6047, type `tanakh_commentary`)
  - `Chizkuni 650644840ff5c406:Genesis/0/25/3` (score 0.6042, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `4d2bb6d49da69ddd:0/2/0` score 0.6335
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` score 0.6302
  - `596d4e2c101152da:Genesis/0/25/2` score 0.6215
  - `5cc060f8cd54b5d6:0/25/3` score 0.6172
  - `f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` score 0.6135
  - `ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` score 0.6052
  - `e16479853ef7d57f:1/20/0` score 0.6047
  - `650644840ff5c406:Genesis/0/25/3` score 0.6042
- *Graph — reranked (graph score / retrieval score):*
  - `4d2bb6d49da69ddd:0/2/0` graph 0.9400 / vec 0.6335
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` graph 0.9349 / vec 0.6302
  - `596d4e2c101152da:Genesis/0/25/2` graph 0.9211 / vec 0.6215
  - `5cc060f8cd54b5d6:0/25/3` graph 0.9143 / vec 0.6172
  - `f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` graph 0.9085 / vec 0.6135
  - `ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` graph 0.8955 / vec 0.6052
  - `e16479853ef7d57f:1/20/0` graph 0.8946 / vec 0.6047
  - `650644840ff5c406:Genesis/0/25/3` graph 0.8938 / vec 0.6042
- *Graph — signals (per ref in pool before rerank):*
  - `4d2bb6d49da69ddd:0/2/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9349
  - `596d4e2c101152da:Genesis/0/25/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9211
  - `5cc060f8cd54b5d6:0/25/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9143
  - `f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9085
  - `ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8955
  - `e16479853ef7d57f:1/20/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8946
  - `650644840ff5c406:Genesis/0/25/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8938

---

### Question 3

- **Query:** איפה יש דיון בקשיות הלב של פרעה, ומה היחס בין בחירה להתערבות אלוהית?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
דיון בקשיות הלב של פרעה מופיע במקומות שונים בתורה, במיוחד בספר שמות. בפרשת וַאֵרָא, יש התייחסות לכך שה' הכביד את לב פרעה, מה שמעורר שאלות על חופש הרצון והאחריות של פרעה על מעשיו. השאלה המרכזית היא כיצד ניתן להעניש את פרעה אם הוא פעל תחת השפעה אלוהית ולא מתוך רצון חופשי.

היחס בין בחירה להתערבות אלוהית הוא מורכב. מצד אחד, ישנה ההבנה שה' משפיע על לב פרעה, מה שמוביל לתהיות על צדק ההענשה (Covenant and Conversation; Hebrew Edition, Ref: 5139e9501410a731:Vaera/2/0). מצד שני, יש המפרשים שהקשה הלב נועדה להדגיש את חופש הרצון של פרעה, שכן הוא עדיין יכול לבחור כיצד להגיב למכות (Chibbah Yeteirah on Torah, Ref: a1e70289c5a5e3bc:Exodus/6/21/0).

לסיכום, הדיון סביב קשיות הלב של פרעה נוגע לשאלות עמוקות של חופש הרצון, אחריות מוסרית, והתערבות אלוהית, והוא נמשך לאורך הדורות בקרב פילוסופים ותיאולוגים.
```


#### Graph answer

```
דיון בקשיות הלב של פרעה מופיע בפרשות שמות וערה, שם מתואר כיצד אלוהים הכביד את לב פרעה, מה שמוביל אותו לסרב לשחרר את בני ישראל. השאלה המרכזית היא האם פרעה פעל מתוך חופש רצון או שההכבדה הייתה התערבות אלוהית שהשפיעה על החלטותיו. 

היחס בין בחירה להתערבות אלוהית הוא מורכב. מצד אחד, אם אלוהים הכביד את לב פרעה, עולה השאלה על צדק הענישה, שכן פרעה לא פעל מתוך רצון חופשי. מצד שני, יש המפרשים את ההכבדה כהזדמנות לפרעה להראות את עמידתו מול אלוהים, מה שמצביע על חופש הרצון שלו, גם אם הוא היה נתון להשפעה אלוהית [שמות 7:3; שמות 10:1; וערה 4:21].

לסיכום, המתח בין חופש הרצון להתערבות אלוהית הוא נושא מרכזי בדיון על דמותו של פרעה וההחלטות שהוא מקבל.
```


#### Baseline refs (context pool)

- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14`
- `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11`
- `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4`

#### Graph refs (context pool)

- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14`
- `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11`
- `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13` (score 0.5687, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` (score 0.5554, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14` (score 0.5454, type `tanakh_commentary`)
  - `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` (score 0.5449, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` (score 0.5431, type `tanakh_commentary`)
  - `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0` (score 0.5420, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0` (score 0.5405, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4` (score 0.5390, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Vaera/0/9` (score 0.5373, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Chukat/1/14` (score 0.5365, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Nasso/2/3` (score 0.5354, type `tanakh_commentary`)
  - `Tur HaArokh 79aaaf9dea65e0f0:Exodus/6/2/0` (score 0.5343, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13` (score 0.5687, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` (score 0.5554, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14` (score 0.5454, type `tanakh_commentary`)
  - `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` (score 0.5449, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` (score 0.5431, type `tanakh_commentary`)
  - `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0` (score 0.5420, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0` (score 0.5405, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4` (score 0.5390, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13` (score 0.5688, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` (score 0.5554, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14` (score 0.5454, type `tanakh_commentary`)
  - `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` (score 0.5450, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` (score 0.5432, type `tanakh_commentary`)
  - `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0` (score 0.5420, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0` (score 0.5405, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4` (score 0.5391, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Vaera/0/9` (score 0.5374, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Chukat/1/14` (score 0.5365, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Nasso/2/3` (score 0.5354, type `tanakh_commentary`)
  - `Tur HaArokh 79aaaf9dea65e0f0:Exodus/6/2/0` (score 0.5344, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13` (score 0.5688, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` (score 0.5554, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14` (score 0.5454, type `tanakh_commentary`)
  - `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` (score 0.5450, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` (score 0.5432, type `tanakh_commentary`)
  - `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0` (score 0.5420, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0` (score 0.5405, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4` (score 0.5391, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `5139e9501410a731:Ki%20Tisa/3/13` score 0.5688
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` score 0.5554
  - `5139e9501410a731:Bereshit/1/14` score 0.5454
  - `2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` score 0.5450
  - `a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` score 0.5432
  - `a1e70289c5a5e3bc:Exodus/6/21/0` score 0.5420
  - `5139e9501410a731:Vaera/2/0` score 0.5405
  - `a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4` score 0.5391
- *Graph — reranked (graph score / retrieval score):*
  - `5139e9501410a731:Ki%20Tisa/3/13` graph 0.9400 / vec 0.5688
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` graph 0.9165 / vec 0.5554
  - `5139e9501410a731:Bereshit/1/14` graph 0.8989 / vec 0.5454
  - `2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` graph 0.8982 / vec 0.5450
  - `a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` graph 0.8950 / vec 0.5432
  - `a1e70289c5a5e3bc:Exodus/6/21/0` graph 0.8930 / vec 0.5420
  - `5139e9501410a731:Vaera/2/0` graph 0.8904 / vec 0.5405
  - `a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4` graph 0.8879 / vec 0.5391
- *Graph — signals (per ref in pool before rerank):*
  - `5139e9501410a731:Ki%20Tisa/3/13` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9165
  - `5139e9501410a731:Bereshit/1/14` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8989
  - `2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8982
  - `a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8950
  - `a1e70289c5a5e3bc:Exodus/6/21/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8930
  - `5139e9501410a731:Vaera/2/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8904
  - `a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8879

---

### Question 4

- **Query:** מהם המקורות על תשובה בתנ״ך ואיך חז״ל והפרשנים מפרשים אותם?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
בתנ"ך ישנם מספר מקורות העוסקים בתשובה, כאשר אחד המרכזיים הוא בספר יחזקאל. בפרק 18, פסוק 30, נאמר: "הָשִׁיבוּ וְשִׁנוּ אֶת-דְּרָכֵיכֶן וְאֶת-מַעַלְלֵיכֶן". פסוק זה מדגיש את הצורך בשינוי מעשים ובחזרה בתשובה.

חז"ל והפרשנים מפרשים את המושג תשובה בדרכים שונות. לדוגמה, הרמב"ם בספרו "משנה תורה" מתאר את התשובה כתהליך של חרטה, קבלה על העתיד, ותיקון המעשים. הוא מדגיש את החשיבות של הכרה בחטא והחלטה לשוב למוטב.

גם המפרשים כמו אבן עזרא וראב"ע עוסקים בתשובה, כאשר הם מדגישים את הקשר בין תשובה לבין רחמים וסליחה מצד ה' (כפי שמופיע גם בספר תהילים).

לסיכום, המקורות על תשובה בתנ"ך כוללים את ספר יחזקאל, והפרשנים כמו הרמב"ם ואבן עזרא מספקים הבנות מעמיקות על משמעותה ותהליך השיבה בתשובה.
```


#### Graph answer

```
בתנ"ך ישנם מספר מקורות העוסקים בתשובה, כאשר אחד המרכזיים הוא בספר יחזקאל, בפרק ל״ו, פסוק 26: "וְנָתַתִּי לָכֶם לֵב חָדָשׁ, וְרוּחַ חֲדָשָׁה אֶתֵּן בְּקִרְבֵּכֶם; וְהָסַרְתִּי אֶת-לֵב הָאֶבֶן מִבְּשַׂרְכֶם, וְנָתַתִּי לָכֶם לֵב בָּשָׂר". פסוק זה מדגיש את השינוי הפנימי הנדרש כדי לחזור בתשובה.

חז"ל והפרשנים מפרשים את המושג תשובה בדרכים שונות. לדוגמה, הרמב"ם בספרו "משנה תורה" (הלכות תשובה) מתאר את תהליך התשובה ככולל חרטה, וידוי וקבלה לעתיד. הוא מדגיש את החשיבות של הכוונה והמעשה.

המלבי"ם מפרש את התשובה כיכולת לשוב אל ה' מתוך הבנה עמוקה של משמעות המעשים, בעוד שהאברבנאל מדגיש את הקשר בין תשובה לבין חידוש הברית עם ה'.

לסיכום, המקורות בתנ"ך מצביעים על חשיבות התשובה, וחז"ל והפרשנים מוסיפים לה את המימד של הכוונה והמעשה, תוך הדגשת השינוי הפנימי הנדרש.
```


#### Baseline refs (context pool)

- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11`
- `Metzudat David on Joshua 2fb40407c188ca50:7/33/1`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13`
- `Malbim on I Kings 5b3d899c9941aab7:5/26/0`
- `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15`
- `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9`

#### Graph refs (context pool)

- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11`
- `Metzudat David on Joshua 2fb40407c188ca50:7/33/1`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13`
- `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15`
- `Malbim on I Kings 5b3d899c9941aab7:5/26/0`
- `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` (score 0.5844, type `tanakh_commentary`)
  - `Metzudat David on Joshua 2fb40407c188ca50:7/33/1` (score 0.5771, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5` (score 0.5743, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` (score 0.5694, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` (score 0.5593, type `tanakh_commentary`)
  - `Malbim on I Kings 5b3d899c9941aab7:5/26/0` (score 0.5584, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15` (score 0.5571, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` (score 0.5552, type `tanakh_commentary`)
  - `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/8/28/4` (score 0.5510, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaetchanan/2/2` (score 0.5499, type `tanakh_commentary`)
  - `Mashmia Yeshuah 9b4ee412713cf460:The%20Third%20Herald%20(Isaiah)/%3CEMPTY_KEY%3E/1/4` (score 0.5488, type `tanakh_commentary`)
  - `Radak on II Samuel fc5cbbd3402303fa:0/5/2` (score 0.5461, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` (score 0.5844, type `tanakh_commentary`)
  - `Metzudat David on Joshua 2fb40407c188ca50:7/33/1` (score 0.5771, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5` (score 0.5743, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` (score 0.5694, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` (score 0.5593, type `tanakh_commentary`)
  - `Malbim on I Kings 5b3d899c9941aab7:5/26/0` (score 0.5584, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15` (score 0.5571, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` (score 0.5552, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` (score 0.5860, type `tanakh_commentary`)
  - `Metzudat David on Joshua 2fb40407c188ca50:7/33/1` (score 0.5786, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5` (score 0.5765, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` (score 0.5709, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` (score 0.5603, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15` (score 0.5587, type `tanakh_commentary`)
  - `Malbim on I Kings 5b3d899c9941aab7:5/26/0` (score 0.5576, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` (score 0.5569, type `tanakh_commentary`)
  - `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/8/28/4` (score 0.5521, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaetchanan/2/2` (score 0.5513, type `tanakh_commentary`)
  - `Mashmia Yeshuah 9b4ee412713cf460:The%20Third%20Herald%20(Isaiah)/%3CEMPTY_KEY%3E/1/4` (score 0.5500, type `tanakh_commentary`)
  - `Radak on II Samuel fc5cbbd3402303fa:0/5/2` (score 0.5486, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` (score 0.5860, type `tanakh_commentary`)
  - `Metzudat David on Joshua 2fb40407c188ca50:7/33/1` (score 0.5786, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5` (score 0.5765, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` (score 0.5709, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` (score 0.5603, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15` (score 0.5587, type `tanakh_commentary`)
  - `Malbim on I Kings 5b3d899c9941aab7:5/26/0` (score 0.5576, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` (score 0.5569, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` score 0.5860
  - `2fb40407c188ca50:7/33/1` score 0.5786
  - `5139e9501410a731:Vayikra/3/5` score 0.5765
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` score 0.5709
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` score 0.5603
  - `af25e1459a5766ab:Shmini/1/15` score 0.5587
  - `5b3d899c9941aab7:5/26/0` score 0.5576
  - `11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` score 0.5569
- *Graph — reranked (graph score / retrieval score):*
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` graph 0.9400 / vec 0.5860
  - `2fb40407c188ca50:7/33/1` graph 0.9273 / vec 0.5786
  - `5139e9501410a731:Vayikra/3/5` graph 0.9238 / vec 0.5765
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` graph 0.9142 / vec 0.5709
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` graph 0.8961 / vec 0.5603
  - `af25e1459a5766ab:Shmini/1/15` graph 0.8934 / vec 0.5587
  - `5b3d899c9941aab7:5/26/0` graph 0.8915 / vec 0.5576
  - `11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` graph 0.8903 / vec 0.5569
- *Graph — signals (per ref in pool before rerank):*
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `2fb40407c188ca50:7/33/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9273
  - `5139e9501410a731:Vayikra/3/5` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9238
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9142
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8961
  - `af25e1459a5766ab:Shmini/1/15` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8934
  - `5b3d899c9941aab7:5/26/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8915
  - `11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8903

---

### Question 5

- **Query:** איפה יש דיון במשמעות של “לא בשמים היא”, ואיך משתמשים בפסוק הזה?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
הדיון במשמעות של "לא בשמים היא" מופיע בעניין פרשנות התורה והמצוות, במיוחד בהקשר של חובת האדם להבין את התורה וליישם אותה בעצמו. הפסוק "לא בשמים היא" לקוח מתוך ספר דברים (דברים ל:יב) ומשמש להדגיש שהמצוות אינן מעבר להבנה האנושית, אלא ניתנות ליישום כאן על פני האדמה.

בפרשנויות שונות, כמו של רמב"ם ורשב"ם, הפסוק משמש להראות שהאדם לא צריך לחכות להכוונה אלוהית נוספת כדי להבין את מה שנדרש ממנו, אלא עליו לפעול על פי מה שכבר נמסר לו. זהו עיקרון חשוב ביהדות שמדגיש את האחריות האישית של כל אדם.

אם יש לך שאלות נוספות או נושאים נוספים שתרצה לדון בהם, אני כאן לעזור!
```


#### Graph answer

```
הדיון במשמעות של "לא בשמים היא" מופיע בְּמָקוֹמוֹת שונים, בעיקר בהקשר של תורת ישראל והבנת מצוותיה. הפסוק "לא בשמים היא" מופיע בספר דברים (דברים ל:יב) ומשמש להדגיש שהמצוות אינן מעבר להישג ידו של האדם, אלא ניתנות להבנה ולביצוע כאן על פני האדמה.

בפרשנויות שונות, כמו של רמב"ן ורשב"ם, הפסוק מדגיש את הנגישות של התורה ואת חובת האדם לקחת אחריות על מעשיו. הוא מציין שהאדם אינו צריך לחכות להוראות שמגיעות משמים, אלא עליו לפעול על פי מה שנמצא לפניו.

השימוש בפסוק הזה הוא כדי להדגיש את הרעיון שהאדם יכול להבין את התורה וליישם אותה בחייו, מבלי להמתין להכוונה עליונה. זהו עיקרון מרכזי בהבנת תפקיד האדם במערכת הדתית והחוקית של ישראל.
```


#### Baseline refs (context pool)

- `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0`
- `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2`
- `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0`
- `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3`
- `Gur Aryeh on Shemot 08752ac870f2f8c5:28/21/1`

#### Graph refs (context pool)

- `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0`
- `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2`
- `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0`
- `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3`
- `Gur Aryeh on Shemot 08752ac870f2f8c5:28/21/1`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` (score 0.5496, type `tanakh_commentary`)
  - `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0` (score 0.5496, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` (score 0.5421, type `tanakh_commentary`)
  - `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0` (score 0.5300, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` (score 0.5239, type `tanakh_commentary`)
  - `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` (score 0.5220, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` (score 0.5191, type `tanakh_commentary`)
  - `Gur Aryeh on Shemot 08752ac870f2f8c5:28/21/1` (score 0.5190, type `tanakh_commentary`)
  - `Metzudat David on Psalms 0aa6ba868f0e2d78:18/4/1` (score 0.5189, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/21/14/0` (score 0.5187, type `tanakh_commentary`)
  - `Malbim on Exodus 764487f170fce2a3:21/5/0` (score 0.5185, type `tanakh_commentary`)
  - `Gur Aryeh on Vayikra 911af6be5e464ea7:6/18/2` (score 0.5182, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` (score 0.5496, type `tanakh_commentary`)
  - `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0` (score 0.5496, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` (score 0.5421, type `tanakh_commentary`)
  - `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0` (score 0.5300, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` (score 0.5239, type `tanakh_commentary`)
  - `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` (score 0.5220, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` (score 0.5191, type `tanakh_commentary`)
  - `Gur Aryeh on Shemot 08752ac870f2f8c5:28/21/1` (score 0.5190, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0` (score 0.5498, type `tanakh_commentary`)
  - `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` (score 0.5498, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` (score 0.5421, type `tanakh_commentary`)
  - `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0` (score 0.5302, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` (score 0.5240, type `tanakh_commentary`)
  - `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` (score 0.5223, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` (score 0.5193, type `tanakh_commentary`)
  - `Gur Aryeh on Shemot 08752ac870f2f8c5:28/21/1` (score 0.5192, type `tanakh_commentary`)
  - `Metzudat David on Psalms 0aa6ba868f0e2d78:18/4/1` (score 0.5191, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/21/14/0` (score 0.5189, type `tanakh_commentary`)
  - `Malbim on Exodus 764487f170fce2a3:21/5/0` (score 0.5187, type `tanakh_commentary`)
  - `Gur Aryeh on Vayikra 911af6be5e464ea7:6/18/2` (score 0.5184, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0` (score 0.5498, type `tanakh_commentary`)
  - `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` (score 0.5498, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` (score 0.5421, type `tanakh_commentary`)
  - `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0` (score 0.5302, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` (score 0.5240, type `tanakh_commentary`)
  - `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` (score 0.5223, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` (score 0.5193, type `tanakh_commentary`)
  - `Gur Aryeh on Shemot 08752ac870f2f8c5:28/21/1` (score 0.5192, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `d1eb3a7cb0ea1719:Genesis/5/29/0` score 0.5498
  - `db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` score 0.5498
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` score 0.5421
  - `60f5b580c6e0f96f:2/0/0` score 0.5302
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` score 0.5240
  - `879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` score 0.5223
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` score 0.5193
  - `08752ac870f2f8c5:28/21/1` score 0.5192
- *Graph — reranked (graph score / retrieval score):*
  - `d1eb3a7cb0ea1719:Genesis/5/29/0` graph 0.9400 / vec 0.5498
  - `db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` graph 0.9400 / vec 0.5498
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` graph 0.9260 / vec 0.5421
  - `60f5b580c6e0f96f:2/0/0` graph 0.9043 / vec 0.5302
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` graph 0.8931 / vec 0.5240
  - `879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` graph 0.8899 / vec 0.5223
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` graph 0.8844 / vec 0.5193
  - `08752ac870f2f8c5:28/21/1` graph 0.8843 / vec 0.5192
- *Graph — signals (per ref in pool before rerank):*
  - `d1eb3a7cb0ea1719:Genesis/5/29/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9260
  - `60f5b580c6e0f96f:2/0/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9043
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8931
  - `879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8899
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8844
  - `08752ac870f2f8c5:28/21/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8843

---

### Question 6

- **Query:** מי מפרש את עקידת יצחק מנקודת מבט של ניסיון מול ציווי?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
מנקודת מבט של ניסיון מול ציווי, עקידת יצחק נתפסת כנסיון גדול של אברהם, שבו הוא נדרש להקריב את בנו על פי צו אלוהי. המפרשים השונים מתארים את המתח בין הציווי האלוהי לבין הקושי המוסרי והרגשי של אברהם. 

אחת הגישות המפורסמות היא של רמב"ן, שמדגיש את הניסיון של אברהם ואת האמונה המוחלטת שלו בה' למרות הקושי שבציווי. הוא רואה בעקידה לא רק ציווי אלא גם מבחן לאמונה של אברהם ([בראשית כב:א]).

אם יש לך שאלות נוספות או אם תרצה להעמיק בנושא, אני כאן!
```


#### Graph answer

```
מפרש את עקידת יצחק מנקודת מבט של ניסיון מול ציווי הוא הרמב"ן. הוא מדגיש את המתח בין הציווי האלוהי להקריב את יצחק לבין הניסיון של אברהם, שמעמיד את אמונתו וביטחונו באלוהים במבחן קשה. הרמב"ן מציע שהניסיון הוא חלק מהותי מהציווי, ומטרתו היא לבדוק את נאמנותו של אברהם לאלוהים, גם כאשר הציווי נראה סותר את ההיגיון האנושי.

אם יש לך שאלות נוספות או צורך בהבהרות נוספות, אני כאן לעזור!
```


#### Baseline refs (context pool)

- `Pardes Yosef 920062d067507725:Genesis/30/16/0`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0`
- `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0`
- `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10`
- `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0`
- `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8`
- `Tur HaArokh 79aaaf9dea65e0f0:Genesis/35/5/0`

#### Graph refs (context pool)

- `Pardes Yosef 920062d067507725:Genesis/30/16/0`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0`
- `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0`
- `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10`
- `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0`
- `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8`
- `Tur HaArokh 79aaaf9dea65e0f0:Genesis/35/5/0`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Pardes Yosef 920062d067507725:Genesis/30/16/0` (score 0.5307, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` (score 0.5294, type `tanakh_commentary`)
  - `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` (score 0.5290, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` (score 0.5205, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10 (part 3/3)` (score 0.5176, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0` (score 0.5138, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8` (score 0.5126, type `tanakh_commentary`)
  - `Tur HaArokh 79aaaf9dea65e0f0:Genesis/35/5/0` (score 0.5112, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Exodus fada1ea2420e5f61:%3CEMPTY_KEY%3E/12/2/0` (score 0.5109, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/0/15/2` (score 0.5079, type `tanakh_commentary`)
  - `Pardes Yosef 920062d067507725:Exodus/19/21/0 (part 2/2)` (score 0.5069, type `tanakh_commentary`)
  - `Kli Yakar on Numbers 57b8c08f69873f45:15/0/0` (score 0.5040, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Pardes Yosef 920062d067507725:Genesis/30/16/0` (score 0.5307, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` (score 0.5294, type `tanakh_commentary`)
  - `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` (score 0.5290, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` (score 0.5205, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` (score 0.5176, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0` (score 0.5138, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8` (score 0.5126, type `tanakh_commentary`)
  - `Tur HaArokh 79aaaf9dea65e0f0:Genesis/35/5/0` (score 0.5112, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Pardes Yosef 920062d067507725:Genesis/30/16/0` (score 0.5307, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` (score 0.5294, type `tanakh_commentary`)
  - `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` (score 0.5290, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` (score 0.5205, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10 (part 3/3)` (score 0.5176, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0` (score 0.5138, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8` (score 0.5126, type `tanakh_commentary`)
  - `Tur HaArokh 79aaaf9dea65e0f0:Genesis/35/5/0` (score 0.5112, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Exodus fada1ea2420e5f61:%3CEMPTY_KEY%3E/12/2/0` (score 0.5109, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/0/15/2` (score 0.5079, type `tanakh_commentary`)
  - `Pardes Yosef 920062d067507725:Exodus/19/21/0 (part 2/2)` (score 0.5069, type `tanakh_commentary`)
  - `Kli Yakar on Numbers 57b8c08f69873f45:15/0/0` (score 0.5040, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Pardes Yosef 920062d067507725:Genesis/30/16/0` (score 0.5307, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` (score 0.5294, type `tanakh_commentary`)
  - `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` (score 0.5290, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` (score 0.5205, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` (score 0.5176, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0` (score 0.5138, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8` (score 0.5126, type `tanakh_commentary`)
  - `Tur HaArokh 79aaaf9dea65e0f0:Genesis/35/5/0` (score 0.5112, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `920062d067507725:Genesis/30/16/0` score 0.5307
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` score 0.5294
  - `7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` score 0.5290
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` score 0.5205
  - `11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` score 0.5176
  - `5cc060f8cd54b5d6:47/13/0` score 0.5138
  - `af25e1459a5766ab:Shoftim/3/8` score 0.5126
  - `79aaaf9dea65e0f0:Genesis/35/5/0` score 0.5112
- *Graph — reranked (graph score / retrieval score):*
  - `920062d067507725:Genesis/30/16/0` graph 0.9400 / vec 0.5307
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` graph 0.9376 / vec 0.5294
  - `7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` graph 0.9368 / vec 0.5290
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` graph 0.9208 / vec 0.5205
  - `11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` graph 0.9154 / vec 0.5176
  - `5cc060f8cd54b5d6:47/13/0` graph 0.9082 / vec 0.5138
  - `af25e1459a5766ab:Shoftim/3/8` graph 0.9060 / vec 0.5126
  - `79aaaf9dea65e0f0:Genesis/35/5/0` graph 0.9033 / vec 0.5112
- *Graph — signals (per ref in pool before rerank):*
  - `920062d067507725:Genesis/30/16/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9376
  - `7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9368
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9208
  - `11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9154
  - `5cc060f8cd54b5d6:47/13/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9082
  - `af25e1459a5766ab:Shoftim/3/8` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9060
  - `79aaaf9dea65e0f0:Genesis/35/5/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9033

---

### Question 7

- **Query:** איפה בתנ״ך מופיע רעיון הרחמים במצוות, ואיך הפרשנים מתמודדים איתו?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
רעיון הרחמים במצוות מופיע במקומות שונים בתנ"ך, במיוחד כאשר מדובר במצוות הקשורות ליחס בין בני אדם. לדוגמה, בפרשת משפטים (שמות כ"א) ישנן מצוות המורות על יחס של רחמים כלפי עניים ועבדים. הפרשנים מתמודדים עם רעיון זה בדרכים שונות.

בין הפרשנים, יש המבחינים בין סוגי רחמים: יש רחמים הנובעים מרצון טוב לעזור, ויש רחמים הנובעים מרכות טבעית, כלומר, אדם מרגיש צער על מצוקת הזולת (אוהל יעקב). 

בנוסף, יש המצביעים על כך שהרחמים אינם סותרים את הצורך בשמירה על סדר חברתי וערכים מוסריים, אלא הם חלק מהותי מהם. לדוגמה, יש המפרשים את הסיפורים המקראיים כקריאה לשמור על האחווה והצדק, תוך שמירה על גבולות מסוימים (קרתי בכל לב).

לסיכום, רעיון הרחמים במצוות בתנ"ך זוכה להתייחסות רחבה, והפרשנים מציעים הבנות שונות שמדגישות את המורכבות שביחס בין רחמים לבין חוקים ומוסר.
```


#### Graph answer

```
רעיון הרחמים במצוות מופיע בתנ"ך במקומות שונים, כאשר אחד מהבולטים הוא בפרשת חוקת, בה מתוארת התפרצות הזעם של משה על העם שדרש מים (במדבר כ, א–יג). הפרשנים עוסקים בשאלה מדוע משה נענש על כך, ומדגישים את החשיבות של רחמים וחמלה כלפי העם, גם כאשר הם מתנהגים בצורה לא נאותה.

הפרשנים מציעים גישות שונות להבנת הרחמים במצוות. לדוגמה, במקורות מסוימים מדברים על כך שהחמלה והרחמים הם חלק מהותי מהתורה, והם צריכים להנחות את הפרשנות וההבנה של מצוות (כפי שמציין דוד צבי הופמן) [David Zvi Hoffmann on Leviticus, Ref: 5a9ec949ebd7c295:Preface to Torah Commentary/2]. 

בנוסף, יש המצביעים על כך שהחמלה והצדק הם יסודות חשובים בחיים החברתיים של עם ישראל, והם מהווים את הבסיס לחוסן הפנימי של העם (כפי שמוזכר במקורות על פרשתנו) [Karati Bekhol Lev, Ref: af25e1459a5766ab:Emor/1/16].

באופן כללי, הפרשנים מדגישים את הצורך לאזן בין שמירה על החוק לבין הרחמים והחמלה, ומבינים את הרחמים לא רק כהרגשה אלא גם כמצווה שיש ליישם במציאות החברתית.
```


#### Baseline refs (context pool)

- `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7`
- `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1`

#### Graph refs (context pool)

- `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7`
- `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13` (score 0.5486, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` (score 0.5482, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4` (score 0.5376, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` (score 0.5346, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` (score 0.5320, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` (score 0.5308, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5286, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` (score 0.5280, type `tanakh_commentary`)
  - `Malbim on Leviticus 753f6ce4354a3661:Bechukotai/33/0` (score 0.5279, type `tanakh_commentary`)
  - `Ibn Ezra on Zechariah a0492cb8148ae5a0:13/20/0` (score 0.5261, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/7/10/3` (score 0.5261, type `tanakh_commentary`)
  - `Paaneach Raza 37526edd4a4cc76d:Terumah/12` (score 0.5258, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13` (score 0.5486, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` (score 0.5482, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4` (score 0.5376, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` (score 0.5346, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` (score 0.5320, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` (score 0.5308, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5286, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` (score 0.5280, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13` (score 0.5486, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` (score 0.5482, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4` (score 0.5376, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` (score 0.5346, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` (score 0.5320, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` (score 0.5308, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5286, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` (score 0.5280, type `tanakh_commentary`)
  - `Malbim on Leviticus 753f6ce4354a3661:Bechukotai/33/0` (score 0.5279, type `tanakh_commentary`)
  - `Ibn Ezra on Zechariah a0492cb8148ae5a0:13/20/0` (score 0.5261, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/7/10/3` (score 0.5261, type `tanakh_commentary`)
  - `Paaneach Raza 37526edd4a4cc76d:Terumah/12` (score 0.5258, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13` (score 0.5486, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` (score 0.5482, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4` (score 0.5376, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` (score 0.5346, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` (score 0.5320, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` (score 0.5308, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5286, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` (score 0.5280, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `af25e1459a5766ab:Vayetzei/5/13` score 0.5486
  - `a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` score 0.5482
  - `ec91309b7f81308f:Shemot%3B%20Peticha/4` score 0.5376
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` score 0.5346
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` score 0.5320
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` score 0.5308
  - `af25e1459a5766ab:Emor/1/16` score 0.5286
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` score 0.5280
- *Graph — reranked (graph score / retrieval score):*
  - `af25e1459a5766ab:Vayetzei/5/13` graph 0.9400 / vec 0.5486
  - `a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` graph 0.9394 / vec 0.5482
  - `ec91309b7f81308f:Shemot%3B%20Peticha/4` graph 0.9200 / vec 0.5376
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` graph 0.9145 / vec 0.5346
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` graph 0.9098 / vec 0.5320
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` graph 0.9076 / vec 0.5308
  - `af25e1459a5766ab:Emor/1/16` graph 0.9036 / vec 0.5286
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` graph 0.9024 / vec 0.5280
- *Graph — signals (per ref in pool before rerank):*
  - `af25e1459a5766ab:Vayetzei/5/13` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9394
  - `ec91309b7f81308f:Shemot%3B%20Peticha/4` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9200
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9145
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9098
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9076
  - `af25e1459a5766ab:Emor/1/16` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9036
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9024

---

### Question 8

- **Query:** איפה מופיעים חלומות משמעותיים בתנ״ך ואיך מפרשים אותם?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
חלומות משמעותיים בתנ"ך מופיעים בכמה מקומות, כאשר אחד המפורסמים שבהם הוא חלומו של יוסף, שבו הוא רואה את עצמו ואת יתר האחים שלו בשדה, והם משתחווים לו (בראשית ל"ז:ט). חלומות נוספים כוללים את חלומו של פרעה, שבו הוא רואה שבע פרות רזות ושבע פרות שמנות (בראשית מ"א:א-ד), וחלומו של נבוכדנצר, שבו הוא רואה פסל גדול (דניאל ב:א-ל).

המפרשים מסבירים את החלומות בדרכים שונות. לדוגמה, יוסף מפרש את חלומותיו כתחזיות לעתיד, כאשר הוא רואה את עצמו במעמד גבוה יותר. פרעה, לעומת זאת, זקוק ליוסף כדי להבין את משמעות חלומותיו, שמבשרים על רעב שיבוא (בראשית מ"א:כח-ל). 

כמו כן, ישנה מסורת חז"ל המצביעה על כך שחלומות יכולים לשמש כקריאת כיוון בחיים, ולא רק כתחזיות עתידיות. לדוגמה, בכתבים מודרניים מצוין כי חלומות יכולים להוות כלי לתכנון חיים פעיל ולא פסיבי (Covenant and Conversation; Hebrew Edition, Ref: 5139e9501410a731:Miketz/2/10).

לסיכום, חלומות בתנ"ך נחשבים לאמצעי תקשורת עם האל, והם מפרשים לעיתים קרובות כתחזיות או כקריאות לפעולה.
```


#### Graph answer

```
חלומות משמעותיים בתנ"ך מופיעים במקרים רבים, כאשר המפורסמים ביותר הם חלומותיו של יוסף, כמו החלום על השיבולים והכוכבים (בראשית ל"ז). יוסף מפרש את חלומותיו של פרעה, המייצגים את שבע השנים של שפע ושבע השנים של רעב (בראשית מ"א).

בנוסף, ישנם חלומות נוספים כמו חלום יעקב בסולם (בראשית כ"ח), שבו הוא רואה סולם שמגיע עד השמיים, המייצג את הקשר בין שמיים לארץ.

מפרשים שונים מציעים גישות שונות לפירוש חלומות. לדוגמה, המסורת היהודית רואה בחלומות כלי לתקשורת עם האל, ולעיתים הם נחשבים לאותות או נבואות. כמו כן, יש המפרשים את החלומות כמשקפים את מחשבותיו ורצונותיו של החולם, כפי שמצוין במקורות כמו "חלימת חלומות נחשבת בדרך כלל לדבר לא מעשי" (Covenant and Conversation).

באופן כללי, חלומות בתנ"ך משמשים כדרך להעברת מסרים חשובים, ולעיתים יש להם השפעה מכרעת על מהלך האירועים.
```


#### Baseline refs (context pool)

- `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`
- `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3`
- `Reggio on Torah fa90ac80cdeb4185:Genesis/34/3/0`

#### Graph refs (context pool)

- `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`
- `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3`
- `Reggio on Torah fa90ac80cdeb4185:Genesis/34/3/0`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` (score 0.5415, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10` (score 0.5296, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` (score 0.5273, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` (score 0.5257, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` (score 0.5231, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5224, type `tanakh_commentary`)
  - `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3 (part 2/2)` (score 0.5206, type `tanakh_commentary`)
  - `Reggio on Torah fa90ac80cdeb4185:Genesis/34/3/0` (score 0.5204, type `tanakh_commentary`)
  - `Ta'alumot Chokhmah on Ecclesiastes 5fcd6ad672529cd1:%3CEMPTY_KEY%3E/4/5/0` (score 0.5193, type `tanakh_commentary`)
  - `Ohev Ger d25096e7f8f5ec8d:Part%20II/Variants%20in%20Targum%20Onkelos/170/0` (score 0.5150, type `tanakh_commentary`)
  - `Malbim Ayelet HaShachar a04187a690df2399:0/0` (score 0.5147, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/11/42/0` (score 0.5137, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` (score 0.5415, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10` (score 0.5296, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` (score 0.5273, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` (score 0.5257, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` (score 0.5231, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5224, type `tanakh_commentary`)
  - `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3` (score 0.5206, type `tanakh_commentary`)
  - `Reggio on Torah fa90ac80cdeb4185:Genesis/34/3/0` (score 0.5204, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` (score 0.5415, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10` (score 0.5296, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` (score 0.5273, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` (score 0.5257, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` (score 0.5231, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5224, type `tanakh_commentary`)
  - `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3 (part 2/2)` (score 0.5206, type `tanakh_commentary`)
  - `Reggio on Torah fa90ac80cdeb4185:Genesis/34/3/0` (score 0.5204, type `tanakh_commentary`)
  - `Ta'alumot Chokhmah on Ecclesiastes 5fcd6ad672529cd1:%3CEMPTY_KEY%3E/4/5/0` (score 0.5193, type `tanakh_commentary`)
  - `Ohev Ger d25096e7f8f5ec8d:Part%20II/Variants%20in%20Targum%20Onkelos/170/0` (score 0.5150, type `tanakh_commentary`)
  - `Malbim Ayelet HaShachar a04187a690df2399:0/0` (score 0.5147, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/11/42/0` (score 0.5137, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` (score 0.5415, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10` (score 0.5296, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` (score 0.5273, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` (score 0.5257, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` (score 0.5231, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5224, type `tanakh_commentary`)
  - `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3` (score 0.5206, type `tanakh_commentary`)
  - `Reggio on Torah fa90ac80cdeb4185:Genesis/34/3/0` (score 0.5204, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` score 0.5415
  - `5139e9501410a731:Miketz/2/10` score 0.5296
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` score 0.5273
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` score 0.5257
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` score 0.5231
  - `af25e1459a5766ab:Emor/1/16` score 0.5224
  - `fa07892a8f40e0ba:Leviticus/15/7/3` score 0.5206
  - `fa90ac80cdeb4185:Genesis/34/3/0` score 0.5204
- *Graph — reranked (graph score / retrieval score):*
  - `128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` graph 0.9400 / vec 0.5415
  - `5139e9501410a731:Miketz/2/10` graph 0.9181 / vec 0.5296
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` graph 0.9138 / vec 0.5273
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` graph 0.9108 / vec 0.5257
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` graph 0.9061 / vec 0.5231
  - `af25e1459a5766ab:Emor/1/16` graph 0.9048 / vec 0.5224
  - `fa07892a8f40e0ba:Leviticus/15/7/3` graph 0.9015 / vec 0.5206
  - `fa90ac80cdeb4185:Genesis/34/3/0` graph 0.9011 / vec 0.5204
- *Graph — signals (per ref in pool before rerank):*
  - `128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `5139e9501410a731:Miketz/2/10` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9181
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9138
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9108
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9061
  - `af25e1459a5766ab:Emor/1/16` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9048
  - `fa07892a8f40e0ba:Leviticus/15/7/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9015
  - `fa90ac80cdeb4185:Genesis/34/3/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9011

---

### Question 9

- **Query:** איפה מופיעים ערכים מוסריים לפני מתן תורה, ואיך חז״ל קושרים אותם?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
ערכים מוסריים לפני מתן תורה מופיעים במספר מקומות בתנ"ך, כאשר חז"ל קושרים אותם לתהליכים ולמקרים שונים שקרו בעם ישראל. לדוגמה:

1. **יוסף ואחיו** - סיפור מכירת יוסף מדגיש ערכים של שנאה, קנאה ותיקון, כאשר יוסף סולח לאחיו בסוף הסיפור. חז"ל רואים בכך דוגמה לערכים מוסריים של סליחה ורחמים.

2. **סיפור סדום ועמורה** - המוסריות של הכנסת אורחים והצדק מופיעה כאשר אברהם אבינו מתווכח עם ה' על גורל הערים. חז"ל מדגישים את חשיבות הצדק והרחמים, גם לפני מתן תורה.

3. **מעשה של רות המואביה** - רות מייצגת נאמנות, חסד ומוסריות, והסיפור שלה נלמד כחלק מהערכים המוסריים שקדמו למתן תורה.

חז"ל מדגישים את הערכים הללו כדי להראות שהמוסריות לא התחילה עם מתן תורה, אלא הייתה קיימת בעם ישראל גם לפני כן, ובכך הם מבססים את החשיבות של הערכים הללו כחלק מהותי מהזהות היהודית.
```


#### Graph answer

```
ערכים מוסריים לפני מתן תורה מופיעים במספר מקומות בתורה ובמדרשים. לדוגמה, ניתן לראות את ערך הצדק והיושר כבר בבראשית, כאשר קין והבל מתמודדים עם שאלות מוסריות של קנאה ורצח. חז"ל קושרים את הערכים הללו למתן תורה בכך שהם רואים את התורה כבסיס לערכים מוסריים שהיו קיימים גם לפני מתן תורה, אך קיבלו עיגון והבהרה עם קבלת התורה.

כמו כן, יש המצביעים על כך שהאבות והאמהות חיו לפי ערכים מוסריים שהיו מקובלים, והם שימשו דוגמה לעם ישראל לפני קבלת התורה. לדוגמה, אברהם אבינו נודע בחסד ובצדקה, והדברים הללו נחשבים לערכים מוסריים בסיסיים שהיו קיימים גם לפני מתן תורה.

חז"ל מדגישים את החשיבות של הערכים הללו בהקשר של קבלת התורה, שכן התורה לא רק קובעת חוקים, אלא גם מעצבת את המוסר והערכים של העם.
```


#### Baseline refs (context pool)

- `Ohev Ger d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49`
- `Malbim on Joel 7ad2d88dac8f3771:2/2/0`
- `Birkat Asher on Torah ad70008713308697:Numbers/31/41/16`
- `Radak on Amos c3d27d4e6e52e3c4:7/4/3`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19`
- `Birkat Asher on Torah ad70008713308697:Deuteronomy/13/6/3`
- `Saadia Gaon on Genesis 27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0`
- `Karati Bekhol Lev af25e1459a5766ab:Beha'alotcha/0/4`

#### Graph refs (context pool)

- `Ohev Ger d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49`
- `Malbim on Joel 7ad2d88dac8f3771:2/2/0`
- `Birkat Asher on Torah ad70008713308697:Numbers/31/41/16`
- `Radak on Amos c3d27d4e6e52e3c4:7/4/3`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19`
- `Birkat Asher on Torah ad70008713308697:Deuteronomy/13/6/3`
- `Saadia Gaon on Genesis 27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0`
- `Karati Bekhol Lev af25e1459a5766ab:Beha'alotcha/0/4`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Ohev Ger d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49` (score 0.5520, type `tanakh_commentary`)
  - `Malbim on Joel 7ad2d88dac8f3771:2/2/0` (score 0.5470, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/31/41/16` (score 0.5426, type `tanakh_commentary`)
  - `Radak on Amos c3d27d4e6e52e3c4:7/4/3` (score 0.5419, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19` (score 0.5415, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/13/6/3` (score 0.5395, type `tanakh_commentary`)
  - `Saadia Gaon on Genesis 27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0` (score 0.5372, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Beha'alotcha/0/4` (score 0.5368, type `tanakh_commentary`)
  - `Shadal on Exodus af4c24ae01582211:24/17/1` (score 0.5355, type `tanakh_commentary`)
  - `Rabbeinu Bahya 6f4658cddcc025b8:Shemot/10/8/1` (score 0.5353, type `tanakh_commentary`)
  - `Aderet Eliyahu 27c7fba20430e70d:Deuteronomy/20/3/3` (score 0.5345, type `tanakh_commentary`)
  - `Mizrachi 576953114476b3c3:Deuteronomy/20/3/0` (score 0.5343, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Ohev Ger d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49` (score 0.5520, type `tanakh_commentary`)
  - `Malbim on Joel 7ad2d88dac8f3771:2/2/0` (score 0.5470, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/31/41/16` (score 0.5426, type `tanakh_commentary`)
  - `Radak on Amos c3d27d4e6e52e3c4:7/4/3` (score 0.5419, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19` (score 0.5415, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/13/6/3` (score 0.5395, type `tanakh_commentary`)
  - `Saadia Gaon on Genesis 27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0` (score 0.5372, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Beha'alotcha/0/4` (score 0.5368, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Ohev Ger d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49` (score 0.5520, type `tanakh_commentary`)
  - `Malbim on Joel 7ad2d88dac8f3771:2/2/0` (score 0.5470, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/31/41/16` (score 0.5426, type `tanakh_commentary`)
  - `Radak on Amos c3d27d4e6e52e3c4:7/4/3` (score 0.5419, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19` (score 0.5415, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/13/6/3` (score 0.5395, type `tanakh_commentary`)
  - `Saadia Gaon on Genesis 27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0` (score 0.5372, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Beha'alotcha/0/4` (score 0.5368, type `tanakh_commentary`)
  - `Shadal on Exodus af4c24ae01582211:24/17/1` (score 0.5355, type `tanakh_commentary`)
  - `Rabbeinu Bahya 6f4658cddcc025b8:Shemot/10/8/1` (score 0.5353, type `tanakh_commentary`)
  - `Aderet Eliyahu 27c7fba20430e70d:Deuteronomy/20/3/3` (score 0.5345, type `tanakh_commentary`)
  - `Mizrachi 576953114476b3c3:Deuteronomy/20/3/0` (score 0.5343, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Ohev Ger d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49` (score 0.5520, type `tanakh_commentary`)
  - `Malbim on Joel 7ad2d88dac8f3771:2/2/0` (score 0.5470, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/31/41/16` (score 0.5426, type `tanakh_commentary`)
  - `Radak on Amos c3d27d4e6e52e3c4:7/4/3` (score 0.5419, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19` (score 0.5415, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/13/6/3` (score 0.5395, type `tanakh_commentary`)
  - `Saadia Gaon on Genesis 27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0` (score 0.5372, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Beha'alotcha/0/4` (score 0.5368, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49` score 0.5520
  - `7ad2d88dac8f3771:2/2/0` score 0.5470
  - `ad70008713308697:Numbers/31/41/16` score 0.5426
  - `c3d27d4e6e52e3c4:7/4/3` score 0.5419
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19` score 0.5415
  - `ad70008713308697:Deuteronomy/13/6/3` score 0.5395
  - `27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0` score 0.5372
  - `af25e1459a5766ab:Beha'alotcha/0/4` score 0.5368
- *Graph — reranked (graph score / retrieval score):*
  - `d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49` graph 0.9400 / vec 0.5520
  - `7ad2d88dac8f3771:2/2/0` graph 0.9309 / vec 0.5470
  - `ad70008713308697:Numbers/31/41/16` graph 0.9230 / vec 0.5426
  - `c3d27d4e6e52e3c4:7/4/3` graph 0.9217 / vec 0.5419
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19` graph 0.9211 / vec 0.5415
  - `ad70008713308697:Deuteronomy/13/6/3` graph 0.9174 / vec 0.5395
  - `27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0` graph 0.9132 / vec 0.5372
  - `af25e1459a5766ab:Beha'alotcha/0/4` graph 0.9125 / vec 0.5368
- *Graph — signals (per ref in pool before rerank):*
  - `d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `7ad2d88dac8f3771:2/2/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9309
  - `ad70008713308697:Numbers/31/41/16` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9230
  - `c3d27d4e6e52e3c4:7/4/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9217
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9211
  - `ad70008713308697:Deuteronomy/13/6/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9174
  - `27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9132
  - `af25e1459a5766ab:Beha'alotcha/0/4` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9125

---

### Question 10

- **Query:** מי עוסק במשמעות של שתיקת אהרן אחרי מות בניו, ואילו קריאות שונות מוצעות?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
שתיקת אהרן אחרי מות בניו נדונה במספר מקורות, כאשר ישנן קריאות שונות המנסות להסביר את משמעותה. 

1. **הקשר בין אהרן לבניו**: יש המצביעים על כך ששתיקתו של אהרן יכולה להעיד על הכאב העמוק שהוא חווה, וכי הוא מבין את גודל המעשה שהוביל למותם. המדרשים מציעים כי אהרן היה מודע לכך שהבנים נענשו על חטאיהם, ולכן הוא שתק מתוך קבלה של הדין האלוהי (Birkat Asher on Torah, Leviticus/9/2/1).

2. **ההבנה של גדלות**: יש המפרשים את שתיקתו כהבנה של אהרן לגבי מעמדו של בניו, כאשר הוא רואה בהם "גדולים" ממנו. זה יכול להעיד על ענווה או על הכרה במעמד הרוחני של בניו (Birkat Asher on Torah, Leviticus/9/2/1).

3. **ההתקבלות של דברי המתים**: קריאה נוספת מצביעה על כך שדבריהם של מתים מקבלים משקל רב יותר לאחר מותם, מה שמצביע על נצחיות הרעיונות שהם השאירו אחריהם (Karati Bekhol Lev, Vayechi/0/8).

באופן כללי, ישנה הסכמה בין המפרשים כי שתיקתו של אהרן היא בעלת משמעויות רבות, כולל כאב, ענווה והבנה של דין אלוהי.
```


#### Graph answer

```
שתיקת אהרן אחרי מות בניו, נדונה במספר מקורות עם קריאות שונות. יש המפרשים את שתיקתו כהבעת צער עמוק, בעוד אחרים רואים בה תגובה של קבלה או הבנה של רצון ה'. 

1. **הבנה של צער**: יש המציעים כי אהרן שתק מתוך כאב עמוק על מות בניו, כפי שמצוין במדרשים המייחסים לו רגשות של אובדן וכאב (כפי שצוין בבראשית א:א).

2. **קבלה של רצון ה'**: יש המפרשים את שתיקתו כהבנה של אהרן את רצון ה' ואת מקומו, מה שמצביע על גדלות רוחו (כפי שמוזכר בברכות לד ע"ב).

3. **הקשר בין חיים למוות**: ישנה גם התייחסות לכך שדבריו של אדם לאחר מותו מקבלים משמעות חדשה, מה שמצביע על כך שאהרן, לאחר מות בניו, מבין את העומק של המצב ואת משמעותו (כפי שמוזכר ב"קרתי בכל לב").

לסיכום, ישנן קריאות שונות לשתיקת אהרן, המשלבות בין כאב אישי לבין קבלה של מציאות רוחנית גבוהה יותר.
```


#### Baseline refs (context pool)

- `Birkat Asher on Torah ad70008713308697:Numbers/15/0/9`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:On%20Introductory%20Notes/24`
- `Birkat Asher on Torah ad70008713308697:Leviticus/9/2/1`
- `Karati Bekhol Lev af25e1459a5766ab:Vayechi/0/8`
- `Birkat Asher on Torah ad70008713308697:Deuteronomy/31/49/1`
- `Penei David 9abeee7bd83c2c54:Leviticus/Emor/7/2`
- `Birkat Asher on Torah ad70008713308697:Deuteronomy/25/11/4`
- `Torah Temimah on Torah f78eea9aa956fdbe:Deuteronomy/6/12/1`

#### Graph refs (context pool)

- `Birkat Asher on Torah ad70008713308697:Numbers/15/0/9`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:On%20Introductory%20Notes/24`
- `Birkat Asher on Torah ad70008713308697:Leviticus/9/2/1`
- `Karati Bekhol Lev af25e1459a5766ab:Vayechi/0/8`
- `Birkat Asher on Torah ad70008713308697:Deuteronomy/31/49/1`
- `Penei David 9abeee7bd83c2c54:Leviticus/Emor/7/2`
- `Birkat Asher on Torah ad70008713308697:Deuteronomy/25/11/4`
- `Torah Temimah on Torah f78eea9aa956fdbe:Deuteronomy/6/12/1`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Birkat Asher on Torah ad70008713308697:Numbers/15/0/9` (score 0.6221, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:On%20Introductory%20Notes/24` (score 0.6169, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Leviticus/9/2/1` (score 0.6131, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Vayechi/0/8` (score 0.6103, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/31/49/1` (score 0.6077, type `tanakh_commentary`)
  - `Penei David 9abeee7bd83c2c54:Leviticus/Emor/7/2` (score 0.6033, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/25/11/4` (score 0.5998, type `tanakh_commentary`)
  - `Torah Temimah on Torah f78eea9aa956fdbe:Deuteronomy/6/12/1` (score 0.5997, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/32/39/0` (score 0.5989, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Vayechi/7/10` (score 0.5989, type `tanakh_commentary`)
  - `Mechokekei Yehudah; Yahel Ohr e7651e094dbc402b:Genesis/1/94/0` (score 0.5984, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/7/11/0` (score 0.5960, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Birkat Asher on Torah ad70008713308697:Numbers/15/0/9` (score 0.6221, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:On%20Introductory%20Notes/24` (score 0.6169, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Leviticus/9/2/1` (score 0.6131, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Vayechi/0/8` (score 0.6103, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/31/49/1` (score 0.6077, type `tanakh_commentary`)
  - `Penei David 9abeee7bd83c2c54:Leviticus/Emor/7/2` (score 0.6033, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/25/11/4` (score 0.5998, type `tanakh_commentary`)
  - `Torah Temimah on Torah f78eea9aa956fdbe:Deuteronomy/6/12/1` (score 0.5997, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Birkat Asher on Torah ad70008713308697:Numbers/15/0/9` (score 0.6221, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:On%20Introductory%20Notes/24` (score 0.6169, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Leviticus/9/2/1` (score 0.6131, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Vayechi/0/8` (score 0.6103, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/31/49/1` (score 0.6077, type `tanakh_commentary`)
  - `Penei David 9abeee7bd83c2c54:Leviticus/Emor/7/2` (score 0.6033, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/25/11/4` (score 0.5998, type `tanakh_commentary`)
  - `Torah Temimah on Torah f78eea9aa956fdbe:Deuteronomy/6/12/1` (score 0.5997, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/32/39/0` (score 0.5989, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Vayechi/7/10` (score 0.5989, type `tanakh_commentary`)
  - `Mechokekei Yehudah; Yahel Ohr e7651e094dbc402b:Genesis/1/94/0` (score 0.5984, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/7/11/0` (score 0.5960, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Birkat Asher on Torah ad70008713308697:Numbers/15/0/9` (score 0.6221, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:On%20Introductory%20Notes/24` (score 0.6169, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Leviticus/9/2/1` (score 0.6131, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Vayechi/0/8` (score 0.6103, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/31/49/1` (score 0.6077, type `tanakh_commentary`)
  - `Penei David 9abeee7bd83c2c54:Leviticus/Emor/7/2` (score 0.6033, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/25/11/4` (score 0.5998, type `tanakh_commentary`)
  - `Torah Temimah on Torah f78eea9aa956fdbe:Deuteronomy/6/12/1` (score 0.5997, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `ad70008713308697:Numbers/15/0/9` score 0.6221
  - `5a9ec949ebd7c295:On%20Introductory%20Notes/24` score 0.6169
  - `ad70008713308697:Leviticus/9/2/1` score 0.6131
  - `af25e1459a5766ab:Vayechi/0/8` score 0.6103
  - `ad70008713308697:Deuteronomy/31/49/1` score 0.6077
  - `9abeee7bd83c2c54:Leviticus/Emor/7/2` score 0.6033
  - `ad70008713308697:Deuteronomy/25/11/4` score 0.5998
  - `f78eea9aa956fdbe:Deuteronomy/6/12/1` score 0.5997
- *Graph — reranked (graph score / retrieval score):*
  - `ad70008713308697:Numbers/15/0/9` graph 0.9400 / vec 0.6221
  - `5a9ec949ebd7c295:On%20Introductory%20Notes/24` graph 0.9317 / vec 0.6169
  - `ad70008713308697:Leviticus/9/2/1` graph 0.9257 / vec 0.6131
  - `af25e1459a5766ab:Vayechi/0/8` graph 0.9211 / vec 0.6103
  - `ad70008713308697:Deuteronomy/31/49/1` graph 0.9169 / vec 0.6077
  - `9abeee7bd83c2c54:Leviticus/Emor/7/2` graph 0.9098 / vec 0.6033
  - `ad70008713308697:Deuteronomy/25/11/4` graph 0.9042 / vec 0.5998
  - `f78eea9aa956fdbe:Deuteronomy/6/12/1` graph 0.9040 / vec 0.5997
- *Graph — signals (per ref in pool before rerank):*
  - `ad70008713308697:Numbers/15/0/9` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `5a9ec949ebd7c295:On%20Introductory%20Notes/24` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9317
  - `ad70008713308697:Leviticus/9/2/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9257
  - `af25e1459a5766ab:Vayechi/0/8` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9211
  - `ad70008713308697:Deuteronomy/31/49/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9169
  - `9abeee7bd83c2c54:Leviticus/Emor/7/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9098
  - `ad70008713308697:Deuteronomy/25/11/4` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9042
  - `f78eea9aa956fdbe:Deuteronomy/6/12/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9040

---

### Question 11

- **Query:** איפה בתנ״ך יש פער בין כוונה למעשה, ואיך הפרשנים מתייחסים לזה?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
בתנ"ך ישנם מספר מקומות שבהם ניתן לראות פער בין כוונה למעשה. דוגמה בולטת לכך היא בפרשת המקלל (ויקרא כ"ד), שבה הכוונה של התורה היא להדגיש את הצורך בשמירה על כבוד האדם, אך המעשה שנעשה הוא עונש חמור מאוד, שמוביל למוות. הפרשנים מתייחסים לכך בדרכים שונות: יש המצביעים על הצורך לשמור על סדר חברתי, בעוד אחרים מדגישים את החמלה והצורך להבין את המניע מאחורי המעשה.

למשל, המדרש מציע קריאה ביקורתית יותר, המצביעה על המחיר של הרחקת החלכאים והנדכאים, ומדגיש את הצורך באחווה ובצדק בתוך החברה (מקור: Karati Bekhol Lev, Ref: af25e1459a5766ab:Emor/1/16).

בנוסף, ישנם פרשנים כמו רש"י שמדגישים את הכוונה מאחורי העונש, אך גם מצביעים על הקשיים והסיבוכים הנלווים לכך (מקור: Birkat Asher on Torah, Ref: ad70008713308697:Genesis/18/19/3). 

פערים כאלה בין כוונה למעשה יכולים להצביע על מורכבות המוסרית והחברתית בתורה, ועל הצורך בפרשנות מעמיקה כדי להבין את המסרים הנסתרים שבה.
```


#### Graph answer

```
בתנ"ך ישנם מספר מקומות בהם ניתן לראות פער בין כוונה למעשה, אחד מהם הוא בפרשת "שמות" כאשר אהרון עושה את המכות במצרים. ישנה הבחנה בין מעשה אהרון לבין מעשה החרטומים, כפי שמציין אבן עזרא: "ראה פרעה כי הפרש בין מעשה אהרן ובין מעשיהם" (שמות ז:כ). כאן ניתן לראות שהכוונה של אהרון הייתה להראות את כוח ה' בעוד שהחרטומים ניסו לחקות את המכות, אך לא הצליחו להקטין את המכה.

הפרשנים מתייחסים לפער זה בדרכים שונות. אבן עזרא מדגיש את ההבדל בין הכוונה של אהרון לבין המעשה של החרטומים, מה שמצביע על הבדל מהותי בכוח ובאמונה. לעומת זאת, רש"י מפרש את המעשה של אהרון כמעשה שמטרתו להראות את האמת האלוהית, בעוד שהחרטומים מנסים להטעות את פרעה.

פער זה בין הכוונה למעשה מדגיש את ההבדל בין אמונה אמיתית לבין חיקוי שטחי, והפרשנים מציעים הבנות שונות על משמעות הפער הזה והשפעתו על הסיפור הכללי.
```


#### Baseline refs (context pool)

- `Riva on Torah 6bed0247212b68cf:Exodus/24/37/0`
- `Karati Bekhol Lev af25e1459a5766ab:Sh'lach/0/7`
- `Ibn Ezra on Exodus 9bf8a85d37b80301:7/2/0`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3`
- `Birkat Asher on Torah ad70008713308697:Exodus/27/21/1`
- `Birkat Asher on Torah ad70008713308697:Numbers/8/14/1`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`
- `Birkat Asher on Torah ad70008713308697:Genesis/18/19/3`

#### Graph refs (context pool)

- `Riva on Torah 6bed0247212b68cf:Exodus/24/37/0`
- `Karati Bekhol Lev af25e1459a5766ab:Sh'lach/0/7`
- `Ibn Ezra on Exodus 9bf8a85d37b80301:7/2/0`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3`
- `Birkat Asher on Torah ad70008713308697:Exodus/27/21/1`
- `Birkat Asher on Torah ad70008713308697:Numbers/8/14/1`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`
- `Birkat Asher on Torah ad70008713308697:Genesis/18/19/3`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Riva on Torah 6bed0247212b68cf:Exodus/24/37/0` (score 0.5701, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Sh'lach/0/7` (score 0.5605, type `tanakh_commentary`)
  - `Ibn Ezra on Exodus 9bf8a85d37b80301:7/2/0` (score 0.5596, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3` (score 0.5580, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Exodus/27/21/1` (score 0.5569, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/8/14/1` (score 0.5454, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5428, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/18/19/3` (score 0.5423, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/3/34` (score 0.5411, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/2/18` (score 0.5401, type `tanakh_commentary`)
  - `Rabbeinu Bahya 6f4658cddcc025b8:Bamidbar/21/40/1` (score 0.5388, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/40/7/2` (score 0.5364, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Riva on Torah 6bed0247212b68cf:Exodus/24/37/0` (score 0.5701, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Sh'lach/0/7` (score 0.5605, type `tanakh_commentary`)
  - `Ibn Ezra on Exodus 9bf8a85d37b80301:7/2/0` (score 0.5596, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3` (score 0.5580, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Exodus/27/21/1` (score 0.5569, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/8/14/1` (score 0.5454, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5428, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/18/19/3` (score 0.5423, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Riva on Torah 6bed0247212b68cf:Exodus/24/37/0` (score 0.5701, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Sh'lach/0/7` (score 0.5605, type `tanakh_commentary`)
  - `Ibn Ezra on Exodus 9bf8a85d37b80301:7/2/0` (score 0.5596, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3` (score 0.5580, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Exodus/27/21/1` (score 0.5569, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/8/14/1` (score 0.5454, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5428, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/18/19/3` (score 0.5423, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/3/34` (score 0.5411, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/2/18` (score 0.5401, type `tanakh_commentary`)
  - `Rabbeinu Bahya 6f4658cddcc025b8:Bamidbar/21/40/1` (score 0.5388, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/40/7/2` (score 0.5364, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Riva on Torah 6bed0247212b68cf:Exodus/24/37/0` (score 0.5701, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Sh'lach/0/7` (score 0.5605, type `tanakh_commentary`)
  - `Ibn Ezra on Exodus 9bf8a85d37b80301:7/2/0` (score 0.5596, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3` (score 0.5580, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Exodus/27/21/1` (score 0.5569, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/8/14/1` (score 0.5454, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5428, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/18/19/3` (score 0.5423, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `6bed0247212b68cf:Exodus/24/37/0` score 0.5701
  - `af25e1459a5766ab:Sh'lach/0/7` score 0.5605
  - `9bf8a85d37b80301:7/2/0` score 0.5596
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3` score 0.5580
  - `ad70008713308697:Exodus/27/21/1` score 0.5569
  - `ad70008713308697:Numbers/8/14/1` score 0.5454
  - `af25e1459a5766ab:Emor/1/16` score 0.5428
  - `ad70008713308697:Genesis/18/19/3` score 0.5423
- *Graph — reranked (graph score / retrieval score):*
  - `6bed0247212b68cf:Exodus/24/37/0` graph 0.9400 / vec 0.5701
  - `af25e1459a5766ab:Sh'lach/0/7` graph 0.9231 / vec 0.5605
  - `9bf8a85d37b80301:7/2/0` graph 0.9216 / vec 0.5596
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3` graph 0.9187 / vec 0.5580
  - `ad70008713308697:Exodus/27/21/1` graph 0.9168 / vec 0.5569
  - `ad70008713308697:Numbers/8/14/1` graph 0.8966 / vec 0.5454
  - `af25e1459a5766ab:Emor/1/16` graph 0.8920 / vec 0.5428
  - `ad70008713308697:Genesis/18/19/3` graph 0.8912 / vec 0.5423
- *Graph — signals (per ref in pool before rerank):*
  - `6bed0247212b68cf:Exodus/24/37/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `af25e1459a5766ab:Sh'lach/0/7` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9231
  - `9bf8a85d37b80301:7/2/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9216
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9187
  - `ad70008713308697:Exodus/27/21/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9168
  - `ad70008713308697:Numbers/8/14/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8966
  - `af25e1459a5766ab:Emor/1/16` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8920
  - `ad70008713308697:Genesis/18/19/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8912

---

### Question 12

- **Query:** איפה בתנ״ך מצווים על אהבת הגר, ואיך מפרשים את זה בפרשנות?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
בתנ"ך מצווים על אהבת הגר בעיקר בספר דברים, בפרק 10, פסוק 19: "ואָהַבְתָּ אֶת הַגֵּר". פסוק זה מדגיש את הצורך לאהוב את הגר, כאשר הסיבה לכך היא שהעם היהודי היה גר בארץ מצרים, ולכן יש להבין את מצוקתו של הגר.

פרשנויות שונות מצביעות על כך שהאהבה לגר היא חלק מהאתיקה היהודית, המקדשת את ערך האהבה והחמלה כלפי אחרים. לדוגמה, רמב"ן מפרש את הציווי הזה כהמשך של אהבת ה' והאהבה לזולת, כמו שנאמר גם בוויקרא פרק 19, פסוק 18: "ואהבת לרעך כמוך".

בנוסף, יש המפרשים את אהבת הגר כהבעת ערכים מוסריים של צדק וחמלה, המייחדים את היהדות. אהבה זו נחשבת לאלטרואיסטית, כלומר, היא דורשת מהאדם לשים את עצמו במקומו של הזולת ולפעול למענו כפי שהיה פועל למען עצמו (כפי שמצוין במקורות כמו "Covenant and Conversation").

לסיכום, אהבת הגר בתנ"ך נחשבת לערך מרכזי, המבטא את החובה המוסרית של עם ישראל כלפי אחרים, במיוחד כלפי מי שנמצא במצב של פגיעות.
```


#### Graph answer

```
בתנ"ך מצווים על אהבת הגר במקומות שונים, במיוחד בספר דברים ובספר ויקרא. אחד הפסוקים המרכזיים הוא בדברים י:יט: "ואהבתם את הגר". בנוסף, ישנו פסוק נוסף בויקרא י"ט:יח: "ואהבת לרעך כמוך", שמדגיש את עקרון האהבה גם כלפי הגר.

בפרשנות, כמו אצל רבינו בחיי, מדגישים את החשיבות של אהבת הגר כחלק מהציווי הכללי לאהוב את הזולת. הוא מציין שהאהבה הזו היא חלק מהותי מהאחריות המוסרית של עם ישראל, במיוחד לאור ההיסטוריה שלהם כגר בארץ מצרים (ראה גם ספרי פיסקא לב).

אור החיים מפרש את המילה "והב" בהקשרים של אהבה ונתינה, ומדגיש את הקשר בין האהבה לאלוהים לבין האהבה לזולת, כולל לגר. 

באופן כללי, הפרשנויות מדגישות את העקרון של אהבה אלטרואיסטית, שמבוססת על ההבנה של מה זה להיות גר, וכיצד יש לנהוג כלפי אחרים מתוך חמלה ואמפתיה.
```


#### Baseline refs (context pool)

- `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1`
- `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10`
- `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0`
- `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1`
- `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1`
- `Tzafnat Pa'neach on Torah abcfc567063097ca:Deuteronomy/5/4/0`

#### Graph refs (context pool)

- `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1`
- `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10`
- `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0`
- `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1`
- `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1`
- `Tzafnat Pa'neach on Torah abcfc567063097ca:Deuteronomy/5/4/0`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1` (score 0.5612, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2` (score 0.5553, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` (score 0.5514, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10` (score 0.5340, type `tanakh_commentary`)
  - `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0` (score 0.5280, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1` (score 0.5256, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1` (score 0.5231, type `tanakh_commentary`)
  - `Tzafnat Pa'neach on Torah abcfc567063097ca:Deuteronomy/5/4/0` (score 0.5220, type `tanakh_commentary`)
  - `Chizkuni 650644840ff5c406:Deuteronomy/11/19/0` (score 0.5205, type `tanakh_commentary`)
  - `Haamek Davar on Genesis 9deb879e253ee745:%3CEMPTY_KEY%3E/23/66/1` (score 0.5165, type `tanakh_commentary`)
  - `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/10/18/0` (score 0.5154, type `tanakh_commentary`)
  - `Siftei Chakhamim 545f1d52e3cb3225:Deuteronomy/9/18/0` (score 0.5134, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1` (score 0.5612, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2` (score 0.5553, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` (score 0.5514, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10` (score 0.5340, type `tanakh_commentary`)
  - `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0` (score 0.5280, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1` (score 0.5256, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1` (score 0.5231, type `tanakh_commentary`)
  - `Tzafnat Pa'neach on Torah abcfc567063097ca:Deuteronomy/5/4/0` (score 0.5220, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1` (score 0.5616, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2` (score 0.5557, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` (score 0.5520, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10` (score 0.5341, type `tanakh_commentary`)
  - `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0` (score 0.5286, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1` (score 0.5259, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1` (score 0.5233, type `tanakh_commentary`)
  - `Tzafnat Pa'neach on Torah abcfc567063097ca:Deuteronomy/5/4/0` (score 0.5222, type `tanakh_commentary`)
  - `Chizkuni 650644840ff5c406:Deuteronomy/11/19/0` (score 0.5205, type `tanakh_commentary`)
  - `Haamek Davar on Genesis 9deb879e253ee745:%3CEMPTY_KEY%3E/23/66/1` (score 0.5168, type `tanakh_commentary`)
  - `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/10/18/0` (score 0.5154, type `tanakh_commentary`)
  - `Siftei Chakhamim 545f1d52e3cb3225:Deuteronomy/9/18/0` (score 0.5139, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1` (score 0.5616, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2` (score 0.5557, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` (score 0.5520, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10` (score 0.5341, type `tanakh_commentary`)
  - `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0` (score 0.5286, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1` (score 0.5259, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1` (score 0.5233, type `tanakh_commentary`)
  - `Tzafnat Pa'neach on Torah abcfc567063097ca:Deuteronomy/5/4/0` (score 0.5222, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `6f4658cddcc025b8:Devarim/9/17/1` score 0.5616
  - `771e480a7bd1be4d:20/13/2` score 0.5557
  - `a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` score 0.5520
  - `5139e9501410a731:Eikev/1/10` score 0.5341
  - `e4c48774d3dbbda2:Genesis/23/66/0` score 0.5286
  - `ad70008713308697:Genesis/23/66/1` score 0.5259
  - `ad70008713308697:Genesis/10/8/1` score 0.5233
  - `abcfc567063097ca:Deuteronomy/5/4/0` score 0.5222
- *Graph — reranked (graph score / retrieval score):*
  - `6f4658cddcc025b8:Devarim/9/17/1` graph 0.9400 / vec 0.5616
  - `771e480a7bd1be4d:20/13/2` graph 0.9296 / vec 0.5557
  - `a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` graph 0.9229 / vec 0.5520
  - `5139e9501410a731:Eikev/1/10` graph 0.8911 / vec 0.5341
  - `e4c48774d3dbbda2:Genesis/23/66/0` graph 0.8813 / vec 0.5286
  - `ad70008713308697:Genesis/23/66/1` graph 0.8765 / vec 0.5259
  - `ad70008713308697:Genesis/10/8/1` graph 0.8718 / vec 0.5233
  - `abcfc567063097ca:Deuteronomy/5/4/0` graph 0.8700 / vec 0.5222
- *Graph — signals (per ref in pool before rerank):*
  - `6f4658cddcc025b8:Devarim/9/17/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `771e480a7bd1be4d:20/13/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9296
  - `a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9229
  - `5139e9501410a731:Eikev/1/10` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8911
  - `e4c48774d3dbbda2:Genesis/23/66/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8813
  - `ad70008713308697:Genesis/23/66/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8765
  - `ad70008713308697:Genesis/10/8/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8718
  - `abcfc567063097ca:Deuteronomy/5/4/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8700

---

## Aggregate summary

| Metric | Count |
|--------|-------|
| Questions with different final answers (heuristic text diff) | 12 |
| Questions with different context-pool ref lists (ordered keys) | 2 |
| Questions that gained ≥1 new source in graph context pool | 0 |
| Questions with added commentary-looking ref or graph neighbor | 0 |
| Questions where graph signals showed link/topic cohesion in pool | 0 |
| Questions labeled *no clear change* | 12 |
| Questions labeled *possible degradation* | 0 |
| Questions labeled *likely improved* | 0 |

### Run again

```bash
npm --workspace packages/worker run eval:graph-augment
```

Output path: `./eval/my_report.md`
