# Graph-augmented retrieval evaluation

Generated: 2026-04-13T08:47:47.567Z

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
הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מופיע במקורות שונים, אך הוא לא תמיד מפורש במדויק. אחד המקורות המוכרים הוא מהתנא רבי שמעון בר יוחאי, שאמר כי העולם נברא בשביל התורה, כפי שמובא במדרשים שונים. 

במדרש נאמר כי התורה ניתנה מתוך חשך, והאומות שלא קיבלו אותה חיות בחשך, בעוד שישראל, שקיבלו את התורה, זוכים לאור (ישעיה ס', ב') [Ohel Ya'akov on Torah, Ref: ec91309b7f81308f:Vayikra/19/0]. 

בנוסף, יש המפרשים את הרעיון הזה כך שהעולם כולו נברא כדי לאפשר לישראל לקיים את התורה, שהיא הדרך להנחיל את הערכים והמצוות שיביאו לתיקון העולם. 

לסיכום, הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מופיע במקורות שונים, והוא נתפס כתשתית להבנת משמעות קיום ישראל ותפקידם בעולם.
```


#### Graph answer

```
הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מופיע במקורות שונים. אחד המקורות הוא מדרש שמדבר על כך שהאומות שלא קיבלו את התורה חיות בחשך, בעוד שישראל, שקיבלו את התורה, זוכים לאור (ישעיה ס', ב') [Ohel Ya'akov on Torah, Ref: ec91309b7f81308f:Vayikra/19/0].

בנוסף, יש המפרשים את הרעיון הזה בהקשר של תכלית הבריאה, כאשר התורה נחשבת כאמצעי להנחלת ערכים מוסריים וקדושה לעולם. כך, יש המצביעים על כך שהעולם קיים כדי לאפשר לישראל לקיים את התורה, ובכך להביא אור לעולם כולו [Meshekh Chokhmah, Ref: c33fbee783cb0c47:Vezot%20Haberakha/21].

לסיכום, הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מתפרש כהבנה שהקיום האנושי והעולם כולו תלויים במימוש התורה ובערכים שהיא מייצגת.
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
הפסוק "נעשה אדם בצלמנו כדמותנו" (בראשית א:כו) זכה לפרשנויות רבות, והמשמעות שלו נבחנת מכיוונים שונים:

1. **הדמיון לאל**: אחד הכיוונים המרכזיים הוא שהאדם נברא בדמות אלוהים, כלומר יש בו צדדים רוחניים ושכליים שמבדילים אותו משאר הברואים. הרמב"ם מציין שהאדם מתייחד בהשגה השכלית, שהיא ייחודית לו ואינה קיימת אצל שאר הנבראים (מורה נבוכים, חלק א, פרק 9).

2. **הכנת האדם לכל המידות**: שד"ל מציע שהאדם דומה לאל בכך שיש לו את הכוח והיכולת לכל המידות והפעולות, בניגוד לשאר בעלי החיים שיש להם יכולות מוגבלות (שד"ל על בראשית א:כו).

3. **הקשר בין גוף לנשמה**: הרמב"ן מציין שהאדם נברא עם גוף שמזכיר את הארץ, אך עם נשמה שמקשרת אותו לעליונים. כלומר, יש באדם שילוב של חומר ורוח (רמב"ן על בראשית א:כו).

4. **ההשתדלות והשאיפה**: הכוונה של "כדמותנו" יכולה להתפרש כהשתדלות האדם להתדמות למידות רוחניות, כלומר לשאוף לעלות במעלות רוחניות ולהתקרב לאל (כתאב והקבלה על בראשית א:כו).

5. **ההיבט של ענווה**: יש המפרשים את הפסוק בהקשר של ענווה, כלומר שהאדם צריך להכיר במקומו בעולם ולא להחשיב את עצמו גבוה מדי, כפי שמופיע במקורות שונים (חומת אנך על קהלת).

לסיכום, הפסוק "נעשה אדם בצלמנו כדמותנו" מצביע על הקשר המורכב בין האדם לאלוהים, ומזמין אותנו לחשוב על מהות האדם, תכליתו והשאיפות הרוחניות שלו.
```


#### Graph answer

```
הפסוק "נעשה אדם בצלמנו כדמותנו" (בראשית א:כו) עורר מגוון רחב של פרשנויות. 

1. **הקשר בין האדם לאלוהים**: לפי קאסוטו, הפסוק מדגיש שהאדם נברא בדמות אלוהים, מה שמצביע על כך שגם בני האדם נולדים בדמותו. הוא רואה בכך הקדמה למה שיבוא לאחר מכן על דורות בני אדם (קאסוטו על בראשית).

2. **ההיבט השכלי**: הרמב"ם מציין שהאדם ניחן בהשגה שכלית שאין לה מקבילה בעולם החי, ולכן הוא דומה לאלוהים בהשגת האמת, אף על פי שאין הכוונה לדמיון פיזי (מורה נבוכים, חלק א, פרק ט).

3. **הדמיון הרוחני**: הכתבים מדברים על כך שהאדם נברא כדי להתדמות למידות הרוחניות של האל, וככל שהאדם מתעלה במידותיו, כך הוא מתקרב לדמות האל (הכתב והקבלה).

4. **ההיבט של יצירה**: לפי שד"ל, המילה "נעשה" מצביעה על כך שהאדם נברא במחשבה ובכוונה, מה שמצביע על מעלתו המיוחדת (שד"ל על בראשית).

5. **הקשר עם הארץ**: הרמב"ן מציע שהפסוק מצביע על שיתוף פעולה בין האל לארץ ביצירת האדם, כאשר האל מעניק לאדם את החלק הרוחני (רמב"ן על בראשית).

לסיכום, הפסוק "נעשה אדם בצלמנו כדמותנו" מציע הבנה עמוקה של הקשר בין האדם לאלוהים, הן בהיבט הפיזי והן בהיבט הרוחני, ומדגיש את ייחודיותו של האדם בעולם.
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
  - `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0` (score 0.6329, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` (score 0.6296, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 1:9` (score 0.6242, type `philosophy`)
  - `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2` (score 0.6210, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3` (score 0.6163, type `tanakh_commentary`)
  - `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` (score 0.6124, type `tanakh_commentary`)
  - `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` (score 0.6053, type `tanakh_commentary`)
  - `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0` (score 0.6046, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Chomat Anakh on Ecclesiastes 4d2bb6d49da69ddd:0/2/0` (score 0.6329, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/4/0/79` (score 0.6296, type `tanakh_commentary`)
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 1:9` (score 0.6242, type `philosophy`)
  - `HaKtav VeHaKabalah 596d4e2c101152da:Genesis/0/25/2` (score 0.6210, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:0/25/3` (score 0.6163, type `tanakh_commentary`)
  - `Kli Yakar on Genesis f919654f570d7ef7:%3CEMPTY_KEY%3E/0/25/0` (score 0.6124, type `tanakh_commentary`)
  - `Ramban on Job ad23b5ccf148fcc8:%3CEMPTY_KEY%3E/27/3/1` (score 0.6053, type `tanakh_commentary`)
  - `Torah Temimah on Ecclesiastes e16479853ef7d57f:1/20/0` (score 0.6046, type `tanakh_commentary`)

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
- **Heuristic label:** *likely improved*
- **Why this label:** Graph mode added neighbors and/or new sources with limited loss of baseline coverage, and/or increased commentary or corpus diversity.
- **Notes on differences:** (none)

#### Baseline answer

```
דיון בקשיות הלב של פרעה מופיע במקרא, בעיקר בספר שמות, בפרשות המתארות את המכות והיציאה ממצרים. בפרשות אלו מצוין כי ה' הכביד את לב פרעה, מה שמעורר שאלות לגבי חופש הרצון והאחריות של פרעה על מעשיו. 

היחס בין בחירה להתערבות אלוהית הוא מורכב. מצד אחד, אם ה' הכביד את לב פרעה, עולה השאלה כיצד ניתן להעניש את פרעה על החלטות שלא התקבלו מתוך חופש רצון. מצד שני, יש המפרשים את הקשיות כעדות לכך שפרעה בחר להתנגד למרות ההתערבות האלוהית, מה שמצביע על חופש הרצון שלו. 

כפי שנאמר במקורות, "אם ה' הקשה את לב פרעה, כי אז ה' הוא שגרם לכך שפרעה יסרב לשלח את עם ישראל" (Covenant and Conversation; Hebrew Edition, Ref: 5139e9501410a731:Vaera/2/0). זה מציב אתגרים מוסריים ותיאולוגיים בנוגע לאשמה ולחופש הרצון של האדם.
```


#### Graph answer

```
דיון בקשיות הלב של פרעה מופיע בעיקר בספר שמות, בפרשות העוסקות במכות מצרים. הכתוב מציין כי ה' "הכביד" את לב פרעה, מה שמעורר שאלות לגבי חופש הרצון והאחריות של פרעה על מעשיו (שמות פרק 7, פסוק 3; פרק 10, פסוק 1). השאלה המרכזית היא כיצד ניתן להעניש את פרעה אם הוא פעל תחת השפעה אלוהית ולא מתוך רצון חופשי.

היחס בין בחירה להתערבות אלוהית הוא מורכב. מצד אחד, אם ה' הוא זה שהקשה את לב פרעה, אזי יש לשאול על צדק הענישה. מצד שני, יש המפרשים שהקשה זו לא נוגעת לבחירה החופשית של פרעה, אלא מצביעה על כך שהוא בחר להקשיח את לבו, ולכן הוא אחראי למעשיו (Covenant and Conversation; Hebrew Edition, Ref: 5139e9501410a731:Vaera/2/0).

לסיכום, הדיון סביב קשיות הלב של פרעה נוגע לשאלות של חופש הרצון, אחריות מוסרית, והתערבות אלוהית, ומציג את המתח בין שני הקטבים הללו.
```


#### Baseline refs (context pool)

- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14`
- `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1`
- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11`
- `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0`
- `Karati Bekhol Lev af25e1459a5766ab:Vaera/0/9`

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

- `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Tazria%3B%20The%20Power%20of%20Bad/4`

#### Removed refs (baseline vs graph pool)

- `Karati Bekhol Lev af25e1459a5766ab:Vaera/0/9`

#### Baseline — retrieval stages

- *Vector top-k:*
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13` (score 0.5745, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` (score 0.5604, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14` (score 0.5495, type `tanakh_commentary`)
  - `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` (score 0.5492, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` (score 0.5478, type `tanakh_commentary`)
  - `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0` (score 0.5458, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0` (score 0.5446, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Vaera/0/9` (score 0.5437, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Ki%20Tisa/3/13` (score 0.5745, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/1/24/3` (score 0.5604, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Bereshit/1/14` (score 0.5495, type `tanakh_commentary`)
  - `Haamek Davar on Deuteronomy 2d09e96f5a213935:%3CEMPTY_KEY%3E/31/41/1` (score 0.5492, type `tanakh_commentary`)
  - `Judaism's Life Changing Ideas; A Weekly Reading of the Jewish Bible a193e823a180c713:Beshallah%3B%20The%20Longer%2C%20Shorter%20Road/11` (score 0.5478, type `tanakh_commentary`)
  - `Chibbah Yeteirah on Torah a1e70289c5a5e3bc:Exodus/6/21/0` (score 0.5458, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vaera/2/0` (score 0.5446, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Vaera/0/9` (score 0.5437, type `tanakh_commentary`)

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
בתנ"ך ישנם מספר מקורות העוסקים בתשובה, כאשר אחד המרכזיים הוא ספר יחזקאל, בפרק 18, שבו נכתבת קריאה לתשובה ולשינוי דרכי חיים (יחזקאל יח:ל). 

חז"ל והפרשנים מפרשים את המושג תשובה בדרכים שונות. למשל, המפרש רמב"ם מדגיש את החשיבות של הכוונה וההכרה בחטא, בעוד שהמפרש רש"י מתמקד בתהליך של חזרה למוטב. 

בפרשנות של אבן עזרא, הוא מציע שהמושג תשובה כולל גם את הרעיון של חרטה על העבר, והתחייבות לעתיד טוב יותר. 

לסיכום, תשובה בתנ"ך נתפסת כתהליך של חזרה למוטב, עם דגשים שונים אצל הפרשנים השונים, אך תמיד עם מטרה של תיקון עצמי ושיפור.
```


#### Graph answer

```
בתנ"ך, נושא התשובה מופיע בכמה מקומות, כאשר אחד מהפסוקים המרכזיים הוא בספר יחזקאל: "וְשָׁבוּ בָּנִים שׁוֹבָבִים, אֶל-אֶרֶץ אֲבוֹתֵיהֶן" (יחזקאל 18:30). פסוק זה מדגיש את החשיבות של חזרה בתשובה והחזרת האדם למצבו הקודם.

חז"ל והפרשנים מפרשים את נושא התשובה בדרכים שונות. לדוגמה, במדרש רבה (ויקרא רבה פרשה י"ט) נאמר כי תשובה היא כלי שמאפשר לאדם לשוב אל ה' גם לאחר חטא. התשובה נחשבת לאמצעי לתיקון ולתהליך פנימי עמוק.

הפרשנים כמו רש"י, אבן עזרא ומלב"ם מדגישים את הכוונה הפנימית של התשובה, שהיא לא רק חזרה פיזית אלא גם שינוי פנימי במחשבה ובמעשה. רש"י, למשל, מפרש את הפסוקים בהקשר של חזרה בתשובה כצורך להכיר בחטא ולהתחרט עליו.

באופן כללי, התשובה בתנ"ך נתפסת כפעולה שמביאה לגאולה ולסליחה, והפרשנים מדגישים את המורכבות והעומק של התהליך הזה, הן ברמה האישית והן ברמה הקולקטיבית של עם ישראל.
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
  - `Metzudat David on Joshua 2fb40407c188ca50:7/33/1` (score 0.5785, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5` (score 0.5765, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` (score 0.5708, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` (score 0.5602, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15` (score 0.5586, type `tanakh_commentary`)
  - `Malbim on I Kings 5b3d899c9941aab7:5/26/0` (score 0.5576, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` (score 0.5569, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` (score 0.5860, type `tanakh_commentary`)
  - `Metzudat David on Joshua 2fb40407c188ca50:7/33/1` (score 0.5785, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Vayikra/3/5` (score 0.5765, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` (score 0.5708, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` (score 0.5602, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shmini/1/15` (score 0.5586, type `tanakh_commentary`)
  - `Malbim on I Kings 5b3d899c9941aab7:5/26/0` (score 0.5576, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` (score 0.5569, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` score 0.5860
  - `2fb40407c188ca50:7/33/1` score 0.5785
  - `5139e9501410a731:Vayikra/3/5` score 0.5765
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` score 0.5708
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` score 0.5602
  - `af25e1459a5766ab:Shmini/1/15` score 0.5586
  - `5b3d899c9941aab7:5/26/0` score 0.5576
  - `11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` score 0.5569
- *Graph — reranked (graph score / retrieval score):*
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` graph 0.9400 / vec 0.5860
  - `2fb40407c188ca50:7/33/1` graph 0.9272 / vec 0.5785
  - `5139e9501410a731:Vayikra/3/5` graph 0.9238 / vec 0.5765
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` graph 0.9141 / vec 0.5708
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` graph 0.8959 / vec 0.5602
  - `af25e1459a5766ab:Shmini/1/15` graph 0.8932 / vec 0.5586
  - `5b3d899c9941aab7:5/26/0` graph 0.8915 / vec 0.5576
  - `11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` graph 0.8904 / vec 0.5569
- *Graph — signals (per ref in pool before rerank):*
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/%3CEMPTY_KEY%3E/2/23/11` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `2fb40407c188ca50:7/33/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9272
  - `5139e9501410a731:Vayikra/3/5` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9238
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/8/17/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9141
  - `4592db48180a0bb2:From%20Adam%20to%20Noah/Introduction/13` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8959
  - `af25e1459a5766ab:Shmini/1/15` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8932
  - `5b3d899c9941aab7:5/26/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8915
  - `11a590b6ecbb9073:Leviticus/%3CEMPTY_KEY%3E/8/0/9` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8904

---

### Question 5

- **Query:** איפה יש דיון במשמעות של “לא בשמים היא”, ואיך משתמשים בפסוק הזה?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
הדיון במשמעות של "לא בשמים היא" מופיע בדברים (דברים ל, יב). הפסוק מתייחס לכך שהתורה אינה דבר מה רחוק או בלתי נגיש, אלא היא קרובה אלינו וניתנת להבנה וליישום. 

במסגרת השיח התורני, הפסוק משמש להדגיש את הנגישות של התורה ואת האחריות של בני האדם לקיים את מצוותיה. הוא מציין שאין צורך לחפש את התורה בשמים או אצל אחרים, אלא היא מצויה בקרבנו ובידינו. 

הפסוק הזה משמש לעיתים קרובות כדי להדגיש את החשיבות של הבחירה החופשית והיכולת של כל אדם להבין וליישם את התורה בחייו.
```


#### Graph answer

```
הדיון במשמעות של "לא בשמים היא" מופיע במקרא בספר דברים (דברים ל, יב). הפסוק מתייחס לכך שהתורה אינה דבר מה רחוק או בלתי נגיש, אלא היא קרובה אל האדם וניתנת להבנה וליישום.

הפסוק משמש לעיתים קרובות בהקשרים של הבהרת עקרונות מוסריים או הלכתיים, כדי להדגיש שהאדם יכול להבין את דרכי התורה ולפעול לפיהן, ולא צריך לחכות להוראות שמגיעות משמים. זהו עיקרון שמדגיש את האחריות האישית של כל אדם לקיים את מצוות התורה.

למשל, ניתן להשתמש בפסוק זה כדי להדגיש את החשיבות של לימוד תורה והבנתה, ולא להסתמך על סמכות חיצונית בלבד.
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
מנקודת מבט של ניסיון מול ציווי, עקידת יצחק נתפסת כנסיון של אברהם, שבו הוא נדרש להקריב את בנו על פי ציווי אלוהי. המפרשים השונים מתמודדים עם הדילמה הזו, כאשר יש המפרשים את המעשה כציווי מוחלט של ה' ואחרים רואים בו ניסיון שמטרתו לבדוק את אמונתו של אברהם.

אחת הגישות המפורסמות היא של הרמב"ן, אשר מדגיש את המתח שבין הציווי לבין הניסיון, וטוען שהמעשה נועד להוכיח את נאמנותו של אברהם לאלוהים, גם כאשר הציווי נראה קשה ומאתגר. 

אם יש לך שאלות נוספות או אם תרצה להרחיב על מפרש מסוים, אני כאן לעזור!
```


#### Graph answer

```
לגבי פירוש עקידת יצחק מנקודת מבט של ניסיון מול ציווי, ישנם מפרשים שונים. אחד המפורסמים הוא הרמב"ן, אשר מדגיש את המתח בין הציווי האלוהי לבין הניסיון האישי של אברהם. הוא רואה את העקידה כניסיון של אברהם להראות את נאמנותו לאלוהים, למרות הציווי הקשה.

מנגד, ישנם מפרשים כמו רש"י, שמדגישים את הציווי האלוהי כמרכזי, ומבינים את העקידה כהוראה ישירה מאלוהים, שמטרתה לבדוק את אמונתו של אברהם.

לסיכום, ניתן לראות את העקידה כמצב שבו ישנו ציווי אלוהי המהווה ניסיון לאברהם, כאשר כל מפרש מציע זווית ראייה שונה על הדינמיקה שבין השניים.
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
  - `Pardes Yosef 920062d067507725:Genesis/30/16/0` (score 0.5305, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` (score 0.5292, type `tanakh_commentary`)
  - `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` (score 0.5290, type `tanakh_commentary`)
  - `Menachot Menachot 26b:17` (score 0.5254, type `bavli`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` (score 0.5205, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10 (part 3/3)` (score 0.5177, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0` (score 0.5138, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8` (score 0.5125, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Pardes Yosef 920062d067507725:Genesis/30/16/0` (score 0.5305, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` (score 0.5292, type `tanakh_commentary`)
  - `Ish Leshivto; on Judges 7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` (score 0.5290, type `tanakh_commentary`)
  - `Menachot Menachot 26b:17` (score 0.5254, type `bavli`)
  - `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` (score 0.5205, type `tanakh_commentary`)
  - `Abarbanel on Torah 11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` (score 0.5177, type `tanakh_commentary`)
  - `Shadal on Genesis 5cc060f8cd54b5d6:47/13/0` (score 0.5138, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Shoftim/3/8` (score 0.5125, type `tanakh_commentary`)
- *Graph — original pool (pre-rerank):*
  - `920062d067507725:Genesis/30/16/0` score 0.5305
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` score 0.5292
  - `7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` score 0.5290
  - `Menachot 26b:17` score 0.5254
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` score 0.5205
  - `11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` score 0.5177
  - `5cc060f8cd54b5d6:47/13/0` score 0.5138
  - `af25e1459a5766ab:Shoftim/3/8` score 0.5125
- *Graph — reranked (graph score / retrieval score):*
  - `920062d067507725:Genesis/30/16/0` graph 0.9400 / vec 0.5305
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` graph 0.9375 / vec 0.5292
  - `7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` graph 0.9372 / vec 0.5290
  - `Menachot 26b:17` graph 0.9304 / vec 0.5254
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` graph 0.9211 / vec 0.5205
  - `11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` graph 0.9158 / vec 0.5177
  - `5cc060f8cd54b5d6:47/13/0` graph 0.9084 / vec 0.5138
  - `af25e1459a5766ab:Shoftim/3/8` graph 0.9061 / vec 0.5125
- *Graph — signals (per ref in pool before rerank):*
  - `920062d067507725:Genesis/30/16/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/19/9/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9375
  - `7b5880204e7a7a35:%3CEMPTY_KEY%3E/11/30` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9372
  - `Menachot 26b:17` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9304
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/36/24/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9211
  - `11a590b6ecbb9073:Numbers/%3CEMPTY_KEY%3E/3/20/10` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9158
  - `5cc060f8cd54b5d6:47/13/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9084
  - `af25e1459a5766ab:Shoftim/3/8` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9061

---

### Question 7

- **Query:** איפה בתנ״ך מופיע רעיון הרחמים במצוות, ואיך הפרשנים מתמודדים איתו?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
רעיון הרחמים במצוות מופיע במקומות שונים בתנ"ך, ובפרט בפרשות העוסקות במצוות חברתיות וביחס בין בני אדם. דוגמה לכך ניתן למצוא בפרשת חוקת, שם מתוארת התפרצות הזעם של משה על העם, מה שמוביל לעונש חמור (במדבר כ, א–יג). הפרשנים עוסקים בשאלה מדוע משה נענש על כך, ומדגישים את החשיבות של רחמים וחמלה גם כלפי העם.

הפרשנים מציעים גישות שונות להבנת הרחמים במצוות. לדוגמה, המפרש "אוהל יעקב" מציין שישנם שני סוגים של רחמים: רחמים הנובעים מרצון טוב ורחמים הנובעים מרכות טבעית (אוהל יעקב על התורה). כמו כן, "דוד צבי הופמן" מדגיש את הצורך שהפרשן יתחשב במסורת ובתורה שבעל פה, כדי לא לסתור את ההלכה המסורה (דוד צבי הופמן על ויקרא).

בנוסף, יש המפרשים את הרחמים כבסיס לחוקי התורה, המיועדים לשמור על צדק וחמלה בחברה, כמו שצוין במדרשים השונים על פרשתנו (קרתי בכל לב). 

לסיכום, רעיון הרחמים במצוות נוכח בתנ"ך ובפרשנויות, כאשר הפרשנים מתמודדים עם המתח בין שמירה על החוק לבין הצורך בחמלה ורחמים.
```


#### Graph answer

```
רעיון הרחמים במצוות מופיע בתנ"ך במקומות שונים, כמו בפרשת חוקת, שבה מתוארת התפרצות הזעם של משה על העם שדרש מים (במדבר כ, א–יג). הפרשנים מתמודדים עם רעיון זה בדרכים שונות, כאשר חלקם מדגישים את הצורך בחמלה ובצדק כלפי הפרט, גם כאשר מדובר במצבים קשים או בעונש.

לדוגמה, יש המפרשים את הפרשה כקריאה לשמור על צדק וחמלה, תוך הבנת המחיר של הרחקת החלכאים והנדכאים (כפי שמוזכר במקורות כמו "Karati Bekhol Lev"). אחרים, כמו הרמ"א, מציינים את המניפולציות החברתיות של נשים במצבים קשים, ומבינים את הצורך בהבנה ובחמלה כלפי מצבים אלה (כפי שמוזכר במקור אחר).

באופן כללי, הפרשנים מדגישים את החשיבות של התייחסות לרגשות ולצרכים של הפרט, גם כאשר יש חוקים נוקשים, ומבינים את הרחמים כחלק בלתי נפרד מהמצוות והחוקים שבתורה.
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
- `Cassuto on Exodus 60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`

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
- *Graph — original pool (pre-rerank):*
  - `af25e1459a5766ab:Vayetzei/5/13` score 0.5447
  - `a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` score 0.5416
  - `ec91309b7f81308f:Shemot%3B%20Peticha/4` score 0.5345
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` score 0.5298
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` score 0.5276
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` score 0.5266
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` score 0.5224
  - `af25e1459a5766ab:Emor/1/16` score 0.5222
- *Graph — reranked (graph score / retrieval score):*
  - `af25e1459a5766ab:Vayetzei/5/13` graph 0.9400 / vec 0.5447
  - `a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` graph 0.9343 / vec 0.5416
  - `ec91309b7f81308f:Shemot%3B%20Peticha/4` graph 0.9212 / vec 0.5345
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` graph 0.9127 / vec 0.5298
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` graph 0.9085 / vec 0.5276
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` graph 0.9068 / vec 0.5266
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` graph 0.8989 / vec 0.5224
  - `af25e1459a5766ab:Emor/1/16` graph 0.8987 / vec 0.5222
- *Graph — signals (per ref in pool before rerank):*
  - `af25e1459a5766ab:Vayetzei/5/13` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `a193e823a180c713:Hukkat%3B%20Kohelet%2C%20Tolstoy%2C%20and%20the%20Defeat%20of%20Death/7` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9343
  - `ec91309b7f81308f:Shemot%3B%20Peticha/4` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9212
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/2` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9127
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/35/28/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9085
  - `5a9ec949ebd7c295:Preface%20to%20Torah%20Commentary/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9068
  - `60a94389fb6ddba7:%3CEMPTY_KEY%3E/13/20/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8989
  - `af25e1459a5766ab:Emor/1/16` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.8987

---

### Question 8

- **Query:** איפה מופיעים חלומות משמעותיים בתנ״ך ואיך מפרשים אותם?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
חלומות משמעותיים מופיעים בתנ"ך במקומות שונים, כאשר אחד המקרים הבולטים הוא חלומותיו של יוסף. יוסף חולם שני חלומות, האחד על אלומות תבואה והשני על כוכבים, שמשמעותם היא שהוא עתיד להיות בעל מעמד גבוה במשפחה ובמצרים (בראשית ל"ז).

חלומות נוספים מופיעים בספר בראשית, כמו חלום פרעה, שבו הוא רואה שבע פרות רזות ושבע פרות שמנות, אשר יוסף מפרש כתחזית לרעב שיבוא לאחר שבע שנות שפע (בראשית מ"א).

לגבי פרשנות החלומות, המסורת היהודית רואה בהם כלי לתקשורת עם האל. יוסף, לדוגמה, מפרש את החלומות על סמך הבנתו את רצון ה' ואת הסימנים המופיעים בהם. יש המאמינים כי חלומות יכולים לשקף את מחשבות האדם, רגשותיו או מצבו הנפשי, ולעיתים אף להוות אזהרה או הכוונה לעתיד.

כמו כן, ישנה מסורת חז"ל המצביעה על כך שחלומות יכולים להיות בעלי משמעות רוחנית או מוסרית, ולעיתים יש לפרשם בזהירות, שכן לא כל חלום הוא נבואי או בעל משמעות עמוקה (מגילה י ע"ב).
```


#### Graph answer

```
חלומות משמעותיים בתנ"ך מופיעים בכמה מקומות בולטים, כאשר אחד המקרים הידועים ביותר הוא חלומותיו של יוסף. יוסף חולם שני חלומות, האחד על אלומות תבואה והשני על כוכבים, שמשמעותם היא שהוא עתיד להיות בעל מעמד גבוה ולשלוט על משפחתו (בראשית ל"ז). לאחר מכן, הוא מפרש את חלומותיהם של שר המשקים ושר האופים בכלא, מה שמוביל אותו בסופו של דבר לעמוד לפני פרעה ולפרש את חלומו על שבע השנים הטובות ושבע השנים הרעות (בראשית מ"א).

בנוסף, חלומות נוספים מופיעים אצל דניאל, שם הוא מפרש את חלומו של נבוכדנצר (דניאל ב'), מה שמצביע על יכולתו להבין את המסרים האלוהיים דרך חלומות.

לגבי הפרשנות של חלומות, המסורת היהודית רואה בהם כדרך שבה אלוהים מתקשר עם בני האדם. יש המפרשים חלומות כסימנים או נבואות, בעוד אחרים רואים בהם ביטוי לתודעה הפנימית של החולם. לדוגמה, חז"ל טוענים כי "כל חלום שאינו מתפרש, הוא כלא חלום" (ברכות נ"ב), מה שמעיד על החשיבות של הבנת החלום והוצאת משמעות ממנו.

באופן כללי, חלומות בתנ"ך נתפסים ככלים להעברת מסרים חשובים, ולעיתים הם משקפים את מצבו הנפשי או החברתי של החולם.
```


#### Baseline refs (context pool)

- `Guide for the Perplexed Guide for the Perplexed, Part 1 61:4`
- `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1`
- `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10`
- `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94`
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0`
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
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 61:4` (score 0.5480, type `philosophy`)
  - `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` (score 0.5466, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10` (score 0.5366, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` (score 0.5330, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5293, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` (score 0.5293, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` (score 0.5291, type `tanakh_commentary`)
  - `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3 (part 2/2)` (score 0.5285, type `tanakh_commentary`)
- *After expandSplitChunks:*
  - `Guide for the Perplexed Guide for the Perplexed, Part 1 61:4` (score 0.5480, type `philosophy`)
  - `Ralbag on Song of Songs 128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` (score 0.5466, type `tanakh_commentary`)
  - `Covenant and Conversation; Hebrew Edition 5139e9501410a731:Miketz/2/10` (score 0.5366, type `tanakh_commentary`)
  - `Cassuto on Genesis 4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` (score 0.5330, type `tanakh_commentary`)
  - `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16` (score 0.5293, type `tanakh_commentary`)
  - `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` (score 0.5293, type `tanakh_commentary`)
  - `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` (score 0.5291, type `tanakh_commentary`)
  - `Em LaMikra fa07892a8f40e0ba:Leviticus/15/7/3` (score 0.5285, type `tanakh_commentary`)

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
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
ערכים מוסריים לפני מתן תורה מופיעים במספר מקומות בתנ"ך, והם מקושרים על ידי חז"ל למוסריות ולתודעה הדתית של העם ישראל.

1. **יוסף ואחיו**: סיפורו של יוסף, שבו הוא מתמודד עם קנאה ושנאה מצד האחים, מדגים ערכים של סליחה, כבוד ומשפחה. חז"ל רואים בכך דוגמה למוסריות שהייתה קיימת בעם ישראל לפני מתן תורה.

2. **אברהם אבינו**: אברהם נחשב לדמות מוסרית מופתית, כאשר הוא מתעקש על צדק ומוסר, כמו בסיפור של סדום ועמורה, שבו הוא מתפלל על העיר כדי להציל את הצדיקים. חז"ל מדגישים את ערכי הצדק והרחמים שהוא מייצג.

3. **חוקי נח**: לפני מתן תורה, ישנם חוקים שנמסרו לנח, כמו איסור רצח, גזל ועבודה זרה. חז"ל רואים בחוקים אלו בסיס לערכים מוסריים שהיו קיימים גם לפני מתן תורה.

חז"ל קושרים את הערכים הללו למתן תורה בכך שהם רואים את התורה כהמשך והרחבה של הערכים המוסריים שהיו קיימים, ומדגישים שהמוסריות לא התחילה עם מתן תורה אלא הייתה קיימת כבר קודם לכן, והייתה הכנה לקראת קבלת התורה.
```


#### Graph answer

```
ערכים מוסריים לפני מתן תורה מופיעים במספר מקומות בתנ"ך, והם מקושרים על ידי חז"ל למוסריות ולתודעה הדתית של עם ישראל. לדוגמה, ניתן למצוא את הערכים המוסריים בסיפורים כמו סיפור אברהם ושרה, שבו יש דגש על הכנסת אורחים, צדקה וחסד, וכן בסיפורים על יוסף ואחיו, שבהם יש מוסר השכל על סליחה ורחמים.

חז"ל מדגישים את החשיבות של הערכים הללו כהכנה למתן תורה, ומבינים כי הם היוו בסיס מוסרי שדרכו עם ישראל יוכל לקבל את התורה. לדוגמה, המדרש מציין כי אבות האומה חינכו את בני ישראל לערכים מוסריים, וכך הם היו מוכנים לקבל את התורה ולהיות עם סגולה.

לסיכום, הערכים המוסריים לפני מתן תורה הם חלק מהותי מההכנה הרוחנית והחברתית של עם ישראל, והם מקושרים על ידי חז"ל לתהליך קבלת התורה ולתודעה הדתית של העם.
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
שתיקת אהרן אחרי מות בניו נדונה במספר מקורות, כאשר ישנן קריאות שונות למצב זה. 

1. **הבנה של שתיקה כצער**: יש המפרשים את שתיקתו של אהרן כהבעה של צער עמוק על מות בניו, מה שמצביע על הכאב והאובדן שהוא חווה. המדרשים מציעים כי אהרן לא היה יכול לדבר מתוך הכאב, ובכך הוא משקף את עוצמת האבל שלו.

2. **הבנה של שתיקה כהבנה**: יש המציעים כי שתיקתו של אהרן נובעת מהבנה עמוקה של מקומו ושל תפקידו, כמו גם הכרה בכך שהכל מגיע מהקב"ה. במובן זה, שתיקתו יכולה להתפרש כהסכמה עם גזר הדין האלוהי.

3. **הקשר עם המנהיגות**: יש המצביעים על כך ששתיקתו של אהרן יכולה לשקף את המורכבות של תפקידו כמנהיג וככוהן גדול, שבו הוא נדרש לשמור על איזון בין רגשותיו האישיים לבין חובותיו הציבוריות.

לסיכום, שתיקת אהרן אחרי מות בניו נתפסת כמצב מורכב, המשלב כאב אישי עם הבנה רוחנית ותפקיד ציבורי.
```


#### Graph answer

```
שתיקת אהרן אחרי מות בניו, נדונה במספר מקורות עם קריאות שונות. אחד ההסברים מציע כי אהרן, כמי שנמצא במעמד גבוה, הבין את גודל המצב והעדיף לשתוק, מה שמצביע על ענווה והבנה של מקומו. יש המפרשים את שתיקתו כהבעת כאב עמוק, שאינו זקוק למילים.

בנוסף, יש המצביעים על כך ששתיקתו יכולה להעיד על קבלת הדין האלוהי, דבר הממחיש את עוצמת האמונה שלו. קריאה נוספת רואה בשתיקתו סימן לכך שהוא הכיר במעלת בניו, שהיו צדיקים גמורים, והבין את משמעות המקרה.

לסיכום, שתיקת אהרן יכולה להתפרש כתגובה של ענווה, כאב, קבלת דין או הכרה במעלת בניו, וכל אחת מהקריאות הללו מציעה הבנה שונה של המצב הרגשי והמוסרי שבו היה נתון אהרן [ויקרא י:ג].
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
בתנ"ך ישנם מספר מקומות שבהם ניתן לראות פער בין כוונה למעשה, ואחד מהם הוא בפרשת "שמות" כאשר אהרון והחרטומים מציגים את מכות מצרים. בפרק ז', פסוק 22, נאמר כי החרטומים הצליחו לחקות את המכה הראשונה (הדם) בעזרת כישוף, אך כאשר הגיעו למכות נוספות, הם לא הצליחו להקטין את המכה אלא רק להוסיף עליה. כאן ניתן לראות פער בין הכוונה של החרטומים (להוכיח את כוחם) לבין המעשה (שלא מצליחים להקטין את המכה) [אבן עזרא על שמות ז:כ].

הפרשנים מתייחסים לכך בהקשרים שונים. אבן עזרא מציין כי פרעה הבחין בהבדל בין מעשה אהרון לבין מעשה החרטומים, מה שמצביע על כך שהחרטומים לא הצליחו להוכיח את כוחם באופן שווה [אבן עזרא על שמות ז:כ]. 

בנוסף, ישנה מחלוקת בין ר' עקיבא ור' יהודה בן בתירא לגבי הכלים שבהם יש להשתמש לפרש את התורה, מה שמצביע על פער בין הכוונה של הפרשן לבין המעשה של הפירוש עצמו [קרתי בכל לב]. 

פערים כאלה בתנ"ך ובפרשנויותיהם משקפים את המתח בין כוונות שונות לבין התוצאות המעשיות של המעשים.
```


#### Graph answer

```
בתנ"ך ישנם מספר מקומות שבהם ניתן לראות פער בין כוונה למעשה, אחד מהם הוא הסיפור על משה ואהרון במצרים. כאשר אהרון מטיל את המטה שלו לארץ והופך לנחש, החרטומים של פרעה מצליחים לחקות את המעשה, אך ההבדל הוא במים מועטים שראתה פרעה, מה שמצביע על כך שהמעשה של אהרון היה בעל משמעות רוחנית גבוהה יותר מאשר המעשה של החרטומים, שעסקו בחיקוי בלבד. כאן, הפרשן אבן עזרא מציין את הפער בין המעשה של אהרון לבין מעשה החרטומים, מה שמדגיש את הכוונה האמיתית מאחורי המעשה של אהרון ([אבן עזרא על שמות ז:ב]).

בנוסף, ישנה מחלוקת בין רבי עקיבא לרבי יהודה בן בתירא לגבי הכלים שבהם יש להשתמש לפרש את התורה. רבי עקיבא טוען שיש להשתמש בכלים מדעיים ומדויקים, בעוד שרבי יהודה בן בתירא טוען שיש מקום גם לכלים אומנותיים וספקולטיביים, מה שמצביע על פער בין הכוונה של הפרשן לבין המעשה של הפירוש ([Karati Bekhol Lev]).

פערים אלו מצביעים על המורכבות שבפרשנות טקסטים מקראיים, כאשר הכוונה של הדמויות והמעשה בפועל עשויים להיות שונים, והפרשנים מתמודדים עם הפערים הללו בדרכים שונות.
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
בתנ"ך מצווים על אהבת הגר במקומות שונים, במיוחד בספר דברים ובספר ויקרא. אחד הפסוקים המרכזיים הוא מדברים י:יט: "ואהבתם את הגר". בנוסף, יש פסוק נוסף בויקרא י"ט:יח: "ואהבת לרעך כמוך", שמדגיש את עקרון האהבה גם כלפי אחרים, כולל הגר.

בפרשנות, כמו אצל רבינו בחיי, ישנה הדגשה על כך שהאהבה לגר נובעת מההבנה שהעם היהודי היה גר בארץ מצרים, ולכן יש חובה לאהוב את הגר מתוך הזדהות עם מצבו. אור החיים מוסיף כי אהבה זו היא חלק מהותי מהתנהגות מוסרית ואלטרואיסטית, שמייחדת את היהדות.

הציווי לאהוב את הגר נחשב לאתיקה של אהבה, שמדגישה את החשיבות של יחס טוב לזולת, כפי שמוזכר גם במקורות נוספים על אהבת ה' ואהבת הזולת [דברים י:יט; ויקרא י"ט:יח].
```


#### Graph answer

```
בתנ"ך מצווים על אהבת הגר במקומות שונים, במיוחד בספר דברים ובספר ויקרא. אחד הפסוקים המפורסמים הוא בדברים י:יט: "ואהבתם את הגר, כי גרים הייתם בארץ מצרים". פסוק זה מדגיש את הצורך לאהוב את הגר מתוך חוויה אישית של העם היהודי כגרים במצרים.

פרשנויות שונות מדגישות את המוסריות שבאהבה זו. למשל, רבינו בחיי מפרש את הציווי לאהוב את הגר כהמשך של אהבת הזולת, כפי שנאמר גם בוויקרא י"ט:יח: "ואהבת לרעך כמוך" (מקור: [דברים י:יט], [ויקרא י"ט:יח]). הוא רואה בכך חובת מוסר שמתחייבת מההיסטוריה של העם היהודי.

הפרשן אור החיים מוסיף כי אהבה זו נובעת מהבנה עמוקה של הקשר בין בני אדם, ומדגיש את הצורך לאהוב את הגר כפי שאנו אוהבים את עצמנו, דבר המצביע על אתיקה של אהבה אלטרואיסטית ([אור החיים, במדבר כ':יג]).

באופן כללי, ניתן לראות שהאהבה לגר מהווה חלק מהאתיקה המוסרית של התורה, שמדגישה את החשיבות של יחס טוב לזולת, במיוחד לאלו שנמצאים במצב של פגיעות ([Covenant and Conversation, Eikev]).
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
| Questions with different context-pool ref lists (ordered keys) | 3 |
| Questions that gained ≥1 new source in graph context pool | 1 |
| Questions with added commentary-looking ref or graph neighbor | 0 |
| Questions where graph signals showed link/topic cohesion in pool | 0 |
| Questions labeled *no clear change* | 11 |
| Questions labeled *possible degradation* | 0 |
| Questions labeled *likely improved* | 1 |

### Run again

```bash
npm --workspace packages/worker run eval:graph-augment
```

Output path: `./eval/my_report_post_fix3.md`
