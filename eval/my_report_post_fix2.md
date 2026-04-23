# Graph-augmented retrieval evaluation

Generated: 2026-04-13T07:56:27.893Z

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
הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מופיע במספר מקורות. אחד מהם הוא במדרש, שבו נאמר כי ישראל קיבלו את התורה מתוך החושך, ולכן עליהם יזרח ה' (ישעיה ס', ב') [Ohel Ya'akov on Torah, Ref: ec91309b7f81308f:Vayikra/19/0]. 

בנוסף, יש המפרשים שהעולם נברא כדי לאפשר לישראל לקיים את התורה, ובכך להביא לתכליתו של העולם. לדוגמה, ב"משנת חכמים" נאמר כי כל מצווה נועדה להזכיר את חידוש העולם ואת תכליתו [Kli Yakar on Leviticus, Ref: e493f000f1fd5ef4:24/1/0].

הפרשנות לרעיון זה מדגישה את הקשר בין קיום התורה לבין קיום העולם, כלומר, העולם קיים בזכות התורה והעם ישראל, והם המטרה של הבריאה.
```


#### Graph answer

```
הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מופיע במספר מקורות. אחד המקורות הוא מדרש שמדבר על כך שהתורה ניתנה מתוך חשך, והאומות שלא קיבלו אותה חיות בחשך, בעוד שישראל, שקיבלו את התורה, זוכים לאור (ישעיה ס', ב') [Ohel Ya'akov on Torah, Ref: ec91309b7f81308f:Vayikra/19/0].

בנוסף, יש המפרשים שהעולם נברא כדי לאפשר לישראל לקיים את התורה, ובכך להביא אור לעולם. רעיון זה מתבטא גם במקורות כמו "אם לא בריתי יומם ולילה" (ירמיהו לג, כה), שמצביע על הקשר בין קיום התורה לבין קיום העולם [Paaneach Raza, Ref: 37526edd4a4cc76d:Lech%20Lecha/58].

לסיכום, הרעיון שהעולם נברא בשביל התורה או בשביל ישראל מתפרש כהדגשה על תפקידם המרכזי של ישראל בהבאת אור ותכלית לעולם, כאשר התורה היא הכלי המרכזי לכך.
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
הפסוק "נעשה אדם בצלמנו כדמותנו" (בראשית א:כו) עורר פרשנויות רבות בקרב מפרשים שונים. 

1. **רש"י** מציע שהכוונה היא שהאדם נברא בדמות אלוהית, כלומר הוא נושא בתוכו את המידות הרוחניות של האל, מה שמקנה לו את היכולת להתעלות רוחנית (כדמותנו).

2. **קאסוטו** מדגיש את הקשר בין האדם לבניו, כשהוא מציין שהאדם נברא בדמות אלוהים ולכן גם בניו נולדים בדמותו, מה שמצביע על המשכיות רוחנית (בדמות אלהים עשה אתו).

3. **הראב"ע** מציע שהאדם נברא מתוך שיתוף פעולה בין האל לארץ, כלומר יש בו גם את החומריות של הארץ וגם את הרוחניות של האל (כדמותנו).

4. **הרמב"ן** מסביר שהאדם נברא בצורה מיוחדת, כאילו היה מלאכת מחשבת, מה שמצביע על חשיבותו ועל מעלתו (נעשה אדם).

5. **החכם הרמב"ם** טוען שהאדם ניחן בהשגה שכלית שאין לה מקבילה בבריאה, מה שמדגיש את ייחודו (בצלם אלוהים).

6. **שד"ל** מציע שהאדם נבדל משאר בעלי החיים בכך שיש לו את הכוח לכל המידות והפעולות, מה שמצביע על פוטנציאל גדול (כדמותנו).

בכל הפרשנויות הללו, עולה הרעיון שהאדם נושא בתוכו את הדימוי האלוהי, מה שמקנה לו ייחודיות ומחייב אותו לשאוף להתעלות רוחנית.
```


#### Graph answer

```
המשמעות של "נעשה אדם בצלמנו כדמותנו" נידונה על ידי מספר פרשנים, וכל אחד מהם מציע כיוונים פרשניים שונים:

1. **רש"י**: הוא מפרש שהפסוק מצביע על כך שהאדם נברא בצלם ובדמות אלוהים, כלומר יש לו תכונות רוחניות שמבדילות אותו משאר הברואים. הוא מדגיש את חשיבות הענווה והיכולת של האדם להתעלות רוחנית.

2. **קאסוטו**: הוא מציין שהאדם נברא בדמות אלוהים כדי להדגיש את הקשר בין האדם לבניו, שממשיכים את הדמיון לאל. הוא רואה בכך הקדמה למה שיבוא לאחר מכן בתיאור הדורות.

3. **הרמב"ם**: הוא מדבר על ההשגה השכלית של האדם, שהיא ייחודית לו, ומדמה אותה להשגת האל. הוא טוען שהדמיון הוא במובן של השגה ולא במובן פיזי.

4. **הכתב והקבלה**: הוא מפרש את "כדמותנו" כהתדמות לאל, כלומר שהאדם צריך לשאוף להתעלות במידותיו הרוחניות, וכך יוכל להתקרב לאל.

5. **שד"ל**: הוא מציע שהאדם נבדל משאר בעלי החיים בכך שיש לו יכולת לכל המידות והפעולות, מה שמקנה לו מעמד מיוחד.

6. **הקב"ה והארץ**: הרמב"ן מציין שהאדם נברא בשיתוף פעולה עם הארץ, כלומר יש בו גם את החומריות וגם את הרוחניות.

כל הפרשנויות הללו מצביעות על הקשר העמוק בין האדם לאלוהים, ועל המורכבות של טבע האדם, המשלבת בין גוף לנשמה.
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
הדיון בקשיות הלב של פרעה מופיע בעיקר בספר שמות, בפרשות שונות, כאשר מתוארת ההתנהלות של פרעה מול משה והניסיונות לשחרר את בני ישראל. בפרט, יש התייחסות לכך שה' הכביד את לב פרעה, מה שמעורר שאלות על חופש הרצון והאחריות של פרעה על מעשיו (שמות פרק 7, פסוק 3; פרק 10, פסוק 1).

היחס בין בחירה להתערבות אלוהית הוא מורכב. מצד אחד, אם ה' הכביד את לב פרעה, עולה השאלה כיצד ניתן להעניש את פרעה על החלטות שלא התקבלו מתוך חופש רצון. מצד שני, יש המפרשים שה' לא נטל מפרעה את חופש הרצון, אלא חיזק את עמידתו על עקרונותיו, מה שמוביל לתוצאה של סירובו לשחרר את בני ישראל (Covenant and Conversation; Hebrew Edition, Ref: 5139e9501410a731:Vaera/2/0).

לסיכום, הדיון סביב קשיות הלב של פרעה נוגע לשאלות של חופש הרצון, אחריות מוסרית, והתערבות אלוהית, והוא נמשך לאורך הפרשות השונות בספר שמות.
```


#### Graph answer

```
דיון בקשיות הלב של פרעה מופיע בפרשות שמות וַיֵּשֶׁב וַעֲבוּדָה. בפרשות אלו מתואר כיצד אלוהים הכביד את לב פרעה, מה שמעלה שאלות על חופש הרצון והאחריות של פרעה. השאלה המרכזית היא האם פרעה פעל מתוך רצון חופשי או שההחלטות שלו היו תוצאה של התערבות אלוהית.

היחס בין בחירה להתערבות אלוהית הוא מורכב. מצד אחד, אם אלוהים הוא זה שהקשה את לב פרעה, אזי יש לשאול כיצד ניתן להעניש את פרעה על מעשיו, שכן הוא לא פעל מתוך רצון חופשי. מצד שני, יש המפרשים שהקשה זו לא נוגעת לבחירה החופשית של פרעה, אלא היא חלק מתהליך חינוכי או ניסי, שבו פרעה נדרש להתמודד עם ההשלכות של החלטותיו.

כפי שנאמר במקורות, "אם ה׳ הקשה את לב פרעה, כי אז ה׳ הוא שגרם לכך שפרעה יסרב לשלח את עם ישראל, לא פרעה עצמו" (Covenant and Conversation; Hebrew Edition, Ref: 5139e9501410a731:Vaera/2/0). זה מצביע על הדינמיקה בין חופש הרצון לבין התערבות אלוהית, ושואלת האם ניתן להטיל אחריות על פרעה במצב כזה.
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
בתנ"ך ישנם מספר מקורות העוסקים בתשובה, כאשר אחד המרכזיים הוא בספר יחזקאל, בפרק 18, פסוק 30: "הָשִׁיבוּ וְשִׁנוּ אֶת-דְּרָכֵיכֶן וְאֶת-מַעַלְלֵיכֶן". פסוק זה מדגיש את הצורך בשינוי התנהגותי ובחזרה בתשובה.

חז"ל והפרשנים מפרשים את המושג תשובה בדרכים שונות. למשל, הרמב"ם בספרו "משנה תורה" מדגיש את חשיבות הכוונה וההכרה בחטא כתנאים הכרחיים לתהליך התשובה. הוא מציין כי תשובה אמיתית כוללת חרטה, וידוי, וקבלה לעתיד לא לחטוא שוב.

הפרשנים כמו אבן עזרא וראב"ע מוסיפים כי תשובה היא לא רק חזרה על מעשים אלא גם שינוי פנימי, כלומר, שינוי בתודעה ובמניעי הפעולה של האדם.

לסיכום, המקורות בתנ"ך מדברים על תשובה כהזדמנות לשינוי, וחז"ל והפרשנים מפרשים את המושג בהקשרים של חרטה, הכרה בחטא, ושינוי פנימי.
```


#### Graph answer

```
בתנ"ך ישנם מספר מקורות המצביעים על רעיון התשובה, במיוחד בספרי הנביאים ובספרי התורה. לדוגמה, בספר יחזקאל (יחזקאל ל״ו:כ״ה-כ״ז) ישנה קריאה לשוב אל ה' ולקבל רוח חדשה. גם בספר תהילים (תהילים נ״א) מופיעה תפילת תשובה מפורסמת של דוד המלך.

חז"ל והפרשנים מפרשים את המושג תשובה בדרכים שונות. לדוגמה, המפרש רמב"ם מדגיש את החשיבות של חרטה על העבר, קבלה לעתיד ותיקון המעשים. גם המפרש אבן עזרא מתייחס לתשובה כאל תהליך פנימי של חזרה בתשובה, שבו האדם מתקן את דרכיו.

בפרשנות של המפרש מלבי"ם, הוא מדגיש את הצורך בתשובה כדרך לשוב למצב של קשר עם ה', תוך הדגשה על הכוונה והמעשה.

לסיכום, התשובה בתנ"ך נתפסת כתהליך של חזרה בתשובה, חרטה ותיקון, כאשר חז"ל והפרשנים מוסיפים על כך הבנות שונות שמדגישות את המימד הפנימי והמעשי של התהליך.
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
הדיון במשמעות של "לא בשמים היא" נמצא בדברים (דברים ל, יב). פסוק זה מתייחס לכך שהתורה אינה דבר מה בלתי נגיש או רחוק, אלא היא נגישה לכל אדם. השימוש בפסוק זה מדגיש את הרעיון שהאדם יכול להבין את התורה וליישם אותה בחייו, ואין צורך לחכות למישהו אחר שיביא את התורה מהשמים.

הפסוק משמש לעיתים קרובות כדי להדגיש את האחריות האישית של כל אדם ללמוד ולהבין את התורה בעצמו, ולא להסתמך על אחרים או על סמלים חיצוניים.
```


#### Graph answer

```
הדיון במשמעות של "לא בשמים היא" מופיע במקרא בספר דברים (דברים ל, יב). הפסוק מדגיש שהמצוות אינן מעבר להישג ידו של האדם, כלומר, הן נגישות וברות ביצוע. השימוש בפסוק זה נועד להדגיש את הרעיון שאין צורך לחכות להכוונה אלוהית נוספת או לחפש את התורה בשמים, אלא היא כבר ניתנה לנו כאן על פני האדמה.

הפסוק משמש לעיתים קרובות כדי להדגיש את האחריות האישית של כל אדם לקיים את המצוות ולפעול לפי ההנחיות שניתנו לו, מבלי להסתמך על גילויים ניסיים או חיצוניים.
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
מפרש את עקידת יצחק מנקודת מבט של ניסיון מול ציווי הוא רבי אברהם אבן עזרא. הוא מתאר את המתח בין הציווי האלוהי לבין הניסיון האישי של אברהם, שמציג את הקונפליקט בין הציווי לבצע את העקידה לבין אהבתו לבנו יצחק. 

אם יש לך שאלות נוספות או אם תרצה מידע נוסף על מפרשים אחרים, אני כאן לעזור!
```


#### Graph answer

```
מנקודת מבט של ניסיון מול ציווי, עקידת יצחק נתפסת כנסיון של אברהם, שבו הוא נדרש להקריב את בנו, אך יש המפרשים זאת גם כציווי אלוהי. אחד המפרשים הבולטים בהקשר זה הוא הרמב"ן, שמדגיש את המתח בין הציווי של ה' לבין הניסיון של אברהם, כאשר הוא מתמודד עם הדילמה המוסרית והרגשית של ההקרבה.

אם יש לך שאלות נוספות או אם תרצה להעמיק בנושא מסוים, אני כאן לעזור!
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
רעיון הרחמים במצוות מופיע במקומות שונים בתנ"ך, כאשר אחד מהבולטים הוא בפרשת חוקת, שם מתוארת התפרצות הזעם של משה על העם שדרש מים (במדבר כ, א–יג). הפרשנים מתמודדים עם הסיפור הזה בדרכים שונות, כשהם מדגישים את המתח בין החמלה לבין הצורך לשמור על סדר וחוקים.

לדוגמה, הפרשן דוד צבי הופמן מציין כי על הפרשן להתחשב בתנאים המיוחדים של המסורת היהודית, ולוודא שהבנתו לא תסתור הלכה מסורה (הופמן, ויקרא, הקדמה). הוא מדגיש את החשיבות של התורה שבעל פה בהבנת התורה שבכתב, וכיצד היא מספקת הקשר לפסוקים שאינם ברורים.

בנוסף, ישנם מדרשים המציעים קריאות שונות על פרשות המגע עם החלכאים והנדכאים, תוך הדגשת הצורך בחמלה ובצדק (קרתי בכל לב, ויקרא). יש המפרשים את הסיפור כהזהרה מפני הרחקת אנשים מתוך החברה, בעוד אחרים מדגישים את החשיבות של שמירה על גבולות ברורים.

באופן כללי, הפרשנים נוטים להדגיש את הצורך באיזון בין החוקים לבין הרחמים, ומבינים את המצוות לא רק כדרישות אלא גם כהזדמנות להראות חמלה ואנושיות.
```


#### Graph answer

```
רעיון הרחמים במצוות מופיע בתנ"ך במגוון מקומות, כאשר אחד מהבולטים שבהם הוא בפרשת חוקת, בה מתוארת התפרצות הזעם של משה על העם שדרש מים (במדבר כ, א–יג). הפרשנים עוסקים בשאלה כיצד ניתן להבין את תגובתו של משה, והאם יש מקום לרחמים גם כאשר מדובר בעונש חמור כמו מותו לפני הכניסה לארץ ישראל.

הפרשנים מציעים גישות שונות: יש המפרשים את המעשה כהתפרצות של זעם אנושי, בעוד אחרים מדגישים את הצורך לרחמים גם במצבים קשים. לדוגמה, יש המצביעים על כך שהחמלה והצדק הם יסודות חשובים בחיים החברתיים, וכי יש לשמור על איזון בין החוקים לבין הרחמים (מקורות: [בראשית א:א], [במדבר כ:א–יג]).

בנוסף, יש המייחסים חשיבות לרחמים גם במצוות עצמן, כאשר מצוות רבות נועדו להקל על מצוקות הפרט ולהדגיש את ערך החמלה והעזרה לזולת (מקורות: [שמות פרק 20], [ויקרא פרק 19]). 

באופן כללי, הפרשנים מדגישים את הצורך לשלב בין שמירה על החוק לבין הרחמים, ומבינים שהחוקים לא נועדו להיות נוקשים בלבד, אלא גם לשקף את ערכי החמלה והצדק.
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
חלומות משמעותיים בתנ"ך מופיעים בכמה מקומות בולטים, כאשר המפורסמים שבהם הם חלומותיו של יוסף, חלומותיו של פרעה, וחלום של יעקב.

1. **חלומות יוסף**: יוסף חולם שני חלומות, האחד על אלומות תבואה והשני על כוכבים, אשר מנבאים את עלייתו לדרגה גבוהה במצרים ואת השפעתו על משפחתו. יוסף מפרש את החלומות הללו כתחזיות על העתיד, דבר שמוביל אותו למעמד בכיר במצרים (בראשית פרק ל"ז ופרק מ"א).

2. **חלומות פרעה**: פרעה חולם על שבע פרות רזות ושבע פרות שמנות, וכן על שבע שיבולים רזות ושבע שיבולים מלאות. יוסף מפרש את החלומות כתחזית לשבע שנות שפע ולאחר מכן לשבע שנות רעב, מה שמוביל לתכנון מראש ולחיסכון (בראשית פרק מ"א).

3. **חלום יעקב**: יעקב חולם על סולם המגיע עד השמיים, עם מלאכים עולים ויורדים. החלום הזה מסמל את הקשר בין השמיים לארץ ואת הברית עם אלוהים (בראשית פרק כ"ח).

מפרשים שונים התייחסו לחלומות בתנ"ך, כאשר יש המפרשים אותם כתחזיות לעתיד, אחרים רואים בהם מסרים רוחניים או סימנים לשינויים בחיים. המסורת היהודית מדברת על כך שחלומות יכולים לשקף את מחשבות האדם, ולעיתים יש להם משמעות עמוקה יותר, כפי שנאמר במקורות חז"ל (מגילה י ע"ב). 

באופן כללי, חלומות בתנ"ך נחשבים לאמצעי תקשורת בין אלוהים לאנשים, ולעיתים הם נושאים מסרים חשובים או אזהרות.
```


#### Graph answer

```
חלומות משמעותיים בתנ"ך מופיעים בכמה מקומות בולטים, כאשר המפורסם שבהם הוא חלומותיו של יוסף. יוסף מפרש את חלומותיו של פרעה, הממחישים את השפע שיבוא בעקבות שבע שנות שובע ולאחר מכן את הרעב שיבוא בעקבותיהן (בראשית מ"א). חלומותיו של יוסף עצמם, הממחישים את עלייתו לגדולה, גם הם נחשבים לחלומות משמעותיים (בראשית ל"ז).

בנוגע לפרשנות חלומות, המסורת היהודית רואה בחלומות כלי לתקשורת עם האל. לדוגמה, חז"ל טוענים כי חלומות יכולים לשאת מסרים חשובים, ולעיתים אף נחשבים לאמצעי להכוונת האדם בחייו (מגילה י ע"ב). יש המפרשים חלומות כמשקפים את מחשבותיו ורצונותיו של החולם, בעוד אחרים רואים בהם סימנים או אזהרות מהאל.

לסיכום, חלומות בתנ"ך נחשבים לא רק לתופעה פסיכולוגית אלא גם לתופעה רוחנית, עם משמעות עמוקה המצריכה פרשנות זהירה.
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
- `Karati Bekhol Lev af25e1459a5766ab:Emor/1/16`
- `David Zvi Hoffmann on Leviticus 5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19`
- `Malbim on Job f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0`
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
- *Graph — original pool (pre-rerank):*
  - `Guide for the Perplexed, Part 1 61:4` score 0.5480
  - `128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` score 0.5466
  - `5139e9501410a731:Miketz/2/10` score 0.5366
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` score 0.5330
  - `af25e1459a5766ab:Emor/1/16` score 0.5293
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` score 0.5293
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` score 0.5291
  - `fa07892a8f40e0ba:Leviticus/15/7/3` score 0.5285
- *Graph — reranked (graph score / retrieval score):*
  - `Guide for the Perplexed, Part 1 61:4` graph 0.9400 / vec 0.5480
  - `128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` graph 0.9375 / vec 0.5466
  - `5139e9501410a731:Miketz/2/10` graph 0.9193 / vec 0.5366
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` graph 0.9127 / vec 0.5330
  - `af25e1459a5766ab:Emor/1/16` graph 0.9059 / vec 0.5293
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` graph 0.9059 / vec 0.5293
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` graph 0.9055 / vec 0.5291
  - `fa07892a8f40e0ba:Leviticus/15/7/3` graph 0.9045 / vec 0.5285
- *Graph — signals (per ref in pool before rerank):*
  - `Guide for the Perplexed, Part 1 61:4` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9400
  - `128562d9640bfb56:%3CEMPTY_KEY%3E/3/6/1` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9375
  - `5139e9501410a731:Miketz/2/10` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9193
  - `4592db48180a0bb2:From%20Noah%20to%20Abraham/%3CEMPTY_KEY%3E/5/8/94` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9127
  - `af25e1459a5766ab:Emor/1/16` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9059
  - `5a9ec949ebd7c295:%3CEMPTY_KEY%3E/25/2/19` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9059
  - `f8f25950ad5d8dbe:%3CEMPTY_KEY%3E/27/0/0` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9055
  - `fa07892a8f40e0ba:Leviticus/15/7/3` links 0, topics 0, commentaryBonus 0, weak 1, graphScore 0.9045

---

### Question 9

- **Query:** איפה מופיעים ערכים מוסריים לפני מתן תורה, ואיך חז״ל קושרים אותם?
- **Heuristic label:** *no clear change*
- **Why this label:** Retrieval pool and answers are largely similar; graph signals did not move heuristics past the neutral band.
- **Notes on differences:** (none)

#### Baseline answer

```
ערכים מוסריים לפני מתן תורה מופיעים במספר מקומות בתנ"ך, כמו במעשים של אבות האומה, שמגלים עקרונות של צדקה, חסד ויושר. לדוגמה, אברהם אבינו מתארח ומקבל את האורחים, מה שמדגיש את ערך הכנסת אורחים (בראשית יח:א-ח).

חז"ל קושרים את הערכים הללו למתן תורה בכך שהם רואים בהם הכנה לקיום המצוות שניתנות לעם ישראל. הם מדגישים שהערכים המוסריים הללו היו קיימים גם לפני מתן תורה, והם מהווים בסיס מוסרי למצוות שניתנות לאחר מכן. לדוגמה, המדרש מציין שהאבות קיימו מצוות גם ללא תורה, מה שמצביע על כך שהמוסר היה חלק מהותי מהזהות היהודית עוד לפני קבלת התורה (ספרא, פרשת קדושים). 

אם יש לך שאלות נוספות או נושאים ספציפיים שתרצה לחקור, אני כאן לעזור!
```


#### Graph answer

```
ערכים מוסריים לפני מתן תורה מופיעים במספר מקומות בתנ"ך, ובפרט ניתן לראותם אצל האבות, כמו אברהם, שגידל את בניו על ערכים של צדקה ומשפט (בראשית יח:י"ט). גם בבריתות שנעשו עם האומות השונות, כמו ברית אברהם עם אבימלך, ניתן למצוא יסודות מוסריים.

חז"ל קושרים את הערכים המוסריים הללו למתן תורה בכך שהם רואים את התורה כמשהו שמקנה ומחייב את הערכים הללו בצורה מסודרת ומחייבת. לדוגמה, המדרש מדגיש את החשיבות של ערכים כמו צדק וחסד, אשר היו קיימים לפני מתן תורה, אך קיבלו עוצמה והגדרה ברורה יותר עם קבלת התורה (כגון במדרשים על אברהם וערכיו).

בנוסף, יש המפרשים כי הערכים המוסריים שקדמו למתן תורה שימשו כבסיס לתורה עצמה, וכי התורה לא ניתנה במציאות ריקה אלא על רקע של ערכים מוסריים שהיו קיימים בעם ישראל ובסביבתו.
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
שתיקת אהרן אחרי מות בניו נדונה במספר מקורות, כאשר ישנן קריאות שונות המנסות להסביר את משמעותה. 

1. **הבנה של אהרן**: יש המפרשים ששתיקתו של אהרן נובעת מהבנה עמוקה של גדלות בניו, כפי שמובא בברכת אשר, שם נאמר שאהרן הכיר בכך שהם צדיקים גמורים, ולכן הוא שתק (Birkat Asher on Torah, Leviticus/9/2/1).

2. **הקשר למוסר**: יש המציעים כי שתיקתו משקפת את עקרון העדפת עקרונות רוחניים על פני עניינים חומריים, כלומר, אהרן לא רצה להטריד את דעתו בעניינים של העולם הזה (Penei David, Leviticus/Emor/7/2).

3. **ההתקבלות של דברי המתים**: ישנה גישה המצביעה על כך שדבריהם של מתים מתקבלים יותר מאשר דברי חיים, מה שמצביע על נצחיות הרעיונות שמובעים לאחר המוות (Karati Bekhol Lev, Vayechi/0/8).

לסיכום, שתיקת אהרן נתפסת כתגובה עמוקה ומורכבת למצבו, עם דגשים על הכרה בגדלות בניו, עקרונות מוסריים, ונצחיות הרעיונות.
```


#### Graph answer

```
שתיקת אהרן אחרי מות בניו נדונה במספר מקורות, כאשר ישנן קריאות שונות המנסות להסביר את משמעותה.

1. **הקשר בין אהרן לבניו**: יש המפרשים את שתיקתו של אהרן כתגובה לאירוע הקשה של מות בניו, כאשר הוא מבין את גודל המצב ואת עונש ה' על חטאיהם. המדרשים מציעים כי אהרן היה במצב של תודעה עמוקה לגבי מעשיהם של בניו, ולכן לא הגיב.

2. **ההבנה של גדלות**: יש המצביעים על כך שאהרן הכיר בגדלותם של בניו, כפי שמצוין במקורות שונים, מה שמוביל אותו לשתוק מתוך הכרה במעמדם הרוחני [Birkat Asher on Torah, Leviticus/9/2/1].

3. **ההתקבלות של דברי המתים**: ישנה גישה המצביעה על כך שדבריהם של מתים מקבלים משקל רב יותר לאחר מותם, מה שמצביע על נצחיות הרעיונות שהם השאירו אחריהם [Karati Bekhol Lev, Vayechi/0/8]. 

4. **העדר תגובה**: יש המפרשים את שתיקתו של אהרן כהעדר תגובה, מה שמעיד על עומק הכאב וההבנה שלו לגבי המצב, ולאו דווקא על חוסר אכפתיות או חוסר הבנה [Birkat Asher on Torah, Deuteronomy/31/49/1].

לסיכום, שתיקת אהרן אחרי מות בניו נחשבת לתגובה מורכבת, המשלבת כאב, הכרה בגדלותם של בניו והבנה של משמעות המצב הרוחני.
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
בתנ"ך ישנם מספר מקומות שבהם ניתן לראות פער בין כוונה למעשה, אחד מהם הוא בפרשת "שמות" כאשר אהרון והחרטומים מציגים את מכות מצרים. בפרק ז', פסוק 22, נאמר כי החרטומים הצליחו לחקות את המכה הראשונה, אך לא הצליחו להקטין את עוצמתה. כאן יש פער בין כוונתם של החרטומים (להוכיח את יכולותיהם) לבין המעשה בפועל (שלא הצליחו לחקות את המכה במלואה) [אבן עזרא על שמות 7:22].

פרשנים כמו אבן עזרא מציינים כי פרעה הבחין בהבדל בין מעשה אהרון לבין מעשה החרטומים, מה שמצביע על כך שהחרטומים לא הצליחו להוכיח את כוחם [אבן עזרא על שמות 7:22]. 

בנוסף, ישנה מחלוקת בין ר' עקיבא ור' יהודה בן בתירא לגבי הכלים שבהם יש להשתמש לפרש את התורה, מה שמעיד על פער בין הכוונה של הפרשן לבין הדרך שבה הוא מפרש את הטקסט [Karati Bekhol Lev]. 

פערים אלו מדגישים את הקושי בהבנת הכוונות מאחורי המעשים, ואת השפעתם על הפרשנות וההבנה של הטקסטים המקראיים.
```


#### Graph answer

```
בתנ"ך ישנם מספר מקומות שבהם ניתן לראות פער בין כוונה למעשה, ואחד מהם הוא בפרשת "שמות", כאשר אהרון והחרטומים מציגים את מכות מצרים. בפרק זה, אהרון מצליח להכות את המים ולהפכם לדם, בעוד שהחרטומים מצליחים לשחזר את המכה אך לא יכולים להקטין את הנזק שנגרם (שמות ז:22). כאן יש פער בין הכוונה של החרטומים להראות את כוחם לבין המעשה שהם מבצעים, שאינו מועיל.

הפרשנים מתייחסים לכך בדרכים שונות. למשל, אבן עזרא מציין שהחרטומים ניסו להוסיף על המכה, אך לא הצליחו לחסרה, מה שמצביע על חוסר יכולת אמיתית להפעיל כוח כמו זה של אהרון (אבן עזרא על שמות ז:22). 

כמו כן, רש"י מדגיש את ההבדל בין מעשה אהרון לבין מעשה החרטומים, מה שמצביע על כך שהמעשה של אהרון היה בעל משמעות רוחנית ואלוהית, בעוד שהחרטומים לא הצליחו לשחזר את הכוונה האמיתית של המכה (רש"י על שמות ז:22).

פער זה מדגיש את ההבדל בין כוונה למעשה, ומעורר שאלות על משמעות הכוח והיכולת של בני אדם לעומת הכוח האלוהי.
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
בתנ"ך מצווים על אהבת הגר במקומות שונים, במיוחד בספר דברים ובספר ויקרא. לדוגמה, בספר דברים (דברים י:יט) כתוב: "ואהבתם את הגר". כמו כן, בוויקרא (ויקרא י"ט:יח) מופיע הציווי "ואהבת לרעך כמוך", שמדגיש את עקרון האהבה כלפי הזולת, כולל הגר.

פרשנויות שונות מדגישות את החשיבות המוסרית של אהבת הגר. רבינו בחיי מציין כי אהבת הגר נובעת מההבנה שהעם היהודי היה גר בארץ מצרים, ולכן יש חובה לאהוב את הגר (Rabbeinu Bahya, Ref: 6f4658cddcc025b8:Devarim/9/17/1). אור החיים מוסיף כי אהבה זו היא חלק מהאתיקה היהודית, שמדברת על אהבה אלטרואיסטית (Or HaChaim on Numbers, Ref: 771e480a7bd1be4d:20/13/2).

הציווי לאהוב את הגר נחשב לאחד מהעקרונות המוסריים המרכזיים ביהדות, שמדגישים את הצורך להרגיש אמפתיה כלפי אחרים, במיוחד כלפי אלו שנמצאים במצב של פגיעות או חוסר ביטחון.
```


#### Graph answer

```
בתנ"ך מצווים על אהבת הגר במספר מקומות, במיוחד בספר דברים ובספר ויקרא. אחד הפסוקים המרכזיים הוא: "וְאָהַבְתָּ לְגָר" (דברים י:十九), שבו מצווה ה' את בני ישראל לאהוב את הגר. פסוק נוסף הוא "וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ" (ויקרא י"ט:יח), שמדגיש את עקרון האהבה כלפי הזולת, כולל הגר.

בפרשנות, כמו אצל רבינו בחיי, מדגישים את החשיבות של אהבת הגר כחלק מהחובה המוסרית של עם ישראל, שמבוססת על ההבנה שהיו גרים במצרים ושה' גאל אותם (רבינו בחיי, דברים 9:17). אור החיים מפרש את המילה "ואהבת" בהקשרים שונים, ומדגיש את משמעות האהבה כנתינה ודאגה לזולת (אור החיים, במדבר 20:13).

הפרשנויות הללו מדגישות את האתיקה של אהבה ויחס טוב כלפי אחרים, ובמיוחד כלפי הגר, כחלק מהערכים המרכזיים של התורה.
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
| Questions with different context-pool ref lists (ordered keys) | 0 |
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

Output path: `./eval/my_report_post_fix2.md`
