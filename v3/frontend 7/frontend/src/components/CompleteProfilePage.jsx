import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Camera, FileText, Home, Lock, Mail, MapPin, Phone, Upload, UserRound } from 'lucide-react'
import Logo from './Logo.jsx'
import PincodeAreaHint from './common/PincodeAreaHint.jsx'
import ProfileImageUpload from './common/ProfileImageUpload.jsx'
import { usePincodeAreaLookup } from '../hooks/usePincodeAreaLookup.js'
import { completeUserProfile } from '../services/authService.js'
import { uploadLocalFile } from '../services/uploadService.js'
import { setAuthenticatedUser } from '../redux/authSlice.js'

function rolePath(role) {
  if (role === 'CONTRACTOR') return '/contractor'
  if (role === 'SUPPLIER') return '/supplier'
  return '/owner'
}

function readPendingEstimate() {
  try {
    return JSON.parse(localStorage.getItem('gharbano_pending_estimate') || 'null')
  } catch {
    return null
  }
}

function floorCountFromEstimate(value) {
  if (value === 'Ground') return 1
  if (value === 'Ground + 1') return 2
  if (value === 'Ground + 2') return 3
  if (value === 'Ground + 3') return 4
  return 1
}

function budgetNumberFromEstimate(value) {
  const budgetMap = {
    '10 - 15 Lakhs': 1500000,
    '15 - 25 Lakhs': 2500000,
    '25 - 30 Lakhs': 3000000,
    '30 - 50 Lakhs': 5000000,
    '50 Lakhs+': 5000000,
  }
  return budgetMap[value] || 0
}

const contractorServiceOptions = [
  'Residential Construction',
  'Commercial Construction',
  'Renovation & Remodeling',
  'Interior Work',
  'Structural Work',
  'Plumbing & Electrical',
]

const contractorEquipmentOptions = [
  'Concrete Mixer',
  'Excavator',
  'Scaffolding',
  'Bar Bending Machine',
  'Concrete Vibrator',
  'Safety Equipment',
]

const contractorDocumentTypes = [
  'Business License',
  'Company Registration',
  'GST Certificate',
  'PAN Card',
  'Insurance Certificate',
  'ISO Certificate',
]

const supplierCategoryOptions = [
  'Cement',
  'Steel',
  'Sand',
  'Bricks',
  'Tiles',
  'Paint',
  'Electrical',
  'Plumbing',
]

const supplierDocumentTypes = [
  'Shop License',
  'GST Certificate',
  'PAN Card',
  'Trade License',
  'Material Quality Certificate',
  'Insurance Certificate',
]

const businessTypeOptions = [
  'Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'Public Limited',
  'One Person Company',
  'Trust / Society',
]

export default function CompleteProfilePage() {
  const { user, accessToken, refreshToken } = useSelector((state) => state.auth)
  const pendingEstimate = useMemo(readPendingEstimate, [])
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [profileDetails, setProfileDetails] = useState({
    phone: user?.phone || '',
    address: user?.address || pendingEstimate?.area || '',
    pincode: user?.pincode || pendingEstimate?.pincode || '',
    building_type: pendingEstimate?.buildingType || 'RESIDENTIAL',
    construction_type: pendingEstimate?.constructionType || 'CONTRACTOR',
    budget: budgetNumberFromEstimate(pendingEstimate?.budget),
    land_area: Number(pendingEstimate?.landArea || 0),
    floors: floorCountFromEstimate(pendingEstimate?.floors),
    company_name: '',
    company_logo_url: '',
    license_number: '',
    experience_years: 0,
    profile_image_url: '',
    about: '',
    gstin: '',
    pan: '',
    website: '',
    business_type: '',
    registration_year: '',
    team_size: '',
    insurance_available: false,
    service_locations: '',
    services_offered: '',
    equipment_owned: '',
    documents: '',
    gallery: '',
    store_name: '',
    store_logo_url: '',
    categories: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [uploadMessage, setUploadMessage] = useState('')
  const [serviceLocationInputs, setServiceLocationInputs] = useState([
    user?.address || pendingEstimate?.area || '',
    '',
    '',
  ])
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedEquipment, setSelectedEquipment] = useState([])
  const [selectedSupplierCategories, setSelectedSupplierCategories] = useState([])
  const [galleryImageUrls, setGalleryImageUrls] = useState([])
  const [documentUploads, setDocumentUploads] = useState({})
  const applyResolvedArea = useCallback((areaDetails) => {
    setProfileDetails((currentProfileDetails) => ({
      ...currentProfileDetails,
      address: areaDetails.display || currentProfileDetails.address,
      pincode: areaDetails.pincode || currentProfileDetails.pincode,
      service_locations: currentProfileDetails.service_locations || areaDetails.display || '',
    }))
    setServiceLocationInputs((currentLocations) => {
      if (currentLocations.some((location) => location.trim())) return currentLocations
      return [areaDetails.display || '', '', '']
    })
  }, [])
  const pincodeLookupState = usePincodeAreaLookup(profileDetails.pincode, applyResolvedArea)

  const updateProfileField = (field, value) => {
    setProfileDetails((currentProfileDetails) => ({ ...currentProfileDetails, [field]: value }))
    setValidationErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors
      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const clearValidationError = (field) => {
    setValidationErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors
      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const fieldHasError = (field) => Boolean(validationErrors[field])

  const fieldShellClass = (field) => `mt-1.5 flex h-10 items-center gap-3 rounded-lg border px-3 ${
    fieldHasError(field) ? 'border-red-500 bg-red-50 ring-1 ring-red-200' : 'border-forest-100 bg-white'
  }`

  const fieldInputClass = (field, extraClass = '') => `${extraClass} rounded-lg border px-3 text-sm outline-none ${
    fieldHasError(field) ? 'border-red-500 bg-red-50 ring-1 ring-red-200 focus:border-red-500' : 'border-forest-100 bg-white focus:border-forest-400'
  }`

  const fieldTextareaClass = (field) => `mt-1 min-h-20 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
    fieldHasError(field) ? 'border-red-500 bg-red-50 ring-1 ring-red-200 focus:border-red-500' : 'border-forest-100 bg-white focus:border-forest-400'
  }`

  const optionGroupClass = (field, extraClass = '') => `${extraClass} ${
    fieldHasError(field) ? 'rounded-xl border border-red-500 bg-red-50 p-2 ring-1 ring-red-200' : ''
  }`

  const FieldError = ({ field }) => (
    fieldHasError(field) ? <p className="mt-1 text-[11px] font-bold text-red-600">{validationErrors[field]}</p> : null
  )

  const toggleListValue = (value, selectedValues, setSelectedValues, validationField) => {
    setSelectedValues((currentValues) => (
      currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value]
    ))
    if (validationField) clearValidationError(validationField)
  }

  const updateServiceLocation = (index, value) => {
    setServiceLocationInputs((currentLocations) => currentLocations.map((location, locationIndex) => (
      locationIndex === index ? value : location
    )))
    if (value.trim()) clearValidationError('service_locations')
  }

  const uploadGalleryImages = async (files) => {
    const selectedFiles = Array.from(files || [])
    if (!selectedFiles.length) return
    setUploadMessage('Uploading gallery images...')
    const uploadedFiles = await Promise.all(selectedFiles.map(uploadLocalFile))
    setGalleryImageUrls((currentUrls) => [...currentUrls, ...uploadedFiles.map((item) => item.url)])
    setUploadMessage('Gallery images uploaded.')
  }

  const uploadDocument = async (documentType, file) => {
    if (!file) return
    setUploadMessage(`Uploading ${documentType}...`)
    const uploadedFile = await uploadLocalFile(file)
    setDocumentUploads((currentUploads) => ({ ...currentUploads, [documentType]: uploadedFile.url }))
    setUploadMessage(`${documentType} uploaded.`)
  }

  const uploadProfileImage = async (file) => {
    if (!file) return
    setUploadMessage('Uploading profile image...')
    const uploadedFile = await uploadLocalFile(file)
    updateProfileField('profile_image_url', uploadedFile.url)
    setUploadMessage('Profile image uploaded.')
  }

  const uploadBusinessLogo = async (field, file) => {
    if (!file) return
    setUploadMessage('Uploading logo...')
    const uploadedFile = await uploadLocalFile(file)
    updateProfileField(field, uploadedFile.url)
    setUploadMessage('Logo uploaded.')
  }

  const submitProfile = async (event) => {
    event.preventDefault()
    const selectedServiceLocations = serviceLocationInputs.map((location) => location.trim()).filter(Boolean)
    const nextValidationErrors = {}
    if (!String(profileDetails.phone || '').trim()) nextValidationErrors.phone = 'Phone number is required.'
    if (!String(profileDetails.address || '').trim()) nextValidationErrors.address = 'Address is required.'
    if (!String(profileDetails.pincode || '').trim()) nextValidationErrors.pincode = 'Pincode is required.'

    if (user?.role === 'CONTRACTOR') {
      if (!String(profileDetails.company_name || '').trim()) nextValidationErrors.company_name = 'Company name is required.'
      if (!String(profileDetails.license_number || '').trim()) nextValidationErrors.license_number = 'License number is required.'
      if (!Number(profileDetails.experience_years || 0)) nextValidationErrors.experience_years = 'Experience years is required.'
      if (!String(profileDetails.about || '').trim()) nextValidationErrors.about = 'About company is required.'
      if (selectedServiceLocations.length < 1) nextValidationErrors.service_locations = 'Add at least one service location.'
      if (!selectedServices.length) nextValidationErrors.services_offered = 'Select at least one service offered.'
    }
    if (user?.role === 'SUPPLIER') {
      if (!String(profileDetails.store_name || '').trim()) nextValidationErrors.store_name = 'Store name is required.'
      if (!String(profileDetails.about || '').trim()) nextValidationErrors.about = 'About store is required.'
      if (selectedServiceLocations.length < 1) nextValidationErrors.service_locations = 'Add at least one delivery location.'
      if (!selectedSupplierCategories.length) nextValidationErrors.categories = 'Select at least one product category.'
    }

    if (Object.keys(nextValidationErrors).length) {
      setValidationErrors(nextValidationErrors)
      setErrorMessage('Please complete the highlighted required fields.')
      return
    }
    try {
      setErrorMessage('')
      const updatedUser = await completeUserProfile({
        ...profileDetails,
        service_locations: selectedServiceLocations.join(', '),
        services_offered: selectedServices.join(', '),
        equipment_owned: selectedEquipment.join(', '),
        categories: selectedSupplierCategories.join(', ') || profileDetails.categories,
        gallery: galleryImageUrls.join(', '),
        documents: Object.entries(documentUploads).map(([documentType, url]) => `${documentType}: ${url}`).join(', '),
        budget: profileDetails.budget === '' ? 0 : Number(profileDetails.budget || 0),
        land_area: profileDetails.land_area === '' ? 0 : Number(profileDetails.land_area || 0),
        floors: profileDetails.floors === '' ? 1 : Number(profileDetails.floors || 1),
        experience_years: profileDetails.experience_years === '' ? 0 : Number(profileDetails.experience_years || 0),
        registration_year: profileDetails.registration_year === '' ? null : Number(profileDetails.registration_year),
      })
      dispatch(setAuthenticatedUser({ accessToken, refreshToken, user: updatedUser }))
      localStorage.removeItem('gharbano_pending_estimate')
      navigate(rolePath(updatedUser.role), { replace: true })
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Could not complete profile')
    }
  }

  return (
    <main className="relative grid min-h-screen grid-rows-[70px_minmax(0,1fr)] overflow-x-hidden bg-cream text-graphite">
      <img src="/login-background.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,244,236,0.78)_0%,rgba(247,244,236,0.56)_52%,rgba(247,244,236,0.36)_100%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 lg:px-10">
        <Logo />
        <a href="/" className="inline-flex h-9 items-center gap-2 rounded-full bg-white/85 px-4 text-sm font-semibold shadow-sm ring-1 ring-black/10 backdrop-blur">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </a>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-[1500px] px-6 py-6 lg:px-10">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-forest-100 bg-white/82 p-4 shadow-card backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="h-display text-[clamp(2rem,3vw,3rem)] leading-[1.08] text-forest-950">
              Complete your profile.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-graphite/75">
              Add the details needed to activate your dashboard and help homeowners evaluate your profile.
            </p>
          </div>
          {pendingEstimate && (
            <div className="rounded-2xl border border-forest-100 bg-white/80 p-4 shadow-card lg:w-80">
              <p className="text-xs font-bold uppercase tracking-wider text-forest-700">Saved estimate</p>
              <p className="mt-2 text-sm text-graphite/70">
                {pendingEstimate.landArea || 0} sq ft, {pendingEstimate.floors}, {pendingEstimate.budget}, {pendingEstimate.constructionType}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white/94 p-4 shadow-float ring-1 ring-black/10 backdrop-blur-md lg:p-5">
          <h2 className="font-display text-2xl font-extrabold leading-tight text-graphite">
            Profile details <Home className="inline h-7 w-7 fill-forest-500 text-forest-500" />
          </h2>
          <p className="mt-1 text-sm text-graphite/70">Required before opening your dashboard.</p>

          <form onSubmit={submitProfile} className="mt-4 space-y-3">
            <ProfileImageUpload
              imageSource={profileDetails.profile_image_url}
              title={user?.role === 'SUPPLIER' ? 'Store Image' : 'Profile Image'}
              note={user?.role === 'OWNER' ? 'Upload your profile photo.' : 'Upload a clear business/profile image.'}
              onUpload={(file) => uploadProfileImage(file).catch((error) => setUploadMessage(error.response?.data?.detail || 'Profile image upload failed.'))}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold">Name</span>
                <span className="mt-1.5 flex h-10 items-center gap-3 rounded-lg border border-forest-100 bg-white px-3">
                  <UserRound className="h-4 w-4 text-graphite/45" />
                  <input value={user?.name || ''} disabled className="w-full bg-transparent text-sm outline-none" />
                </span>
              </label>
              <label className="block">
                <span className="text-xs font-bold">Email</span>
                <span className="mt-1.5 flex h-10 items-center gap-3 rounded-lg border border-forest-100 bg-white px-3">
                  <Mail className="h-4 w-4 text-graphite/45" />
                  <input value={user?.email || ''} disabled className="w-full bg-transparent text-sm outline-none" />
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <label className="block">
              <span className="text-xs font-bold">Phone Number</span>
              <span className={fieldShellClass('phone')}>
                <Phone className="h-4 w-4 text-graphite/45" />
                <input value={profileDetails.phone} onChange={(event) => updateProfileField('phone', event.target.value)} placeholder="+91 98765 43210" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
              </span>
              <FieldError field="phone" />
            </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-bold">Address</span>
                <span className={fieldShellClass('address')}>
                  <MapPin className="h-4 w-4 text-graphite/45" />
                  <input value={profileDetails.address} onChange={(event) => updateProfileField('address', event.target.value)} placeholder="Area fills from pincode, edit full address manually" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
                </span>
                <FieldError field="address" />
              </label>
              <label className="block">
                <span className="text-xs font-bold">Pincode</span>
                <span className={fieldShellClass('pincode')}>
                  <input value={profileDetails.pincode} onChange={(event) => updateProfileField('pincode', event.target.value)} placeholder="500001" className="w-full bg-transparent text-sm outline-none placeholder:text-graphite/45" />
                </span>
                <FieldError field="pincode" />
                <PincodeAreaHint lookupState={pincodeLookupState} />
              </label>
            </div>

            {user?.role === 'OWNER' && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="block">
                  <span className="text-xs font-bold">Building Type</span>
                  <select value={profileDetails.building_type} onChange={(event) => updateProfileField('building_type', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm">
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="VILLA">Villa</option>
                    <option value="DUPLEX">Duplex</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold">Construction Type</span>
                  <select value={profileDetails.construction_type} onChange={(event) => updateProfileField('construction_type', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm">
                    <option value="CONTRACTOR">Contractor Based</option>
                    <option value="SELF_CONSTRUCTION">Self Construction</option>
                  </select>
                </label>
              </div>
            )}

            {user?.role === 'CONTRACTOR' && (
              <div className="space-y-3 rounded-xl border border-forest-100 bg-cream/35 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-forest-700">Contractor profile</p>
                <ProfileImageUpload
                  imageSource={profileDetails.company_logo_url}
                  title="Company Logo"
                  note="Upload your construction company logo."
                  onUpload={(file) => uploadBusinessLogo('company_logo_url', file).catch((error) => setUploadMessage(error.response?.data?.detail || 'Logo upload failed.'))}
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <label className="block">
                    <span className="text-xs font-bold">Company Name</span>
                    <input value={profileDetails.company_name} onChange={(event) => updateProfileField('company_name', event.target.value)} className={fieldInputClass('company_name', 'mt-1.5 h-10 w-full')} />
                    <FieldError field="company_name" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">License Number</span>
                    <input value={profileDetails.license_number} onChange={(event) => updateProfileField('license_number', event.target.value)} className={fieldInputClass('license_number', 'mt-1.5 h-10 w-full')} />
                    <FieldError field="license_number" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">Experience Years</span>
                    <input type="number" value={profileDetails.experience_years} onChange={(event) => updateProfileField('experience_years', event.target.value)} className={fieldInputClass('experience_years', 'mt-1.5 h-10 w-full')} />
                    <FieldError field="experience_years" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">GSTIN</span>
                    <input value={profileDetails.gstin} onChange={(event) => updateProfileField('gstin', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">PAN</span>
                    <input value={profileDetails.pan} onChange={(event) => updateProfileField('pan', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">Website</span>
                    <input value={profileDetails.website} onChange={(event) => updateProfileField('website', event.target.value)} placeholder="www.company.com" className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">Business Type</span>
                    <select value={profileDetails.business_type} onChange={(event) => updateProfileField('business_type', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm">
                      <option value="" disabled>Select Business Type</option>
                      {businessTypeOptions.map((businessType) => (
                        <option key={businessType} value={businessType}>{businessType}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">Registration Year</span>
                    <input type="number" value={profileDetails.registration_year} onChange={(event) => updateProfileField('registration_year', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">Team Size</span>
                    <input value={profileDetails.team_size} onChange={(event) => updateProfileField('team_size', event.target.value)} placeholder="25 - 50 Workers" className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm" />
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_1fr]">
                <label className="block">
                  <span className="text-xs font-bold">About Company</span>
                  <textarea value={profileDetails.about} onChange={(event) => updateProfileField('about', event.target.value)} className={fieldTextareaClass('about')} />
                  <FieldError field="about" />
                </label>
                  <div>
                    <span className="text-xs font-bold">Service Locations</span>
                    <p className="text-[11px] font-semibold text-graphite/50">Min 1, max 3.</p>
                    <div className="mt-1 grid grid-cols-1 gap-2">
                      {serviceLocationInputs.map((location, index) => (
                        <input
                          key={index}
                          value={location}
                          onChange={(event) => updateServiceLocation(index, event.target.value)}
                          placeholder={index === 0 ? 'Primary service location' : `Optional location ${index + 1}`}
                          className={fieldInputClass('service_locations', 'h-10')}
                        />
                      ))}
                    </div>
                    <FieldError field="service_locations" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <div>
                    <span className="text-xs font-bold">Services Offered</span>
                    <div className={optionGroupClass('services_offered', 'mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3')}>
                      {contractorServiceOptions.map((service) => (
                        <label key={service} className="flex min-h-9 items-center gap-2 rounded-lg border border-forest-100 bg-white px-2.5 py-1.5 text-[11px] font-bold text-graphite/70">
                          <input type="checkbox" checked={selectedServices.includes(service)} onChange={() => toggleListValue(service, selectedServices, setSelectedServices, 'services_offered')} />
                          {service}
                        </label>
                      ))}
                    </div>
                    <FieldError field="services_offered" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">Equipment Owned</span>
                    <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                      {contractorEquipmentOptions.map((equipment) => (
                        <label key={equipment} className="flex min-h-9 items-center gap-2 rounded-lg border border-forest-100 bg-white px-2.5 py-1.5 text-[11px] font-bold text-graphite/70">
                          <input type="checkbox" checked={selectedEquipment.includes(equipment)} onChange={() => toggleListValue(equipment, selectedEquipment, setSelectedEquipment)} />
                          {equipment}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-xl border border-forest-100 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold">Gallery Images</span>
                        <p className="text-[11px] font-semibold text-graphite/50">Upload or camera.</p>
                      </div>
                      <span className="text-[11px] font-bold text-forest-700">{galleryImageUrls.length} uploaded</span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-forest-200 bg-cream/40 px-3 text-xs font-bold text-forest-700">
                        <Upload className="h-4 w-4" /> Upload Images
                        <input type="file" accept="image/*" multiple onChange={(event) => uploadGalleryImages(event.target.files).catch((error) => setUploadMessage(error.response?.data?.detail || 'Image upload failed.'))} className="sr-only" />
                      </label>
                      <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-forest-200 bg-cream/40 px-3 text-xs font-bold text-forest-700">
                        <Camera className="h-4 w-4" /> Take Photo
                        <input type="file" accept="image/*" capture="environment" onChange={(event) => uploadGalleryImages(event.target.files).catch((error) => setUploadMessage(error.response?.data?.detail || 'Image upload failed.'))} className="sr-only" />
                      </label>
                    </div>
                  </div>
                  <div className="rounded-xl border border-forest-100 bg-white p-3">
                    <span className="text-xs font-bold">Documents</span>
                    <p className="text-[11px] font-semibold text-graphite/50">Upload Business License, Registration, GST, PAN, Insurance and ISO if available.</p>
                    <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                      {contractorDocumentTypes.map((documentType) => (
                        <label key={documentType} className="flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-lg border border-forest-100 bg-cream/35 px-2.5 py-1.5 text-[11px] font-bold text-graphite/70">
                          <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-warm" /> {documentType}</span>
                          <span className="text-forest-700">{documentUploads[documentType] ? 'Uploaded' : 'Upload'}</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(event) => uploadDocument(documentType, event.target.files?.[0]).catch((error) => setUploadMessage(error.response?.data?.detail || 'Document upload failed.'))} className="sr-only" />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {uploadMessage && <p className="text-xs font-semibold text-forest-700">{uploadMessage}</p>}
                <label className="flex items-center gap-2 text-xs font-bold">
                  <input type="checkbox" checked={profileDetails.insurance_available} onChange={(event) => updateProfileField('insurance_available', event.target.checked)} />
                  Insurance available
                </label>
              </div>
            )}

            {user?.role === 'SUPPLIER' && (
              <div className="space-y-3 rounded-xl border border-forest-100 bg-cream/35 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-forest-700">Supplier profile</p>
                <ProfileImageUpload
                  imageSource={profileDetails.store_logo_url}
                  title="Store Logo"
                  note="Upload your supplier store logo."
                  onUpload={(file) => uploadBusinessLogo('store_logo_url', file).catch((error) => setUploadMessage(error.response?.data?.detail || 'Logo upload failed.'))}
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <label className="block">
                    <span className="text-xs font-bold">Store Name</span>
                    <input value={profileDetails.store_name} onChange={(event) => updateProfileField('store_name', event.target.value)} className={fieldInputClass('store_name', 'mt-1.5 h-10 w-full')} />
                    <FieldError field="store_name" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">GSTIN</span>
                    <input value={profileDetails.gstin} onChange={(event) => updateProfileField('gstin', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">PAN</span>
                    <input value={profileDetails.pan} onChange={(event) => updateProfileField('pan', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">Website</span>
                    <input value={profileDetails.website} onChange={(event) => updateProfileField('website', event.target.value)} placeholder="www.store.com" className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">Business Type</span>
                    <select value={profileDetails.business_type} onChange={(event) => updateProfileField('business_type', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm">
                      <option value="" disabled>Select Business Type</option>
                      {businessTypeOptions.map((businessType) => (
                        <option key={businessType} value={businessType}>{businessType}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold">Registration Year</span>
                    <input type="number" value={profileDetails.registration_year} onChange={(event) => updateProfileField('registration_year', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-forest-100 bg-white px-3 text-sm" />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.1fr_0.9fr]">
                  <label className="block">
                    <span className="text-xs font-bold">About Store</span>
                    <textarea value={profileDetails.about} onChange={(event) => updateProfileField('about', event.target.value)} className={fieldTextareaClass('about')} />
                    <FieldError field="about" />
                  </label>
                  <div>
                    <span className="text-xs font-bold">Delivery Locations</span>
                    <p className="text-[11px] font-semibold text-graphite/50">Min 1, max 3.</p>
                    <div className="mt-1 grid grid-cols-1 gap-2">
                      {serviceLocationInputs.map((location, index) => (
                        <input
                          key={index}
                          value={location}
                          onChange={(event) => updateServiceLocation(index, event.target.value)}
                          placeholder={index === 0 ? 'Primary delivery location' : `Optional location ${index + 1}`}
                          className={fieldInputClass('service_locations', 'h-10')}
                        />
                      ))}
                    </div>
                    <FieldError field="service_locations" />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold">Product Categories</span>
                  <div className={optionGroupClass('categories', 'mt-1.5 grid grid-cols-2 gap-1.5 md:grid-cols-4 xl:grid-cols-8')}>
                    {supplierCategoryOptions.map((category) => (
                      <label key={category} className="flex min-h-9 items-center gap-2 rounded-lg border border-forest-100 bg-white px-2.5 py-1.5 text-[11px] font-bold text-graphite/70">
                        <input type="checkbox" checked={selectedSupplierCategories.includes(category)} onChange={() => toggleListValue(category, selectedSupplierCategories, setSelectedSupplierCategories, 'categories')} />
                        {category}
                      </label>
                    ))}
                  </div>
                  <FieldError field="categories" />
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-xl border border-forest-100 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold">Store / Product Images</span>
                        <p className="text-[11px] font-semibold text-graphite/50">Upload or camera.</p>
                      </div>
                      <span className="text-[11px] font-bold text-forest-700">{galleryImageUrls.length} uploaded</span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-forest-200 bg-cream/40 px-3 text-xs font-bold text-forest-700">
                        <Upload className="h-4 w-4" /> Upload Images
                        <input type="file" accept="image/*" multiple onChange={(event) => uploadGalleryImages(event.target.files).catch((error) => setUploadMessage(error.response?.data?.detail || 'Image upload failed.'))} className="sr-only" />
                      </label>
                      <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-forest-200 bg-cream/40 px-3 text-xs font-bold text-forest-700">
                        <Camera className="h-4 w-4" /> Take Photo
                        <input type="file" accept="image/*" capture="environment" onChange={(event) => uploadGalleryImages(event.target.files).catch((error) => setUploadMessage(error.response?.data?.detail || 'Image upload failed.'))} className="sr-only" />
                      </label>
                    </div>
                  </div>
                  <div className="rounded-xl border border-forest-100 bg-white p-3">
                    <span className="text-xs font-bold">Documents</span>
                    <p className="text-[11px] font-semibold text-graphite/50">Upload Shop License, GST, PAN, Trade License, Quality and Insurance certificates if available.</p>
                    <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                      {supplierDocumentTypes.map((documentType) => (
                        <label key={documentType} className="flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-lg border border-forest-100 bg-cream/35 px-2.5 py-1.5 text-[11px] font-bold text-graphite/70">
                          <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-warm" /> {documentType}</span>
                          <span className="text-forest-700">{documentUploads[documentType] ? 'Uploaded' : 'Upload'}</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(event) => uploadDocument(documentType, event.target.files?.[0]).catch((error) => setUploadMessage(error.response?.data?.detail || 'Document upload failed.'))} className="sr-only" />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {uploadMessage && <p className="text-xs font-semibold text-forest-700">{uploadMessage}</p>}
              </div>
            )}

            <button type="submit" className="btn-primary h-11 w-full rounded-lg text-sm">
              Complete profile <ArrowRight className="h-4 w-4" />
            </button>
            {errorMessage && <p className="text-xs font-semibold text-warm">{errorMessage}</p>}
          </form>

          <div className="mt-4 flex items-center gap-3 rounded-lg border border-forest-100 bg-cream/70 px-4 py-2.5 text-xs text-graphite/70">
            <Lock className="h-4 w-4 shrink-0 text-forest-700" />
            Your OAuth account is verified. These details complete your local GharBanao profile.
          </div>
        </div>
      </section>
    </main>
  )
}
