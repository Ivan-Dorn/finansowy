import { useEffect, useRef, useState } from "react";

function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Wybierz...",
  className = "",
  disabled = false,
  name,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Scroll highlighted item into view if necessary
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex];
      if (highlightedEl) {
        highlightedEl.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [isOpen, highlightedIndex]);

  function openMenu() {
    const idx = options.findIndex((opt) => opt.value === value);
    setHighlightedIndex(idx >= 0 ? idx : 0);
    setIsOpen(true);
  }

  function handleTriggerClick() {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
    } else {
      openMenu();
    }
  }

  function handleSelect(option) {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  }

  function handleKeyDown(event) {
    if (disabled) return;

    if (!isOpen) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    } else if (event.key === "Tab") {
      setIsOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next < options.length ? next : prev;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next >= 0 ? next : 0;
      });
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < options.length &&
        !options[highlightedIndex].disabled
      ) {
        handleSelect(options[highlightedIndex]);
      }
    }
  }

  const isValueSelected =
    value !== "" && value !== null && value !== undefined && selectedOption;

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${isOpen ? "is-open" : ""} ${
        disabled ? "is-disabled" : ""
      } ${className}`.trim()}
      onKeyDown={handleKeyDown}
    >
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        className="custom-select-trigger"
        onClick={handleTriggerClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="custom-select-value">
          {isValueSelected ? (
            <span className="custom-select-selected-content">
              <span className="custom-select-text">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="custom-select-badge">
                  {selectedOption.badge}
                </span>
              )}
            </span>
          ) : (
            <span className="custom-select-placeholder">
              {placeholder || (selectedOption ? selectedOption.label : "Wybierz...")}
            </span>
          )}
        </span>

        <span className="custom-select-arrow" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="custom-select-dropdown"
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="custom-select-empty">Brak dostępnych opcji</div>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <div
                  key={option.value || `opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-select-option ${
                    isSelected ? "is-selected" : ""
                  } ${isHighlighted ? "is-highlighted" : ""} ${
                    option.isPlaceholder || option.value === ""
                      ? "is-placeholder-option"
                      : ""
                  } ${option.disabled ? "is-disabled" : ""}`.trim()}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="custom-select-option-content">
                    <span className="custom-select-option-label">
                      {option.label}
                    </span>
                    {option.badge && (
                      <span className="custom-select-badge">
                        {option.badge}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <span
                      className="custom-select-check"
                      aria-hidden="true"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
