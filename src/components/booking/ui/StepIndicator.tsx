interface Props {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: Props) {
  return (
    <nav className="booking-steps" aria-label="Buchungsfortschritt">
      <ol className="booking-step-list">
      {labels.map((_, i) => (
        <li
          key={i}
          className={`booking-step ${i + 1 === currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
          aria-current={i + 1 === currentStep ? 'step' : undefined}
        >
          <span className="booking-step-bar" aria-hidden="true" />
          <span className="booking-step-label">
            <span className="booking-step-number">{i + 1}</span>
            {labels[i]}
          </span>
        </li>
      ))}
      </ol>
      <span className="sr-only">Schritt {currentStep} von {totalSteps}: {labels[currentStep - 1]}</span>
    </nav>
  );
}
