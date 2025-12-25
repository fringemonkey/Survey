import React, { useState, useRef, useEffect } from 'react'

function SearchableDropdown({
  label,
  name,
  value,
  onChange,
  onOtherChange,
  error,
  placeholder = 'Search or select...',
  required = false,
  options = [],
  className = '',
  otherValue = '',
  otherPlaceholder = 'Specify other...',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const isOtherSelected = value === 'Other'
  const showOtherInput = isOtherSelected

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchTerm])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        })
      }
    }
  }, [highlightedIndex])

  const handleSelect = (option) => {
    onChange({
      target: {
        name,
        value: option,
      },
    })
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    setIsOpen(true)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleSelect(filteredOptions[highlightedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
      setHighlightedIndex(-1)
      inputRef.current?.blur()
    }
  }

  const baseClasses = `
    w-full px-4 py-2 bg-notion-bg-secondary border border-notion-bg-tertiary 
    rounded-lg text-notion-text placeholder-notion-text-secondary
    focus:outline-none focus:ring-2 focus:ring-notion-accent focus:border-transparent
    transition-all duration-200
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  const displayValue = isOtherSelected ? 'Other' : value || ''

  return (
    <div className="mb-6" ref={dropdownRef}>
      <label htmlFor={name} className="block mb-2 font-medium text-notion-text">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={baseClasses}
          readOnly={!isOpen}
        />

        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen) {
              inputRef.current?.focus()
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-notion-text-secondary hover:text-notion-text transition-colors"
          aria-label="Toggle dropdown"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-notion-bg-secondary border border-notion-bg-tertiary rounded-lg shadow-lg max-h-60 overflow-auto">
            <ul ref={listRef} className="py-1" role="listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li
                    key={option}
                    role="option"
                    aria-selected={value === option}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-4 py-2 cursor-pointer transition-colors
                      ${
                        index === highlightedIndex
                          ? 'bg-notion-accent/20 text-notion-accent'
                          : 'hover:bg-notion-bg-tertiary text-notion-text'
                      }
                      ${value === option ? 'bg-notion-accent/10' : ''}
                    `}
                  >
                    {option}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-notion-text-secondary">
                  No results found
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {showOtherInput && (
        <div className="mt-3">
          <input
            type="text"
            name={`${name}Other`}
            value={otherValue}
            onChange={onOtherChange}
            placeholder={otherPlaceholder}
            className={baseClasses}
          />
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default SearchableDropdown

