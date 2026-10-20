// GET /admin/leads/ — KPI strip for the ISO week, filter chips, search, lead rows, paging.
import { LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadStatus } from '../../../shared/leads';
import type { AccessIdentity } from '../access';
import type { LeadRow, WeekCounts } from '../db';
import { excludeChip, html, layout, sourceChip, statusChip, type SafeHtml } from '../html';
import { relativeTime, type IsoWeek } from '../time';
import { contactLinks, treatmentLabel } from './shared';

export const LIST_FILTERS = ['offen', ...LEAD_STATUSES, 'alle'] as const;
export type ListFilter = (typeof LIST_FILTERS)[number];

/** Statuses behind a filter (null = all); `offen` = neu, kontaktiert, gebucht. */
export function statusesFor(filter: ListFilter): readonly LeadStatus[] | null {
  if (filter === 'alle') return null;
  if (filter === 'offen') return ['neu', 'kontaktiert', 'gebucht'];
  return [filter];
}

const FILTER_LABELS: Record<ListFilter, string> = { offen: 'Offen', ...LEAD_STATUS_LABELS, alle: 'Alle' };

export type ListQuery = { status: ListFilter; q: string; campaign: string; page: number };

export type ListViewInput = {
  identity: AccessIdentity;
  query: ListQuery;
  leads: LeadRow[];
  hasNext: boolean;
  week: IsoWeek;
  counts: WeekCounts;
  now: Date;
};

/** `?status=…&q=…&campaign=…&page=…` with defaults left out. */
export function listHref(query: ListQuery): string {
  const params = new URLSearchParams();
  if (query.status !== 'offen') params.set('status', query.status);
  if (query.q) params.set('q', query.q);
  if (query.campaign) params.set('campaign', query.campaign);
  if (query.page > 1) params.set('page', String(query.page));
  const search = params.toString();
  return `/admin/leads/${search ? `?${search}` : ''}`;
}

function kpiStrip(week: IsoWeek, counts: WeekCounts): SafeHtml {
  const count = (status: LeadStatus) => counts.byStatus[status] ?? 0;
  const booked = count('gebucht') + count('erschienen') + count('no_show');
  const rate = counts.total === 0 ? '–' : `${Math.round((booked / counts.total) * 100)} %`;
  const items: [string, string | number][] = [
    ['Neu', count('neu')],
    ['Kontaktiert', count('kontaktiert')],
    ['Gebucht', count('gebucht')],
    ['Erschienen', count('erschienen')],
    ['Termin-Quote', rate],
  ];
  return html`<section aria-labelledby="kpi-title">
<h2 id="kpi-title">Diese Woche (KW ${week.week})</h2>
<dl class="kpis">${items.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>
</section>`;
}

function filterChips(query: ListQuery): SafeHtml {
  const chips = LIST_FILTERS.map((filter) => {
    const href = listHref({ ...query, status: filter, page: 1 });
    return filter === query.status
      ? html`<a class="chip-link" href="${href}" aria-current="page">${FILTER_LABELS[filter]}</a>`
      : html`<a class="chip-link" href="${href}">${FILTER_LABELS[filter]}</a>`;
  });
  return html`<nav class="filters" aria-label="Status">${chips}</nav>`;
}

function searchForm(query: ListQuery): SafeHtml {
  return html`<form class="search" method="get" action="/admin/leads/" role="search">
<label for="lead-search">Name, E-Mail oder Telefon</label>
<div class="search-row">
<input id="lead-search" type="search" name="q" value="${query.q}" autocomplete="off">
<button class="btn" type="submit">Suchen</button>
</div>
${query.status !== 'offen' ? html`<input type="hidden" name="status" value="${query.status}">` : html``}
${query.campaign ? html`<input type="hidden" name="campaign" value="${query.campaign}">` : html``}
</form>`;
}

function leadRow(lead: LeadRow, now: Date): SafeHtml {
  const topic = lead.treatment || lead.topic;
  const links = contactLinks(lead.name, treatmentLabel(lead), lead.phone_normalized, null);
  return html`<li>
<div class="row-main">
<a class="row-name" href="/admin/leads/${encodeURIComponent(lead.id)}/">${lead.name}</a>
<p class="row-meta">${relativeTime(lead.created_at, now)}${topic ? html` · ${topic}` : html``}</p>
</div>
<div class="row-side">${sourceChip(lead.source)}${statusChip(lead.status)}${excludeChip(lead.exclude)}</div>
${links.length ? html`<div class="row-actions">${links.map((link) => html`<a class="btn btn-secondary btn-small" href="${link.href}">${link.label}</a>`)}</div>` : html``}
</li>`;
}

export function renderList({ identity, query, leads, hasNext, week, counts, now }: ListViewInput): string {
  const campaignLine = query.campaign
    ? html`<p class="muted filter-note">Kampagne: ${query.campaign} · <a href="${listHref({ ...query, campaign: '', page: 1 })}">Filter entfernen</a></p>`
    : html``;
  const rows = leads.length
    ? html`<ul class="rows">${leads.map((lead) => leadRow(lead, now))}</ul>`
    : html`<p class="empty">Keine Anfragen in dieser Ansicht.</p>`;
  const pager = query.page > 1 || hasNext
    ? html`<nav class="pager" aria-label="Seiten">
${query.page > 1 ? html`<a class="btn btn-secondary" href="${listHref({ ...query, page: query.page - 1 })}">Zurück</a>` : html`<span></span>`}
${hasNext ? html`<a class="btn btn-secondary" href="${listHref({ ...query, page: query.page + 1 })}">Weiter</a>` : html``}
</nav>`
    : html``;

  const body = html`${kpiStrip(week, counts)}
${filterChips(query)}
${searchForm(query)}
${campaignLine}
${rows}
${pager}`;
  return layout({ title: 'Anfragen', h1: 'Anfragen', body, identity, wide: true });
}
