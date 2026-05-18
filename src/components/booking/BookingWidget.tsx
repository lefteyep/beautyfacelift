import { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { StepIndicator } from './ui/StepIndicator';
import { TreatmentSelect } from './steps/TreatmentSelect';
import { DateSelect } from './steps/DateSelect';
import { TimeSelect } from './steps/TimeSelect';
import { CustomerForm } from './steps/CustomerForm';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration_minutes: number;
  price_chf: number;
  price_label?: string;
  price_min_chf?: number;
  price_max_chf?: number;
  deposit_chf: number;
  category: string;
}

interface Props {
  preselectedCategory?: string;
}

// Deprecated rollback-only component. Public pages route booking intent to
// Treatwell via /termin/ while ENABLE_LEGACY_BOOKING is false.
const STEP_LABELS = ['Behandlung', 'Datum', 'Uhrzeit', 'Buchen'];
const SERVICE_LOAD_TIMEOUT_MS = 9000;
const SERVICE_SLOW_NOTICE_MS = 3500;

function BookingRecovery({
  title,
  message,
  onRetry,
  retrying = false,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="booking-state" role="alert">
      <span className="booking-state-kicker">Terminbuchung</span>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="booking-state-actions">
        {onRetry && (
          <button type="button" className="pill-btn" onClick={onRetry} disabled={retrying}>
            {retrying ? 'Wird erneut geladen...' : 'Erneut versuchen'}
          </button>
        )}
        <a href="/kontakt/" className="pill-btn pill-btn-outline">Kontakt aufnehmen</a>
        <a href="tel:+41792143462" className="booking-text-link">+41 79 214 34 62</a>
        <a
          href="https://wa.me/41792143462?text=Hallo%20Teresa%2C%20die%20Online-Buchung%20ist%20gerade%20nicht%20verf%C3%BCgbar.%20Ich%20m%C3%B6chte%20einen%20Termin%20anfragen."
          className="booking-text-link"
          target="_blank"
          rel="noopener"
        >
          WhatsApp schreiben
        </a>
      </div>
    </div>
  );
}

function BookingWidgetInner({ preselectedCategory }: Props) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [datesError, setDatesError] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [servicesSlow, setServicesSlow] = useState(false);
  const [serviceLoadAttempt, setServiceLoadAttempt] = useState(0);

  // Load services on mount
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SERVICE_LOAD_TIMEOUT_MS);
    const slowNoticeId = window.setTimeout(() => {
      if (active) setServicesSlow(true);
    }, SERVICE_SLOW_NOTICE_MS);

    async function loadServices() {
      setLoadingServices(true);
      setServicesError(null);
      setServicesSlow(false);

      try {
        const r = await fetch('/api/services', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!r.ok) throw new Error('services failed');
        const data = await r.json();
        const nextServices = Array.isArray(data.services) ? data.services : [];
        if (nextServices.length === 0) throw new Error('services empty');
        if (!active) return;

        setServices(nextServices);
        setServicesError(null);
        setLoadingServices(false);
      } catch (error) {
        if (!active) return;

        const timedOut = (error as { name?: string }).name === 'AbortError';
        setServices([]);
        setServicesError(
          timedOut
            ? 'Die Online-Buchung antwortet gerade zu langsam.'
            : 'Die Behandlungen konnten nicht geladen werden.'
        );
        setLoadingServices(false);
      } finally {
        window.clearTimeout(timeoutId);
        window.clearTimeout(slowNoticeId);
      }
    }

    loadServices();

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeoutId);
      window.clearTimeout(slowNoticeId);
    };
  }, [serviceLoadAttempt]);

  // Auto-advance if only 1 service in preselected category
  useEffect(() => {
    if (!loadingServices && preselectedCategory && services.length > 0) {
      const filtered = services.filter(s => s.category === preselectedCategory);
      if (filtered.length === 1) {
        setSelectedService(filtered[0]);
        setStep(2);
        loadAvailability(getCurrentMonth(), filtered[0].id);
      }
    }
  }, [loadingServices, preselectedCategory, services]);

  function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  const loadAvailability = useCallback((month: string, serviceId?: string) => {
    setLoadingDates(true);
    setDatesError(null);
    const params = new URLSearchParams({ month });
    if (serviceId) params.set('service_id', serviceId);

    fetch(`/api/availability?${params.toString()}`)
      .then(r => {
        if (!r.ok) throw new Error('availability failed');
        return r.json();
      })
      .then(data => {
        setAvailableDates(new Set(data.dates || []));
        setLoadingDates(false);
      })
      .catch(() => {
        setDatesError('Die Verfügbarkeit konnte nicht geladen werden.');
        setAvailableDates(new Set());
        setLoadingDates(false);
      });
  }, []);

  function loadSlots(date: string, serviceId: string) {
    setLoadingSlots(true);
    setSlotsError(null);
    fetch(`/api/slots?date=${date}&service_id=${serviceId}`)
      .then(r => {
        if (!r.ok) throw new Error('slots failed');
        return r.json();
      })
      .then(data => {
        setSlots(data.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => {
        setSlotsError('Die freien Zeiten konnten nicht geladen werden.');
        setSlots([]);
        setLoadingSlots(false);
      });
  }

  function handleServiceSelect(service: Service) {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
    setStep(2);
    loadAvailability(getCurrentMonth(), service.id);
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep(3);
    if (selectedService) {
      loadSlots(date, selectedService.id);
    }
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setStep(4);
  }

  async function handleSubmit(data: { name: string; email: string; phone: string; notes: string }) {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    setSubmitError(null);

    // Collect UTM data from sessionStorage
    let utmData = null;
    try {
      const stored = sessionStorage.getItem('bfl_utm');
      if (stored) utmData = JSON.parse(stored);
    } catch { /* ignore */ }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedService.id,
          customer_name: data.name,
          customer_email: data.email,
          customer_phone: data.phone,
          booking_date: selectedDate,
          booking_time: selectedTime,
          notes: data.notes || null,
          utm_data: utmData,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || 'Buchung fehlgeschlagen. Bitte versuchen Sie es erneut.');
        setSubmitting(false);
        // If slot conflict, go back to time selection
        if (res.status === 409) {
          setStep(3);
          loadSlots(selectedDate, selectedService.id);
        }
        return;
      }

      // Redirect to confirmation
      window.location.href = result.redirect;
    } catch {
      setSubmitError('Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung.');
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  if (loadingServices) {
    return (
      <div className="booking-loading" role="status" aria-live="polite">
        <span className="booking-loader" aria-hidden="true" />
        <span className="booking-loading-title">Behandlungen werden geladen...</span>
        {servicesSlow && (
          <span className="booking-loading-note">
            Die Verbindung dauert gerade etwas länger. Wir versuchen es noch einen Moment.
          </span>
        )}
      </div>
    );
  }

  if (servicesError) {
    return (
      <BookingRecovery
        title="Online-Buchung kurz nicht verfügbar"
        message={`${servicesError} Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt. Wir finden Ihren Termin persönlich.`}
        onRetry={() => setServiceLoadAttempt(attempt => attempt + 1)}
        retrying={loadingServices}
      />
    );
  }

  return (
    <div className="booking-widget" id="buchen">
      <div className="booking-header">
        <h2>Termin buchen</h2>
        <StepIndicator currentStep={step} totalSteps={4} labels={STEP_LABELS} />
      </div>

      <div className="booking-body">
        {step > 1 && (
          <button type="button" className="booking-back" onClick={handleBack}>
            ← Zurück
          </button>
        )}

        {step === 1 && (
          <TreatmentSelect
            services={services}
            selectedId={selectedService?.id || null}
            onSelect={handleServiceSelect}
            preselectedCategory={preselectedCategory}
          />
        )}

        {step === 2 && (
          <DateSelect
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
            onMonthChange={(month) => loadAvailability(month, selectedService?.id)}
            loading={loadingDates}
            error={datesError}
          />
        )}

        {step === 3 && selectedDate && (
          <TimeSelect
            slots={slots}
            selectedTime={selectedTime}
            onSelect={handleTimeSelect}
            loading={loadingSlots}
            selectedDate={selectedDate}
            error={slotsError}
          />
        )}

        {step === 4 && selectedService && selectedDate && selectedTime && (
          <CustomerForm
            service={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={submitError}
          />
        )}
      </div>
    </div>
  );
}

export default function BookingWidget(props: Props) {
  return (
    <ErrorBoundary>
      <BookingWidgetInner {...props} />
    </ErrorBoundary>
  );
}
