# Round 7: five new styles from Pinterest research in the user's logged-in Chrome (ROUND7-PLAN.md), three ads each.
# Text in the image; facts only from the campaign record (ROUND7-PLAN.md, «Rules»). Reviews verbatim and complete from
# src/pages/lp/carbon-microneedling/_reviews.ts. No date in the image (the end date may move).
import os
from motifs_r4 import PORTRAIT, MASKE, PEN, RULES, RAW

STILL = os.path.join(RAW, 'stillleben-v2_20261031_1.png')          # treatment table, no people
HAUTANALYSE = os.path.join(RAW, 'hautanalyse_20261105_1.png')      # Teresa (generated, consented) looks at the client's skin
RUHE = os.path.join(RAW, 'ruhe_20261105_1.png')                    # the fictional client, calm, no device

STRIKE = 'with "CHF 250" struck through by a thin red line'
TERESA = ("the woman from image {n} exactly as in the photo: same face, same real age, warm smile, red lipstick, long blond "
          "hair, white short-sleeved tunic; remove the name tag")
MASKE_PHOTO = ("a realistic photo of the treatment in the style of image {n}: a woman reclining with closed eyes, half her face "
               "in matte black carbon lotion, a gloved hand holding a flat brush, natural skin with visible pores")
PEN_PHOTO = ("a realistic photo in the style of image {n}: a gloved hand holding a brushed silver-grey microneedling pen with a "
             "transparent cartridge resting lightly on a cheek, no needles visible, natural skin")
AVOID = ("\n\nAvoid: lasers, light beams, visible needles, blood, redness, before/after, skin problems, sad faces, dates, any "
         "other words, logos, watermarks, Swiss crosses or flags.")

MOTIFS = {
 # ---- Style 1 · Knockout: the photo lives inside giant letters or digits -------------------------------------------
 'knockout-175': ([MASKE],
  "Design a bold editorial Instagram feed ad (portrait 4:5) in the 'photo inside letters' style. Background: warm ivory with "
  "a very subtle paper grain and a thin black hairline frame close to the edge. Hero: the number \"175\" in an ultra-heavy "
  "condensed sans-serif, filling almost the whole width in the middle of the canvas; the three digits are knocked out and "
  "filled with " + MASKE_PHOTO.format(n=1) + ", so the photo is visible only inside the digits, the face and the brush placed "
  "in the \"7\" and the \"5\"; outside the digits the ivory stays clean.\n\n" + RULES + "Text:\n"
  "- small, above the number on the left: \"CHF\"\n"
  "- small, right after the number: \".–\"\n"
  "- under the number, right-aligned: \"statt CHF 250.–\" " + STRIKE + "\n"
  "- top left, elegant high-contrast serif, black: \"Carbon-Peeling + Microneedling\"\n"
  "- top right, small sans-serif: \"2 Behandlungen · 1 Sitzung · 90 Min.\"\n"
  "- bottom centre: a black button with ivory text \"Jetzt Termin buchen\"\n"
  "- very small at the bottom: \"Beauty Face Lift · Bahnhofstrasse 94, Zürich\"\n\n"
  "Hierarchy: the number dominates, everything else small and precise, generous white space." + AVOID),
 'knockout-carbon': ([MASKE, PEN],
  "Design a dramatic editorial Instagram feed ad (portrait 4:5) in the 'photo inside letters' style on a deep matte charcoal "
  "background with a faint carbon texture. Hero: the word \"CARBON\" in a huge, ultra-bold condensed sans-serif, one line, "
  "spanning the full width in the upper half; the letters are knocked out and filled with " + MASKE_PHOTO.format(n=1) +
  ", visible only inside the letters. In the lower part, a small rounded photo card with " + PEN_PHOTO.format(n=2) + ".\n\n" +
  RULES + "Text:\n"
  "- the hero word: \"CARBON\"\n"
  "- directly under it, ivory high-contrast serif: \"Carbon-Peeling + Microneedling\"\n"
  "- a thin ivory line: \"Zwei Behandlungen in einer Sitzung · 90 Min.\"\n"
  "- price, ivory: \"CHF 175.–\" large, next to it smaller \"statt CHF 250.–\" " + STRIKE + "\n"
  "- an ivory button with charcoal text: \"Jetzt Termin buchen\"\n"
  "- very small at the bottom: \"Bahnhofstrasse 94, Zürich\"\n\n"
  "Mood: luxury, high contrast, lots of dark space, the photo glowing warm inside the letters." + AVOID),
 'knockout-teresa': ([PORTRAIT, MASKE],
  "Design a refined editorial Instagram feed ad (portrait 4:5) in the 'portrait inside a letter' style. Background: warm "
  "ivory with a thin black hairline frame. Hero: one giant high-contrast serif capital letter \"B\" in black, centred, nearly "
  "the full height of the canvas; inside the letter, as a knockout, a realistic photo of " + TERESA.format(n=1) +
  ", head and shoulders, her face fully visible in the upper bowl of the \"B\"; one shoulder slightly overlaps the letter's "
  "edge like a cut-out. In the lower right corner, a small round photo window with " + MASKE_PHOTO.format(n=2) + ".\n\n" +
  RULES + "Text:\n"
  "- top left, serif: \"Beauty Face Lift\"\n"
  "- to the right of the letter, three small sans-serif lines: \"Persönlich von Teresa Stimac\", \"Dipl. Visagistin & "
  "Kosmetikerin\", \"Über 20 Jahre Erfahrung\"\n"
  "- below the letter: \"Carbon-Peeling + Microneedling\" and under it \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a black button with ivory text: \"Jetzt Termin buchen\"\n"
  "- very small at the bottom: \"Bahnhofstrasse 94, Zürich\"" + AVOID),

 # ---- Style 2 · Face map: hairline pointers label the steps on the photo --------------------------------------------
 'facemap-schritte': ([RUHE],
  "Design a clean, clinical-editorial Instagram feed ad (portrait 4:5) in the 'annotated face' style used by aesthetic "
  "clinics. Background: pale cool grey-blue with a faint fine grid. Centre: a large realistic three-quarter portrait of the "
  "same fictional woman as in image 1 (same face, eyes softly closed, calm, no lotion on the face, natural skin with visible "
  "pores, hair under a cream towel headband), from the shoulders up. Four thin dark hairline pointer lines start at small "
  "neutral dots on her face and lead to short labels at the left and right margins, each label in a small white rounded box: "
  "dot on the cheek → \"Carbon-Peeling\"; dot on the jaw → \"Microneedling\"; dot on the forehead → \"Maske + LED-Licht\"; "
  "dot on the other cheek → \"Fruchtsäure-Peeling + Diamantabrasion\". The dots are plain and neutral: no red marks, no "
  "problem zones, no numbers on the face.\n\n" + RULES + "Text:\n"
  "- headline at the top, dark navy grotesk: \"So läuft die Behandlung ab\"\n"
  "- small line under it: \"Carbon-Peeling + Microneedling · 90 Min.\"\n"
  "- the four labels listed above\n"
  "- bottom left: \"CHF 175\" large and \"statt CHF 250\" smaller " + STRIKE + "\n"
  "- bottom right: a dark navy button with white text \"Jetzt Termin buchen\"\n"
  "- very small: \"Bahnhofstrasse 94, Zürich\"" + AVOID),
 'facemap-hautanalyse': ([HAUTANALYSE],
  "Design a clean, clinical-editorial Instagram feed ad (portrait 4:5) in the 'annotated photo' style. Background: pale "
  "sand. A large rounded-corner photo in the style of image 1: the practitioner (the same woman as in image 1, same face and "
  "real age) looks closely at the skin of a reclining client with a cream headband; calm daylight, natural skin, no device. "
  "Three thin dark hairline pointers from small neutral dots in the photo lead to labels in a white side column: from the "
  "practitioner's eyes → \"Hautanalyse vorher\"; from the client's cheek → \"Tiefe passend zu Ihrem Hauttyp\"; from the "
  "practitioner's hand → \"Nachsorge-Hinweise\".\n\n" + RULES + "Text:\n"
  "- headline at the top, dark cocoa grotesk: \"Zum ersten Mal Microneedling?\"\n"
  "- small line under it: \"Carbon-Peeling + Microneedling in einer Sitzung · 90 Min.\"\n"
  "- the three labels listed above\n"
  "- bottom: \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a cocoa button with ivory text: \"Jetzt Termin buchen\"\n"
  "- very small: \"Beauty Face Lift · Bahnhofstrasse 94, Zürich\"" + AVOID),
 'facemap-flatlay': ([STILL],
  "Design a clean Instagram feed ad (portrait 4:5) in the 'annotated flat-lay' style. The whole canvas is a realistic "
  "top-down photo of the treatment table in the style of image 1: slightly wrinkled natural linen, a small matte black bowl "
  "with charcoal-black carbon lotion, a flat brush, the brushed silver-grey microneedling pen with its cap on, a folded cream "
  "towel, a frosted glass bottle, a brass tray; even soft daylight, calm empty linen at the top and the bottom. Three thin "
  "white hairline pointers with small white dots lead from the objects to small white labels: the bowl → \"Carbon-Lotion\"; "
  "the brush → \"Pinsel für das Carbon-Peeling\"; the pen → \"Microneedling-Pen\".\n\n" + RULES + "Text:\n"
  "- headline at the top, dark cocoa serif: \"Alles in einer Sitzung\"\n"
  "- small line under it: \"Reinigung · Fruchtsäure-Peeling · Diamantabrasion · Carbon-Peeling · Microneedling · Maske · "
  "LED-Licht\"\n"
  "- the three labels listed above\n"
  "- bottom left: \"CHF 175\" large, \"statt CHF 250\" smaller " + STRIKE + ", and \"90 Min.\"\n"
  "- bottom right: a cocoa button with ivory text \"Jetzt Termin buchen\"\n"
  "- very small: \"Bahnhofstrasse 94, Zürich\"" + AVOID),

 # ---- Style 3 · Colour block: one flat saturated colour, one huge hero object, chunky type ---------------------------
 'colorblock-pen': ([PEN],
  "Design a bold, modern Instagram feed ad (portrait 4:5) in the flat colour-block product style of premium skincare "
  "launches. Background: one flat, saturated terracotta orange, no gradient, no texture. Hero: the microneedling pen from "
  "image 1 (brushed silver-grey metal body, fine knurled ring, small transparent cartridge, smooth closed tip, no needles), "
  "rendered huge and photoreal, floating diagonally across the middle of the canvas, with one hard-edged offset drop shadow "
  "in a darker terracotta; the device shape stays exactly like image 1, no invented buttons, lights or displays.\n\n" + RULES +
  "Text, heavy black grotesk with tight leading:\n"
  "- top, two lines: \"Zwei Behandlungen.\" / \"Eine Sitzung.\"\n"
  "- under the pen, left: \"CHF 175.–\" huge in ivory; next to it smaller: \"statt CHF 250.–\" " + STRIKE + "\n"
  "- bottom left, small: \"Carbon-Peeling + Microneedling · 90 Min.\"\n"
  "- bottom right: a black pill button with ivory text \"Jetzt Termin buchen\"\n"
  "- very small: \"Bahnhofstrasse 94, Zürich\"" + AVOID),
 'colorblock-bowl': ([STILL],
  "Design a bold, modern Instagram feed ad (portrait 4:5) in the flat colour-block product style. Background: one flat sage "
  "green, no gradient, no texture. Hero: the small matte black ceramic bowl with charcoal-black carbon lotion and the flat "
  "brush resting on its rim, taken from image 1, isolated, huge, photoreal, seen slightly from above, with one hard-edged "
  "offset shadow in a darker sage; nothing else from the table.\n\n" + RULES + "Text, heavy black grotesk:\n"
  "- top, two lines: \"Carbon-Peeling\" / \"+ Microneedling\"\n"
  "- a round ivory badge with black text: \"90 Min.\"\n"
  "- \"CHF 175\" large in black, next to it smaller \"statt CHF 250\" " + STRIKE + "\n"
  "- small: \"Sie sparen CHF 75.–\"\n"
  "- a black pill button with ivory text: \"Jetzt Termin buchen\"\n"
  "- very small: \"Beauty Face Lift · Bahnhofstrasse 94, Zürich\"" + AVOID),
 'colorblock-teresa': ([PORTRAIT],
  "Design a bold, modern Instagram feed ad (portrait 4:5) in the flat colour-block style. Background: one flat lilac, no "
  "gradient, no texture. Hero: " + TERESA.format(n=1) + ", as a clean cut-out from the waist up, large, right of centre, "
  "slightly cropped by the right edge, with one hard-edged offset shadow in a darker lilac behind her.\n\n" + RULES +
  "Text, heavy black grotesk:\n"
  "- top left, three lines: \"Persönlich\" / \"von Teresa\" / \"Stimac\"\n"
  "- small under it: \"Dipl. Visagistin & Kosmetikerin · Über 20 Jahre Erfahrung\"\n"
  "- a white rounded label: \"4,8 ★ aus 260+ Bewertungen auf Treatwell\"\n"
  "- bottom: \"Carbon-Peeling + Microneedling\" and \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a black pill button with ivory text: \"Jetzt Termin buchen\"\n"
  "- very small: \"Bahnhofstrasse 94, Zürich\"" + AVOID),

 # ---- Style 4 · Bento: rounded tiles, each with one fact ------------------------------------------------------------
 'bento-angebot': ([MASKE, PEN],
  "Design a modern Instagram feed ad (portrait 4:5) as a bento grid: a warm sand background and a grid of rounded-corner "
  "tiles (radius about 28 px) with equal gaps and soft shadows, filling the canvas with even margins. Tiles: 1) a tall photo "
  "tile on the left, two rows high, with " + MASKE_PHOTO.format(n=1) + "; 2) top right: a cream tile with \"CHF 175\" very "
  "large in dark cocoa and under it \"statt CHF 250\" " + STRIKE + "; 3) under it: a dark cocoa tile with ivory text \"90 "
  "Min.\" large and \"2 Behandlungen · 1 Sitzung\" small; 4) bottom row: a square photo tile with " + PEN_PHOTO.format(n=2) +
  "; 5) next to it a wide cocoa button-tile with ivory text \"Jetzt Termin buchen\".\n\n" + RULES + "Text:\n"
  "- headline above the grid, dark cocoa serif: \"Carbon-Peeling + Microneedling\"\n"
  "- the tile texts listed above\n"
  "- very small under the grid: \"Beauty Face Lift · Bahnhofstrasse 94, Zürich\"" + AVOID),
 'bento-reviews': ([PEN, MASKE],
  "Design a modern Instagram feed ad (portrait 4:5) as a bento grid on a soft blush background: rounded-corner tiles "
  "(radius about 28 px), equal gaps, soft shadows. Tiles: 1) top left, wide: a white tile with five small gold stars and the "
  "text \"4,8 ★ aus 260+ Bewertungen auf Treatwell\"; 2) top right: a photo tile with " + PEN_PHOTO.format(n=1) + "; 3) "
  "middle row: two white review tiles side by side, each with five small gold stars, a name in bold and the quote: "
  "\"Patricia\" — \"Sehr professionell, freundlich, sauber.\" and \"Denise\" — \"Sehr kompetente Beratung und Behandlung!\"; "
  "4) bottom left: a photo tile with " + MASKE_PHOTO.format(n=2) + "; 5) bottom right: a dark cocoa tile with \"CHF 175\" "
  "large in ivory, \"statt CHF 250\" " + STRIKE + ", and a small ivory button shape inside with cocoa text \"Jetzt Termin "
  "buchen\".\n\n" + RULES + "Text:\n"
  "- headline above the grid, dark cocoa serif: \"Echte Kundenerfahrungen\"\n"
  "- the tile texts listed above, the two quotes word for word\n"
  "- very small under the grid: \"Carbon-Peeling + Microneedling · Bahnhofstrasse 94, Zürich\"\n\n"
  "No other names, quotes or star ratings." + AVOID),
 'bento-teresa': ([PORTRAIT, MASKE],
  "Design a modern Instagram feed ad (portrait 4:5) as a bento grid on a warm ivory background: rounded-corner tiles "
  "(radius about 28 px), equal gaps, soft shadows. Tiles: 1) a tall photo tile on the left, two rows high, with a realistic "
  "photo of " + TERESA.format(n=1) + ", as a photo with a soft studio background, not a cut-out; 2) top right: a dark cocoa "
  "tile with ivory text \"Teresa Stimac\" bold and \"Dipl. Visagistin & Kosmetikerin\" small; 3) under it: a cream tile "
  "with \"Über 20 Jahre Erfahrung\"; 4) bottom row: a photo tile with " + MASKE_PHOTO.format(n=2) + "; 5) a cream tile with "
  "\"CHF 175\" large and \"statt CHF 250\" " + STRIKE + "; 6) a wide cocoa button-tile with ivory text \"Jetzt Termin "
  "buchen\".\n\n" + RULES + "Text:\n"
  "- headline above the grid, dark cocoa serif: \"Persönlich behandelt\"\n"
  "- small line under it: \"Carbon-Peeling + Microneedling · 90 Min.\"\n"
  "- the tile texts listed above\n"
  "- very small under the grid: \"Bahnhofstrasse 94, Zürich\"" + AVOID),

 # ---- Style 5 · Sticker sheet: die-cut vinyl stickers peeled onto a full-bleed photo --------------------------------
 'sticker-angebot': ([MASKE],
  "Design a playful, scroll-stopping Instagram feed ad (portrait 4:5) in the die-cut sticker style: a full-bleed " +
  MASKE_PHOTO.format(n=1) + ", slightly brightened, with calm areas for the stickers. On top, glossy vinyl stickers with "
  "thick white die-cut borders, soft drop shadows and slight rotations, as if peeled onto the photo: 1) a big round cream "
  "sticker, top right, with black text \"CHF 175\" large and \"statt CHF 250\" small " + STRIKE + "; 2) a white pill "
  "sticker: \"90 Min.\"; 3) a yellow starburst sticker with black text: \"2 in 1\"; 4) a long black label sticker with "
  "white text: \"Carbon-Peeling + Microneedling\"; 5) a small white arrow sticker pointing from the price sticker to the "
  "face; 6) a black rounded button sticker at the bottom with white text: \"Jetzt Termin buchen\"; 7) a tiny white strip "
  "sticker: \"Bahnhofstrasse 94, Zürich\".\n\n" + RULES + "Text: only the seven sticker texts listed above." + AVOID),
 'sticker-ablauf': ([PEN],
  "Design a playful Instagram feed ad (portrait 4:5) in the die-cut sticker style: a full-bleed " + PEN_PHOTO.format(n=1) +
  ", slightly brightened. On top, glossy vinyl stickers with thick white die-cut borders, soft drop shadows and slight "
  "rotations: 1) a wide white label sticker at the top with black text: \"7 Schritte. 90 Minuten.\"; 2) a loose cluster of "
  "seven small pill stickers in alternating cream and black, each with its number: \"1 Reinigung\", \"2 Fruchtsäure-"
  "Peeling\", \"3 Diamantabrasion\", \"4 Carbon-Peeling\", \"5 Microneedling\", \"6 Maske\", \"7 LED-Licht\"; 3) a round "
  "cream sticker: \"CHF 175\" large and \"statt CHF 250\" small " + STRIKE + "; 4) a black rounded button sticker: \"Jetzt "
  "Termin buchen\"; 5) a tiny white strip sticker: \"Bahnhofstrasse 94, Zürich\".\n\n" + RULES +
  "Text: only the sticker texts listed above, the seven steps in that order." + AVOID),
 'sticker-reviews': ([RUHE],
  "Design a playful Instagram feed ad (portrait 4:5) in the die-cut sticker style: a full-bleed realistic photo of the same "
  "fictional woman as in image 1, relaxed and calm, natural skin, soft daylight, no device and no lotion, slightly "
  "brightened. On top, glossy vinyl stickers with thick white die-cut borders, soft drop shadows and slight rotations: 1) a "
  "white speech-bubble sticker with black text \"Sehr professionell, freundlich, sauber.\" and a small name \"Patricia\"; "
  "2) a second white speech-bubble sticker: \"Es war eine gute Entscheidung dorthin zu gehen.\" with the name \"Yilmaz\"; "
  "3) a wide yellow label sticker with black text: \"4,8 ★ aus 260+ Bewertungen auf Treatwell\"; 4) a round cream "
  "sticker: \"CHF 175\" large and \"statt CHF 250\" small " + STRIKE + "; 5) a black label sticker with white text: "
  "\"Carbon-Peeling + Microneedling\"; 6) a black rounded button sticker: \"Jetzt Termin buchen\"; 7) a tiny white strip "
  "sticker: \"Bahnhofstrasse 94, Zürich\".\n\n" + RULES +
  "Text: only the sticker texts listed above, the two quotes word for word. No other names, quotes or ratings." + AVOID),
}
