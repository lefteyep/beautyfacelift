// Reviews of Beauty Face Lift on Treatwell, copied verbatim (spelling as written) on 2026-10-31 from
// https://www.treatwell.ch/ort/beauty-face-lift/ (177 reviews with text; Treatwell counts 261 ratings).
// Selection: 5 stars, German, named reviewer, face treatments, at most two per name (the most recent,
// Microneedling first). Left out: reviews that promise or describe results, name a device brand or the other
// facial brand the site never uses, a price or another venue, English ones and very short ones.
// The first six are shown directly (Microneedling first); the rest sit behind «Weitere Bewertungen anzeigen».
// date = month of the review on Treatwell (YYYY-MM).
export type TreatwellReview = { name: string; date: string; treatment: string; text: string };

export const TREATWELL_REVIEWS: readonly TreatwellReview[] = [
  {
    name: "Svenja",
    date: "2025-03",
    treatment: "Gesichtsbehandlungen",
    text: "Ich war zum ersten mal für eine Microneedling-Behandlung bei Frau Stimac. Ich bin sehr freundlich und professionell empfangen und durch die Behandlung geführt worden.\nFühlte mich gut aufgehoben und kann Beauty Face Lift mit gutem Gewissen weiter empfehlen.",
  },
  {
    name: "Rahel",
    date: "2025-04",
    treatment: "Micro-Needling",
    text: "Teresa ist sehr freundlich und zuvorkommend und arbeitet absolut professionell. Ich kann es nur empfehlen, sich von ihr behandeln zu lassen!!",
  },
  {
    name: "Andreas",
    date: "2026-03",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Ein grosses Kompliment an Teresa. Sie ist sehr charmant, herzlich und gleichzeitig absolut professionell. Jede Behandlung ist sehr entspannend - man fühlt sich vom ersten Moment wohl.",
  },
  {
    name: "Klara",
    date: "2023-12",
    treatment: "Micro-Needling",
    text: "Ich kann Teresa nur weiterempfehlen. Man merkt, dass sie langjährige Erfahrung in der Kosmetikbranche hat. Super Service!",
  },
  {
    name: "Rahel",
    date: "2024-12",
    treatment: "Micro-Needling",
    text: "Alles super nett, kompetent und unkompliziert. Werde wieder zu Teresa gehen:-)",
  },
  {
    name: "Corinne",
    date: "2026-03",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Teresa ist eine äusserst sympathische Person und arbeitet sehr gründlich und professionell",
  },
  {
    name: "Isabelle",
    date: "2026-07",
    treatment: "Gesichtsbehandlungen",
    text: "sie arbeitet sehr gründlich und professionell und effizient",
  },
  {
    name: "Emina",
    date: "2026-06",
    treatment: "Gesichtsbehandlungen",
    text: "Wie immer war es ein tolles entspannendes Erlebnis bei Teresa",
  },
  {
    name: "Pascale",
    date: "2026-06",
    treatment: "Gesichtsbehandlungen",
    text: "Ich erlebte eine angenehme und entspannende Gesichtsbehandlung mit Dampf und Massage. Danke Teresa",
  },
  {
    name: "Pascale",
    date: "2026-05",
    treatment: "Gesichtsbehandlungen",
    text: "Die Gesichtsbehandlung mit Dampf, Maske und Massage war sehr angenehm, erfrischend und entspannend. Bis zum nöchsten Mal😃",
  },
  {
    name: "Annika",
    date: "2026-04",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Inmer super bei Teresa. Sehr sauber und angenehm. Alle Behandlungen die ich hatte bis jetzt waren top. Es tut gut sich von ihr verwöhnen zu lassen.",
  },
  {
    name: "Emina",
    date: "2026-02",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Wie immer eine wunderbare Verwöhnzeit!",
  },
  {
    name: "Daniel",
    date: "2026-02",
    treatment: "Gesichtsbehandlungen",
    text: "Bin seit 2008 Stammkunde bei Teresa und immer sehr zufrieden.",
  },
  {
    name: "Sandra",
    date: "2026-02",
    treatment: "Gesichtsbehandlungen",
    text: "Fühle mich sehr wohl bei Teresa und bin immer sehr zufrieden!",
  },
  {
    name: "Irina",
    date: "2025-05",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Super professionell und sehr effizient gearbeitet. Gerne wieder, besten Dank liebe Teresa.",
  },
  {
    name: "Samira",
    date: "2025-04",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Meine Erfahrung war insgesamt sehr positiv.",
  },
  {
    name: "Isabelle",
    date: "2025-03",
    treatment: "Gesichtsbehandlungen",
    text: "Die Behandlungen sind immer professionell und erholsam",
  },
  {
    name: "Kostovic",
    date: "2024-12",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Die Behandlung sowie die Atmosphäre waren topp 💪🏻",
  },
  {
    name: "Yilmaz",
    date: "2024-11",
    treatment: "Micro-Needling",
    text: "Es war eine gute Entscheidung dorthin zu gehen.",
  },
  {
    name: "Andrea.Fernandez",
    date: "2024-05",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Sehr gut! Immer schön wieder zu kommen",
  },
  {
    name: "Walter",
    date: "2024-01",
    treatment: "Gesichtsbehandlungen",
    text: "Die Behandlich war gut und gründlich !",
  },
  {
    name: "Daniel",
    date: "2023-10",
    treatment: "Gesichtsbehandlungen",
    text: "Bin seit bald 15 Jahren Stammkunde; bin sehr zufrieden!",
  },
  {
    name: "Nathalie",
    date: "2023-10",
    treatment: "Gesichtsbehandlungen",
    text: "Vielen Dank - war perfekt - nur zu empfehlen",
  },
  {
    name: "Bossi",
    date: "2023-10",
    treatment: "Gesichtsbehandlungen",
    text: "Sehr nette und professionelle Beratung, gründliche und fürsorgliche Behandlung in freundlicher Ungebung. Gerne wieder.",
  },
  {
    name: "Vjollca",
    date: "2023-10",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Sehr gut ich werde weiter Termin bei Ihnen vereinbaren.",
  },
  {
    name: "Maydelis",
    date: "2023-10",
    treatment: "Gesichtsbehandlungen",
    text: "Sehr nett, sympathisch und professionell!",
  },
  {
    name: "Gezime",
    date: "2023-10",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Diese Behandlung ist Top\nIch empfehle es weiter\nKozmetikerin ist sehr freundlich und kompetent.",
  },
  {
    name: "Klara",
    date: "2023-10",
    treatment: "Gesichtsbehandlungen",
    text: "Teresa macht ihre Arbeit wirklich super. Man merkt, dass sie Erfahrung hat und sich in ihrem Bereich sehr gut auskennt. Ich gehe regelmässig für Gesichtsbehandlungen zu ihr ins Studio an der Bahnhofstrasse in Zürich. Ihre Produkte sind top und sind auf meinen Hauttyp ausgewählt. Ich kann Teresa nur weiterempfehlen! :)",
  },
  {
    name: "D. Herold",
    date: "2023-10",
    treatment: "Gesichtsbehandlungen",
    text: "Ich bin schon jahrelang Kundin und fühle mich immer noch wohl und gut umsorgt.",
  },
  {
    name: "DJZ",
    date: "2023-10",
    treatment: "Gesichtsbehandlungen",
    text: "Bin seit 15 Jahren Stammkunde bei Teresa. Konstante und immer aktuelle Dienstleistungen. Sehr zu empfehlen! Top und zentrale Lage des Beauty Centers.",
  },
  {
    name: "Vicki",
    date: "2023-09",
    treatment: "Gesichtsbehandlungen",
    text: "Sehr sorgfältige und freundliche Behandlung in guter Atmosphäre.",
  },
  {
    name: "Laura",
    date: "2023-09",
    treatment: "Gesichtsbehandlungen",
    text: "Bei Beauty Facelift fühle ich mich immer wohl und gut aufgehoben. Die Beratung ist immer individuell und die Behandlung jedes Mal abgestimmt auf den Zustand meiner Haut. \nIch kann den Salon wärmstens empfehlen!",
  },
  {
    name: "Lara",
    date: "2023-06",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung, Augenbrauen & Wimpern färben",
    text: "Liebevolle Behandlung, sehr entspannend. Freue mich aufs nächste Mal.",
  },
  {
    name: "Antje",
    date: "2023-03",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Ich war bei Beauty Face Lift durch Instagram um zu testen wie Sie arbeitet und was Sie anbietet.Ich bin überrascht, so eine tolle Frau und viel wissen. Fühlte mich sehr wohl und bin sehr zufrieden über die Behandlung. Ich komme auf jedenfall wieder.  Ich habe und kann Sie nur weiter empfehlen .\nMeine Behandlung war Vakum mit Microneedling.\nDanke Beauty Face Lift",
  },
  {
    name: "Patricia",
    date: "2023-01",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Sehr professionell, freundlich, sauber.",
  },
  {
    name: "Cynthia",
    date: "2022-12",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Ich fühlte mich rundum sehr gut aufgehoben bei Teresa. Sie übt ihren Job mit viel Herzblut und Leidenschaft aus.\nIch werde auf jeden Fall wieder zu Teresa gehen und kann Sie nur wärmstens weiterempfehlen.",
  },
  {
    name: "Danijela",
    date: "2022-12",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Sehr professionelle und effiziente Servis. Schöne Atmosphäre und gute Lage in Central Bahnofstrasse.",
  },
  {
    name: "Anette",
    date: "2022-09",
    treatment: "Feuchtigkeitsspendende Gesichtsbehandlung",
    text: "Hat sie ganz toll gemacht ,komme gerne wieder 🙏❤️",
  },
  {
    name: "Marlies",
    date: "2020-10",
    treatment: "Gesichtsbehandlungen",
    text: "Theresa ist sehr sympathisch.\nSie ist voll dabei. \nDie Behandlung kann man in vollen Zügen geniessen.\nBesonders die Massagen sind sehr entspannend.",
  },
  {
    name: "Billi",
    date: "2018-12",
    treatment: "Gesichtsbehandlungen",
    text: "Alles bestens, Teresa macht ihre Arbeit einwandfrei und dazu ist sie sehr herzlich! Gehe gerne zu ihr, danke 😄",
  },
  {
    name: "Denise",
    date: "2017-10",
    treatment: "Gesichtsbehandlungen",
    text: "Sehr kompetente Beratung und Behandlung!",
  },
  {
    name: "emine",
    date: "2016-12",
    treatment: "Gesichtsbehandlungen",
    text: "wie immer, war alles wunderbar. eine schöne Auszeit in einer hektischen Zeit...",
  },
];
