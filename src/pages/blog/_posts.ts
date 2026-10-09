// "Wissen" (knowledge section, URL /blog/) metadata shared by the index and the
// BlogPost layout. The leading underscore keeps this file out of Astro's routing.
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
    /** Last editorial change: Article dateModified and the sitemap lastmod. */
    modifiedDate: string;
    readingTime: string;
    image: ImageMetadata;
    imageAlt: string;
    /** Treatment page offered next to "Termin buchen" in the article's consultation block. */
    treatment: { href: string; label: string };
}

// Newest first.
export const JOURNAL_POSTS: JournalPost[] = [
    {
        slug: 'aquafacial-vs-microneedling',
        href: '/blog/aquafacial-vs-microneedling/',
        title: 'Aquafacial vs. Microneedling: Welche Behandlung passt zu Ihnen?',
        excerpt: 'Beide Behandlungen können zu einem frischeren Hautbild beitragen, doch welche passt zu Ihrem Hauttyp? Ein direkter Vergleich.',
        category: 'Behandlungsvergleich',
        publishDate: '2026-03-15',
        modifiedDate: '2026-10-07',
        readingTime: '10 Min.',
        image: spaFacialTreatment,
        imageAlt: 'Pflegeserum wird mit der Pipette auf die Wange aufgetragen',
        treatment: { href: '/behandlungen/vergleich/', label: 'Behandlungen vergleichen' },
    },
    {
        slug: 'hautpflege-routine-zuerich',
        href: '/blog/hautpflege-routine-zuerich/',
        title: 'Die passende Hautpflege-Routine: Tipps von Ihrer Kosmetikerin',
        excerpt: 'Teresa Stimac zeigt die wichtigsten Schritte für eine wirksame tägliche Hautpflege, abgestimmt auf das Zürcher Klima.',
        category: 'Hautpflege',
        publishDate: '2026-03-10',
        modifiedDate: '2026-10-07',
        readingTime: '10 Min.',
        image: spaProducts,
        imageAlt: 'Serumflaschen mit Pipette auf hellem Stein',
        treatment: { href: '/behandlungen/gesichtsbehandlung-zuerich/', label: 'Zur Gesichtsbehandlung' },
    },
    {
        slug: 'was-ist-aquafacial',
        href: '/blog/was-ist-aquafacial/',
        title: 'Was ist Aquafacial? Alles was Sie wissen müssen',
        excerpt: 'Vom 3-Schritte-Ablauf bis zum Glow-Effekt: alles Wissenswerte über die Gesichtsbehandlung, ihre Varianten und Kosten.',
        category: 'Behandlungswissen',
        publishDate: '2026-03-05',
        modifiedDate: '2026-10-07',
        readingTime: '12 Min.',
        image: aquafacialCard,
        imageAlt: 'Aquafacial Behandlung mit Handstück an der Wange',
        treatment: { href: '/behandlungen/aquafacial-zuerich/', label: 'Mehr zu Aquafacial' },
    },
    {
        slug: 'microneedling-erfahrung',
        href: '/blog/microneedling-erfahrung/',
        title: 'Microneedling Erfahrung: Was erwartet Sie bei Ihrer ersten Behandlung?',
        excerpt: 'Was passiert während einer Microneedling-Sitzung und wie fühlt sich die Behandlung an? Ein ehrlicher Erfahrungsbericht.',
        category: 'Erfahrungsbericht',
        publishDate: '2026-02-28',
        modifiedDate: '2026-10-07',
        readingTime: '10 Min.',
        image: microneedlingCard,
        imageAlt: 'Microneedling Behandlung im Gesicht',
        treatment: { href: '/behandlungen/microneedling-zuerich/', label: 'Mehr zu Microneedling' },
    },
    {
        slug: 'anti-aging-behandlungen-zuerich',
        href: '/blog/anti-aging-behandlungen-zuerich/',
        title: 'Anti-Aging Behandlungen in Zürich: Ein umfassender Überblick',
        excerpt: 'Von Aquafacial über ColdPlasma bis Fruchtsäure Peeling: welche Anti-Aging Methoden sich für welche Haut eignen.',
        category: 'Anti-Aging',
        publishDate: '2026-02-20',
        modifiedDate: '2026-10-07',
        readingTime: '12 Min.',
        image: spaInterior,
        imageAlt: 'Ruhiger Behandlungsraum mit Liege, Leinen und warmem Licht',
        treatment: { href: '/behandlungen/vergleich/', label: 'Behandlungen vergleichen' },
    },
];

// The Wissen article a page links to: from the FAQ block of a treatment or comparison page,
// from the details head of a service hub (page → article). The way back is each
// post's own `treatment` field above.
const WISSEN_FOR_PAGE: Record<string, { slug: string; label: string }> = {
    '/behandlungen/aquafacial-zuerich/': { slug: 'was-ist-aquafacial', label: 'Aquafacial erklärt' },
    '/behandlungen/microneedling-zuerich/': { slug: 'microneedling-erfahrung', label: 'Microneedling Erfahrung' },
    '/behandlungen/vergleich/': { slug: 'aquafacial-vs-microneedling', label: 'Aquafacial vs. Microneedling' },
    '/behandlungen/coldplasma-zuerich/': { slug: 'anti-aging-behandlungen-zuerich', label: 'Anti-Aging Behandlungen' },
    '/behandlungen/fruchtsaeure-peeling-zuerich/': { slug: 'anti-aging-behandlungen-zuerich', label: 'Anti-Aging Behandlungen' },
    '/behandlungen/gesichtsbehandlung-zuerich/': { slug: 'hautpflege-routine-zuerich', label: 'Hautpflege-Routine' },
};

export function wissenLinkFor(pathname: string): { href: string; label: string } | undefined {
    // Keys end in "/"; the dev server can also be asked for the path without it.
    const entry = WISSEN_FOR_PAGE[pathname.endsWith('/') ? pathname : `${pathname}/`];
    return entry && { href: getJournalPost(entry.slug).href, label: entry.label };
}

export function getJournalPost(slug: string): JournalPost {
    const post = JOURNAL_POSTS.find((item) => item.slug === slug);
    if (!post) throw new Error(`Unknown Wissen post: ${slug}`);
    return post;
}

/**
 * Up to `count` further articles: the hand-picked slugs first, then the
 * newest remaining posts, never the current one.
 */
export function getRelatedPosts(slug: string, picks: string[] = [], count = 3): JournalPost[] {
    const chosen = picks
        .filter((pick) => pick !== slug)
        .map((pick) => getJournalPost(pick));
    for (const post of JOURNAL_POSTS) {
        if (chosen.length >= count) break;
        if (post.slug !== slug && !chosen.includes(post)) chosen.push(post);
    }
    return chosen.slice(0, count);
}

export function formatJournalDate(isoDate: string): string {
    return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('de-CH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Zurich',
    });
}
