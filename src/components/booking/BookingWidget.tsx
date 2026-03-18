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
  deposit_chf: number;
  category: string;
}

interface Props {
  preselectedCategory?: string;
}

const STEP_LABELS = ['Behandlung', 'Datum', 'Uhrzeit', 'Buchen'];

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

  // Load services on mount
  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => {
        setServices(data.services || []);
        setLoadingServices(false);
      })
      .catch(() => setLoadingServices(false));
  }, []);

  // Auto-advance if only 1 service in preselected category
  useEffect(() => {
    if (!loadingServices && preselectedCategory && services.length > 0) {
      const filtered = services.filter(s => s.category === preselectedCategory);
      if (filtered.length === 1) {
        setSelectedService(filtered[0]);
        setStep(2);
        loadAvailability(getCurrentMonth());
      }
    }
  }, [loadingServices, preselectedCategory, services]);

  function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  const loadAvailability = useCallback((month: string) => {
    setLoadingDates(true);
    fetch(`/api/availability?month=${month}`)
      .then(r => r.json())
      .then(data => {
        setAvailableDates(new Set(data.dates || []));
        setLoadingDates(false);
      })
      .catch(() => setLoadingDates(false));
  }, []);

  function loadSlots(date: string, serviceId: string) {
    setLoadingSlots(true);
    fetch(`/api/slots?date=${date}&service_id=${serviceId}`)
      .then(r => r.json())
      .then(data => {
        setSlots(data.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => setLoadingSlots(false));
  }

  function handleServiceSelect(service: Service) {
    setSelectedService(service);
    setStep(2);
    loadAvailability(getCurrentMonth());
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
    return <div className="booking-loading">Behandlungen werden geladen...</div>;
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
            onMonthChange={loadAvailability}
            loading={loadingDates}
          />
        )}

        {step === 3 && selectedDate && (
          <TimeSelect
            slots={slots}
            selectedTime={selectedTime}
            onSelect={handleTimeSelect}
            loading={loadingSlots}
            selectedDate={selectedDate}
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
