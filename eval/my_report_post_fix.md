# Graph-augmented retrieval evaluation

Generated: 2026-04-12T21:06:21.036Z

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
הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מופיע במספר מקורות. אחד המקורות הוא במדרש, שבו נאמר כי אומות העולם שלא קיבלו את התורה נחשבים לחשוכים, בעוד שישראל, שקיבלו את התורה, זוכים לאור. זה מצביע על כך שהתורה היא הסיבה לקיום העולם, שכן היא מעניקה משמעות לעם ישראל ולבריאה כולה (אורח חיים, ישעיה ס', ב').

בנוסף, יש המפרשים שהעולם נברא כדי לאפשר לישראל לקיים את התורה, ובכך להביא לתיקון העולם. כמו כן, יש המפרשים את הרעיון הזה בהקשר של חידוש העולם, כלומר, שהקיום של העולם תלוי במעשי ישראל ובקיום התורה (Kli Yakar על ויקרא).

לסיכום, הרעיון שהעולם נברא בשביל התורה או בשביל ישראל נוגע לקשר ההדוק בין קיום התורה לבין קיום העולם, כאשר התורה היא המניע והסיבה לקיום האנושי והבריאה כולה.
```


#### Graph answer

```
הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מופיע במספר מקורות. אחד המקורות הוא מדרש שמדבר על כך שהתורה ניתנה מתוך חשך לישראל, ובכך הם זוכים לאור אלוהי, בעוד שאומות העולם לא קיבלו את התורה ונשארו בחשך (אוהל יעקב, פרשת ויקרא).

בנוסף, יש המפרשים שהעולם נברא בזכות ישראל, כפי שמובא במדרש על אברהם, שבו נרמז כי העולם כולו כדאי לאברהם ולישראל (פנחס רזא). 

הפרשנויות שונות מצביעות על כך שהקיום של העולם תלוי במעשי ישראל ובקיום התורה, והם מהווים את הסיבה לקיומו של העולם. 

לסיכום, הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מופיע במדרשים ובפרשנויות שונות, ומדגיש את הקשר בין ישראל לתכלית הבריאה.
```


#### Baseline refs (context pool)

- `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0`
- `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0`
- `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21`
- `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58`
- `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19`
- `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3`
- `Guide for the Perplexed Guide for the Perplexed, Part 2 30:2`

#### Graph refs (context pool)

- `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0`
- `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0`
- `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21`
- `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58`
- `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19`
- `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3`
- `Guide for the Perplexed Guide for the Perplexed, Part 2 30:2`

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
  - `Guide for the Perplexed Guide for the Perplexed, Part 2 30:2` (score 0.5722, type `philosophy`)
- *After expandSplitChunks:*
  - `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0` (score 0.5876, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0` (score 0.5822, type `tanakh_commentary`)
  - `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21` (score 0.5774, type `tanakh_commentary`)
  - `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58` (score 0.5772, type `tanakh_commentary`)
  - `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0` (score 0.5768, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` (score 0.5744, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3` (score 0.5743, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 2 30:2` (score 0.5722, type `philosophy`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0` (score 0.5876, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0` (score 0.5822, type `tanakh_commentary`)
  - `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21` (score 0.5774, type `tanakh_commentary`)
  - `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58` (score 0.5772, type `tanakh_commentary`)
  - `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0` (score 0.5768, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` (score 0.5744, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3` (score 0.5743, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 2 30:2` (score 0.5722, type `philosophy`)
- *After expandSplitChunks:*
  - `Kli Yakar on Leviticus e493f000f1fd5ef4:24/1/0` (score 0.5876, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Vayikra/19/0` (score 0.5822, type `tanakh_commentary`)
  - `Meshekh Chokhmah c33fbee783cb0c47:Vezot%20Haberakha/21` (score 0.5774, type `tanakh_commentary`)
  - `Paaneach Raza 37526edd4a4cc76d:Lech%20Lecha/58` (score 0.5772, type `tanakh_commentary`)
  - `Ralbag Beur HaMilot on Torah 5d07e4948670f23e:Numbers/18/9/0` (score 0.5768, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` (score 0.5744, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:4/14/3` (score 0.5743, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 2 30:2` (score 0.5722, type `philosophy`)
- *Graph — original pool (pre-rerank):*
  - `e493f000f1fd5ef4:24/1/0` score 0.5876
  - `ec91309b7f81308f:Vayikra/19/0` score 0.5822
  - `c33fbee783cb0c47:Vezot%20Haberakha/21` score 0.5774
  - `37526edd4a4cc76d:Lech%20Lecha/58` score 0.5772
  - `5d07e4948670f23e:Numbers/18/9/0` score 0.5768
  - `a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` score 0.5744
  - `771e480a7bd1be4d:4/14/3` score 0.5743
  - `Guide for the Perplexed, Part 2 30:2` score 0.5722
- *Graph — reranked (graph score / retrieval score):*
  - `e493f000f1fd5ef4:24/1/0` graph 0.9400 / vec 0.5876
  - `ec91309b7f81308f:Vayikra/19/0` graph 0.9309 / vec 0.5822
  - `c33fbee783cb0c47:Vezot%20Haberakha/21` graph 0.9227 / vec 0.5774
  - `37526edd4a4cc76d:Lech%20Lecha/58` graph 0.9224 / vec 0.5772
  - `5d07e4948670f23e:Numbers/18/9/0` graph 0.9217 / vec 0.5768
  - `a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` graph 0.9176 / vec 0.5744
  - `771e480a7bd1be4d:4/14/3` graph 0.9175 / vec 0.5743
  - `Guide for the Perplexed, Part 2 30:2` graph 0.9139 / vec 0.5722
- *Graph — signals (per ref in pool before rerank):*
  - `e493f000f1fd5ef4:24/1/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `ec91309b7f81308f:Vayikra/19/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9309
  - `c33fbee783cb0c47:Vezot%20Haberakha/21` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9227
  - `37526edd4a4cc76d:Lech%20Lecha/58` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9224
  - `5d07e4948670f23e:Numbers/18/9/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9217
  - `a193e823a180c713:Toledot%3B%20Why%20Isaac%3F%20Why%20Jacob%3F/19` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9176
  - `771e480a7bd1be4d:4/14/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9175
  - `Guide for the Perplexed, Part 2 30:2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9139

---

### Question 2

- **Query:** מי דן במשמעות של “נעשה אדם בצלמנו כדמותנו”, ואילו כיוונים פרשניים עולים?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
הפסוק "נעשה אדם בצלמנו כדמותנו" (בראשית א:כו) עורר דיונים פרשניים רבים. 

1. **המשמעות של "צלם" ו"דמות"**: 
   - **רמב"ם** ב"Guide for the Perplexed" מציע שהאדם נברא בצלם אלוהים בזכות השגתו השכלית, שהיא ייחודית לו ואינה קיימת אצל שאר הנבראים. הוא מדגיש שהשגת האל אינה פיזית, ולכן גם האדם אינו דומה לאל בגוף, אלא במובן השכלי בלבד ([Guide for the Perplexed, Part 1 1:9]).
   
2. **הקשר בין האדם לאל**: 
   - **שד"ל** מציע שהאדם דומה לאל בכך שיש לו יכולת לפעול בכל המידות והכוחות, מה שמבדיל אותו משאר בעלי החיים. הוא רואה בכך שהאדם נברא במחשבה ובכוונה, מה שמדגיש את מעלתו ([Shadal on Genesis]).

3. **ההיבט הרוחני והגשמי**: 
   - **רמב"ן** מציין שהאדם נברא עם חלק גשמי (כמו הארץ) וחלק רוחני (כמו האל), מה שמצביע על השילוב בין שני העולמות ([Kli Yakar on Genesis]).

4. **ההיבט של הענווה**: 
   - **חומת אנך** מדבר על מידת הענווה כמרכזית בחיים האנושיים, ומקשר זאת ליכולת של האדם להכיר במקומו בעולם, מה שמצביע על חשיבות המידות הטובות ([Chomat Anakh on Ecclesiastes]).

5. **ההקשר של הדורות**: 
   - **קסוטו** מציין שהפסוק מהווה הקדמה לדורות בני אדם, ומדגיש את הקשר בין האדם לבניו, שממשיכים את הדמיון לאל ([Cassuto on Genesis]).

באופן כללי, הפרשנויות מצביעות על כך שהאדם נושא בתוכו את הדמיון לאלוהים במובנים שונים – בשכלו, במידותיו ובקשרו עם העולם הגשמי והרוחני.
```


#### Graph answer

```
המשמעות של "נעשה אדם בצלמנו כדמותנו" נידונה על ידי מספר פרשנים, וכל אחד מהם מציע כיוונים פרשניים שונים:

1. **רמב"ן** - הוא מציע שהפסוק מתאר את השותפות בין האלוהים לארץ ביצירת האדם. הוא מסביר שהאדם נברא עם גוף חומרי (מהארץ) ונשמה רוחנית (מעל) [רמב"ן על בראשית א:כו].

2. **קאסוטו** - מדגיש שהאדם נברא בדמות אלוהים, מה שמצביע על כך שגם בני האדם נולדים בדמותו. הוא רואה בכך הקדמה להבנת הדורות הבאים של בני אדם [קאסוטו על בראשית ה:ג].

3. **הכתב והקבלה** - מפרש את המילה "כדמותנו" כהתדמות לאלוהים, ומסביר שהאדם מתעלה במידותיו הרוחניות, וככל שיתעלה, כך יזכה להיבנות בצורתו הרוחנית [הכתב והקבלה על בראשית א:כו].

4. **שד"ל** - מציע שהאדם נבדל משאר בעלי החיים בכך שיש לו את הכוח לכל המידות והפעולות, מה שמצביע על ייחודיותו [שד"ל על בראשית א:כו].

5. **חכמת אנך** - מתייחס למידת הענווה כמרכזית בהבנת האדם, ומסביר שהאדם צריך להחשיב את עצמו כעלוב כדי להצליח בחיים [חכמת אנך על קהלת].

כל אחד מהפרשנים מציע זווית שונה על משמעות האדם שנברא בצלם אלוהים, ומדגיש את הקשרים בין הגוף לנשמה, בין האל לאדם, ובין מידות רוחניות לחיים הגשמיים.
```


#### Baseline refs (context pool)

- `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79`
- `Guide for the Perplexed Guide for the Perplexed, Part 1 1:9`
- `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2`
- `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3`
- `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0`
- `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1`
- `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0`

#### Graph refs (context pool)

- `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79`
- `Guide for the Perplexed Guide for the Perplexed, Part 1 1:9`
- `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2`
- `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3`
- `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0`
- `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1`
- `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0` (score 0.6335, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` (score 0.6302, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 1:9` (score 0.6248, type `philosophy`)
  - `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2` (score 0.6215, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3` (score 0.6172, type `tanakh_commentary`)
  - `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` (score 0.6135, type `tanakh_commentary`)
  - `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` (score 0.6052, type `tanakh_commentary`)
  - `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0` (score 0.6047, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0` (score 0.6335, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` (score 0.6302, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 1:9` (score 0.6248, type `philosophy`)
  - `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2` (score 0.6215, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3` (score 0.6172, type `tanakh_commentary`)
  - `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` (score 0.6135, type `tanakh_commentary`)
  - `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` (score 0.6052, type `tanakh_commentary`)
  - `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0` (score 0.6047, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0` (score 0.6335, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` (score 0.6302, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 1:9` (score 0.6248, type `philosophy`)
  - `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2` (score 0.6215, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3` (score 0.6172, type `tanakh_commentary`)
  - `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` (score 0.6135, type `tanakh_commentary`)
  - `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` (score 0.6052, type `tanakh_commentary`)
  - `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0` (score 0.6047, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0` (score 0.6335, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` (score 0.6302, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 1:9` (score 0.6248, type `philosophy`)
  - `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2` (score 0.6215, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3` (score 0.6172, type `tanakh_commentary`)
  - `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` (score 0.6135, type `tanakh_commentary`)
  - `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` (score 0.6052, type `tanakh_commentary`)
  - `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0` (score 0.6047, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `4d2bb6d49da69ddd:0/2/0` score 0.6335
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` score 0.6302
  - `Guide for the Perplexed, Part 1 1:9` score 0.6248
  - `596d4e2c101152da:Genesis/0/25/2` score 0.6215
  - `5cc060f8cd54b5d6:0/25/3` score 0.6172
  - `f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` score 0.6135
  - `ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` score 0.6052
  - `e16479853ef7d57f:1/20/0` score 0.6047
- *Graph — reranked (graph score / retrieval score):*
  - `4d2bb6d49da69ddd:0/2/0` graph 0.9400 / vec 0.6335
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` graph 0.9349 / vec 0.6302
  - `Guide for the Perplexed, Part 1 1:9` graph 0.9264 / vec 0.6248
  - `596d4e2c101152da:Genesis/0/25/2` graph 0.9211 / vec 0.6215
  - `5cc060f8cd54b5d6:0/25/3` graph 0.9143 / vec 0.6172
  - `f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` graph 0.9085 / vec 0.6135
  - `ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` graph 0.8955 / vec 0.6052
  - `e16479853ef7d57f:1/20/0` graph 0.8946 / vec 0.6047
- *Graph — signals (per ref in pool before rerank):*
  - `4d2bb6d49da69ddd:0/2/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9349
  - `Guide for the Perplexed, Part 1 1:9` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9264
  - `596d4e2c101152da:Genesis/0/25/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9211
  - `5cc060f8cd54b5d6:0/25/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9143
  - `f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9085
  - `ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8955
  - `e16479853ef7d57f:1/20/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8946

---

### Question 3

- **Query:** איפה יש דיון בקשיות הלב של פרעה, ומה היחס בין בחירה להתערבות אלוהית?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
דיון בקשיות הלב של פרעה מופיע במקומות שונים בתורה, במיוחד בספר שמות. בפרשת וַאֵרָא, נאמר כי ה' הכביד את לב פרעה, מה שמעורר שאלות על חופש הרצון והאחריות של פרעה על מעשיו. השאלה המרכזית היא כיצד ניתן להעניש את פרעה אם הוא פעל תחת השפעה אלוהית ולא מתוך רצון חופשי. 

היחס בין בחירה להתערבות אלוהית הוא מורכב. מצד אחד, יש המאמינים שה' משפיע על לבו של פרעה כדי לממש תוכנית אלוהית, ומצד שני, יש המחשבה שעל האדם לשאת באחריות למעשיו, גם כאשר ישנה התערבות אלוהית. כמו שנאמר, "אם ה' הקשה את לב פרעה, איך אפשר להענישו?" (Covenant and Conversation; Hebrew Edition, Ref: 5139e9501410a731:Vaera/2/0).

הדיון הזה נוגע לשאלות של מוסר, חופש הרצון והאחריות, והוא נמשך לאורך ההיסטוריה של הפילוסופיה והדת.
```


#### Graph answer

```
דיון בקשיות הלב של פרעה מופיע בעיקר בספר שמות, בפרשות שונות, שם מתואר כיצד אלוהים הכביד את לבו של פרעה, מה שמוביל אותו לסרב לשחרר את בני ישראל. לדוגמה, בפרשת וַאֵרָא נאמר: "וַיְחַזֵּק ה' אֶת-לֵב פַּרְעֹה" (שמות 7:3), מה שמעורר שאלות על חופש הרצון והאחריות של פרעה.

היחס בין בחירה להתערבות אלוהית הוא מורכב. אם אלוהים הכביד את לב פרעה, נשאלת השאלה האם פרעה פעל מתוך חופש או שמא היה נתון להשפעה חיצונית. המחלוקות הפילוסופיות סביב נושא זה עוסקות בשאלת הצדק: כיצד ניתן להעניש את פרעה אם הוא לא פעל מתוך רצון חופשי? המחשבה היא שהחופש הוא מהותי לאנושיות, ואם נשלל, נשללת גם האחריות (Covenant and Conversation; Hebrew Edition, Ref: 5139e9501410a731:Vaera/2/0).

לסיכום, הדיון בקשיות הלב של פרעה נוגע לשאלות של חופש הרצון, אחריות ויחס בין רצון אנושי להתערבות אלוהית, והוא נמשך לאורך המסופר בספר שמות.
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
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13` (score 0.5688, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` (score 0.5554, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14` (score 0.5454, type `tanakh_commentary`)
  - `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` (score 0.5450, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` (score 0.5432, type `tanakh_commentary`)
  - `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0` (score 0.5420, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0` (score 0.5405, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4` (score 0.5391, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13` (score 0.5688, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` (score 0.5554, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14` (score 0.5454, type `tanakh_commentary`)
  - `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` (score 0.5450, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` (score 0.5432, type `tanakh_commentary`)
  - `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0` (score 0.5420, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0` (score 0.5405, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4` (score 0.5391, type `tanakh_commentary`)

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
בתנ"ך ישנם מקורות שונים העוסקים בתשובה, כאשר אחד המרכזיים הוא בספר יחזקאל, בפרק 18, פסוקים 30-32, שבו נכתב על הצורך בשוב מהחטא והבטחה לסליחה. פסוקים אלו מדגישים את חשיבות התשובה והחזרה למעשים טובים.

חז"ל והפרשנים מפרשים את המקורות הללו בדרכים שונות. לדוגמה, המפרשים מציינים שהתשובה היא לא רק חזרה פיזית אלא גם שינוי פנימי של הלב והנפש (כפי שמופיע במקורות כמו "תשובה מאהבה" לעומת "תשובה מיראה"). 

בפרשנות של רש"י, הוא מדגיש את הכוונה הפנימית של האדם בתהליך התשובה, ואילו המפרשים כמו אבן עזרא מציעים הבנות שונות לגבי התהליך והשלכותיו.

לסיכום, המקורות על תשובה בתנ"ך כוללים את ספר יחזקאל, והפרשנויות השונות של חז"ל והפרשנים מצביעות על עומק התהליך והמשמעות של חזרה בתשובה.
```


#### Graph answer

```
בתנ"ך ישנם מספר מקורות העוסקים בתשובה, כאשר אחד המרכזיים הוא בספר יחזקאל, בפרק 18, פסוק 30: "הָשִׁיבוּ וְשִׁנוּ אֶת-דְּרָכֵיכֶן וְאֶת-מַעַלְלֵיכֶן". כאן, הנביא קורא לעם ישראל לשוב מדרכיהם הרעים.

חז"ל והפרשנים מפרשים את המושג תשובה בדרכים שונות. למשל, הרמב"ם בספרו "משנה תורה" מדגיש את חשיבות הכוונה וההכרה בחטא כתנאים הכרחיים לתהליך התשובה. הוא מציין כי תשובה אמיתית כוללת חרטה, וידוי, וקבלה לעתיד לא לחזור על החטא.

הפרשנים כמו אבן עזרא וראב"ע מדגישים את ההיבט של חזרה למצב הקודם, כלומר, חזרה למצב של קשר עם הקב"ה, והם רואים בתשובה תהליך של תיקון עצמי.

לסיכום, המקורות בתנ"ך מדברים על תשובה כעל תהליך של חזרה למוטב, וחז"ל והפרשנים מוסיפים על כך את ההיבטים של הכוונה, חרטה, וידוי, ותיקון עצמי.
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
- `Malbim on I Kings 5b3d899c9941aab7:5/26/0`
- `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15`
- `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` (score 0.5843, type `tanakh_commentary`)
  - `Metzudat David on Joshua 2fb40407c188ca50:7/33/1` (score 0.5769, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5` (score 0.5741, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` (score 0.5694, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` (score 0.5591, type `tanakh_commentary`)
  - `Malbim on I Kings 5b3d899c9941aab7:5/26/0` (score 0.5585, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15` (score 0.5570, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` (score 0.5551, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` (score 0.5843, type `tanakh_commentary`)
  - `Metzudat David on Joshua 2fb40407c188ca50:7/33/1` (score 0.5769, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5` (score 0.5741, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` (score 0.5694, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` (score 0.5591, type `tanakh_commentary`)
  - `Malbim on I Kings 5b3d899c9941aab7:5/26/0` (score 0.5585, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15` (score 0.5570, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` (score 0.5551, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` (score 0.5844, type `tanakh_commentary`)
  - `Metzudat David on Joshua 2fb40407c188ca50:7/33/1` (score 0.5771, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5` (score 0.5743, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` (score 0.5694, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` (score 0.5593, type `tanakh_commentary`)
  - `Malbim on I Kings 5b3d899c9941aab7:5/26/0` (score 0.5584, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15` (score 0.5571, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` (score 0.5552, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` (score 0.5844, type `tanakh_commentary`)
  - `Metzudat David on Joshua 2fb40407c188ca50:7/33/1` (score 0.5771, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5` (score 0.5743, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` (score 0.5694, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` (score 0.5593, type `tanakh_commentary`)
  - `Malbim on I Kings 5b3d899c9941aab7:5/26/0` (score 0.5584, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15` (score 0.5571, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` (score 0.5552, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` score 0.5844
  - `2fb40407c188ca50:7/33/1` score 0.5771
  - `5139e9501410a731:Vayikra/3/5` score 0.5743
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` score 0.5694
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` score 0.5593
  - `5b3d899c9941aab7:5/26/0` score 0.5584
  - `af25e1459a5766ab:Shmini/1/15` score 0.5571
  - `11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` score 0.5552
- *Graph — reranked (graph score / retrieval score):*
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` graph 0.9400 / vec 0.5844
  - `2fb40407c188ca50:7/33/1` graph 0.9275 / vec 0.5771
  - `5139e9501410a731:Vayikra/3/5` graph 0.9227 / vec 0.5743
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` graph 0.9144 / vec 0.5694
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` graph 0.8970 / vec 0.5593
  - `5b3d899c9941aab7:5/26/0` graph 0.8956 / vec 0.5584
  - `af25e1459a5766ab:Shmini/1/15` graph 0.8932 / vec 0.5571
  - `11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` graph 0.8901 / vec 0.5552
- *Graph — signals (per ref in pool before rerank):*
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `2fb40407c188ca50:7/33/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9275
  - `5139e9501410a731:Vayikra/3/5` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9227
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9144
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8970
  - `5b3d899c9941aab7:5/26/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8956
  - `af25e1459a5766ab:Shmini/1/15` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8932
  - `11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8901

---

### Question 5

- **Query:** איפה יש דיון במשמעות של “לא בשמים היא”, ואיך משתמשים בפסוק הזה?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
הדיון במשמעות של "לא בשמים היא" מופיע במקרא בספר דברים (דברים ל:יב). הפסוק מתייחס לכך שהתורה אינה דבר מה בלתי נגיש או רחוק, אלא היא ניתנת להבנה וליישום על ידי בני האדם. 

בפרשנויות שונות, הפסוק משמש להדגיש את הגישה שהמצוות והחוקים אינם מעבר ליכולת האנושית, אלא ניתנים להבנה ולביצוע. זהו עיקרון שמדגיש את האחריות האישית של כל אדם לקיים את התורה.

למשל, הרמב"ם ב"משGuide for the Perplexed" מתייחס לכך שהאדם יכול להבין את התורה וליישם אותה בחייו, ולא צריך לחכות להנחיות שמיימיות נוספות (Guide for the Perplexed, Part 1 11:2). 

באופן כללי, הפסוק "לא בשמים היא" משמש לעודד את בני האדם לקחת אחריות על מעשיהם ולפעול בהתאם לערכים ולמצוות שניתנים להם.
```


#### Graph answer

```
הדיון במשמעות של "לא בשמים היא" מופיע בְּתָנַךְ בספר דברים (דברים ל:יב). פסוק זה מתייחס לכך שהתורה אינה דבר מה בלתי נגיש או רחוק, אלא היא קרובה אלינו וניתנת להבנה וליישום. 

בפרשנויות שונות, הפסוק משמש להדגיש את הרעיון שהאדם יכול להבין את מצוות התורה ולפעול לפיהן, ואין צורך לחכות למישהו שיביא את התורה מהשמים. זהו עיקרון מרכזי ביהדות, המצביע על האחריות האישית של כל אדם לקיים את מצוות התורה.

למשל, הרמב"ם ב"משנה תורה" מתייחס לרעיון זה כדי להדגיש את הנגישות של התורה לכל אדם, ולא רק למי שיש לו גישה למקורות עליונים או חכמים מיוחדים. 

אם יש לך שאלות נוספות או צורך בהבהרות נוספות, אני כאן לעזור!
```


#### Baseline refs (context pool)

- `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0`
- `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2`
- `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0`
- `Guide for the Perplexed Guide for the Perplexed, Part 1 11:2`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0`
- `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3`

#### Graph refs (context pool)

- `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0`
- `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2`
- `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0`
- `Guide for the Perplexed Guide for the Perplexed, Part 1 11:2`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0`
- `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0` (score 0.5498, type `tanakh_commentary`)
  - `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` (score 0.5498, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` (score 0.5421, type `tanakh_commentary`)
  - `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0` (score 0.5302, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 11:2` (score 0.5257, type `philosophy`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` (score 0.5240, type `tanakh_commentary`)
  - `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` (score 0.5223, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` (score 0.5193, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0` (score 0.5498, type `tanakh_commentary`)
  - `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` (score 0.5498, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` (score 0.5421, type `tanakh_commentary`)
  - `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0` (score 0.5302, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 11:2` (score 0.5257, type `philosophy`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` (score 0.5240, type `tanakh_commentary`)
  - `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` (score 0.5223, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` (score 0.5193, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0` (score 0.5498, type `tanakh_commentary`)
  - `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` (score 0.5498, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` (score 0.5421, type `tanakh_commentary`)
  - `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0` (score 0.5302, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 11:2` (score 0.5257, type `philosophy`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` (score 0.5240, type `tanakh_commentary`)
  - `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` (score 0.5223, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` (score 0.5193, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Mechokekei Yehudah; Karnei Ohr d1eb3a7cb0ea1719:Genesis/5/29/0` (score 0.5498, type `tanakh_commentary`)
  - `Haamek Davar on Numbers db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` (score 0.5498, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` (score 0.5421, type `tanakh_commentary`)
  - `Rashbam on Leviticus 60f5b580c6e0f96f:2/0/0` (score 0.5302, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 11:2` (score 0.5257, type `philosophy`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` (score 0.5240, type `tanakh_commentary`)
  - `Ohr Chadash 879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` (score 0.5223, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` (score 0.5193, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `d1eb3a7cb0ea1719:Genesis/5/29/0` score 0.5498
  - `db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` score 0.5498
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` score 0.5421
  - `60f5b580c6e0f96f:2/0/0` score 0.5302
  - `Guide for the Perplexed, Part 1 11:2` score 0.5257
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` score 0.5240
  - `879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` score 0.5223
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` score 0.5193
- *Graph — reranked (graph score / retrieval score):*
  - `d1eb3a7cb0ea1719:Genesis/5/29/0` graph 0.9400 / vec 0.5498
  - `db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` graph 0.9400 / vec 0.5498
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` graph 0.9260 / vec 0.5421
  - `60f5b580c6e0f96f:2/0/0` graph 0.9043 / vec 0.5302
  - `Guide for the Perplexed, Part 1 11:2` graph 0.8962 / vec 0.5257
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` graph 0.8931 / vec 0.5240
  - `879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` graph 0.8899 / vec 0.5223
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` graph 0.8844 / vec 0.5193
- *Graph — signals (per ref in pool before rerank):*
  - `d1eb3a7cb0ea1719:Genesis/5/29/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `db3c658ae8fd4e5f:%3CEMPTY_KEY%3E/30/50/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/21/20/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9260
  - `60f5b580c6e0f96f:2/0/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9043
  - `Guide for the Perplexed, Part 1 11:2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8962
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/19/6/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8931
  - `879a44ddf1c1ea13:%3CEMPTY_KEY%3E/3/16/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8899
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/9/6/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8844

---

### Question 6

- **Query:** מי מפרש את עקידת יצחק מנקודת מבט של ניסיון מול ציווי?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
לגבי פירוש עקידת יצחק מנקודת מבט של ניסיון מול ציווי, ישנם מפרשים שונים. אחד המפורסמים הוא הרמב"ן, אשר מדגיש את המתח בין הציווי האלוהי לבין הניסיון האישי של אברהם. הוא רואה את העקידה כניסיון להראות את נאמנותו של אברהם לאלוהים, גם כאשר הציווי נראה קשה ומאתגר.

מנגד, יש המפרשים את העקידה כציווי מוחלט של אלוהים, שבו אברהם נדרש להיכנע לרצון האל ללא עוררין. המחלוקות הללו משקפות את הדינמיקה בין אמונה בציווי אלוהי לבין התמודדות עם אתגרים מוסריים ואישיים.

לסיכום, ניתן לראות את העקידה כמצב שבו אברהם מתמודד עם ציווי אלוהי שמוביל אותו לניסיון אישי עמוק, מה שמוביל לפרשנויות שונות בנושא זה.
```


#### Graph answer

```
מנקודת מבט של ניסיון מול ציווי, עקידת יצחק נתפסת לעיתים כניסיון של אברהם, שבו הוא נדרש להוכיח את נאמנותו לאלוהים, בעוד שהציווי הוא ההוראה האלוהית להקריב את בנו. יש המפרשים את הסיפור כמאבק פנימי בין הציווי האלוהי לבין האהבה ההורית, מה שמוביל לתובנות עמוקות על אמונה, מסירות וניסיון.

לגבי המפרשים, רמב"ן ורש"י הם בין המפורסמים שמדברים על הניסיון של אברהם, כאשר הם מדגישים את הקונפליקט בין הציווי לבין רגשותיו כאב. 

אם יש לך שאלות נוספות או צורך במידע נוסף, אני כאן לעזור!
```


#### Baseline refs (context pool)

- `Pardes Yosef 920062d067507725:Genesis/30/16/0`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0`
- `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30`
- `Menachot Menachot 26b:17`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0`
- `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10`
- `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0`
- `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8`

#### Graph refs (context pool)

- `Pardes Yosef 920062d067507725:Genesis/30/16/0`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0`
- `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30`
- `Menachot Menachot 26b:17`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0`
- `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10`
- `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0`
- `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Pardes Yosef 920062d067507725:Genesis/30/16/0` (score 0.5307, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` (score 0.5294, type `tanakh_commentary`)
  - `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` (score 0.5290, type `tanakh_commentary`)
  - `Menachot Menachot 26b:17` (score 0.5256, type `bavli`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` (score 0.5205, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10 (part 3/3)` (score 0.5176, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0` (score 0.5138, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8` (score 0.5126, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Pardes Yosef 920062d067507725:Genesis/30/16/0` (score 0.5307, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` (score 0.5294, type `tanakh_commentary`)
  - `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` (score 0.5290, type `tanakh_commentary`)
  - `Menachot Menachot 26b:17` (score 0.5256, type `bavli`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` (score 0.5205, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` (score 0.5176, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0` (score 0.5138, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8` (score 0.5126, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Pardes Yosef 920062d067507725:Genesis/30/16/0` (score 0.5307, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` (score 0.5294, type `tanakh_commentary`)
  - `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` (score 0.5290, type `tanakh_commentary`)
  - `Menachot Menachot 26b:17` (score 0.5256, type `bavli`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` (score 0.5205, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10 (part 3/3)` (score 0.5176, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0` (score 0.5138, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8` (score 0.5126, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Pardes Yosef 920062d067507725:Genesis/30/16/0` (score 0.5307, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` (score 0.5294, type `tanakh_commentary`)
  - `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` (score 0.5290, type `tanakh_commentary`)
  - `Menachot Menachot 26b:17` (score 0.5256, type `bavli`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` (score 0.5205, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` (score 0.5176, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0` (score 0.5138, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8` (score 0.5126, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `920062d067507725:Genesis/30/16/0` score 0.5307
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` score 0.5294
  - `7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` score 0.5290
  - `Menachot 26b:17` score 0.5256
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` score 0.5205
  - `11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` score 0.5176
  - `5cc060f8cd54b5d6:47/13/0` score 0.5138
  - `af25e1459a5766ab:Shoftim/3/8` score 0.5126
- *Graph — reranked (graph score / retrieval score):*
  - `920062d067507725:Genesis/30/16/0` graph 0.9400 / vec 0.5307
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` graph 0.9376 / vec 0.5294
  - `7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` graph 0.9368 / vec 0.5290
  - `Menachot 26b:17` graph 0.9304 / vec 0.5256
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` graph 0.9208 / vec 0.5205
  - `11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` graph 0.9154 / vec 0.5176
  - `5cc060f8cd54b5d6:47/13/0` graph 0.9082 / vec 0.5138
  - `af25e1459a5766ab:Shoftim/3/8` graph 0.9060 / vec 0.5126
- *Graph — signals (per ref in pool before rerank):*
  - `920062d067507725:Genesis/30/16/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9376
  - `7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9368
  - `Menachot 26b:17` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9304
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9208
  - `11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9154
  - `5cc060f8cd54b5d6:47/13/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9082
  - `af25e1459a5766ab:Shoftim/3/8` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9060

---

### Question 7

- **Query:** איפה בתנ״ך מופיע רעיון הרחמים במצוות, ואיך הפרשנים מתמודדים איתו?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
רעיון הרחמים במצוות מופיע במקומות שונים בתנ"ך, במיוחד כאשר מדובר במצוות הקשורות ליחס בין אדם לחברו. לדוגמה, בפרשת משפטים ישנן מצוות המורות על רחמים כלפי עניים וחלשים, כמו מצוות צדקה ושמיטת חובות (שמות כ"ב).

הפרשנים מתמודדים עם רעיון הרחמים בדרכים שונות. לדוגמה, הרמ"א מדגיש את החשיבות של הכוונה מאחורי מעשה הרחמים, אם היא נובעת מרצון טוב או מתוך רגישות לצערו של הזולת (Ohel Ya'akov on Torah). כמו כן, דוד צבי הופמן מציין שהפרשן חייב להיזהר שלא לסתור את ההלכה המסורה, מה שמצביע על כך שהרחמים צריכים להיות מתוארים במסגרת ההלכה ולא בניגוד לה (David Zvi Hoffmann on Leviticus).

בנוסף, ישנם מדרשים המצביעים על הקונפליקט בין שמירה על כללים נוקשים לבין הצורך בחמלה ובצדק, מה שמעיד על המורכבות של רעיון הרחמים במצוות (Karati Bekhol Lev). 

באופן כללי, הפרשנים מדגישים את הצורך לאזן בין שמירה על החוק לבין הרחמים והחמלה, מה שמצביע על עומק המחשבה היהודית בנושא זה.
```


#### Graph answer

```
רעיון הרחמים במצוות מופיע במקומות שונים בתנ"ך, במיוחד כאשר מדובר במצוות הקשורות ליחס בין בני אדם, כמו מצוות צדקה וחסד. לדוגמה, בפרשת משפטים (שמות כ"ב, 25) ישנה מצווה שלא להטיל ריבית על העני, מה שמעיד על הרחמים והחמלה כלפי החלש.

הפרשנים מתמודדים עם רעיון הרחמים במצוות בדרכים שונות. למשל, במקורות שהוזכרו, יש המבחינים בין סוגי רחמים: רחמים הנובעים מרצון טוב לעזור, לעומת רחמים הנובעים מרכות טבעית (אוהל יעקב). כמו כן, יש המצביעים על כך שהרחמים צריכים להיות מאוזנים עם צדק חברתי, כלומר לא להעדיף את טובת הפרט על פני טובת הכלל (קרתי בכל לב).

בנוסף, ישנה התייחסות לכך שהפרשנות חייבת להתחשב במסורת ובחוקים הקיימים, כך שאין לסתור את ההלכה המסורה (דוד צבי הופמן). רעיון זה מדגיש את החשיבות של שמירה על ערכי הרחמים תוך כדי שמירה על הצדק והחוק.
```


#### Baseline refs (context pool)

- `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7`
- `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3`
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`

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
  - `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13` (score 0.5447, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` (score 0.5416, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4` (score 0.5345, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` (score 0.5298, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` (score 0.5276, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` (score 0.5266, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` (score 0.5224, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5222, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13` (score 0.5447, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` (score 0.5416, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4` (score 0.5345, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` (score 0.5298, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` (score 0.5276, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` (score 0.5266, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` (score 0.5224, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5222, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13` (score 0.5485, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` (score 0.5481, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4` (score 0.5375, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` (score 0.5344, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` (score 0.5320, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` (score 0.5306, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5286, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` (score 0.5279, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Karati Bekhol Lev af25e1459a5766ab:Vayetzei/5/13` (score 0.5485, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` (score 0.5481, type `tanakh_commentary`)
  - `Ohel Ya'akov on Torah ec91309b7f81308f:Shemot%3B%20Peticha/4` (score 0.5375, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` (score 0.5344, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` (score 0.5320, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` (score 0.5306, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5286, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` (score 0.5279, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `af25e1459a5766ab:Vayetzei/5/13` score 0.5485
  - `a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` score 0.5481
  - `ec91309b7f81308f:Shemot%3B%20Peticha/4` score 0.5375
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` score 0.5344
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` score 0.5320
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` score 0.5306
  - `af25e1459a5766ab:Emor/1/16` score 0.5286
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` score 0.5279
- *Graph — reranked (graph score / retrieval score):*
  - `af25e1459a5766ab:Vayetzei/5/13` graph 0.9400 / vec 0.5485
  - `a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` graph 0.9392 / vec 0.5481
  - `ec91309b7f81308f:Shemot%3B%20Peticha/4` graph 0.9199 / vec 0.5375
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` graph 0.9143 / vec 0.5344
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` graph 0.9099 / vec 0.5320
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` graph 0.9073 / vec 0.5306
  - `af25e1459a5766ab:Emor/1/16` graph 0.9036 / vec 0.5286
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` graph 0.9023 / vec 0.5279
- *Graph — signals (per ref in pool before rerank):*
  - `af25e1459a5766ab:Vayetzei/5/13` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9392
  - `ec91309b7f81308f:Shemot%3B%20Peticha/4` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9199
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9143
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9099
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9073
  - `af25e1459a5766ab:Emor/1/16` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9036
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9023

---

### Question 8

- **Query:** איפה מופיעים חלומות משמעותיים בתנ״ך ואיך מפרשים אותם?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
חלומות משמעותיים בתנ"ך מופיעים במקומות שונים, כאשר אחד המפורסמים שבהם הוא חלומו של יוסף, המופיע בספר בראשית. יוסף חולם על אלומות תבואה, כאשר האלומות של יתר האחים משתחוות לאלומתו שלו (בראשית לז:ה-ט). חלומותיו של יוסף מפרשים את עתידו ואת עלייתו לגדולה במצרים.

חלום נוסף הוא חלומו של פרעה, שבו הוא רואה שבע פרות רזות ושבע פרות שמנות (בראשית מא:א-ד). יוסף מפרש את החלום הזה כהתרעה על רעב שיבוא לאחר שבע שנות שפע, והפרשנות הזו מביאה אותו למעמד בכיר במצרים.

בנוסף, ישנה מסורת חז"ל המצביעה על כך שחלומות יכולים לשאת משמעות עמוקה, ולעיתים הם משקפים את מצבו הפנימי של החולם. לדוגמה, במסכת מגילה (י ע"ב) נאמר כי כל מקום שבו נאמר "ויהי" בתורה, זהו לשון צער, מה שמעיד על כך שחלומות יכולים להיות גם אזהרות או סימנים לצער שיבוא.

באופן כללי, חלומות בתנ"ך נחשבים לאמצעי תקשורת בין אלוהים לאנשים, ולעיתים הם משמשים ככלי לנבואה או להכוונה רוחנית.
```


#### Graph answer

```
חלומות משמעותיים בתנ"ך מופיעים בכמה מקומות מרכזיים, כאשר המפורסמים שבהם הם חלומותיו של יוסף. יוסף, בנו של יעקב, חולם שני חלומות הממחישים את עלייתו לעוצמה ואת מעמדו המשמעותי במשפחה ובמצרים (בראשית ל"ז). החלומות הללו מפרשים את עתידו ואת השפעתו על משפחתו, כאשר הוא מתפרש כמי שעתיד לשלוט ולספק מזון בזמן רעב.

חלומות נוספים מופיעים בספר בראשית, כמו חלום פרעה, שבו הוא רואה שבע פרות רזות ושבע פרות שמנות, אשר גם הוא מפורש על ידי יוסף כמשמעותי, המצביע על שבע שנות שפע ושבע שנות רעב (בראשית מ"א).

מפרשים שונים, כמו רמב"ם, רלב"ג וקאסוטו, מדברים על החשיבות של חלומות כדרך לתקשורת עם האל, והם מציינים כי חלומות יכולים לשמש כקריאת כיוון או אזהרה (ראה למשל במקורות כמו "מגילה י ע״ב" המצביע על כך שחלומות יכולים לשאת משמעות עמוקה).

באופן כללי, חלומות בתנ"ך נתפסים כדרך שבה האל מתערב בחיי האנשים, ומפרשים אותם כמשמעותיים מאוד, לעיתים כתחזיות לעתיד ולעיתים כהכוונה רוחנית.
```


#### Baseline refs (context pool)

- `Guide for the Perplexed Guide for the Perplexed, Part 1 61:4`
- `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`
- `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3`

#### Graph refs (context pool)

- `Guide for the Perplexed Guide for the Perplexed, Part 1 61:4`
- `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`
- `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3`

#### Added refs (graph vs baseline pool)

(none)

#### Removed refs (baseline vs graph pool)

(none)

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 61:4` (score 0.5437, type `philosophy`)
  - `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` (score 0.5415, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10` (score 0.5296, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` (score 0.5273, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` (score 0.5257, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` (score 0.5231, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5224, type `tanakh_commentary`)
  - `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3 (part 2/2)` (score 0.5206, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 61:4` (score 0.5437, type `philosophy`)
  - `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` (score 0.5415, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10` (score 0.5296, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` (score 0.5273, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` (score 0.5257, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` (score 0.5231, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5224, type `tanakh_commentary`)
  - `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3` (score 0.5206, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 61:4` (score 0.5437, type `philosophy`)
  - `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` (score 0.5415, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10` (score 0.5296, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` (score 0.5273, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` (score 0.5257, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` (score 0.5231, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5224, type `tanakh_commentary`)
  - `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3 (part 2/2)` (score 0.5206, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 61:4` (score 0.5437, type `philosophy`)
  - `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` (score 0.5415, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10` (score 0.5296, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` (score 0.5273, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` (score 0.5257, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` (score 0.5231, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5224, type `tanakh_commentary`)
  - `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3` (score 0.5206, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `Guide for the Perplexed, Part 1 61:4` score 0.5437
  - `128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` score 0.5415
  - `5139e9501410a731:Miketz/2/10` score 0.5296
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` score 0.5273
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` score 0.5257
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` score 0.5231
  - `af25e1459a5766ab:Emor/1/16` score 0.5224
  - `fa07892a8f40e0ba:Leviticus/15/7/3` score 0.5206
- *Graph — reranked (graph score / retrieval score):*
  - `Guide for the Perplexed, Part 1 61:4` graph 0.9400 / vec 0.5437
  - `128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` graph 0.9358 / vec 0.5415
  - `5139e9501410a731:Miketz/2/10` graph 0.9140 / vec 0.5296
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` graph 0.9097 / vec 0.5273
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` graph 0.9068 / vec 0.5257
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` graph 0.9021 / vec 0.5231
  - `af25e1459a5766ab:Emor/1/16` graph 0.9007 / vec 0.5224
  - `fa07892a8f40e0ba:Leviticus/15/7/3` graph 0.8975 / vec 0.5206
- *Graph — signals (per ref in pool before rerank):*
  - `Guide for the Perplexed, Part 1 61:4` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9358
  - `5139e9501410a731:Miketz/2/10` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9140
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9097
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9068
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9021
  - `af25e1459a5766ab:Emor/1/16` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9007
  - `fa07892a8f40e0ba:Leviticus/15/7/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8975

---

### Question 9

- **Query:** איפה מופיעים ערכים מוסריים לפני מתן תורה, ואיך חז״ל קושרים אותם?
- **Heuristic label:** *likely improved*
- **Why this label:** Graph mode added neighbors and/or new sources with limited loss of baseline coverage, and/or increased commentary or corpus diversity.
- **Notes on differences:** (none)

#### Baseline answer

```
ערכים מוסריים לפני מתן תורה מופיעים במספר מקומות בתנ"ך, והחז"ל קושרים אותם למוסריות ולתודעה דתית שהייתה קיימת בעם ישראל גם לפני קבלת התורה. דוגמאות לכך כוללות את המוסריות של אברהם אבינו, שעמד על עקרונות מוסריים גם מול מלכים, ואת מעשה צדקה וחסד של אנשי סדום ועמורה.

חז"ל מדגישים כי גם לפני מתן תורה, היו עקרונות מוסריים בסיסיים שהיו ידועים והיו מחויבים להם, כמו עקרון "לא תרצח" ו"לא תגנוב". הם רואים במוסריות זו הכנה לקראת קבלת התורה, שמביאה עקרונות מוסריים מפורטים וברורים יותר.

למשל, יש המצביעים על כך שציווי על צדקה וחסד היה קיים גם לפני מתן תורה, והדבר נלמד מהתנהגותם של אבות האומה. כמו כן, יש המפרשים את המוסריות שהייתה קיימת בקרב העמים השכנים, כעדות לכך שהמוסר הוא ערך אוניברסלי, ולא רק תוצאה של מתן תורה.

לסיכום, החז"ל רואים במוסריות שהייתה קיימת לפני מתן תורה כבסיס שעליו נבנתה התורה, ומדגישים את החשיבות של ערכים מוסריים גם ללא התורה הכתובה.
```


#### Graph answer

```
ערכים מוסריים לפני מתן תורה מופיעים במקרא ובפרשנויות שונות. לדוגמה, ניתן למצוא התייחסויות לערכים מוסריים כמו צדק, אמת וחסד בסיפורים ובמצוות שניתנות לעם ישראל לפני קבלת התורה.

חז"ל קושרים את הערכים הללו למתן תורה בכך שהם רואים את התורה כבסיס לערכים המוסריים הללו. לדוגמה, המדרש מדגיש את החשיבות של חינוך לערכים מוסריים, כמו בהמתנה של העם למרים, שממחיש את הערך של סבלנות וכבוד לזולת (כפי שמוזכר במדרשים על ההמתנה של העם) [קרתי בכל לב, בהעלותך].

בנוסף, יש המפרשים את הסיפורים המקראיים כמעידים על ערכים מוסריים שהיו קיימים בעם ישראל גם לפני מתן תורה, כמו במעשי האבות והאימהות, שמדגימים ערכים של חסד, צדק ואמונה [סעדיה גאון, בראשית]. 

לסיכום, חז"ל רואים את התורה כמשלימה ומחזקת את הערכים המוסריים שהיו קיימים בעם ישראל גם לפני מתן תורה.
```


#### Baseline refs (context pool)

- `Ohev Ger d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49`
- `Malbim on Joel 7ad2d88dac8f3771:2/2/0`
- `Birkat Asher on Torah ad70008713308697:Numbers/31/41/16`
- `Radak on Amos c3d27d4e6e52e3c4:7/4/3`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19`
- `Mizrachi 576953114476b3c3:Deuteronomy/20/3/0`
- `Birkat Asher on Torah ad70008713308697:Deuteronomy/13/6/3`
- `Saadia Gaon on Genesis 27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0`

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

- `Karati Bekhol Lev af25e1459a5766ab:Beha'alotcha/0/4`

#### Removed refs (baseline vs graph pool)

- `Mizrachi 576953114476b3c3:Deuteronomy/20/3/0`

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Ohev Ger d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49` (score 0.5570, type `tanakh_commentary`)
  - `Malbim on Joel 7ad2d88dac8f3771:2/2/0` (score 0.5513, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/31/41/16` (score 0.5476, type `tanakh_commentary`)
  - `Radak on Amos c3d27d4e6e52e3c4:7/4/3` (score 0.5463, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19` (score 0.5442, type `tanakh_commentary`)
  - `Mizrachi 576953114476b3c3:Deuteronomy/20/3/0` (score 0.5394, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/13/6/3` (score 0.5392, type `tanakh_commentary`)
  - `Saadia Gaon on Genesis 27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0` (score 0.5390, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Ohev Ger d25096e7f8f5ec8d:Additions/On%20Syriac%20Grammar/Introduction/49` (score 0.5570, type `tanakh_commentary`)
  - `Malbim on Joel 7ad2d88dac8f3771:2/2/0` (score 0.5513, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/31/41/16` (score 0.5476, type `tanakh_commentary`)
  - `Radak on Amos c3d27d4e6e52e3c4:7/4/3` (score 0.5463, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/22/20/19` (score 0.5442, type `tanakh_commentary`)
  - `Mizrachi 576953114476b3c3:Deuteronomy/20/3/0` (score 0.5394, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Deuteronomy/13/6/3` (score 0.5392, type `tanakh_commentary`)
  - `Saadia Gaon on Genesis 27fb00960153aadc:%3CEMPTY_KEY%3E/24/26/0` (score 0.5390, type `tanakh_commentary`)

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
שתיקת אהרן אחרי מות בניו נדונה במקורות שונים, כאשר ישנן קריאות שונות המנסות להסביר את משמעותה. 

1. **השתיקה כתגובה לאירוע טראומטי**: יש המפרשים את שתיקתו של אהרן כהבעת כאב עמוק ואי-יכולת לדבר בעקבות האובדן הכבד של בניו, נדב ואביהוא. זהו מצב של שבר רגשי שבו המילים לא מצליחות לבטא את הכאב.

2. **הבנה של גדלות**: יש המציעים כי אהרן הבין את גדולת בניו ואת מקומם הרוחני, כפי שמצוין במקורות המייחסים להם צדיקות רבה. אהרן, בהכרתו את מעשיהם, שותק מתוך הכרה שהם נענשו על מעשיהם, דבר שמחייב אותו לשתוק ולהתבונן במצב (Birkat Asher on Torah, Leviticus/9/2/1).

3. **הקשר למורשת**: יש המצביעים על כך ששתיקתו של אהרן מדגימה את הקושי של המנהיגים להתמודד עם אובדן, ובמיוחד כאשר מדובר במורשת ובתפקידים רוחניים. שתיקתו עשויה להצביע על כך שהדברים שנאמרים לאחר מותו של אדם מקבלים משמעות חדשה ונצחית (Karati Bekhol Lev, Vayechi/0/8).

לסיכום, שתיקת אהרן אחרי מות בניו נבחנת ממספר זוויות, כולל כאב אישי, הכרה במורשת ובגדולה, והקשר בין החיים למוות.
```


#### Graph answer

```
שתיקת אהרן אחרי מות בניו נדונה במספר מקורות, כאשר ישנן קריאות שונות המנסות להסביר את משמעותה.

1. **הבנה של שתיקה**: אחד ההסברים מציע ששתיקתו של אהרן נובעת מההכרה במעלת בניו, כפי שמובא במקורות שונים. לדוגמה, יש המפרשים כי אהרן הבין שבניו היו צדיקים גמורים ולכן לא היה מקום להתנגדות או למילים נוספות מצידו (כפי שמוזכר בברכות לד ע"ב) [Birkat Asher on Torah, Leviticus/9/2/1].

2. **הקבלה למשה**: יש המצביעים על כך ששתיקתו של אהרן משקפת את ההבדל בין חייו למותו של משה, שבו לא היו אפיונים דומים. אהרן, לעומת זאת, חווה את המוות של בניו בצורה שונה, מה שמוביל לתהיות על משמעות המוות והשתיקה (כפי שמוזכר ברש"י) [Birkat Asher on Torah, Deuteronomy/31/49/1].

3. **הקשר בין חיים למוות**: יש המציעים כי דבריו של אדם בחייו מתקבלים פחות מאשר לאחר מותו, מה שמצביע על כך ששתיקתו של אהרן יכולה להיות גם ביטוי להכרה במעמדו של המוות ובנצחיות הרעיון (כפי שמוזכר במאמר על ההתקבלות) [Karati Bekhol Lev, Vayechi/0/8].

לסיכום, שתיקת אהרן אחרי מות בניו נחשבת לאירוע טעון, עם פרשנויות שונות המצביעות על הכרה במעלת בניו, הבדל בין חייו למותו של משה, והקשר בין חיים למוות.
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
בתנ"ך ישנם מספר מקומות שבהם ניתן לראות פער בין כוונה למעשה, ובפרשנויות השונות יש התייחסות לכך.

דוגמה בולטת היא בפרשת המכות במצרים, כאשר פרעה רואה את ההבדל בין מעשה אהרן לבין מעשה החרטומים. כאן, יש הבדל בין הכוונה של אהרן לבצע את המכה על פי צו ה' לבין המעשה של החרטומים, שמנסים להוסיף על המכה ולא מצליחים. אבן עזרא מציין כי פרעה הבחין בפער הזה, מה שמצביע על הבדל מהותי בין הכוונה האלוהית לבין המעשה האנושי ([אבן עזרא על שמות ז:ב]).

עוד דוגמה היא בפרשת הענן, שבה ישנה התמקדות בהמתנה ובסבלנות של בני ישראל במדבר. כאן, הכוונה היא להדגיש את הצורך בסבלנות ובציפייה, בעוד שהמעשה הוא חנייה ממושכת במדבר, דבר שמדגיש את הקושי והציפייה ([ברכת אשר על במדבר ט:י"ד]).

פרשנים כמו רש"ר הירש מדגישים את החשיבות של ההמתנה והציפייה, ומצביעים על כך שהעם היה מודע לכך שהמחוז החפץ לא היה במדבר, מה שמחזק את הפער בין הכוונה לבין המעשה בפועל ([ברכת אשר על במדבר ט:י"ד]).

באופן כללי, הפרשנים מתייחסים לפערים הללו כאל הזדמנויות ללמידה על טבע האדם, על הקשר עם האל ועל המשמעות של סבלנות וציפייה.
```


#### Graph answer

```
בתנ"ך ניתן למצוא פערים בין כוונה למעשה במקרים שונים. דוגמה בולטת היא בפרשת המקלל (ויקרא כ"ד), שם הכוונה הייתה להעניש את המקלל, אך יש המפרשים שהעונש שניתן היה חמור מדי ולא התחשב בנסיבות. 

הפרשנים מתייחסים לכך בדרכים שונות. למשל, יש המצביעים על כך שהעונש נועד לשמור על סדר חברתי, בעוד אחרים רואים בכך חוסר חמלה כלפי המקלל, ומדגישים את הצורך באיזון בין צדק לחמלה (כפי שמוזכר במקורות שונים על פרשיות אלו) [ויקרא כ"ד]. 

בנוסף, ישנה מחלוקת בין ר' עקיבא לר' יהודה בן בתירא לגבי הכלים שבהם יש להשתמש לפרש את התורה, מה שמעיד על פערים בין הכוונה למעשים בפירוש הטקסטים עצמם [שילוח]. 

במקרים אחרים, כמו במעשה אהרן והחרטומים (שמות ז'), ישנה הבחנה בין מעשה אהרן, שנעשה בכוח אלוהי, לבין מעשה החרטומים, שמבוסס על כישוף, מה שמצביע על פער בין הכוונה של כל אחד מהם לבין התוצאה [שמות ז']. 

באופן כללי, הפרשנים עוסקים בשאלות של צדק, חמלה ופרשנות, ומדגישים את הצורך בהבנה מעמיקה של הכוונות מאחורי המעשים.
```


#### Baseline refs (context pool)

- `Riva on Torah 6bed0247212b68cf:Exodus/24/37/0`
- `Ibn Ezra on Exodus 9bf8a85d37b80301:7/2/0`
- `Karati Bekhol Lev af25e1459a5766ab:Sh'lach/0/7`
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
  - `Riva on Torah 6bed0247212b68cf:Exodus/24/37/0` (score 0.5761, type `tanakh_commentary`)
  - `Ibn Ezra on Exodus 9bf8a85d37b80301:7/2/0` (score 0.5651, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Sh'lach/0/7` (score 0.5629, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3` (score 0.5612, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Exodus/27/21/1` (score 0.5585, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/8/14/1` (score 0.5535, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5513, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/18/19/3` (score 0.5449, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Riva on Torah 6bed0247212b68cf:Exodus/24/37/0` (score 0.5761, type `tanakh_commentary`)
  - `Ibn Ezra on Exodus 9bf8a85d37b80301:7/2/0` (score 0.5651, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Sh'lach/0/7` (score 0.5629, type `tanakh_commentary`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/33/10/3` (score 0.5612, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Exodus/27/21/1` (score 0.5585, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Numbers/8/14/1` (score 0.5535, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5513, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/18/19/3` (score 0.5449, type `tanakh_commentary`)

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
- **Heuristic label:** *likely improved*
- **Why this label:** Graph mode added neighbors and/or new sources with limited loss of baseline coverage, and/or increased commentary or corpus diversity.
- **Notes on differences:** (none)

#### Baseline answer

```
בתנ"ך מצווים על אהבת הגר במקומות שונים, במיוחד בספר דברים ובספר ויקרא. בפסוק מדברים (דברים י:יט) כתוב: "ואהבתם את הגר". כמו כן, בוויקרא (ויקרא י"ט:יח) מופיע הציווי "ואהבת לרעך כמוך", שמדגיש את עקרון האהבה כלפי הזולת, כולל הגר.

פרשנויות שונות מצביעות על החשיבות המוסרית של אהבת הגר. רבינו בחיי מדגיש את הציווי לאהוב את הגר כמשמעותי, ומקשר אותו לאהבה הכללית בין בני אדם (Rabbeinu Bahya, Ref: 6f4658cddcc025b8:Devarim/9/17/1). אור החיים מפרש את המילה "והב" בהקשרים של אהבה ונתינה, מה שמצביע על הקשר העמוק בין אהבה למעשים (Or HaChaim on Numbers, Ref: 771e480a7bd1be4d:20/13/2).

הפרשנות המודרנית רואה באהבה זו חלק מהאתיקה היהודית, שמדגישה את האהבה האלטרואיסטית כלפי הזולת (Covenant and Conversation; Hebrew Edition, Ref: 5139e9501410a731:Eikev/1/10).
```


#### Graph answer

```
בתנ"ך מצווים על אהבת הגר במקומות שונים, במיוחד בספר דברים ובספר ויקרא. לדוגמה, בספר דברים (דברים י:יט) כתוב: "ואהבתם את הגר". כמו כן, בספר ויקרא (ויקרא י"ט:יח) מופיע הציווי "ואהבת לרעך כמוך", שמדגיש את עקרון האהבה גם כלפי הגר.

פרשנויות שונות מדגישות את החשיבות המוסרית של מצווה זו. רבינו בחיי מסביר כי אהבת הגר נובעת מההבנה שהעם היהודי היה גר בארץ מצרים, ולכן יש להם חובה מוסרית לאהוב את הגר (Rabbeinu Bahya, Ref: 6f4658cddcc025b8:Devarim/9/17/1). 

אור החיים מפרש את המילה "ואהבת" כאהבה שיש לה ביטוי מעשי, ומדגיש את הקשר בין אהבה זו לבין אהבת ה' (Or HaChaim on Numbers, Ref: 771e480a7bd1be4d:20/13/2). 

הציווי לאהוב את הגר נחשב לאתיקה של אהבה, שמייחדת את הדת היהודית ומדגישה את החשיבות של אהבה אלטרואיסטית (Covenant and Conversation; Hebrew Edition, Ref: 5139e9501410a731:Eikev/1/10). 

באופן כללי, אהבת הגר בתורה משקפת עקרונות של צדק וחמלה, ומדגישה את הקשר בין בני האדם לבין אלוהים.
```


#### Baseline refs (context pool)

- `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1`
- `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10`
- `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0`
- `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1`
- `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1`
- `Chizkuni 650644840ff5c406:Deuteronomy/11/19/0`

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

- `Tzafnat Pa'neach on Torah abcfc567063097ca:Deuteronomy/5/4/0`

#### Removed refs (baseline vs graph pool)

- `Chizkuni 650644840ff5c406:Deuteronomy/11/19/0`

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1` (score 0.5630, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2` (score 0.5602, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` (score 0.5539, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10` (score 0.5405, type `tanakh_commentary`)
  - `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0` (score 0.5342, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1` (score 0.5283, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1` (score 0.5262, type `tanakh_commentary`)
  - `Chizkuni 650644840ff5c406:Deuteronomy/11/19/0` (score 0.5255, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1` (score 0.5630, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2` (score 0.5602, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` (score 0.5539, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10` (score 0.5405, type `tanakh_commentary`)
  - `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0` (score 0.5342, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1` (score 0.5283, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1` (score 0.5262, type `tanakh_commentary`)
  - `Chizkuni 650644840ff5c406:Deuteronomy/11/19/0` (score 0.5255, type `tanakh_commentary`)

#### Graph run — retrieval stages + graph internals

- *Vector top-k:*
  - `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1` (score 0.5612, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2` (score 0.5553, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` (score 0.5514, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10` (score 0.5340, type `tanakh_commentary`)
  - `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0` (score 0.5280, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1` (score 0.5256, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1` (score 0.5231, type `tanakh_commentary`)
  - `Tzafnat Pa'neach on Torah abcfc567063097ca:Deuteronomy/5/4/0` (score 0.5220, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Rabbeinu Bahya 6f4658cddcc025b8:Devarim/9/17/1` (score 0.5612, type `tanakh_commentary`)
  - `Or HaChaim on Numbers 771e480a7bd1be4d:20/13/2` (score 0.5553, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` (score 0.5514, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Eikev/1/10` (score 0.5340, type `tanakh_commentary`)
  - `Minei Targuma on Torah e4c48774d3dbbda2:Genesis/23/66/0` (score 0.5280, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/23/66/1` (score 0.5256, type `tanakh_commentary`)
  - `Birkat Asher on Torah ad70008713308697:Genesis/10/8/1` (score 0.5231, type `tanakh_commentary`)
  - `Tzafnat Pa'neach on Torah abcfc567063097ca:Deuteronomy/5/4/0` (score 0.5220, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `6f4658cddcc025b8:Devarim/9/17/1` score 0.5612
  - `771e480a7bd1be4d:20/13/2` score 0.5553
  - `a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` score 0.5514
  - `5139e9501410a731:Eikev/1/10` score 0.5340
  - `e4c48774d3dbbda2:Genesis/23/66/0` score 0.5280
  - `ad70008713308697:Genesis/23/66/1` score 0.5256
  - `ad70008713308697:Genesis/10/8/1` score 0.5231
  - `abcfc567063097ca:Deuteronomy/5/4/0` score 0.5220
- *Graph — reranked (graph score / retrieval score):*
  - `6f4658cddcc025b8:Devarim/9/17/1` graph 0.9400 / vec 0.5612
  - `771e480a7bd1be4d:20/13/2` graph 0.9295 / vec 0.5553
  - `a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` graph 0.9226 / vec 0.5514
  - `5139e9501410a731:Eikev/1/10` graph 0.8916 / vec 0.5340
  - `e4c48774d3dbbda2:Genesis/23/66/0` graph 0.8808 / vec 0.5280
  - `ad70008713308697:Genesis/23/66/1` graph 0.8766 / vec 0.5256
  - `ad70008713308697:Genesis/10/8/1` graph 0.8723 / vec 0.5231
  - `abcfc567063097ca:Deuteronomy/5/4/0` graph 0.8702 / vec 0.5220
- *Graph — signals (per ref in pool before rerank):*
  - `6f4658cddcc025b8:Devarim/9/17/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `771e480a7bd1be4d:20/13/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9295
  - `a193e823a180c713:Va'ethanan%3B%20Making%20Love%20Last/16` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9226
  - `5139e9501410a731:Eikev/1/10` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8916
  - `e4c48774d3dbbda2:Genesis/23/66/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8808
  - `ad70008713308697:Genesis/23/66/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8766
  - `ad70008713308697:Genesis/10/8/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8723
  - `abcfc567063097ca:Deuteronomy/5/4/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8702

---

## Aggregate summary

| Metric | Count |
|--------|-------|
| Questions with different final answers (heuristic text diff) | 12 |
| Questions with different context-pool ref lists (ordered keys) | 4 |
| Questions that gained ≥1 new source in graph context pool | 2 |
| Questions with added commentary-looking ref or graph neighbor | 1 |
| Questions where graph signals showed link/topic cohesion in pool | 0 |
| Questions labeled *no clear change* | 10 |
| Questions labeled *possible degradation* | 0 |
| Questions labeled *likely improved* | 2 |

### Run again

```bash
npm --workspace packages/worker run eval:graph-augment
```

Output path: `./eval/my_report_post_fix.md`
