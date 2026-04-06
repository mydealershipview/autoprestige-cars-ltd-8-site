'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MapPin, Check, Loader2 } from 'lucide-react'
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete'

interface AddressData {
  streetNumber: string
  route: string
  locality: string
  administrativeAreaLevel1: string
  administrativeAreaLevel2: string
  postalCode: string
  country: string
  formattedAddress: string
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData) => void
  placeholder?: string
  className?: string
  required?: boolean
  countries?: string[]
}

export default function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Start typing your address...",
  className = "",
  required = false,
  countries = ['GB']
}: AddressAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    inputValue,
    suggestions,
    isLoading,
    showSuggestions,
    mapRef,
    handleInputChange,
    selectAddress,
    clearSuggestions,
    setInputValue,
  } = useAddressAutocomplete({
    onAddressSelect: (address) => {
      onAddressSelect(address)
      setIsVerified(true)
    },
    countries,
    types: ['address'],
  })

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        clearSuggestions()
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [clearSuggestions])

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      clearSuggestions()
      inputRef.current?.blur()
    }
  }

  const handleInputFocus = () => {
    setIsFocused(true)
    if (inputValue.length >= 3) {
      handleInputChange(inputValue)
    }
  }

  const handleInputBlur = () => {
    // Delay to allow suggestion clicks to register
    setTimeout(() => {
      setIsFocused(false)
    }, 200)
  }

  const handleSuggestionClick = (prediction: google.maps.places.AutocompletePrediction) => {
    selectAddress(prediction)
    setIsFocused(false)
  }

  const handleManualInput = (value: string) => {
    setIsVerified(false)
    handleInputChange(value)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden div for Google Maps service initialization */}
      <div ref={mapRef} style={{ display: 'none' }} />

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleManualInput(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#44903C]/30 focus:border-[#44903C] !transition-all !duration-200 ${className}`}
        />

        {/* Map Pin Icon */}
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

        {/* Loading/Verified Icon */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-[#44903C] animate-spin" />
          ) : isVerified ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : null}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && isFocused && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((prediction) => (
            <div
              key={prediction.place_id}
              onClick={() => handleSuggestionClick(prediction)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 !transition-colors"
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address verification status */}
      {inputValue && !isLoading && (
        <div className="mt-2 text-xs">
          {isVerified ? (
            <span className="text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Address verified
            </span>
          ) : (
            <span className="text-amber-600">
              Please select an address from the dropdown to verify
            </span>
          )}
        </div>
      )}
    </div>
  )
}
