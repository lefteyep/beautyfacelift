/**
 * Event-data keys the browser may send to /api/track, which the Worker forwards to Meta CAPI as
 * custom data. One list for both sides: the Worker rejects an event that carries any other key,
 * so a page-side key missing here is a silent loss of every server event on that visit (this
 * happened to all ad traffic between 2026-05-08 and 2026-10-20, when the two lists differed).
 */

/** Attribution keys the ad pages store per session and attach to every event. */
export const CAMPAIGN_KEYS = [
  'utm_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_source_platform',
  'campaign_id',
  'adset_id',
  'ad_id',
  'placement',
  'creative_angle',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'matchtype',
  'network',
  'device',
] as const;

export const CAPI_EVENT_DATA_KEYS = [
  ...CAMPAIGN_KEYS,
  'campaign',
  'offer',
  'value',
  'currency',
  'method',
  'source',
  'content_name',
  'content_category',
  'treatment_name',
  'button_location',
  'page_path',
  'destination_url',
  'link_domain',
  'page_type',
  'service',
  'intent_rule',
  'percent_scrolled',
] as const;
