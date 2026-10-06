// Journal metadata shared by the blog index and the BlogPost layout.
// The leading underscore keeps this file out of Astro's routing.
// Images are existing site photography matched to each article's topic;
// the articles' JSON-LD `image` fields are left unchanged.
import type { ImageMetadata } from 'astro';
import {
    aquafacialCard,
    microneedlingCard,
    spaFacialTreatment,
    spaInterior,
    spaProducts,
} from '../../lib/site-images';

export interface JournalPost {
    slug: string;
    href: string;
    title: string;
    excerpt: string;
    category: string;
    publishDate: string;
    readingTime: string;
    image: ImageMetadata;
    imageAlt: string;
}

// Newest first.
export const JOURNAL_POSTS: JournalPost[] = [
    {
        slug: 'aquafacial-vs-microneedling',
        href: '/blog/aquafacial-vs-microneedling/',
        title: 'Aquafacial vs. Microneedling: Welche Behandlung passt zu Ihnen?',
        excerpt: 'Beide Behandlungen versprechen ein strahlendes Hautbild, doch welche ist die richtige für Ihren Hauttyp? Ein direkter Vergleich.',
        category: 'Behandlungsvergleich',
        publishDate: '2026-03-15',
        readingTime: '10 Min.',
        image: spaFacialTreatment,
        imageAlt: 'Pflegeserum wird mit der Pipette auf die Wange aufgetragen',
    },
    {
        slug: 'hautpflege-routine-zuerich',
        href: '/blog/hautpflege-routine-zuerich/',
        title: 'Die passende Hautpflege-Routine: Tipps von Ihrer Kosmetikerin',
        excerpt: 'Teresa Stimac zeigt die wichtigsten Schritte für eine wirksame tägliche Hautpflege, abgestimmt auf das Zürcher Klima.',
        category: 'Hautpflege',
        publishDate: '2026-03-10',
        readingTime: '10 Min.',
        image: spaProducts,
        imageAlt: 'Serumflaschen mit Pipette auf hellem Stein',
    },
    {
        slug: 'was-ist-aquafacial',
        href: '/blog/was-ist-aquafacial/',
        title: 'Was ist Aquafacial? Alles was Sie wissen müssen',
        excerpt: 'Von der patentierten Vortex-Technologie bis zum Glow-Effekt: alles Wissenswerte über die beliebte Gesichtsbehandlung.',
        category: 'Behandlungswissen',
        publishDate: '2026-03-05',
        readingTime: '12 Min.',
        image: aquafacialCard,
        imageAlt: 'Aquafacial Behandlung mit Handstück an der Wange',
    },
    {
        slug: 'microneedling-erfahrung',
        href: '/blog/microneedling-erfahrung/',
        title: 'Microneedling Erfahrung: Was erwartet Sie bei Ihrer ersten Behandlung?',
        excerpt: 'Was passiert während einer Microneedling-Sitzung und wie fühlt sich die Behandlung an? Ein ehrlicher Erfahrungsbericht.',
        category: 'Erfahrungsbericht',
        publishDate: '2026-02-28',
        readingTime: '10 Min.',
        image: microneedlingCard,
        imageAlt: 'Microneedling Behandlung im Gesicht',
    },
    {
        slug: 'anti-aging-behandlungen-zuerich',
        href: '/blog/anti-aging-behandlungen-zuerich/',
        title: 'Anti-Aging Behandlungen in Zürich: Ein Überblick',
        excerpt: 'Von Aquafacial über ColdPlasma bis Fruchtsäure Peeling: welche Anti-Aging Methoden sich für welche Haut eignen.',
        category: 'Anti-Aging',
        publishDate: '2026-02-20',
        readingTime: '12 Min.',
        image: spaInterior,
        imageAlt: 'Ruhiger Behandlungsraum mit Liege, Leinen und warmem Licht',
    },
];

export function getJournalPost(slug: string): JournalPost {
    const post = JOURNAL_POSTS.find((item) => item.slug === slug);
    if (!post) throw new Error(`Unknown journal post: ${slug}`);
    return post;
}

export function formatJournalDate(isoDate: string): string {
    return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('de-CH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Zurich',
    });
}
