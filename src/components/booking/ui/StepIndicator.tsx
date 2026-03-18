interface Props {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: Props) {
  return (
    <div className="booking-steps">
      {labels.map((label, i) => (
        <div
          key={i}
          className={`booking-step ${i + 1 === currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
        >
          <div className="booking-step-number">{i + 1 < currentStep ? '✓' : i + 1}</div>
          <span className="booking-step-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
