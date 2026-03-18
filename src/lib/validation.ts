/** Swiss phone number: +41... or 0... */
export function isValidSwissPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  return /^(\+41|0)\d{9,10}$/.test(cleaned);
}

/** Basic email validation */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Date is not in the past and not more than 90 days out */
export function isValidBookingDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);

  return date >= today && date <= maxDate;
}

/** Validate booking request body */
export function validateBookingInput(body: Record<string, unknown>): string | null {
  if (!body.service_id || typeof body.service_id !== 'string') {
    return 'Bitte wählen Sie eine Behandlung aus.';
  }
  if (!body.customer_name || typeof body.customer_name !== 'string' || body.customer_name.trim().length < 2) {
    return 'Bitte geben Sie Ihren Namen ein.';
  }
  if (!body.customer_email || !isValidEmail(body.customer_email as string)) {
    return 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
  }
  if (!body.customer_phone || !isValidSwissPhone(body.customer_phone as string)) {
    return 'Bitte geben Sie eine gültige Schweizer Telefonnummer ein.';
  }
  if (!body.booking_date || !isValidBookingDate(body.booking_date as string)) {
    return 'Bitte wählen Sie ein gültiges Datum.';
  }
  if (!body.booking_time || typeof body.booking_time !== 'string') {
    return 'Bitte wählen Sie eine Uhrzeit.';
  }
  return null;
}
