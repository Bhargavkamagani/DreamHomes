import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowRight, Boxes, BriefcaseBusiness, Calendar, CheckCircle2, FileText,
  HardHat, Home, IndianRupee, MapPin, MessageSquare, Plus, Search, UserRound, Users,
} from 'lucide-react'
import MessageThread from '../../components/dashboard/MessageThread.jsx'
import ProfileImageUpload from '../../components/common/ProfileImageUpload.jsx'
import RequestsPanel from '../../components/dashboard/RequestsPanel.jsx'
import StatusPill from '../../components/dashboard/StatusPill.jsx'
import TimelineUpdateForm from '../../components/contractor/TimelineUpdateForm.jsx'
import { Card, EmptyState, NavBar, StatCards, Topbar } from '../../dashboard/RoleDashboardUi.jsx'
import { SmartImage } from '../../lib/ui.jsx'
import { imageUrl } from '../../services/apiClient.js'
import { completeUserProfile, updateBusinessLogo, updateUserProfileImage } from '../../services/authService.js'
import { uploadLocalFile } from '../../services/uploadService.js'
import { setAuthenticatedUser } from '../../redux/authSlice.js'
import {
  acceptProjectRequest,
  fetchConversations,
  fetchContractorProfile,
  fetchIncomingRequests,
  fetchNearbyProjects,
  fetchNotifications,
  fetchOwnerProjects,
  fetchProjectTimelineEntries,
  markModuleNotificationsRead,
  rejectProjectRequest,
  saveLabourLog,
  saveMaterialLog,
  sendProjectRequest,
} from '../../services/gharService.js'

const baseNav = [
  { id: 'requests', label: 'Requests', icon: FileText },
  { id: 'projects', label: 'Projects', icon: BriefcaseBusiness },
  { id: 'findClients', label: 'Find Clients', icon: Search },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

const defaultProjectImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'
const projectDetailTabs = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'details', label: 'Details' },
  { id: 'material', label: 'Material' },
  { id: 'labour', label: 'Labour' },
  { id: 'documents', label: 'Documents' },
  { id: 'payments', label: 'Payments' },
]

const contractorDocumentTypes = [
  'Business License',
  'Company Registration',
  'GST Certificate',
  'PAN Card',
  'Insurance Certificate',
  'ISO Certificate',
]

const splitEditableList = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean)

function inr(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function formatProjectDate(value) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function timelineDayLabel(entry, index, timelineEntries) {
  if (!entry.date || !timelineEntries[0]?.date) return `Day ${index + 1}`
  const firstDate = new Date(timelineEntries[0].date)
  const entryDate = new Date(entry.date)
  return `Day ${Math.max(1, Math.round((entryDate - firstDate) / 86400000) + 1)}`
}

function DetailItem({ label, value }) {
  return (
    <p className="rounded-xl border border-forest-100 bg-white px-3 py-2 text-sm">
      <span className="block text-[11px] font-bold uppercase tracking-wide text-graphite/45">{label}</span>
      <span className="font-semibold text-graphite">{value || 'Not set'}</span>
    </p>
  )
}

function ProfileTabNav({ items, activeId, onChange }) {
  return (
    <nav className="dash-scroll flex gap-1 overflow-x-auto rounded-2xl border border-forest-100 bg-white px-2 shadow-card">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`shrink-0 border-b-2 px-5 py-3 text-sm font-bold ${activeId === item.id ? 'border-forest-700 text-forest-800' : 'border-transparent text-graphite/55 hover:text-forest-700'}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

function ContractorProfilePanel({ profile, errorMessage, uploadMessage, onProfileImageUpload, onCompanyLogoUpload, onSaveProfile }) {
  const [activeProfileTab, setActiveProfileTab] = useState('overview')
  const [editDetails, setEditDetails] = useState({})
  useEffect(() => {
    if (!profile) return
    setEditDetails({
      name: profile.name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      pincode: profile.pincode || '',
      company_name: profile.company_name || '',
      license_number: profile.license_number || '',
      experience_years: profile.experience_years || '',
      about: profile.about || '',
      gstin: profile.gstin || '',
      pan: profile.pan || '',
      website: profile.website || '',
      business_type: profile.business_type || '',
      registration_year: profile.registration_year || '',
      team_size: profile.team_size || '',
      insurance_available: Boolean(profile.insurance_available),
      service_locations: (profile.service_locations || []).join(', '),
      services_offered: (profile.services_offered || []).join(', '),
      equipment_owned: (profile.equipment_owned || []).join(', '),
      documents: (profile.documents || []).join(', '),
      gallery: (profile.gallery || []).join(', '),
    })
  }, [profile])
  if (errorMessage) {
    return <Card title="Contractor Profile" icon={UserRound}><EmptyState title="Profile not loaded" message={errorMessage} /></Card>
  }
  if (!profile) {
    return <Card title="Contractor Profile" icon={UserRound}><EmptyState title="Loading profile" message="Fetching your completed contractor profile details." /></Card>
  }

  const galleryImages = splitEditableList(editDetails.gallery)
  const documentList = splitEditableList(editDetails.documents)
  const profileTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'personal', label: 'Personal Information' },
    { id: 'business', label: 'Business Information' },
    { id: 'documents', label: 'Documents' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'media', label: 'Media' },
  ]
  const updateEditField = (field, value) => setEditDetails((currentDetails) => ({ ...currentDetails, [field]: value }))

  const saveProfileChanges = async () => {
    await onSaveProfile(editDetails)
  }

  const uploadEditableProfileFile = async (field, file) => {
    if (!file) return
    const uploadedFile = await uploadLocalFile(file)
    setEditDetails((currentDetails) => ({
      ...currentDetails,
      [field]: [currentDetails[field], uploadedFile.url].filter(Boolean).join(', '),
    }))
  }

  return (
    <div className="space-y-5">
      <Card title="Contractor Profile" icon={UserRound}>
        {uploadMessage && <p className="mb-3 text-xs font-semibold text-forest-700">{uploadMessage}</p>}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="flex justify-center lg:block">
            <SmartImage
              src={profile.profile_image_url ? imageUrl(profile.profile_image_url) : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80'}
              alt={profile.name}
              className="h-40 w-40 rounded-full object-cover"
            />
          </div>
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-graphite">{profile.company_name}</h2>
                <p className="mt-1 text-sm font-semibold text-graphite/60">{profile.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-graphite/70">{profile.about || 'About company not added.'}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${profile.profile_complete ? 'bg-forest-50 text-forest-700' : 'bg-warm/10 text-warm'}`}>
                {profile.profile_complete ? 'Profile Complete' : 'Profile Incomplete'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <DetailItem label="Company" value={profile.company_name} />
              <DetailItem label="Experience" value={`${profile.experience_years || 0} years`} />
              <DetailItem label="Rating" value={profile.rating} />
            </div>
          </div>
        </div>
      </Card>

      <ProfileTabNav items={profileTabs} activeId={activeProfileTab} onChange={setActiveProfileTab} />

      {activeProfileTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card title="About Company" icon={UserRound}>
            <p className="text-sm leading-relaxed text-graphite/70">{profile.about || 'About company not added.'}</p>
          </Card>
          <Card title="Quick Stats" icon={BriefcaseBusiness}>
            <div className="grid grid-cols-1 gap-3">
              <DetailItem label="Completed Projects" value={profile.completed_projects} />
              <DetailItem label="Insurance Available" value={profile.insurance_available ? 'Yes' : 'No'} />
              <DetailItem label="Profile Status" value={profile.profile_complete ? 'Complete' : 'Incomplete'} />
            </div>
          </Card>
        </div>
      )}

      {activeProfileTab === 'personal' && (
        <form onSubmit={(event) => { event.preventDefault(); saveProfileChanges() }}>
          <Card title="Personal Information" icon={UserRound}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Email" value={profile.email} />
              <input value={editDetails.name || ''} onChange={(event) => updateEditField('name', event.target.value)} placeholder="Name" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
              <input value={editDetails.phone || ''} onChange={(event) => updateEditField('phone', event.target.value)} placeholder="Phone" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
              <input value={editDetails.pincode || ''} onChange={(event) => updateEditField('pincode', event.target.value)} placeholder="Pincode" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
              <input value={editDetails.address || ''} onChange={(event) => updateEditField('address', event.target.value)} placeholder="Address" className="h-10 rounded-xl border border-forest-100 px-3 text-sm md:col-span-2 xl:col-span-3" />
            </div>
            <button className="mt-4 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-bold text-white">Save Personal Information</button>
          </Card>
        </form>
      )}

      {activeProfileTab === 'business' && (
        <form onSubmit={(event) => { event.preventDefault(); saveProfileChanges() }} className="space-y-5">
          <div className="space-y-5">
            <Card title="Business Information" icon={BriefcaseBusiness}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <input value={editDetails.company_name || ''} onChange={(event) => updateEditField('company_name', event.target.value)} placeholder="Company name" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input value={editDetails.license_number || ''} onChange={(event) => updateEditField('license_number', event.target.value)} placeholder="License number" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input type="number" value={editDetails.experience_years || ''} onChange={(event) => updateEditField('experience_years', event.target.value)} placeholder="Experience years" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input value={editDetails.gstin || ''} onChange={(event) => updateEditField('gstin', event.target.value)} placeholder="GSTIN" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input value={editDetails.pan || ''} onChange={(event) => updateEditField('pan', event.target.value)} placeholder="PAN" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input value={editDetails.website || ''} onChange={(event) => updateEditField('website', event.target.value)} placeholder="Website" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input value={editDetails.business_type || ''} onChange={(event) => updateEditField('business_type', event.target.value)} placeholder="Business type" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input type="number" value={editDetails.registration_year || ''} onChange={(event) => updateEditField('registration_year', event.target.value)} placeholder="Registration year" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input value={editDetails.team_size || ''} onChange={(event) => updateEditField('team_size', event.target.value)} placeholder="Team size" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <label className="flex h-10 items-center gap-2 rounded-xl border border-forest-100 px-3 text-sm font-bold"><input type="checkbox" checked={Boolean(editDetails.insurance_available)} onChange={(event) => updateEditField('insurance_available', event.target.checked)} /> Insurance available</label>
                <textarea value={editDetails.about || ''} onChange={(event) => updateEditField('about', event.target.value)} placeholder="About company" className="min-h-24 rounded-xl border border-forest-100 px-3 py-2 text-sm md:col-span-2 xl:col-span-3" />
              </div>
            </Card>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <Card title="Services Offered" icon={HardHat}>
                <div className="flex flex-wrap gap-2">
                  <textarea value={editDetails.services_offered || ''} onChange={(event) => updateEditField('services_offered', event.target.value)} placeholder="Services offered, comma separated" className="min-h-24 w-full rounded-xl border border-forest-100 px-3 py-2 text-sm" />
                </div>
              </Card>
              <Card title="Equipment Owned" icon={Boxes}>
                <div className="flex flex-wrap gap-2">
                  <textarea value={editDetails.equipment_owned || ''} onChange={(event) => updateEditField('equipment_owned', event.target.value)} placeholder="Equipment owned, comma separated" className="min-h-24 w-full rounded-xl border border-forest-100 px-3 py-2 text-sm" />
                </div>
              </Card>
              <Card title="Service Locations" icon={MapPin}>
                <div className="flex flex-wrap gap-2">
                  <textarea value={editDetails.service_locations || ''} onChange={(event) => updateEditField('service_locations', event.target.value)} placeholder="Service locations, comma separated" className="min-h-24 w-full rounded-xl border border-forest-100 px-3 py-2 text-sm" />
                </div>
              </Card>
            </div>
            <button className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-bold text-white">Save Business Information</button>
          </div>
        </form>
      )}

      {activeProfileTab === 'documents' && (
        <Card title="Documents" icon={FileText}>
          <p className="mb-3 text-sm font-semibold text-graphite/45">Upload Business License, Registration, GST, PAN, Insurance and ISO if available.</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {contractorDocumentTypes.map((documentType) => (
              <label key={documentType} className="flex h-12 cursor-pointer items-center justify-between rounded-xl border border-forest-100 bg-white px-4 text-sm font-bold text-graphite/65">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-warm" /> {documentType}</span>
                <span className="text-forest-700">Upload</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(event) => uploadEditableProfileFile('documents', event.target.files?.[0])} className="sr-only" />
              </label>
            ))}
          </div>
          {documentList.length > 0 && <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">{documentList.map((documentName) => <div key={documentName} className="rounded-xl border border-forest-100 bg-cream/40 px-3 py-2 text-xs font-bold text-graphite/70">{documentName}</div>)}</div>}
          <button onClick={saveProfileChanges} className="mt-4 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-bold text-white">Save Documents</button>
        </Card>
      )}

      {activeProfileTab === 'gallery' && (
        <Card title="Gallery" icon={FileText}>
          <label className="mb-4 inline-flex cursor-pointer rounded-xl border border-dashed border-forest-200 bg-cream/40 px-4 py-3 text-xs font-bold text-forest-700">
            Upload Gallery Images
            <input type="file" multiple accept="image/*" onChange={(event) => Array.from(event.target.files || []).forEach((file) => uploadEditableProfileFile('gallery', file))} className="sr-only" />
          </label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {galleryImages.map((image) => <SmartImage key={image} src={imageUrl(image)} alt="" className="h-28 rounded-xl object-cover" />)}
            {!galleryImages.length && <EmptyState title="No gallery images" message="Uploaded gallery images appear here." />}
          </div>
          <button onClick={saveProfileChanges} className="mt-4 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-bold text-white">Save Gallery</button>
        </Card>
      )}

      {activeProfileTab === 'media' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <ProfileImageUpload imageSource={profile.profile_image_url} title="Profile Image" note="Upload a clear contractor profile image." onUpload={onProfileImageUpload} />
            <ProfileImageUpload imageSource={profile.company_logo_url} title="Company Logo" note="Update your company logo." onUpload={onCompanyLogoUpload} />
          </div>
          <Card title="Media Guidelines" icon={UserRound}>
            <p className="text-sm leading-relaxed text-graphite/65">
              Keep one clear contractor photo and one company logo. Business, documents and gallery content are managed in their own tabs.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}

function ProjectDetailRow({ icon: Icon, label, value }) {
  return (
    <div className="grid grid-cols-[1.75rem_1fr_1.35fr] items-center gap-3 border-t border-forest-50 py-3 text-sm">
      <Icon className="h-5 w-5 text-forest-700" />
      <span className="text-graphite/55">{label}</span>
      <span className="font-bold text-graphite">{value || 'Not set'}</span>
    </div>
  )
}

function ContractorProjectCard({ project, onSelect }) {
  return (
    <button
      onClick={() => onSelect(project)}
      className="group overflow-hidden rounded-2xl border border-forest-100 bg-white text-left shadow-card transition hover:-translate-y-0.5 hover:border-forest-300 hover:shadow-lg"
    >
      <div className="relative h-52 overflow-hidden">
        <SmartImage
          src={project.cover_image_url ? imageUrl(project.cover_image_url) : defaultProjectImage}
          alt={project.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4">
          <StatusPill status={project.status || 'active'} />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-extrabold text-graphite">{project.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-graphite/55">
              <MapPin className="h-3.5 w-3.5" /> {project.address} {project.pincode}
            </p>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-forest-600 transition group-hover:translate-x-1" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <span><b>{project.completion_percentage || 0}%</b><br /><small className="text-graphite/50">Completion</small></span>
          <span><b>{inr(project.budget)}</b><br /><small className="text-graphite/50">Budget</small></span>
          <span><b>{project.construction_type}</b><br /><small className="text-graphite/50">Type</small></span>
          <span><b>{project.floors}</b><br /><small className="text-graphite/50">Floors</small></span>
        </div>
      </div>
    </button>
  )
}

function ContractorProjectDetail({
  project,
  contractorName,
  timelineEntries,
  activeTab,
  setActiveTab,
  showTimelineForm,
  setShowTimelineForm,
  onTimelineSaved,
  materialDetails,
  setMaterialDetails,
  createMaterialLog,
  labourDetails,
  setLabourDetails,
  createLabourLog,
  onBack,
}) {
  const estimatedEndDate = project.created_at ? new Date(new Date(project.created_at).getTime() + 90 * 86400000) : null

  return (
    <section className="rounded-3xl border border-forest-100 bg-white/80 p-5 shadow-card">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onBack} className="rounded-xl border border-forest-100 bg-white px-3 py-2 text-xs font-bold text-forest-700 shadow-sm">
            Back to Projects
          </button>
          <h2 className="font-display text-2xl font-extrabold text-graphite sm:text-3xl">Project Details & Timeline</h2>
        </div>
        <div className="dash-scroll flex gap-2 overflow-x-auto rounded-2xl bg-cream/70 p-1">
          {projectDetailTabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-xl px-5 py-3 text-sm font-extrabold transition ${
                  active ? 'bg-white text-forest-700 shadow-sm ring-1 ring-forest-100' : 'text-graphite/70 hover:text-forest-700'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[31rem_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-forest-100 bg-white p-4 shadow-sm">
          <SmartImage
            src={project.cover_image_url ? imageUrl(project.cover_image_url) : defaultProjectImage}
            alt={project.title}
            className="h-64 w-full rounded-2xl object-cover"
          />
          <div className="px-1 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-2xl font-extrabold leading-tight text-graphite">{project.title}</h3>
                <p className="mt-2 text-base font-bold text-graphite/80">{contractorName || 'Contractor'}</p>
              </div>
              <StatusPill status={project.status || 'active'} />
            </div>
            <div className="mt-4">
              <ProjectDetailRow icon={MapPin} label="Location" value={`${project.address || ''} ${project.pincode || ''}`.trim()} />
              <ProjectDetailRow icon={Home} label="Project Type" value={`${project.floors || 1} floor ${project.building_type || ''}`.trim()} />
              <ProjectDetailRow icon={IndianRupee} label="Budget" value={project.budget ? inr(project.budget) : 'Not set'} />
              <ProjectDetailRow icon={Calendar} label="Start Date" value={formatProjectDate(project.created_at)} />
              <ProjectDetailRow icon={Calendar} label="Expected End" value={formatProjectDate(estimatedEndDate)} />
            </div>
          </div>
        </aside>

        <div className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm">
          {activeTab === 'timeline' && (
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-graphite/55">Site Monitoring Timeline</p>
                <button onClick={() => setShowTimelineForm((currentValue) => !currentValue)} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm">
                  <Plus className="h-4 w-4" /> {showTimelineForm ? 'Close Update' : 'Add Update'}
                </button>
              </div>

              {showTimelineForm && (
                <div className="mb-5">
                  <TimelineUpdateForm projectId={project.id} timelineEntries={timelineEntries} onTimelineSaved={onTimelineSaved} />
                </div>
              )}

              <div className="space-y-0">
                {timelineEntries.map((entry, index) => (
                  <div key={entry.id} className="grid grid-cols-[5rem_3rem_minmax(0,1fr)_10rem_3rem] gap-3 border-b border-forest-50 py-5 last:border-b-0 max-lg:grid-cols-[4rem_2.5rem_minmax(0,1fr)]">
                    <p className="pt-1 text-lg font-extrabold text-graphite">{timelineDayLabel(entry, index, timelineEntries)}</p>
                    <div className="relative flex justify-center">
                      <span className={`relative z-10 h-8 w-8 rounded-full border-[6px] bg-white ${index === 0 ? 'border-forest-600' : 'border-blue-600'}`} />
                      {index < timelineEntries.length - 1 && <span className="absolute left-1/2 top-8 h-[calc(100%+1.25rem)] border-l-2 border-dashed border-blue-200" />}
                    </div>
                    <div>
                      <h4 className="font-display text-xl font-extrabold text-graphite">{entry.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-graphite/60">{entry.description}</p>
                    </div>
                    <div className="flex items-center gap-2 max-lg:col-span-2 max-lg:col-start-2">
                      {(entry.images || []).slice(0, 3).map((image) => (
                        <SmartImage key={image.id || image.image_url} src={imageUrl(image.image_url)} alt={entry.title} className="h-16 w-20 rounded-lg object-cover" />
                      ))}
                    </div>
                    <div className="grid place-items-center max-lg:col-start-3 max-lg:row-start-1 max-lg:justify-self-end">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-600 text-white">
                        <CheckCircle2 className="h-7 w-7" />
                      </span>
                    </div>
                  </div>
                ))}
                {!timelineEntries.length && <EmptyState title="No timeline updates" message="Add the first daily update for this project." />}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                ['Project Name', project.title],
                ['Description', project.description],
                ['Address', project.address],
                ['Pincode', project.pincode],
                ['Construction Type', project.construction_type],
                ['Building Type', project.building_type],
                ['Land Area', `${project.land_area || 0} sq ft`],
                ['Floors', project.floors],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-forest-100 bg-cream/30 p-4">
                  <p className="text-xs font-bold uppercase text-graphite/40">{label}</p>
                  <p className="mt-1 font-bold text-graphite">{value || 'Not set'}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'material' && (
            <form onSubmit={createMaterialLog} className="grid grid-cols-2 gap-3">
              {['Cement', 'Steel', 'Sand', 'Bricks', 'Tiles'].map((material) => <button key={material} type="button" onClick={() => setMaterialDetails({ ...materialDetails, material_name: material })} className={`rounded-xl border px-3 py-2 text-xs font-bold ${materialDetails.material_name === material ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-forest-100'}`}>{material}</button>)}
              <input required value={materialDetails.quantity} onChange={(event) => setMaterialDetails({ ...materialDetails, quantity: event.target.value })} placeholder="Quantity" className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
              <input required value={materialDetails.unit} onChange={(event) => setMaterialDetails({ ...materialDetails, unit: event.target.value })} placeholder="Unit" className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
              <input required value={materialDetails.cost} onChange={(event) => setMaterialDetails({ ...materialDetails, cost: event.target.value })} placeholder="Cost" className="col-span-2 rounded-xl border border-forest-100 px-3 py-2 text-sm" />
              <button className="btn-primary col-span-2 h-11 rounded-xl">Save material log</button>
            </form>
          )}

          {activeTab === 'labour' && (
            <form onSubmit={createLabourLog} className="grid grid-cols-1 gap-3">
              <input required value={labourDetails.labour_count} onChange={(event) => setLabourDetails({ ...labourDetails, labour_count: event.target.value })} placeholder="Labour count" className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
              <input required value={labourDetails.labour_cost} onChange={(event) => setLabourDetails({ ...labourDetails, labour_cost: event.target.value })} placeholder="Labour cost" className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
              <input required type="date" value={labourDetails.work_date} onChange={(event) => setLabourDetails({ ...labourDetails, work_date: event.target.value })} className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
              <button className="btn-primary h-11 rounded-xl">Save labour log</button>
            </form>
          )}

          {activeTab === 'documents' && <EmptyState title="No documents uploaded" message="Project documents and uploaded files will appear in this section." />}

          {activeTab === 'payments' && (
            <div className="space-y-3">
              {(project.escrow_milestones || []).map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between rounded-xl border border-forest-100 p-4">
                  <div>
                    <p className="font-bold text-graphite">{milestone.name}</p>
                    <p className="text-xs text-graphite/50">Escrow milestone</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-extrabold text-forest-700">{inr(milestone.amount)}</p>
                    <StatusPill status={milestone.status} />
                  </div>
                </div>
              ))}
              {!project.escrow_milestones?.length && <EmptyState title="No payment milestones" message="Escrow milestones are created when the project is saved." />}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function ContractorDashboard() {
  const { user, accessToken, refreshToken } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [activeId, setActiveId] = useState('requests')
  const [requestList, setRequestList] = useState([])
  const [projectList, setProjectList] = useState([])
  const [nearbyProjectList, setNearbyProjectList] = useState([])
  const [timelineEntries, setTimelineEntries] = useState([])
  const [materialDetails, setMaterialDetails] = useState({ project_id: '', material_name: 'Cement', quantity: '', unit: 'bags', cost: '' })
  const [labourDetails, setLabourDetails] = useState({ project_id: '', labour_count: '', labour_cost: '', work_date: '' })
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedProjectTab, setSelectedProjectTab] = useState('timeline')
  const [showTimelineForm, setShowTimelineForm] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [notificationBadgeCounts, setNotificationBadgeCounts] = useState({})
  const [contractorProfileDetails, setContractorProfileDetails] = useState(null)
  const [contractorProfileError, setContractorProfileError] = useState('')
  const [profileImageMessage, setProfileImageMessage] = useState('')
  const userShell = useMemo(() => ({
    name: user?.name || 'Contractor',
    initials: (user?.name || 'C').slice(0, 2).toUpperCase(),
    profileImageUrl: user?.profile_image_url || '',
  }), [user])

  const refreshContractorData = () => {
    fetchIncomingRequests().then(setRequestList)
    fetchOwnerProjects().then((projects) => {
      setProjectList(projects)
      setSelectedProject((currentSelectedProject) => {
        if (!currentSelectedProject || !projects.length) return null
        return projects.find((project) => project.id === currentSelectedProject.id) || null
      })
    })
    fetchNearbyProjects().then(setNearbyProjectList)
  }

  const refreshUnreadMessageCount = () => {
    fetchConversations()
      .then((conversationList) => {
        const totalUnreadMessages = conversationList.reduce((total, conversation) => total + Number(conversation.unread_count || 0), 0)
        setUnreadMessageCount(totalUnreadMessages)
      })
      .catch(() => setUnreadMessageCount(0))
  }

  const refreshNotificationBadgeCounts = () => {
    fetchNotifications()
      .then((notificationList) => {
        const nextBadgeCounts = {}
        notificationList.forEach((notification) => {
          if (notification.is_read) return
          const moduleTabMap = {
            request: 'requests',
            project: 'projects',
            contractor: 'findClients',
            supplier: 'findClients',
            estimate: 'projects',
            escrow: 'projects',
            general: 'profile',
          }
          const tabId = moduleTabMap[notification.module]
          if (tabId) nextBadgeCounts[tabId] = (nextBadgeCounts[tabId] || 0) + 1
        })
        setNotificationBadgeCounts(nextBadgeCounts)
      })
      .catch(() => setNotificationBadgeCounts({}))
  }

  useEffect(refreshContractorData, [])
  useEffect(() => {
    refreshUnreadMessageCount()
    const messageCountTimer = window.setInterval(refreshUnreadMessageCount, 10000)
    return () => window.clearInterval(messageCountTimer)
  }, [])
  useEffect(() => {
    refreshNotificationBadgeCounts()
    const notificationBadgeTimer = window.setInterval(refreshNotificationBadgeCounts, 8000)
    return () => window.clearInterval(notificationBadgeTimer)
  }, [])
  useEffect(() => {
    if (selectedProject?.id) {
      fetchProjectTimelineEntries(selectedProject.id).then(setTimelineEntries)
    } else {
      setTimelineEntries([])
    }
  }, [selectedProject?.id])
  useEffect(() => {
    if (activeId !== 'profile' || !user?.id) return
    setContractorProfileError('')
    fetchContractorProfile(user.id)
      .then(setContractorProfileDetails)
      .catch((error) => setContractorProfileError(error.response?.data?.detail || 'Unable to load contractor profile details.'))
  }, [activeId, user?.id])

  const createMaterialLog = async (event) => {
    event.preventDefault()
    await saveMaterialLog({ ...materialDetails, project_id: selectedProject?.id || materialDetails.project_id })
    setMaterialDetails({ project_id: '', material_name: 'Cement', quantity: '', unit: 'bags', cost: '' })
  }

  const createLabourLog = async (event) => {
    event.preventDefault()
    await saveLabourLog({ ...labourDetails, project_id: selectedProject?.id || labourDetails.project_id })
    setLabourDetails({ project_id: '', labour_count: '', labour_cost: '', work_date: '' })
  }

  const uploadContractorProfileImage = async (file) => {
    if (!file) return
    setProfileImageMessage('Uploading profile image...')
    const uploadedFile = await uploadLocalFile(file)
    const updatedUser = await updateUserProfileImage(uploadedFile.url)
    dispatch(setAuthenticatedUser({ accessToken, refreshToken, user: updatedUser }))
    setContractorProfileDetails((currentProfileDetails) => currentProfileDetails ? { ...currentProfileDetails, profile_image_url: uploadedFile.url } : currentProfileDetails)
    setProfileImageMessage('Profile image updated.')
  }

  const uploadContractorCompanyLogo = async (file) => {
    if (!file) return
    setProfileImageMessage('Uploading company logo...')
    const uploadedFile = await uploadLocalFile(file)
    const updatedProfile = await updateBusinessLogo(uploadedFile.url)
    setContractorProfileDetails(updatedProfile)
    setProfileImageMessage('Company logo updated.')
  }

  const saveContractorProfileChanges = async (profileUpdates) => {
    setProfileImageMessage('Saving profile changes...')
    const updatedUser = await completeUserProfile({
      ...profileUpdates,
      profile_image_url: contractorProfileDetails?.profile_image_url || '',
      company_logo_url: contractorProfileDetails?.company_logo_url || '',
      experience_years: Number(profileUpdates.experience_years || 0),
      registration_year: profileUpdates.registration_year === '' ? null : Number(profileUpdates.registration_year),
    })
    dispatch(setAuthenticatedUser({ accessToken, refreshToken, user: updatedUser }))
    const refreshedProfile = await fetchContractorProfile(user.id)
    setContractorProfileDetails(refreshedProfile)
    setProfileImageMessage('Profile changes saved.')
  }

  const selectDashboardSection = (sectionId) => {
    if (sectionId === 'projects') {
      setSelectedProject(null)
      setSelectedProjectTab('timeline')
      setShowTimelineForm(false)
    }
    setActiveId(sectionId)
    const tabNotificationModules = {
      requests: ['request'],
      projects: ['project', 'estimate', 'escrow'],
      findClients: ['contractor', 'supplier'],
      profile: ['general'],
    }
    const modulesToRead = tabNotificationModules[sectionId] || []
    modulesToRead.forEach((moduleName) => {
      markModuleNotificationsRead(moduleName)
        .then(refreshNotificationBadgeCounts)
        .catch(() => {})
    })
  }

  const nav = baseNav.map((item) => {
    if (item.id === 'messages') return { ...item, badge: unreadMessageCount }
    return { ...item, badge: notificationBadgeCounts[item.id] }
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6f3e8_0%,#eef4ec_45%,#fffaf0_100%)]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -right-28 top-16 h-80 w-80 rounded-full bg-forest-200/45 blur-3xl" />
        <div className="absolute -left-24 top-72 h-72 w-72 rounded-full bg-gold/18 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-warm/12 blur-3xl" />
      </div>
      <div className="relative z-10">
        <Topbar user={userShell} roleLabel="Contractor" />
        <main className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6">
        <section className="relative overflow-hidden rounded-2xl border border-forest-100 bg-gradient-to-br from-white via-forest-50 to-gold/10 p-5 shadow-card sm:p-6">
          <div className="absolute inset-y-0 right-0 hidden w-[44%] bg-[radial-gradient(circle_at_center,#1f644026,transparent_62%)] md:block" />
          <div className="relative flex min-h-[150px] items-center justify-between gap-4">
            <div className="max-w-xl">
              <h1 className="font-display text-xl font-extrabold leading-tight text-forest-900 sm:text-[1.65rem]">
                Welcome{user?.name ? `, ${user.name}` : ''}!
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-graphite/70">
                Manage owner requests, assigned projects, daily timeline updates, material logs, labour logs, nearby client discovery and conversations.
              </p>
              <button onClick={() => selectDashboardSection('findClients')} className="mt-4 rounded-full bg-forest-700 px-4 py-2 text-xs font-bold text-white shadow-sm">
                Find Nearby Clients
              </button>
            </div>
            <div className="hidden shrink-0 items-center gap-4 md:flex">
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-forest-700">Profile</p>
                <p className="mt-1 max-w-[180px] truncate text-sm font-bold text-graphite">{userShell.name}</p>
              </div>
              {userShell.profileImageUrl ? (
                <img src={imageUrl(userShell.profileImageUrl)} alt="" className="h-24 w-24 rounded-2xl object-cover shadow-card ring-4 ring-white/70" />
              ) : (
                <span className="grid h-24 w-24 place-items-center rounded-2xl bg-white/85 text-2xl font-extrabold text-forest-700 shadow-card ring-1 ring-forest-100">
                  {userShell.initials}
                </span>
              )}
            </div>
          </div>
        </section>
        <NavBar items={nav} activeId={activeId} onNav={selectDashboardSection} />
        <StatCards items={[
          { label: 'Requests', value: requestList.length, icon: FileText, note: 'Incoming' },
          { label: 'Projects', value: projectList.length, icon: BriefcaseBusiness, note: 'Assigned' },
          { label: 'Find Clients', value: nearbyProjectList.length, icon: Search, note: 'Nearby' },
          { label: 'Timeline', value: timelineEntries.length, icon: HardHat, note: selectedProject ? 'Current project' : 'No project' },
          { label: 'Tracking', value: 'MVP', icon: Boxes, note: 'Material & labour' },
        ]} />
      {activeId === 'requests' && (
        <RequestsPanel
          title="Owner Requests"
          subtitle="Requests from homeowners near you."
          requestList={requestList}
          onAccept={async (requestId) => { await acceptProjectRequest(requestId); refreshContractorData() }}
          onReject={async (requestId) => { await rejectProjectRequest(requestId); refreshContractorData() }}
        />
      )}

      {activeId === 'projects' && (
        <div className="space-y-5">
          {!selectedProject ? (
            <>
              <div className="flex flex-col gap-3 rounded-2xl border border-forest-100 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-graphite">Projects</h2>
                  <p className="mt-1 text-sm text-graphite/55">Select a project to manage timeline, material and labour updates.</p>
                </div>
                <span className="rounded-xl bg-forest-50 px-4 py-2 text-sm font-bold text-forest-700">{projectList.length} assigned</span>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {projectList.map((project) => (
                  <ContractorProjectCard
                    key={project.id}
                    project={project}
                    onSelect={(projectDetails) => {
                      setSelectedProject(projectDetails)
                      setSelectedProjectTab('timeline')
                      setShowTimelineForm(false)
                    }}
                  />
                ))}
              </div>
              {!projectList.length && <EmptyState title="No assigned projects" message="Accept an owner request or send requests from Find Clients." />}
            </>
          ) : (
            <ContractorProjectDetail
              project={selectedProject}
              contractorName={user?.name}
              timelineEntries={timelineEntries}
              activeTab={selectedProjectTab}
              setActiveTab={setSelectedProjectTab}
              showTimelineForm={showTimelineForm}
              setShowTimelineForm={setShowTimelineForm}
              onTimelineSaved={() => {
                fetchProjectTimelineEntries(selectedProject.id).then(setTimelineEntries)
                setShowTimelineForm(false)
              }}
              materialDetails={materialDetails}
              setMaterialDetails={setMaterialDetails}
              createMaterialLog={createMaterialLog}
              labourDetails={labourDetails}
              setLabourDetails={setLabourDetails}
              createLabourLog={createLabourLog}
              onBack={() => {
                setSelectedProject(null)
                setSelectedProjectTab('timeline')
                setShowTimelineForm(false)
              }}
            />
          )}
        </div>
      )}

      {activeId === 'findClients' && <Card title="Nearby Owner Projects" icon={Search}><div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{nearbyProjectList.map((project) => <article key={project.id} className="overflow-hidden rounded-xl border border-forest-100 bg-white"><SmartImage src={project.cover_image_url ? imageUrl(project.cover_image_url) : defaultProjectImage} alt={project.title} className="h-36 w-full object-cover" /><div className="p-4"><p className="font-display font-bold">{project.title}</p><p className="text-xs text-graphite/55">{project.address} - {project.pincode}</p><button onClick={() => sendProjectRequest({ receiver_id: project.owner_id, project_id: project.id, request_type: 'CONTRACTOR_TO_OWNER' })} className="mt-4 w-full rounded-xl bg-forest-700 py-2 text-xs font-bold text-white">Send request</button></div></article>)}</div>{!nearbyProjectList.length && <EmptyState title="No nearby projects" message="Projects must be unassigned, same pincode, and created within the last 5 days." />}</Card>}
      {activeId === 'messages' && <MessageThread />}
        {activeId === 'profile' && (
          <ContractorProfilePanel
            profile={contractorProfileDetails}
            errorMessage={contractorProfileError}
            uploadMessage={profileImageMessage}
            onProfileImageUpload={(file) => uploadContractorProfileImage(file).catch((error) => setProfileImageMessage(error.response?.data?.detail || 'Profile image upload failed.'))}
            onCompanyLogoUpload={(file) => uploadContractorCompanyLogo(file).catch((error) => setProfileImageMessage(error.response?.data?.detail || 'Company logo upload failed.'))}
            onSaveProfile={(profileUpdates) => saveContractorProfileChanges(profileUpdates).catch((error) => setProfileImageMessage(error.response?.data?.detail || 'Unable to save profile.'))}
          />
        )}
        </main>
      </div>
    </div>
  )
}
