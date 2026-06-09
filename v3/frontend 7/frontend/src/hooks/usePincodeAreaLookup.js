import { useEffect, useState } from 'react'
import { lookupPincodeArea } from '../services/locationService.js'

export function usePincodeAreaLookup(pincode, onAreaResolved) {
  const [lookupState, setLookupState] = useState({ status: 'idle', areaDetails: null, message: '' })

  useEffect(() => {
    const cleanedPincode = String(pincode || '').replace(/\D/g, '')
    if (cleanedPincode.length < 5) {
      setLookupState({ status: 'idle', areaDetails: null, message: '' })
      return undefined
    }

    let lookupCancelled = false
    const lookupTimer = window.setTimeout(() => {
      setLookupState({ status: 'loading', areaDetails: null, message: 'Fetching area...' })
      lookupPincodeArea(cleanedPincode)
        .then((areaDetails) => {
          if (lookupCancelled) return
          setLookupState({ status: 'success', areaDetails, message: areaDetails.display })
          onAreaResolved?.(areaDetails)
        })
        .catch((error) => {
          if (lookupCancelled) return
          setLookupState({
            status: 'error',
            areaDetails: null,
            message: error.response?.data?.detail || 'Area not found for this pincode.',
          })
        })
    }, 450)

    return () => {
      lookupCancelled = true
      window.clearTimeout(lookupTimer)
    }
  }, [pincode, onAreaResolved])

  return lookupState
}
