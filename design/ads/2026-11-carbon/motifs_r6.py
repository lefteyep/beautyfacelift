# Round 6: ten ad formats taken from the Pinterest research (ROUND6-PLAN.md). Text in the image, facts only from the
# campaign record. Reviews are verbatim Treatwell reviews from src/pages/lp/carbon-microneedling/_reviews.ts.
import os
from motifs_r4 import PORTRAIT, MASKE, PEN, RULES, RAW

HAUTANALYSE = os.path.join(RAW, 'hautanalyse_20261105_1.png')
RUHE = os.path.join(RAW, 'ruhe_20261105_1.png')
STRIKE = "with \"CHF 250\" struck through by a thin red line"

MOTIFS = {
 'problem-loesung': ([MASKE],
  "Design a high-converting Instagram feed ad (portrait 4:5) in the popular 'problem vs. solution' split format. Left half: cool light "
  "grey, slightly muted. Right half: warm blush pink, bright and inviting. A thin vertical divider in the middle. Standing in the right "
  "half, overlapping the divider a little, a tall rounded photo card with a realistic photo of the treatment from image 1 (a woman "
  "reclining with closed eyes, half her face in matte black carbon lotion, a gloved hand with a brush), with a soft shadow.\n\n" + RULES +
  "Text, clean bold sans-serif:\n"
  "- left header, dark grey: \"Getrennt gebucht\"\n"
  "- three small grey pills on the left, each with a small red cross icon: \"Zwei Termine\", \"Zweimal anreisen\", \"Unsicher, was passt\"\n"
  "- right header, dark cocoa: \"Die Kombi\"\n"
  "- three small white pills on the right, each with a small green check icon: \"Eine Sitzung, 90 Min.\", \"Hautanalyse vorher\", "
  "\"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- bottom, centred: \"Carbon-Peeling + Microneedling · Bahnhofstrasse 94, Zürich\"\n"
  "- a dark cocoa button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: lasers, needles, before/after, sad faces, clutter."),
 'toggles': ([MASKE],
  "Design a clean, modern Instagram feed ad (portrait 4:5) on a warm sand-beige background, inspired by phone settings screens. Top "
  "third: a realistic close-up photo, softly cut out, of a gloved hand holding a flat brush loaded with matte black carbon lotion, in the "
  "style of image 1, with a soft shadow. Below it, a neat vertical list of seven rows, each with a rounded switch on the left that is "
  "switched ON (green) and a label.\n\n" + RULES + "Text, rounded bold sans-serif, dark cocoa:\n"
  "- headline above the list: \"Alles in einer Sitzung\"\n"
  "- the seven labels, in this order: \"Reinigung\", \"Fruchtsäure-Peeling\", \"Diamantabrasion\", \"Carbon-Peeling\", \"Microneedling\", "
  "\"Maske\", \"LED-Licht\"\n"
  "- under the list: \"90 Min. · CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a dark cocoa pill button with white text: \"Jetzt Termin buchen\"\n"
  "- very small at the bottom: \"Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: phone frames, status bars, app logos, lasers, needles, before/after."),
 'reviews': ([PORTRAIT],
  "Design an Instagram feed ad (portrait 4:5) in the 'floating reviews' format: a vivid cobalt-blue background with soft light. In the "
  "middle, the woman from image 1 as a clean cutout from the waist up, exactly as in the photo: same face, same real age, warm smile, red "
  "lipstick, long blond hair, white short-sleeved tunic; remove the name tag and the background. Around her float four white review cards "
  "with rounded corners, soft shadows and slight tilts, each with five small yellow stars, a small grey initial avatar, the name in bold and "
  "the quote.\n\n" + RULES + "Text:\n"
  "- top headline, white elegant serif: \"Echte Kundenerfahrungen\"\n"
  "- card 1, name \"Rahel\", quote: \"Teresa ist sehr freundlich und zuvorkommend und arbeitet absolut professionell.\"\n"
  "- card 2, name \"Yilmaz\", quote: \"Es war eine gute Entscheidung dorthin zu gehen.\"\n"
  "- card 3, name \"Denise\", quote: \"Sehr kompetente Beratung und Behandlung!\"\n"
  "- card 4, name \"Patricia\", quote: \"Sehr professionell, freundlich, sauber.\"\n"
  "- under the cards, white: \"4,8 ★ aus 260+ Bewertungen auf Treatwell\"\n"
  "- bottom, white: \"Carbon-Peeling + Microneedling · CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a yellow button with dark text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: any other names or quotes, platform logos, lasers, needles, before/after."),
 'chat-faq': ([PORTRAIT],
  "Design an Instagram feed ad (portrait 4:5) that looks like a friendly chat, used as an FAQ: a soft blush-to-cream background, chat "
  "bubbles with rounded corners. Questions on the left in light grey bubbles; answers on the right in warm clay-brown bubbles with white "
  "text, each answer with a tiny round avatar of the woman from image 1 (her face only, same face and real age). No phone frame, no app "
  "name, no logos.\n\n" + RULES + "Text, clean sans-serif:\n"
  "- small header at the top: \"Häufige Fragen\"\n"
  "- question bubble: \"Tut Microneedling weh?\"\n"
  "- answer bubble: \"Viele empfinden das Microneedling als leichtes Piksen, Druckgefühl oder Wärme. Die Intensität wird kontrolliert und "
  "individuell angepasst.\"\n"
  "- question bubble: \"Und wie lange dauert es?\"\n"
  "- answer bubble: \"90 Minuten. Carbon-Peeling und Microneedling in einer Sitzung.\"\n"
  "- a white price card under the chat: \"CHF 175\" large and \"statt CHF 250\" small " + STRIKE + "\n"
  "- a clay-brown button with white text: \"Jetzt Termin buchen\"\n"
  "- very small at the bottom: \"Beauty Face Lift · Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: read receipts, time stamps, app names, lasers, needles, before/after."),
 'ab-choice': ([MASKE],
  "Design an Instagram feed ad (portrait 4:5) in the 'Would you rather?' A-or-B format: a light sky-blue background, a thin vertical "
  "line splitting it into two columns. Left column A: two small glossy 3D calendar pages side by side. Right column B: one glossy 3D "
  "calendar page with a small realistic photo of the treatment from image 1 (a woman reclining with closed eyes, black carbon lotion on "
  "half her face) pinned to it. At the bottom of each column a big round dark-navy badge with a white letter.\n\n" + RULES +
  "Text, bold rounded sans-serif, dark navy:\n"
  "- top headline: \"Was ist Ihnen lieber?\"\n"
  "- under column A: \"Zwei Termine\"\n"
  "- under column B: \"Beides in 90 Minuten\" and below it \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- the badges: \"A\" and \"B\"\n"
  "- small, bottom: \"Carbon-Peeling + Microneedling · Bahnhofstrasse 94, Zürich\"\n"
  "- a dark-navy button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: dates or numbers on the calendars, lasers, needles, before/after."),
 'pov-caption': ([MASKE],
  "Design a native, creator-style Instagram feed ad (portrait 4:5): a full-bleed, realistic, slightly candid photo in the style of image 1 "
  "(a woman reclining with closed eyes and a relaxed face, half her face in matte black carbon lotion, a gloved hand with a brush, warm "
  "window light), looking like a real phone photo. Over the upper part of the photo, a bold caption in the style of social-video "
  "subtitles: heavy white sans-serif with a thin black outline, centred, three or four short lines.\n\n" + RULES + "Text:\n"
  "- caption: \"POV: Sie müssen sich nicht zwischen Carbon-Peeling und Microneedling entscheiden.\"\n"
  "- a small rounded white sticker, lower part: \"Beides · 90 Min. · CHF 175\" and below it smaller \"statt CHF 250\" " + STRIKE + "\n"
  "- a small black pill button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: emojis, app logos, like counts, lasers, needles, before/after."),
 'hand-hero': ([PEN],
  "Design a minimal, premium Instagram feed ad (portrait 4:5) in the 'hero product in hand' style: a warm beige background with soft "
  "daylight. From the bottom, a hand in a white nitrile glove holds the microneedling pen from image 1 upright like a precious product "
  "(brushed silver-grey metal, fine knurled ring, small transparent cartridge, no needles visible), sharp and realistic. Around the pen, "
  "six thin-outlined pills, three on each side.\n\n" + RULES + "Text:\n"
  "- headline at the top, elegant serif, dark cocoa: \"Auf Ihre Haut abgestimmt.\"\n"
  "- under it, sans-serif: \"Carbon-Peeling + Microneedling · 90 Min.\"\n"
  "- left pills: \"Hautanalyse vorher\", \"Carbon-Peeling\", \"Diamantabrasion\"\n"
  "- right pills: \"Microneedling\", \"Tiefe passend zum Hauttyp\", \"Maske + LED-Licht\"\n"
  "- bottom: \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a dark cocoa button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: lettering on the pen, visible needles, lasers, light beams, before/after."),
 'puzzle-3d': ([],
  "Design a bold, scroll-stopping Instagram feed ad (portrait 4:5) built on a visual metaphor: a vivid cobalt-blue background with soft "
  "studio light. In the middle, two large glossy 3D puzzle pieces snapping together in mid-air with a few motion lines: one piece matte "
  "charcoal black with a fine carbon texture, the other pearl-rose with a delicate pattern of tiny dots. A soft shadow below.\n\n" + RULES +
  "Text, heavy white sans-serif:\n"
  "- big headline at the top: \"Passt zusammen.\"\n"
  "- under it: \"Carbon-Peeling + Microneedling in einer Sitzung\"\n"
  "- a round sunshine-yellow price sticker, tilted: \"CHF 175\" big and \"statt CHF 250\" small " + STRIKE + "\n"
  "- a white button with cobalt text: \"Jetzt Termin buchen\"\n"
  "- small, bottom: \"90 Min. · Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: people, needles, lasers, medical symbols."),
 'orbit': ([MASKE],
  "Design a premium Instagram feed ad (portrait 4:5) in the 'everything in one' orbit format: a deep forest-teal background with a soft "
  "radial glow. In the centre, a tall rounded photo of the treatment from image 1 (a woman reclining with closed eyes, half her face in "
  "matte black carbon lotion, a gloved hand with a brush). Around it, seven small frosted-glass chips with tiny white line icons, placed on "
  "an elegant ellipse.\n\n" + RULES + "Text, clean white sans-serif:\n"
  "- top headline: \"1 Termin. 7 Schritte.\"\n"
  "- under it, smaller: \"Carbon-Peeling + Microneedling\"\n"
  "- the seven chips, clockwise from the top: \"Reinigung\", \"Fruchtsäure-Peeling\", \"Diamantabrasion\", \"Carbon-Peeling\", "
  "\"Microneedling\", \"Maske\", \"LED-Licht\"\n"
  "- a frosted price chip under the photo: \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a frosted-glass button: \"Jetzt Termin buchen\"\n"
  "- small, bottom: \"90 Min. · Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: lasers, light beams, needles, before/after."),
 'storyboard': ([HAUTANALYSE, MASKE, PEN, RUHE],
  "Design an Instagram feed ad (portrait 4:5) as a clean storyboard: a warm ivory background, a 2 x 2 grid of four realistic photos with "
  "thin white borders and soft shadows, each with a small numbered circle in the corner. Photo 1 in the style of image 1 (the practitioner, "
  "same woman as in image 1, looks closely at the client's skin). Photo 2 in the style of image 2 (black carbon lotion being brushed on). "
  "Photo 3 in the style of image 3 (a gloved hand with a silver-grey microneedling pen resting on a cheek, no needles visible). Photo 4 in "
  "the style of image 4 (the client resting calmly with closed eyes). Keep every face realistic and every person the same as in the "
  "images.\n\n" + RULES + "Text:\n"
  "- headline above the grid, elegant dark-cocoa serif: \"Ihre 90 Minuten\"\n"
  "- the numbers in the circles: \"1\", \"2\", \"3\", \"4\"\n"
  "- one short caption under each photo: \"Hautanalyse\", \"Carbon-Peeling\", \"Microneedling\", \"Maske und LED-Licht\"\n"
  "- under the grid: \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a dark cocoa button with white text: \"Jetzt Termin buchen\"\n"
  "- small, bottom: \"Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: lasers, light beams, needles, before/after, clutter."),
}
