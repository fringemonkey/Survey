import React from 'react'
import SearchableDropdown from './SearchableDropdown'

function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onOtherChange,
  error,
  placeholder,
  required = false,
  rows,
  options = [],
  className = '',
  searchable = false,
  otherValue = '',
  otherPlaceholder = '',
}) {
  const baseClasses = `
    w-full px-4 py-2 bg-notion-bg-secondary border border-notion-bg-tertiary 
    rounded-lg text-notion-text placeholder-notion-text-secondary
    focus:outline-none focus:ring-2 focus:ring-notion-accent focus:border-transparent
    transition-all duration-200
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  // Use SearchableDropdown if searchable prop is true and options are provided
  if (searchable && type === 'select' && Array.isArray(options) && options.length > 0) {
    return (
      <SearchableDropdown
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        onOtherChange={onOtherChange}
        error={error}
        placeholder={placeholder}
        required={required}
        options={options}
        className={className}
        otherValue={otherValue}
        otherPlaceholder={otherPlaceholder}
      />
    )
  }

  return (
    <div className="mb-6">
      <label htmlFor={name} className="block mb-2 font-medium text-notion-text">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows || 4}
          className={baseClasses}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={baseClasses}
        >
          <option value="">Select an option...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'radio' ? (
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:text-notion-accent transition-colors"
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                required={required}
                className="w-4 h-4 text-notion-accent focus:ring-notion-accent"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={baseClasses}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default FormField

