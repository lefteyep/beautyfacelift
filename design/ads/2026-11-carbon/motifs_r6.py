# Round 6: ten ad formats taken from the Pinterest research (ROUND6-PLAN.md), revised 2026-11-05 after the logged-in
# research session: every ad sits on the website's own palette (cream, shell, blush, copper-clay, cocoa, gold; charcoal
# and deep sage as the only other accents), a serif display headline over clean sans labels, one accent colour per ad,
# no tech-ad colours (cobalt, sky blue, sunshine yellow). Text in the image, facts only from the campaign record.
# Reviews are verbatim Treatwell reviews from src/pages/lp/carbon-microneedling/_reviews.ts.
import os
from motifs_r4 import PORTRAIT, MASKE, PEN, RULES, RAW

HAUTANALYSE = os.path.join(RAW, 'hautanalyse_20261105_1.png')
RUHE = os.path.join(RAW, 'ruhe_20261105_1.png')
STRIKE = "with \"CHF 250\" struck through by a thin red line"
PALETTE = ("Palette, taken from the studio's website: cream #FAF6F1, shell #F3EAE1, blush #EAD9CC, copper-clay #8F5A2E, light copper "
           "#D7AE84, cocoa #2A1E18, gold #B98F47. ")
TYPE = ("Typography: the headline in an elegant high-contrast serif (like Instrument Serif), everything else in a clean geometric "
        "sans-serif (like Instrument Sans); no italics, no script fonts, no outlined or neon lettering. ")
PHOTO_MASKE = ("a realistic photo of the treatment from image 1: a woman reclining with closed eyes and a relaxed face, half her face in "
               "matte black carbon lotion, a gloved hand with a flat brush, warm window light")

MOTIFS = {
 'problem-loesung': ([MASKE],
  "Design a high-converting Instagram feed ad (portrait 4:5) in the 'problem vs. solution' split format, art-directed like a premium "
  "skincare campaign. Left half: cool, flat light grey #E4E1DE, slightly muted. Right half: warm blush #EAD9CC with soft daylight, "
  "bright and inviting. A thin vertical divider in the middle. Standing in the right half and overlapping the divider a little, a tall "
  "rounded photo card with " + PHOTO_MASKE + ", with a soft shadow.\n\n" + PALETTE + TYPE + RULES + "Text:\n"
  "- big serif headline across the top, cocoa: \"Getrennt oder zusammen?\"\n"
  "- left column header, sans, dark grey: \"Getrennt gebucht\"\n"
  "- three small light-grey pills on the left, each with a small red cross icon: \"Zwei Termine\", \"Zweimal anreisen\", "
  "\"Unsicher, was passt\"\n"
  "- right column header, sans, cocoa: \"Die Kombi\"\n"
  "- three small white pills on the right, each with a small copper check icon: \"Eine Sitzung, 90 Min.\", \"Hautanalyse vorher\", "
  "\"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- bottom, centred, small: \"Carbon-Peeling + Microneedling · Bahnhofstrasse 94, Zürich\"\n"
  "- a copper-clay button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: lasers, needles, before/after, sad faces, clutter."),
 'toggles': ([MASKE],
  "Design a clean, modern Instagram feed ad (portrait 4:5) on a shell background #F3EAE1 with a faint warm paper grain, like a premium "
  "treatment menu. Top third: a realistic close-up photo, softly cut out, of a gloved hand holding a flat brush loaded with matte black "
  "carbon lotion, in the style of image 1, with a soft shadow. Below it, a white rounded card with a neat vertical list of seven rows "
  "separated by hairlines, each row with a small rounded switch on the left that is switched ON in muted sage green and a label.\n\n"
  + PALETTE + TYPE + RULES + "Text:\n"
  "- serif headline above the card, cocoa: \"Alles in einer Sitzung\"\n"
  "- the seven labels, sans, cocoa, in this order: \"Reinigung\", \"Fruchtsäure-Peeling\", \"Diamantabrasion\", \"Carbon-Peeling\", "
  "\"Microneedling\", \"Maske\", \"LED-Licht\"\n"
  "- under the card: \"90 Min. · CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a copper-clay pill button with white text: \"Jetzt Termin buchen\"\n"
  "- very small at the bottom: \"Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: phone frames, status bars, app logos, lasers, needles, before/after."),
 'reviews': ([PORTRAIT],
  "Design an Instagram feed ad (portrait 4:5) in the 'floating reviews' format, art-directed like a premium beauty studio: a cream "
  "background #FAF6F1 with soft daylight and, behind the centre, a tall rounded arch in deep cocoa #2A1E18 (the studio's arch motif). "
  "In front of the arch, the woman from image 1 as a clean cutout from the waist up, exactly as in the photo: same face, same real age, "
  "warm smile, red lipstick, long blond hair, white short-sleeved tunic; remove the name tag and the photo's background. Around her "
  "float four white review cards with rounded corners, soft shadows and slight tilts, each with five small gold stars, a small blush "
  "initial avatar, the name in bold and the quote.\n\n" + PALETTE + TYPE + RULES + "Text:\n"
  "- top headline, serif, cocoa: \"Echte Kundenerfahrungen\"\n"
  "- card 1, name \"Rahel\", quote: \"Teresa ist sehr freundlich und zuvorkommend und arbeitet absolut professionell.\"\n"
  "- card 2, name \"Yilmaz\", quote: \"Es war eine gute Entscheidung dorthin zu gehen.\"\n"
  "- card 3, name \"Denise\", quote: \"Sehr kompetente Beratung und Behandlung!\"\n"
  "- card 4, name \"Patricia\", quote: \"Sehr professionell, freundlich, sauber.\"\n"
  "- under the cards, sans, cocoa: \"4,8 ★ aus 260+ Bewertungen auf Treatwell\"\n"
  "- bottom: \"Carbon-Peeling + Microneedling · CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a copper-clay button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: any other names or quotes, platform logos, lasers, needles, before/after."),
 'chat-faq': ([PORTRAIT],
  "Design an Instagram feed ad (portrait 4:5) that looks like a friendly chat, used as an FAQ: a soft cream-to-blush background, chat "
  "bubbles with rounded corners. Questions on the left in shell-coloured bubbles #F3EAE1 with cocoa text; answers on the right in "
  "copper-clay bubbles #8F5A2E with white text, each answer with a tiny round avatar of the woman from image 1 (her face only, same face "
  "and real age). No phone frame, no app name, no logos.\n\n" + PALETTE + TYPE + RULES + "Text:\n"
  "- small serif header at the top, cocoa: \"Häufige Fragen\"\n"
  "- question bubble: \"Tut Microneedling weh?\"\n"
  "- answer bubble: \"Viele empfinden das Microneedling als leichtes Piksen, Druckgefühl oder Wärme. Die Intensität wird kontrolliert und "
  "individuell angepasst.\"\n"
  "- question bubble: \"Und wie lange dauert es?\"\n"
  "- answer bubble: \"90 Minuten. Carbon-Peeling und Microneedling in einer Sitzung.\"\n"
  "- a white price card under the chat: \"CHF 175\" large in serif and \"statt CHF 250\" small " + STRIKE + "\n"
  "- a cocoa button with white text: \"Jetzt Termin buchen\"\n"
  "- very small at the bottom: \"Beauty Face Lift · Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: read receipts, time stamps, app names, lasers, needles, before/after."),
 'ab-choice': ([MASKE],
  "Design an Instagram feed ad (portrait 4:5) in the 'Would you rather?' A-or-B format on a warm cream background #FAF6F1 with soft "
  "studio light, a thin cocoa vertical line splitting it into two columns. Left column A: two small glossy 3D calendar pages side by "
  "side, charcoal with cream pages. Right column B: one glossy 3D calendar page in copper-clay with " + PHOTO_MASKE + " pinned to it "
  "as a small photo. At the bottom of each column a big round cocoa badge with a white letter.\n\n" + PALETTE + TYPE + RULES + "Text:\n"
  "- top headline, serif, cocoa: \"Was ist Ihnen lieber?\"\n"
  "- under column A, sans: \"Zwei Termine\"\n"
  "- under column B, sans: \"Beides in 90 Minuten\" and below it \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- the badges: \"A\" and \"B\"\n"
  "- small, bottom: \"Carbon-Peeling + Microneedling · Bahnhofstrasse 94, Zürich\"\n"
  "- a copper-clay button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: dates or numbers on the calendars, lasers, needles, before/after."),
 'pov-caption': ([MASKE],
  "Design a native, creator-style Instagram feed ad (portrait 4:5): a full-bleed, realistic, slightly candid photo in the style of image 1 "
  "(a woman reclining with closed eyes and a relaxed face, half her face in matte black carbon lotion, a gloved hand with a brush, warm "
  "window light), looking like a real phone photo. Over the upper part of the photo, a bold caption in the style of social-video "
  "subtitles: heavy white sans-serif with a thin black outline, centred, three or four short lines.\n\n" + RULES + "Text:\n"
  "- caption: \"POV: Sie müssen sich nicht zwischen Carbon-Peeling und Microneedling entscheiden.\"\n"
  "- a small rounded cream sticker, lower part, cocoa text: \"Beides · 90 Min. · CHF 175\" and below it smaller \"statt CHF 250\" "
  + STRIKE + "\n"
  "- a small cocoa pill button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: emojis, app logos, like counts, lasers, needles, before/after."),
 'hand-hero': ([PEN],
  "Design a minimal, premium Instagram feed ad (portrait 4:5) in the 'hero product in hand' style: a cream background #FAF6F1 with soft "
  "daylight and, behind the hand, a tall rounded arch in blush #EAD9CC (the studio's arch motif). From the bottom, a hand in a white "
  "nitrile glove holds the microneedling pen from image 1 upright like a precious product (brushed silver-grey metal, fine knurled ring, "
  "small transparent cartridge, no needles visible), sharp and realistic. Around the pen, six thin cocoa-outlined pills, three on each "
  "side.\n\n" + PALETTE + TYPE + RULES + "Text:\n"
  "- headline at the top, serif, cocoa: \"Auf Ihre Haut abgestimmt.\"\n"
  "- under it, sans: \"Carbon-Peeling + Microneedling · 90 Min.\"\n"
  "- left pills: \"Hautanalyse vorher\", \"Carbon-Peeling\", \"Diamantabrasion\"\n"
  "- right pills: \"Microneedling\", \"Tiefe passend zum Hauttyp\", \"Maske + LED-Licht\"\n"
  "- bottom: \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a copper-clay button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: lettering on the pen, visible needles, lasers, light beams, before/after."),
 'puzzle-3d': ([],
  "Design a bold, scroll-stopping Instagram feed ad (portrait 4:5) built on a visual metaphor, art-directed like a 3D cosmetics "
  "campaign: a warm blush-to-peach studio background #EAD9CC with soft light and a few small matte spheres in cream and copper floating "
  "out of focus. In the middle, two large glossy 3D puzzle pieces snapping together in mid-air with a few soft motion lines: one piece "
  "matte charcoal black with a fine carbon texture, the other pearl-rose with a delicate pattern of tiny dots. A soft shadow below.\n\n"
  + PALETTE + TYPE + RULES + "Text:\n"
  "- big headline at the top, serif, cocoa: \"Passt zusammen.\"\n"
  "- under it, sans, cocoa: \"Carbon-Peeling + Microneedling in einer Sitzung\"\n"
  "- a round copper-clay price sticker, tilted, white text: \"CHF 175\" big and \"statt CHF 250\" small " + STRIKE + "\n"
  "- a cocoa button with white text: \"Jetzt Termin buchen\"\n"
  "- small, bottom: \"90 Min. · Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: people, needles, lasers, medical symbols."),
 'orbit': ([MASKE],
  "Design a premium Instagram feed ad (portrait 4:5) in the 'everything in one' orbit format, art-directed like a spa campaign: a deep "
  "sage-green background #2F4A3E with a soft warm radial glow. In the centre, a tall rounded photo with " + PHOTO_MASKE + ". Around "
  "it, seven small frosted-glass chips with tiny cream line icons, placed on an elegant ellipse.\n\n" + PALETTE + TYPE + RULES + "Text:\n"
  "- top headline, serif, cream: \"1 Termin. 7 Schritte.\"\n"
  "- under it, sans, smaller: \"Carbon-Peeling + Microneedling\"\n"
  "- the seven chips, clockwise from the top: \"Reinigung\", \"Fruchtsäure-Peeling\", \"Diamantabrasion\", \"Carbon-Peeling\", "
  "\"Microneedling\", \"Maske\", \"LED-Licht\"\n"
  "- a frosted price chip under the photo: \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a light-copper button with cocoa text: \"Jetzt Termin buchen\"\n"
  "- small, bottom: \"90 Min. · Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: lasers, light beams, needles, before/after."),
 'storyboard': ([HAUTANALYSE, MASKE, PEN, RUHE],
  "Design an Instagram feed ad (portrait 4:5) as a numbered storyboard, art-directed like a clinic carousel: a shell background "
  "#F3EAE1, a 2 x 2 grid of four realistic photos with rounded corners, thin white borders and soft shadows, all graded in the same "
  "warm tone. In the upper corner of each photo stands a very large thin-outlined serif numeral in cream, partly behind the photo's "
  "edge, as a design element. Photo 1 in the style of image 1 (the practitioner, the same woman as in image 1, looks closely at the "
  "client's skin). Photo 2 in the style of image 2 (black carbon lotion being brushed on). Photo 3 in the style of image 3 (a gloved "
  "hand with a silver-grey microneedling pen resting on a cheek, no needles visible). Photo 4 in the style of image 4 (the client "
  "resting calmly with closed eyes). Keep every face realistic and every person the same as in the images.\n\n" + PALETTE + TYPE +
  RULES + "Text:\n"
  "- headline above the grid, serif, cocoa: \"Ihre 90 Minuten\"\n"
  "- the large numerals: \"1\", \"2\", \"3\", \"4\"\n"
  "- one short caption under each photo, sans, cocoa: \"Hautanalyse\", \"Carbon-Peeling\", \"Microneedling\", \"Maske und LED-Licht\"\n"
  "- under the grid: \"CHF 175 statt CHF 250\" " + STRIKE + "\n"
  "- a copper-clay button with white text: \"Jetzt Termin buchen\"\n"
  "- small, bottom: \"Bahnhofstrasse 94, Zürich\"\n\n"
  "Avoid: lasers, light beams, needles, before/after, clutter."),
}
