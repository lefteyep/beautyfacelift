import { useMemo, useState } from 'react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('de-CH');

  const visibleServices = useMemo(() => (
    preselectedCategory
      ? services.filter(service => service.category === preselectedCategory)
      : services
  ), [preselectedCategory, services]);

  const categoryOptions = useMemo(() => {
    return visibleServices.reduce<string[]>((categories, service) => {
      const category = service.category || 'Behandlungen';
      if (!categories.includes(category)) categories.push(category);
      return categories;
    }, []);
  }, [visibleServices]);

  const filtered = useMemo(() => {
    return visibleServices.filter(service => {
      const category = service.category || 'Behandlungen';
      const matchesCategory = preselectedCategory || activeCategory === 'all' || category === activeCategory;
      const searchableText = `${service.name} ${service.description || ''} ${category}`.toLocaleLowerCase('de-CH');
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, normalizedSearch, preselectedCategory, visibleServices]);

  const groupedServices = filtered.reduce<Record<string, Service[]>>((groups, service) => {
    const category = service.category || 'Behandlungen';
    groups[category] = groups[category] || [];
    groups[category].push(service);
    return groups;
  }, {});

  if (visibleServices.length === 0) {
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

      <div className="booking-treatment-controls">
        <label className="booking-search-label" htmlFor="booking-service-search">
          Behandlung suchen
        </label>
        <div className="booking-search-row">
          <input
            id="booking-service-search"
            className="booking-search-input"
            type="search"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="z.B. Hydra4Face, Laser, Waxing"
            autoComplete="off"
            aria-describedby="booking-service-count"
          />
          {searchTerm && (
            <button
              type="button"
              className="booking-search-clear"
              onClick={() => setSearchTerm('')}
              aria-label="Suche löschen"
            >
              Löschen
            </button>
          )}
        </div>

        {!preselectedCategory && categoryOptions.length > 1 && (
          <div className="booking-category-filter" aria-label="Behandlungskategorie filtern">
            <button
              type="button"
              className={`booking-category-chip ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
              aria-pressed={activeCategory === 'all'}
            >
              Alle
            </button>
            {categoryOptions.map(category => (
              <button
                key={category}
                type="button"
                className={`booking-category-chip ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <p className="booking-result-count" id="booking-service-count" role="status">
          {filtered.length === 1 ? '1 Behandlung gefunden' : `${filtered.length} Behandlungen gefunden`}
        </p>
      </div>

      {filtered.length === 0 && (
        <div className="booking-state" role="status">
          <h3>Keine passende Behandlung gefunden.</h3>
          <p>Bitte löschen Sie die Suche oder schreiben Sie uns direkt. Wir helfen Ihnen, die passende Behandlung zu wählen.</p>
          <div className="booking-state-actions">
            <button
              type="button"
              className="pill-btn pill-btn-outline"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
            >
              Suche zurücksetzen
            </button>
            <a href="https://wa.me/41792143462" className="booking-text-link">WhatsApp schreiben</a>
          </div>
        </div>
      )}

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
