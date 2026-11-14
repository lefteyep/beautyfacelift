# Round 5: five more designed ads, text in the image. Facts only from the campaign record.
import os
from motifs_r4 import PORTRAIT, M7, MASKE, PEN, RULES

MOTIFS = {
 'swiss-poster': ([MASKE],
  "Design a striking Instagram feed ad (portrait 4:5) in the Swiss International Typographic Style, like a classic Zurich "
  "design poster reinterpreted for 2026: a strict modular grid, flat signal red, black and white, lots of white space, one "
  "bold asymmetric composition, no gradients, no decoration.\n\nHero: the number \"175\" set gigantic in a heavy neo-grotesk "
  "sans-serif (like Helvetica Bold), black, running off the left edge, with a small \"CHF\" above it and \".–\" after it. A flat "
  "red square block behind part of the number. A square, realistic photo of the treatment from image 1 (a woman reclining with "
  "closed eyes, half her face in matte black carbon lotion, a gloved hand with a brush) sits precisely on the grid, upper right.\n\n"
  + RULES + "Text, all in the same neo-grotesk family, flush left, ragged right:\n"
  "- headline: \"Carbon-Peeling + Microneedling\"\n"
  "- below it, three short lines: \"Zwei Behandlungen.\" \"Eine Sitzung.\" \"90 Minuten.\"\n"
  "- next to the number, small: \"statt CHF 250.–\" with \"CHF 250.–\" struck through\n"
  "- small, bottom left: \"Zürich, Bahnhofstrasse 94\"\n"
  "- a black rectangular button with white text, bottom right: \"Jetzt Termin buchen\"\n\n"
  "Avoid: flags, crosses, coats of arms, gradients, 3D effects, ornaments, lasers, needles, before/after."),
 'collage': ([PORTRAIT, MASKE, PEN],
  "Design an Instagram feed ad (portrait 4:5) as a trendy handmade paper collage, like a beauty creator's mood board: warm cream "
  "paper background with subtle texture, torn paper strips in blush, sand and black, pieces of washi tape, a few hand-drawn "
  "marker doodles (arrows, circles, small stars, a heart), slight shadows so every piece looks physically layered.\n\nPhotos as "
  "instant photos with white borders, slightly rotated and taped down: one large one of the woman from image 1, smiling, exactly "
  "as in the photo (same face, real age, red lipstick, long blond hair, white tunic; no name tag); one of the treatment from image "
  "2 (black carbon lotion being brushed on); one small one in the style of image 3 (a gloved hand with a silver-grey microneedling "
  "pen resting on a cheek, no needles visible).\n\n" + RULES + "Text:\n"
  "- big headline in bold black hand-cut paper letters: \"Carbon-Peeling + Microneedling\"\n"
  "- handwritten black marker note on a torn paper scrap: \"Zum ersten Mal Microneedling?\"\n"
  "- handwritten caption on the large photo's border: \"Teresa Stimac\"\n"
  "- a round blush price sticker: \"CHF 175\" big, \"statt CHF 250\" small with \"CHF 250\" struck through\n"
  "- a small paper label: \"90 Min. · Bahnhofstrasse 94, Zürich\"\n"
  "- a black pill-shaped button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: clutter that hides the faces, lasers, needles, before/after."),
 'clay-steps': ([PEN],
  "Design a playful, premium Instagram feed ad (portrait 4:5) in a soft 3D clay style (claymorphism), like a modern app launch: "
  "smooth matte clay shapes with soft studio light and gentle shadows on a warm peach-to-cream gradient stage.\n\nHero: a curved 3D "
  "clay path winding from top to bottom with seven round clay stepping stones. On each stone a cute, simple 3D clay icon: 1 a water "
  "drop, 2 a slice of citrus fruit, 3 a small diamond, 4 a small black bowl with a brush, 5 a silver-grey pen shaped like the one in "
  "image 1 (no needles), 6 a soft white face mask, 7 a small glowing round light. At the end of the path, a large glossy clay price "
  "bubble.\n\n" + RULES + "Text, rounded bold sans-serif, dark cocoa:\n"
  "- top headline: \"7 Schritte. 90 Minuten.\"\n"
  "- under it, smaller: \"Carbon-Peeling + Microneedling\"\n"
  "- one small label beside each stone, in this order: \"Reinigung\", \"Fruchtsäure-Peeling\", \"Diamantabrasion\", "
  "\"Carbon-Peeling\", \"Microneedling\", \"Maske\", \"LED-Licht\"\n"
  "- in the price bubble: \"CHF 175\" big and \"statt CHF 250\" small with \"CHF 250\" struck through\n"
  "- a clay button with white text: \"Jetzt Termin buchen\"\n"
  "- small, bottom: \"Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: lasers, light beams, visible needles, syringes, medical symbols, faces, before/after."),
 'carbon-brush': ([MASKE],
  "Design a minimalist luxury Instagram feed ad (portrait 4:5), art-directed like a high-end fragrance campaign: a warm ivory paper "
  "background with fine texture and lots of empty space. Across the middle runs one single, huge, expressive brush stroke of glossy "
  "matte-black carbon lotion, painted diagonally, with real bristle texture, dry-brush edges and a few fine splatters.\n\nPhoto: a "
  "small, round, realistic photo of the treatment from image 1 (a woman reclining with closed eyes, black carbon lotion on half her "
  "face, a gloved hand with a brush), sitting on the end of the stroke like a full stop.\n\n" + RULES + "Text:\n"
  "- on the black stroke, in large elegant ivory high-contrast serif: \"Carbon-Peeling\"\n"
  "- under the stroke, in the same serif, black: \"+ Microneedling\"\n"
  "- price, black serif, large: \"CHF 175.–\" and next to it small \"statt CHF 250.–\" with \"CHF 250.–\" struck through\n"
  "- a small line in spaced capitals, sans-serif: \"90 MIN. · BAHNHOFSTRASSE 94 · ZÜRICH\"\n"
  "- a thin black outlined button: \"Jetzt Termin buchen\"\n\n"
  "Avoid: any colour besides ivory, black and a touch of warm brown; lasers, needles, before/after, clutter."),
 'pop-art': ([MASKE, PEN],
  "Design a bold, scroll-stopping Instagram feed ad (portrait 4:5) in classic 1960s pop-art comic style: thick black outlines, "
  "Ben-Day halftone dots, flat bright colours (lemon yellow, hot pink, cyan, red), dynamic diagonal panel borders.\n\nPanels: "
  "panel 1, top left, a comic-style woman (fictional, drawn after image 1) relaxing with closed eyes, half her face covered in "
  "a black carbon mask, a gloved hand with a brush. Panel 2, top right, a comic close-up drawn after image 2: a gloved hand holding "
  "a silver-grey microneedling pen on a cheek, no needles visible. Below, a huge red-and-yellow explosion burst.\n\n" + RULES +
  "Text, comic lettering (bold, slightly italic hand-lettered caps):\n"
  "- speech bubble in panel 1: \"CARBON-PEELING?\"\n"
  "- speech bubble in panel 2: \"MICRONEEDLING?\"\n"
  "- in the burst, huge: \"BEIDES!\" and under it \"CHF 175\"\n"
  "- a small yellow caption box: \"statt CHF 250\" with \"CHF 250\" struck through\n"
  "- a small caption box: \"90 Min. · Bahnhofstrasse 94, Zürich\"\n"
  "- a black button with yellow text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: violence, sound-effect words other than the ones given, lasers, needles, before/after."),
}
