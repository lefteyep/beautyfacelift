# Round 4: designed ads with text in the image. Facts only from the campaign record:
# CHF 175 statt CHF 250, Sie sparen 30 % (CHF 75), 90 Min., two treatments in one session, Teresa Stimac,
# 4,8 aus 260+ Bewertungen auf Treatwell, Bahnhofstrasse 94 Zürich, end date 30. November 2026.
import os
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
RAW = os.path.join(REPO, 'design', 'ads', '2026-11-carbon', 'raw')
PORTRAIT = os.path.join(REPO, 'src', 'assets', 'marketing', 'teresa_portrait.jpg')
M7 = os.path.join(RAW, 'teresa_20261031_1.png')
MASKE = os.path.join(RAW, 'maske-v2_20261031_1.png')
PEN = os.path.join(RAW, 'pen-v2_20261031_2.png')

RULES = ("Render ONLY the text listed below, each word spelled exactly as written (German, Swiss spelling), "
         "with clean, sharp, correctly kerned letters; no other words, no lorem ipsum, no logos, no watermarks. ")

MOTIFS = {
 'carbon-gold': ([PORTRAIT, MASKE],
  "Design a premium, click-strong Instagram feed ad (portrait 4:5) for a beauty studio in Zurich, art-directed like a top "
  "luxury-cosmetics campaign.\n\nStyle: deep matte carbon-black background with slow, glossy liquid-carbon swirls and fine gold "
  "dust; warm gold rim light. Hero 3D element: a huge polished 3D gold number \"175\", slightly tilted, with soft reflections, "
  "standing on a dark glass plate that mirrors it.\n\nPeople and photos: on the left, the woman from image 1 as a clean cutout, "
  "waist up, exactly as in the photo: same face, same real age, same warm smile, red lipstick, long blond hair, white "
  "short-sleeved tunic; remove the name tag and the photo's background. Bottom right, a round window with a thin gold rim "
  "showing a realistic photo of the treatment from image 2: a woman reclining with closed eyes, half her face covered in matte "
  "black carbon lotion, a gloved hand with a brush.\n\n" + RULES + "Text:\n"
  "- top, elegant high-contrast serif, ivory: \"Carbon-Peeling + Microneedling\"\n"
  "- small before the gold number: \"CHF\"; small after it: \".–\"\n"
  "- under the number: \"statt CHF 250.–\" with \"CHF 250.–\" struck through by a thin red line\n"
  "- a small gold-outlined label: \"Aktion · nur für kurze Zeit\"\n"
  "- two small labels with thin gold line icons: \"90 Minuten\" and \"2 Behandlungen, 1 Sitzung\"\n"
  "- a gold button with dark text: \"Jetzt Termin buchen\"\n"
  "- bottom line, small ivory: \"Persönlich von Teresa Stimac · Bahnhofstrasse 94, Zürich\"\n\n"
  "Hierarchy: the gold number first, the headline second, the button third; generous spacing, nothing crowded.\n\n"
  "Avoid: lasers or light beams, needles, before/after, glitter overload, cheap clip-art."),
 'duo-split': ([MASKE, PEN],
  "Design a bold, modern Instagram feed ad (portrait 4:5) with a dynamic diagonal split, art-directed like a high-end skincare "
  "launch.\n\nLayout: the canvas is split by a diagonal from top right to bottom left. Upper-left half: deep charcoal black with "
  "a soft carbon texture. Lower-right half: luminous pearl-blush with soft pink and peach light. On the split line floats a large "
  "glossy 3D \"+\" in brushed rose-gold, lit from both sides.\n\nPhotos: in the black half, a rounded-rectangle photo of the "
  "treatment from image 1 (a woman reclining with closed eyes, half her face in matte black carbon lotion, a gloved hand with a "
  "brush). In the blush half, a rounded-rectangle photo in the style of image 2: a gloved hand holding a brushed silver-grey "
  "microneedling pen with a transparent cartridge resting on a cheek, no needles visible. Both photos realistic, natural skin, "
  "soft shadows, slightly overlapping the split line.\n\n" + RULES + "Text:\n"
  "- big bold headline, top left, white: \"2 Behandlungen.\" and on the next line \"1 Sitzung.\"\n"
  "- a small pill label on the black photo: \"Carbon-Peeling\"; a small pill label on the blush photo: \"Microneedling\"\n"
  "- a round, tilted 3D price sticker in rose-gold: \"CHF 175\" large, and below it smaller \"statt CHF 250\" with \"CHF 250\" "
  "struck through\n"
  "- bottom, small: \"90 Min. · Bahnhofstrasse 94, Zürich\"\n"
  "- a black button with white text: \"Jetzt Termin buchen\"\n\n"
  "Typography: heavy geometric sans-serif headline, tight leading, strong contrast.\n\n"
  "Avoid: lasers, light beams, visible needles, blood, redness, before/after."),
 'glass-30': ([PEN],
  "Design a fresh, eye-catching Instagram feed ad (portrait 4:5) in a soft 3D glass style, like a premium beauty-tech "
  "campaign.\n\nBackground: smooth gradient from blush pink to soft lilac with a hint of mint; floating translucent 3D glass "
  "spheres and droplets with real refraction and soft caustic light.\n\nHero 3D element: a huge number \"30 %\" made of clear "
  "frosted glass with tiny bubbles inside, pink and lilac reflections, a slight tilt, a soft coloured shadow.\n\nPhoto: a large "
  "circular glass bubble in the lower part of the ad holds a realistic close-up photo in the style of image 1: a gloved hand "
  "holding a brushed silver-grey microneedling pen with a transparent cartridge resting on a woman's cheek; natural skin with "
  "pores; no needles visible.\n\n" + RULES + "Text:\n"
  "- above the number, bold dark plum sans-serif: \"Sie sparen\"\n"
  "- under the number: \"CHF 175 statt CHF 250\" with \"CHF 250\" struck through\n"
  "- headline, elegant serif, dark plum: \"Carbon-Peeling + Microneedling\"\n"
  "- a small frosted-glass pill: \"90 Min. · Bahnhofstrasse 94, Zürich\"\n"
  "- a small line: \"Nur bis 30. November 2026\"\n"
  "- a glossy plum button with white text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: lasers, visible needles, blood, redness, before/after, clutter."),
 'cover': ([PORTRAIT],
  "Design an Instagram feed ad (portrait 4:5) styled as a confident fashion-magazine cover.\n\nPhoto: the woman from image 1 as "
  "the full-bleed cover portrait, from the chest up, looking into the camera with her warm smile, exactly as in the photo: same "
  "face, same real age, red lipstick, long blond hair, white short-sleeved tunic; remove the name tag; replace the background with "
  "a warm, softly lit cream studio wall with a gentle shadow. Real skin, no retouching.\n\nMasthead: huge, elegant high-contrast "
  "serif across the top: \"BEAUTY FACE LIFT\", fully readable; her head sits below the masthead and nothing covers any letter.\n\nColours: deep lipstick red "
  "(matching her lips), black and ivory.\n\n" + RULES + "Text (cover lines):\n"
  "- masthead: \"BEAUTY FACE LIFT\"\n"
  "- left column, bold condensed sans, red and black: \"Carbon-Peeling + Microneedling\", then smaller \"Zwei Behandlungen in "
  "einer Sitzung\"\n"
  "- right side: \"Persönlich von Teresa Stimac\"\n"
  "- a round red 3D sticker, slightly embossed: \"CHF 175\" big, \"statt CHF 250\" small with \"CHF 250\" struck through\n"
  "- bottom left, small: \"4,8 ★ aus 260+ Bewertungen auf Treatwell\"\n"
  "- bottom strip: \"Zürich · Bahnhofstrasse 94\"\n"
  "- a small black button: \"Jetzt Termin buchen\"\n\n"
  "Avoid: barcodes, issue numbers, prices other than the ones given, glamour retouching."),
 'neon-studio': ([M7, PORTRAIT],
  "Design a dramatic, high-energy Instagram feed ad (portrait 4:5) with cinematic lighting, like a bold sports-brand poster but "
  "for a beauty studio.\n\nScene: the treatment room from image 1 at dusk, darker and moody, with warm copper-orange neon light "
  "lines running along the ceiling and walls (architectural LED strips) and warm window light. In the scene, the moment from image "
  "1: the practitioner applies matte black carbon lotion with a brush to the face of a reclining client with closed eyes. The "
  "practitioner is the same woman as in image 2: same face, same real age, red lipstick, long blond hair, white short-sleeved "
  "tunic, no name tag. Realistic photo, real skin.\n\nHero 3D element: a giant extruded 3D number \"175\" in glossy copper-orange, "
  "standing in the room beside the bed, lit by the neon, reflected on the floor.\n\n" + RULES + "Text:\n"
  "- top, bold white condensed sans with a slight orange glow: \"Carbon-Peeling + Microneedling\"\n"
  "- small \"CHF\" before the 3D number and \".–\" after it\n"
  "- under the number, on a dark tag: \"statt CHF 250.–\" with \"CHF 250.–\" struck through\n"
  "- an orange tag: \"Nur bis 30. November\"\n"
  "- bottom: \"90 Minuten · Bahnhofstrasse 94, Zürich\"\n"
  "- an orange button with black text: \"Jetzt Termin buchen\"\n\n"
  "Avoid: lasers or light beams aimed at the face, needles, sweat, gym equipment, before/after."),
}
