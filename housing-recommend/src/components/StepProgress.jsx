import React from 'react';
import { Check } from 'lucide-react';

export default function StepProgress({ currentStep = 1, totalSteps = 4 }) {
  const steps = [
    { number: 1, title: '학교 선택' },
    { number: 2, title: '통학 횟수' },
    { number: 3, title: '교통·환승' },
    { number: 4, title: '중요도 설정' }
  ];

  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="step-progress-container">
      {/* 진행 바 */}
      <div className="step-progress-track">
        <div
          className="step-progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      {/* 스텝 번호 및 라벨 */}
      <div className="step-nodes-row">
        {steps.map((step) => {
          const isDone = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div
              key={step.number}
              className={`step-node-item ${isDone ? 'done' : ''} ${
                isCurrent ? 'current' : ''
              }`}
            >
              <div className="step-badge">
                {isDone ? <Check size={14} strokeWidth={3} /> : step.number}
              </div>
              <span className="step-title">{step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
