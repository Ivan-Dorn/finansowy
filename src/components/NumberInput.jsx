import { useEffect, useRef } from "react";

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className = "",
  disabled = false,
  controls = true,
  ...props
}) {
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  function triggerChange(nextValue) {
    if (onChange) {
      onChange({
        target: { value: String(nextValue) },
        currentTarget: { value: String(nextValue) },
      });
    }
  }

  function stepValue(direction) {
    if (disabled) return;

    const current = value === "" || value === undefined ? 0 : Number(value);
    const stepNum = Number(step) || 1;
    let next = direction === "up" ? current + stepNum : current - stepNum;

    const precision = step.toString().includes(".")
      ? step.toString().split(".")[1].length
      : 0;
    next = Number(next.toFixed(precision));

    if (min !== undefined && next < Number(min)) {
      next = Number(min);
    }
    if (max !== undefined && next > Number(max)) {
      next = Number(max);
    }

    triggerChange(next);
  }

  function startStepping(direction) {
    stepValue(direction);

    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        stepValue(direction);
      }, 75);
    }, 300);
  }

  function stopStepping() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  useEffect(() => {
    return () => {
      stopStepping();
    };
  }, []);

  const numVal = Number(value);
  const isMin = min !== undefined && value !== "" && numVal <= Number(min);
  const isMax = max !== undefined && value !== "" && numVal >= Number(max);

  return (
    <div className={`custom-number-wrapper ${className}`.trim()}>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        className="custom-number-input"
        {...props}
      />

      {controls && (
        <div className="custom-number-stepper" aria-hidden="true">
          <button
            type="button"
            className="custom-number-btn up"
            tabIndex={-1}
            disabled={disabled || isMax}
            onMouseDown={() => startStepping("up")}
            onMouseUp={stopStepping}
            onMouseLeave={stopStepping}
            onTouchStart={() => startStepping("up")}
            onTouchEnd={stopStepping}
            title="Zwiększ"
          >
            <svg width="8" height="6" viewBox="0 0 8 6" fill="currentColor">
              <path d="M4 1L7 5H1L4 1Z" />
            </svg>
          </button>

          <button
            type="button"
            className="custom-number-btn down"
            tabIndex={-1}
            disabled={disabled || isMin}
            onMouseDown={() => startStepping("down")}
            onMouseUp={stopStepping}
            onMouseLeave={stopStepping}
            onTouchStart={() => startStepping("down")}
            onTouchEnd={stopStepping}
            title="Zmniejsz"
          >
            <svg width="8" height="6" viewBox="0 0 8 6" fill="currentColor">
              <path d="M4 5L1 1H7L4 5Z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default NumberInput;
