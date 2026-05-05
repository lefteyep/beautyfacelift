interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_chf: number;
  category: string;
}

interface Props {
  services: Service[];
  selectedId: string | null;
  onSelect: (service: Service) => void;
  preselectedCategory?: string;
}

export function TreatmentSelect({ services, selectedId, onSelect, preselectedCategory }: Props) {
  const filtered = preselectedCategory
    ? services.filter(s => s.category === preselectedCategory)
    : services;
  const groupedServices = filtered.reduce<Record<string, Service[]>>((groups, service) => {
    const category = service.category || 'Behandlungen';
    groups[category] = groups[category] || [];
    groups[category].push(service);
    return groups;
  }, {});

  if (filtered.length === 0) {
    return (
      <div className="booking-state" role="status">
        <h3>Aktuell sind keine passenden Behandlungen online buchbar.</h3>
        <p>Bitte kontaktieren Sie uns direkt, damit wir einen Termin oder eine Beratung für Sie finden können.</p>
        <div className="booking-state-actions">
          <a href="/kontakt/" className="pill-btn pill-btn-outline">Kontakt aufnehmen</a>
          <a href="https://wa.me/41792143462" className="booking-text-link">WhatsApp schreiben</a>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-treatment-select">
      <div className="booking-choice-intro">
        <p>Wählen Sie die Behandlung, die Sie buchen möchten. Unsicher? Teresa berät Sie auch gerne vorab persönlich.</p>
        <a href="https://wa.me/41792143462" className="booking-text-link">Beratung per WhatsApp</a>
      </div>

      {Object.entries(groupedServices).map(([category, categoryServices]) => {
        const categoryId = `booking-category-${category.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`;

        return (
          <section className="booking-category" key={category} aria-labelledby={categoryId}>
            {!preselectedCategory && <h3 className="booking-category-title" id={categoryId}>{category}</h3>}
            <div className="booking-treatment-grid">
              {categoryServices.map(service => (
                <button
                  key={service.id}
                  type="button"
                  className={`booking-treatment-card ${selectedId === service.id ? 'selected' : ''}`}
                  onClick={() => onSelect(service)}
                  aria-pressed={selectedId === service.id}
                >
                  <span className="booking-treatment-kicker">{service.category}</span>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="booking-treatment-meta">
                    <span>{service.duration_minutes} Min.</span>
                    <span>CHF {service.price_chf.toFixed(0)}</span>
                  </div>
                  <span className="booking-treatment-action">
                    {selectedId === service.id ? 'Ausgewählt' : 'Auswählen'}
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
