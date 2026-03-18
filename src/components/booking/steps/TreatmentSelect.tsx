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

  return (
    <div className="booking-treatment-grid">
      {filtered.map(service => (
        <button
          key={service.id}
          type="button"
          className={`booking-treatment-card ${selectedId === service.id ? 'selected' : ''}`}
          onClick={() => onSelect(service)}
        >
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <div className="booking-treatment-meta">
            <span>{service.duration_minutes} Min.</span>
            <span>CHF {service.price_chf.toFixed(0)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
