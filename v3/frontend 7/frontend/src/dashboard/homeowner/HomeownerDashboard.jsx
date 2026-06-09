import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Boxes, Calculator, Calendar, ChevronDown,
  CheckCircle2, FileText, HardHat, Home, IndianRupee, MapPin, MessageSquare,
  Package, Plus, ShieldCheck, Star, Truck, UserRound, Wallet,
} from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import PincodeAreaHint from '../../components/common/PincodeAreaHint.jsx'
import ProfileImageUpload from '../../components/common/ProfileImageUpload.jsx'
import MessageThread from '../../components/dashboard/MessageThread.jsx'
import NotificationBell from '../../components/dashboard/NotificationBell.jsx'
import RequestsPanel from '../../components/dashboard/RequestsPanel.jsx'
import StatusPill from '../../components/dashboard/StatusPill.jsx'
import { usePincodeAreaLookup } from '../../hooks/usePincodeAreaLookup.js'
import { SmartImage } from '../../lib/ui.jsx'
import {
  acceptProjectRequest,
  createProjectRequest,
  fetchConversations,
  fetchIncomingRequests,
  fetchNearbyContractors,
  fetchNearbySuppliers,
  fetchNotifications,
  fetchOwnerProjects,
  fetchProjectTimelineEntries,
  markModuleNotificationsRead,
  rejectProjectRequest,
  sendProjectRequest,
} from '../../services/gharService.js'
import { imageUrl } from '../../services/apiClient.js'
import { completeUserProfile, updateUserProfileImage } from '../../services/authService.js'
import { uploadLocalFile } from '../../services/uploadService.js'
import { logoutUser, setAuthenticatedUser } from '../../redux/authSlice.js'

const inr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function NavBar({ items, activeId, onNav }) {
  return (
    <div className="sticky top-16 z-20 -mx-1 bg-cream/80 px-1 py-2 backdrop-blur-xl">
      <nav className="rounded-2xl border border-forest-100 bg-white/95 px-2 shadow-card">
        <div className="dash-scroll flex gap-1 overflow-x-auto">
          {items.map((item) => {
            const active = item.id === activeId
            const badgeCount = Number(item.badge || 0)
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`shrink-0 whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'border-forest-700 text-forest-800'
                    : 'border-transparent text-graphite/55 hover:text-forest-700'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {item.label}
                  {badgeCount > 0 && (
                    <span className="grid h-4 min-w-4 place-items-center rounded-full bg-warm px-1 text-[9px] font-bold leading-none text-white">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function Topbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-forest-100 bg-cream/80 px-4 backdrop-blur-xl sm:px-6">
      <Logo />
      <div className="flex-1" />
      <NotificationBell />
      <button className="flex shrink-0 items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-sm ring-1 ring-black/5">
        {user.profileImageUrl ? (
          <img src={imageUrl(user.profileImageUrl)} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-forest-100" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-forest-600 to-forest-800 text-xs font-bold text-white">
            {user.initials}
          </span>
        )}
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-bold leading-tight text-graphite">{user.name || 'Home Owner'}</span>
          <span className="block text-[11px] leading-tight text-graphite/50">Homeowner</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-graphite/40 sm:block" />
      </button>
      <button
        onClick={onLogout}
        className="rounded-full border border-forest-100 bg-white px-4 py-2 text-sm font-bold text-graphite/65 shadow-sm transition hover:border-warm/40 hover:text-warm"
      >
        Logout
      </button>
    </header>
  )
}

function Card({ title, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`flex h-full flex-col rounded-2xl border border-forest-100 bg-white p-5 shadow-card ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-graphite">
              {Icon && <Icon className="h-[18px] w-[18px] text-forest-600" />}
              {title}
            </h3>
          ) : <span />}
          {action}
        </div>
      )}
      {children}
    </section>
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

function ProfileField({ label, value }) {
  return (
    <p className="rounded-xl border border-forest-100 bg-white px-3 py-2 text-sm">
      <span className="block text-[11px] font-bold uppercase tracking-wide text-graphite/45">{label}</span>
      <span className="font-semibold text-graphite">{value || 'Not set'}</span>
    </p>
  )
}

function EmptyState({ title, message }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-forest-100 bg-cream/35 px-4 py-12 text-center">
      <p className="font-display text-sm font-bold text-graphite">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-graphite/55">{message}</p>
    </div>
  )
}

function ViewLink({ children, onClick }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 transition-all hover:gap-1.5">
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </button>
  )
}

function Hero({ user, firstProject, setActiveId }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#eef3ea]">
      <div className="absolute inset-y-0 right-0 hidden h-full w-[62%] bg-gradient-to-br from-forest-100 via-cream to-forest-200 md:block" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-[#eef3ea] via-[#eef3ea]/90 to-transparent md:block" />
      <div className="relative flex min-h-[150px] items-center justify-between gap-4 p-5 sm:p-6">
        <div className="max-w-lg">
          <h1 className="font-display text-xl font-extrabold leading-tight text-forest-800 sm:text-[1.65rem]">
            Welcome home{user.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-graphite/65">
            Manage requests, projects, contractors, suppliers, estimates, escrow and conversations from one place.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-forest-700 shadow-sm ring-1 ring-forest-100">
              <span className="h-2 w-2 rounded-full bg-forest-500" />
              Project Status{firstProject?.status ? `: ${firstProject.status}` : ''}
            </span>
            <button onClick={() => setActiveId('projects')} className="rounded-full bg-forest-700 px-4 py-2 text-xs font-bold text-white shadow-sm">
              Create / View Projects
            </button>
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-4 md:flex">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-forest-700">Profile</p>
            <p className="mt-1 max-w-[180px] truncate text-sm font-bold text-graphite">{user.name || 'Home Owner'}</p>
          </div>
          {user.profileImageUrl ? (
            <img src={imageUrl(user.profileImageUrl)} alt="" className="h-24 w-24 rounded-2xl object-cover shadow-card ring-4 ring-white/70" />
          ) : (
            <span className="grid h-24 w-24 place-items-center rounded-2xl bg-white/85 text-2xl font-extrabold text-forest-700 shadow-card ring-1 ring-forest-100">
              {user.initials || 'HO'}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

function ProjectForm({ onProjectCreated }) {
  const [projectDetails, setProjectDetails] = useState({
    title: '',
    description: '',
    address: '',
    pincode: '',
    building_type: 'RESIDENTIAL',
    construction_type: 'CONTRACTOR',
    budget: '',
    land_area: '',
    floors: 1,
  })
  const [projectFormMessage, setProjectFormMessage] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [projectImageFile, setProjectImageFile] = useState(null)

  const updateProjectField = (field, value) => {
    setProjectDetails((currentProjectDetails) => ({ ...currentProjectDetails, [field]: value }))
  }
  const applyResolvedArea = useCallback((areaDetails) => {
    setProjectDetails((currentProjectDetails) => ({
      ...currentProjectDetails,
      address: areaDetails.display || currentProjectDetails.address,
      pincode: areaDetails.pincode || currentProjectDetails.pincode,
    }))
  }, [])
  const pincodeLookupState = usePincodeAreaLookup(projectDetails.pincode, applyResolvedArea)

  const submitProject = async (event) => {
    event.preventDefault()
    setProjectFormMessage('')
    setIsCreatingProject(true)

    const projectPayload = {
      title: projectDetails.title.trim(),
      description: projectDetails.description.trim(),
      address: projectDetails.address.trim(),
      pincode: projectDetails.pincode.trim(),
      building_type: projectDetails.building_type,
      construction_type: projectDetails.construction_type,
      budget: projectDetails.budget === '' ? 0 : Number(projectDetails.budget),
      land_area: projectDetails.land_area === '' ? 0 : Number(projectDetails.land_area),
      floors: projectDetails.floors === '' ? 1 : Number(projectDetails.floors),
    }

    try {
      let createProjectPayload = projectPayload
      if (projectImageFile) {
        createProjectPayload = new FormData()
        Object.entries(projectPayload).forEach(([key, value]) => {
          createProjectPayload.append(key, value)
        })
        createProjectPayload.append('image', projectImageFile)
      }

      const createdProject = await createProjectRequest(createProjectPayload)
      setProjectDetails({
        title: '',
        description: '',
        address: '',
        pincode: '',
        building_type: 'RESIDENTIAL',
        construction_type: 'CONTRACTOR',
        budget: '',
        land_area: '',
        floors: 1,
      })
      setProjectImageFile(null)
      setProjectFormMessage('Project created successfully.')
      await onProjectCreated(createdProject)
    } catch (error) {
      const errorDetail = error.response?.data?.detail
      setProjectFormMessage(Array.isArray(errorDetail) ? errorDetail[0]?.msg || 'Unable to create project.' : errorDetail || 'Unable to create project.')
    } finally {
      setIsCreatingProject(false)
    }
  }

  return (
    <Card title="Create Project" icon={Home}>
      <form onSubmit={submitProject} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {projectFormMessage && (
          <div className="rounded-xl border border-forest-100 bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800 md:col-span-2">
            {projectFormMessage}
          </div>
        )}
        <input required value={projectDetails.title} onChange={(event) => updateProjectField('title', event.target.value)} placeholder="Project title" className="rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400" />
        <label className="block">
          <input required value={projectDetails.pincode} onChange={(event) => updateProjectField('pincode', event.target.value)} placeholder="Pincode" className="w-full rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400" />
          <PincodeAreaHint lookupState={pincodeLookupState} />
        </label>
        <input required value={projectDetails.address} onChange={(event) => updateProjectField('address', event.target.value)} placeholder="Site address" className="rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400 md:col-span-2" />
        <textarea required value={projectDetails.description} onChange={(event) => updateProjectField('description', event.target.value)} placeholder="Project description" className="min-h-24 rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400 md:col-span-2" />
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-forest-200 bg-cream/40 px-3 py-4 text-center text-sm font-semibold text-forest-700 md:col-span-2">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setProjectImageFile(event.target.files?.[0] || null)}
            className="sr-only"
          />
          {projectImageFile ? projectImageFile.name : 'Upload project image'}
          <span className="mt-1 text-xs font-medium text-graphite/45">This image will be shown in project cards and dashboards.</span>
        </label>
        <select value={projectDetails.construction_type} onChange={(event) => updateProjectField('construction_type', event.target.value)} className="rounded-xl border border-forest-100 px-3 py-2 text-sm">
          <option value="CONTRACTOR">Hire Contractor</option>
          <option value="SELF_CONSTRUCTION">Self Construction</option>
        </select>
        <select value={projectDetails.building_type} onChange={(event) => updateProjectField('building_type', event.target.value)} className="rounded-xl border border-forest-100 px-3 py-2 text-sm">
          <option value="RESIDENTIAL">Residential</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
        <input type="number" value={projectDetails.land_area} onChange={(event) => updateProjectField('land_area', event.target.value)} placeholder="Plot area sqft" className="rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400" />
        <input type="number" value={projectDetails.floors} onChange={(event) => updateProjectField('floors', event.target.value)} placeholder="Floors" className="rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400" />
        <input type="number" value={projectDetails.budget} onChange={(event) => updateProjectField('budget', event.target.value)} placeholder="Budget" className="rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400 md:col-span-2" />
        <button disabled={isCreatingProject} className="btn-primary h-11 rounded-xl disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
          {isCreatingProject ? 'Creating project...' : 'Create project'}
        </button>
      </form>
    </Card>
  )
}

function Stats({ projectList, requestList, contractorList, supplierList }) {
  const activeProjectCount = projectList.filter((project) => project.status !== 'completed').length
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-forest-100 bg-white p-2 shadow-card md:grid-cols-5">
      {[
        { label: 'Projects', value: projectList.length, icon: Home, note: `${activeProjectCount} active` },
        { label: 'Requests', value: requestList.length, icon: FileText, note: 'Incoming' },
        { label: 'Contractors', value: contractorList.length, icon: HardHat, note: 'Nearby' },
        { label: 'Suppliers', value: supplierList.length, icon: Truck, note: 'Nearby' },
        { label: 'Escrow', value: inr(projectList[0]?.escrow_milestones?.reduce((sum, item) => sum + Number(item.amount || 0), 0)), icon: Wallet, note: 'MVP milestones' },
      ].map((item) => (
        <div key={item.label} className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-forest-50/60 md:border-r md:border-forest-50 md:last:border-r-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700"><item.icon className="h-4 w-4" /></span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-xs font-bold text-graphite/55">{item.label}</p>
              <span className="truncate text-[10px] font-bold text-forest-600">{item.note}</span>
            </div>
            <p className="truncate font-display text-xl font-extrabold leading-tight text-graphite">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const projectDetailTabs = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'details', label: 'Details' },
  { id: 'material', label: 'Material' },
  { id: 'labour', label: 'Labour' },
  { id: 'documents', label: 'Documents' },
  { id: 'payments', label: 'Payments' },
]

function formatProjectDate(value) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function timelineDayLabel(entry, index, timelineEntries) {
  if (!entry.date || !timelineEntries[0]?.date) return `Day ${index + 1}`
  const firstDate = new Date(timelineEntries[0].date)
  const entryDate = new Date(entry.date)
  const dayOffset = Math.max(1, Math.round((entryDate - firstDate) / 86400000) + 1)
  return `Day ${dayOffset}`
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

const defaultProjectImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'

function ProjectDetailPanel({ project, ownerName, timelineEntries, activeTab, setActiveTab, onBack }) {
  const timelineImageFallbacks = [
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=240&q=80',
    'https://images.unsplash.com/photo-1590725140246-20acdee442be?auto=format&fit=crop&w=240&q=80',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=240&q=80',
  ]
  const budgetLabel = project.budget ? inr(project.budget) : 'Not set'
  const estimatedEndDate = project.created_at ? new Date(new Date(project.created_at).getTime() + 90 * 86400000) : null

  return (
    <section className="rounded-3xl border border-forest-100 bg-white/80 p-5 shadow-card">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onBack} className="rounded-xl border border-forest-100 bg-white px-3 py-2 text-xs font-bold text-forest-700 shadow-sm">
            Back to Projects
          </button>
          <h2 className="font-display text-2xl font-extrabold text-graphite sm:text-3xl">
            Project Details & Timeline
          </h2>
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
            fallback="from-forest-100 to-cream"
          />
          <div className="px-1 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-2xl font-extrabold leading-tight text-graphite">{project.title}</h3>
                <p className="mt-2 text-base font-bold text-graphite/80">{ownerName || 'House Owner'}</p>
              </div>
              <StatusPill status={project.status || 'active'} />
            </div>
            <div className="mt-4">
              <ProjectDetailRow icon={MapPin} label="Location" value={`${project.address || ''} ${project.pincode || ''}`.trim()} />
              <ProjectDetailRow icon={Home} label="Project Type" value={`${project.floors || 1} floor ${project.building_type || ''}`.trim()} />
              <ProjectDetailRow icon={IndianRupee} label="Budget" value={budgetLabel} />
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
                <button className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm">
                  <Plus className="h-4 w-4" /> Request Update
                </button>
              </div>
              <div className="space-y-0">
                {timelineEntries.map((entry, index) => {
                  const entryImages = entry.images?.length
                    ? entry.images.map((item) => imageUrl(item.image_url))
                    : timelineImageFallbacks
                  return (
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
                        {entryImages.slice(0, 3).map((src) => (
                          <SmartImage key={src} src={src} alt={entry.title} className="h-16 w-20 rounded-lg object-cover" />
                        ))}
                      </div>
                      <div className="grid place-items-center max-lg:col-start-3 max-lg:row-start-1 max-lg:justify-self-end">
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-600 text-white">
                          <CheckCircle2 className="h-7 w-7" />
                        </span>
                      </div>
                    </div>
                  )
                })}
                {!timelineEntries.length && <EmptyState title="No timeline updates" message="Contractor timeline updates will appear here with date, status and images." />}
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
            <EmptyState title="No material logs yet" message="Material entries added by the contractor will be shown here." />
          )}

          {activeTab === 'labour' && (
            <EmptyState title="No labour logs yet" message="Labour count, cost and work date entries will be shown here." />
          )}

          {activeTab === 'documents' && (
            <EmptyState title="No documents uploaded" message="Project documents and uploaded files will appear in this section." />
          )}

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

function ProjectListCard({ project, onSelect }) {
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
          fallback="from-forest-100 to-cream"
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

export default function HomeownerDashboard() {
  const { user, accessToken, refreshToken } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState('requests')
  const [projectList, setProjectList] = useState([])
  const [requestList, setRequestList] = useState([])
  const [contractorList, setContractorList] = useState([])
  const [supplierList, setSupplierList] = useState([])
  const [requestMessage, setRequestMessage] = useState('')
  const [sendingReceiverId, setSendingReceiverId] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedProjectTab, setSelectedProjectTab] = useState('timeline')
  const [timelineEntries, setTimelineEntries] = useState([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectListMessage, setProjectListMessage] = useState('')
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [notificationBadgeCounts, setNotificationBadgeCounts] = useState({})
  const [profileImageMessage, setProfileImageMessage] = useState('')
  const [activeProfileTab, setActiveProfileTab] = useState('overview')
  const [ownerProfileEditDetails, setOwnerProfileEditDetails] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    pincode: user?.pincode || '',
    building_type: 'RESIDENTIAL',
    construction_type: 'CONTRACTOR',
    budget: 0,
    land_area: 0,
    floors: 1,
  })

  const userShell = useMemo(() => ({
    name: user?.name || '',
    initials: (user?.name || 'HO').slice(0, 2).toUpperCase(),
    profileImageUrl: user?.profile_image_url || '',
  }), [user])

  const refreshOwnerData = async () => {
    setProjectListMessage('')
    const ownerProjects = await fetchOwnerProjects().catch((error) => {
      setProjectListMessage(error.response?.data?.detail || 'Unable to load projects.')
      return []
    })
    setProjectList(ownerProjects)
    setSelectedProject((currentSelectedProject) => {
      if (!currentSelectedProject || !ownerProjects.length) return null
      return ownerProjects.find((project) => project.id === currentSelectedProject.id) || null
    })

    const sitePincode = ownerProjects[0]?.pincode || user?.pincode
    fetchIncomingRequests().then(setRequestList).catch(() => setRequestList([]))
    fetchNearbyContractors(sitePincode).then(setContractorList).catch(() => setContractorList([]))
    fetchNearbySuppliers(sitePincode).then(setSupplierList).catch(() => setSupplierList([]))
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
            contractor: 'contractors',
            supplier: 'suppliers',
            estimate: 'estimates',
            escrow: 'escrow',
            general: 'profile',
          }
          const tabId = moduleTabMap[notification.module]
          if (tabId) nextBadgeCounts[tabId] = (nextBadgeCounts[tabId] || 0) + 1
        })
        setNotificationBadgeCounts(nextBadgeCounts)
      })
      .catch(() => setNotificationBadgeCounts({}))
  }

  const logout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  const uploadOwnerProfileImage = async (file) => {
    if (!file) return
    setProfileImageMessage('Uploading profile image...')
    const uploadedFile = await uploadLocalFile(file)
    const updatedUser = await updateUserProfileImage(uploadedFile.url)
    dispatch(setAuthenticatedUser({ accessToken, refreshToken, user: updatedUser }))
    setProfileImageMessage('Profile image updated.')
  }

  const selectDashboardSection = (sectionId) => {
    if (sectionId === 'projects') {
      setSelectedProject(null)
      setSelectedProjectTab('timeline')
    }
    setActiveId(sectionId)
    const tabNotificationModules = {
      requests: ['request'],
      projects: ['project'],
      contractors: ['contractor'],
      suppliers: ['supplier'],
      estimates: ['estimate'],
      escrow: ['escrow'],
      profile: ['general'],
    }
    const modulesToRead = tabNotificationModules[sectionId] || []
    modulesToRead.forEach((moduleName) => {
      markModuleNotificationsRead(moduleName)
        .then(refreshNotificationBadgeCounts)
        .catch(() => {})
    })
  }

  const sendOwnerContractorRequest = async (contractor) => {
    setRequestMessage('')
    if (!firstProject?.id) {
      setRequestMessage('Create a project before contacting a contractor.')
      setActiveId('projects')
      return
    }

    setSendingReceiverId(contractor.user_id)
    try {
      await sendProjectRequest({
        receiver_id: contractor.user_id,
        project_id: firstProject.id,
        request_type: 'OWNER_TO_CONTRACTOR',
      })
      setRequestMessage(`Request sent to ${contractor.name}.`)
      refreshOwnerData()
    } catch (error) {
      setRequestMessage(error.response?.data?.detail || 'Unable to send contractor request.')
    } finally {
      setSendingReceiverId(null)
    }
  }

  const sendOwnerSupplierRequest = async (supplier) => {
    setRequestMessage('')
    if (!firstProject?.id) {
      setRequestMessage('Create a self-construction project before contacting a supplier.')
      setActiveId('projects')
      return
    }

    setSendingReceiverId(supplier.user_id)
    try {
      await sendProjectRequest({
        receiver_id: supplier.user_id,
        project_id: firstProject.id,
        request_type: 'OWNER_TO_SUPPLIER',
      })
      setRequestMessage(`Request sent to ${supplier.store_name}.`)
      refreshOwnerData()
    } catch (error) {
      setRequestMessage(error.response?.data?.detail || 'Unable to send supplier request.')
    } finally {
      setSendingReceiverId(null)
    }
  }

  useEffect(() => {
    refreshOwnerData()
  }, [user?.pincode])

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
    if (!selectedProject?.id) {
      setTimelineEntries([])
      return
    }
    fetchProjectTimelineEntries(selectedProject.id).then(setTimelineEntries).catch(() => setTimelineEntries([]))
  }, [selectedProject?.id])

  const firstProject = projectList[0]
  const constructionType = firstProject?.construction_type || user?.owner_profile?.construction_type || 'CONTRACTOR'
  const estimatedCost = firstProject ? Number(firstProject.land_area || 0) * Number(firstProject.floors || 1) * 2200 : 0

  useEffect(() => {
    setOwnerProfileEditDetails({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      pincode: user?.pincode || '',
      building_type: firstProject?.building_type || 'RESIDENTIAL',
      construction_type: firstProject?.construction_type || 'CONTRACTOR',
      budget: firstProject?.budget || 0,
      land_area: firstProject?.land_area || 0,
      floors: firstProject?.floors || 1,
    })
  }, [user?.phone, user?.address, user?.pincode, firstProject?.id])

  const updateOwnerProfileEditField = (field, value) => {
    setOwnerProfileEditDetails((currentDetails) => ({ ...currentDetails, [field]: value }))
  }

  const saveOwnerProfileChanges = async (event) => {
    event?.preventDefault()
    setProfileImageMessage('Saving profile changes...')
    const updatedUser = await completeUserProfile({
      ...ownerProfileEditDetails,
      profile_image_url: user?.profile_image_url || '',
      budget: Number(ownerProfileEditDetails.budget || 0),
      land_area: Number(ownerProfileEditDetails.land_area || 0),
      floors: Number(ownerProfileEditDetails.floors || 1),
    })
    dispatch(setAuthenticatedUser({ accessToken, refreshToken, user: updatedUser }))
    setProfileImageMessage('Profile changes saved.')
    refreshOwnerData()
  }

  const nav = [
    { id: 'requests', label: 'Requests', badge: notificationBadgeCounts.requests },
    { id: 'projects', label: 'Projects', badge: notificationBadgeCounts.projects },
    { id: 'contractors', label: 'Contractors', badge: notificationBadgeCounts.contractors },
    { id: 'suppliers', label: 'Suppliers', badge: notificationBadgeCounts.suppliers },
    { id: 'estimates', label: 'Estimates', badge: notificationBadgeCounts.estimates },
    { id: 'escrow', label: 'Escrow', badge: notificationBadgeCounts.escrow },
    { id: 'messages', label: 'Messages', badge: unreadMessageCount },
    { id: 'profile', label: 'Profile', badge: notificationBadgeCounts.profile },
  ]

  return (
    <div className="min-h-screen bg-cream">
      <Topbar user={userShell} onLogout={logout} />
      <main className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6">
        <Hero user={userShell} firstProject={firstProject} setActiveId={selectDashboardSection} />
        <NavBar items={nav} activeId={activeId} onNav={selectDashboardSection} />
        <Stats projectList={projectList} requestList={requestList} contractorList={contractorList} supplierList={supplierList} />

        {activeId === 'requests' && (
          <RequestsPanel
            title="Owner Requests"
            subtitle="Contractor and supplier requests for your projects."
            requestList={requestList}
            onAccept={async (requestId) => { await acceptProjectRequest(requestId); refreshOwnerData() }}
            onReject={async (requestId) => { await rejectProjectRequest(requestId); refreshOwnerData() }}
          />
        )}

        {activeId === 'projects' && (
          <>
            {selectedProject ? (
              <ProjectDetailPanel
                project={selectedProject}
                ownerName={user?.name}
                timelineEntries={timelineEntries}
                activeTab={selectedProjectTab}
                setActiveTab={setSelectedProjectTab}
                onBack={() => {
                  setSelectedProject(null)
                  setSelectedProjectTab('timeline')
                }}
              />
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 rounded-2xl border border-forest-100 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold text-graphite">Projects</h2>
                    <p className="mt-1 text-sm text-graphite/55">Select a project to view details, timeline, materials, labour, documents and payments.</p>
                  </div>
                  <button
                    onClick={() => setShowProjectForm((currentValue) => !currentValue)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-4 py-3 text-sm font-bold text-white shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    {showProjectForm ? 'Close Form' : 'Create Project'}
                  </button>
                </div>

                {showProjectForm && (
                  <ProjectForm
                    onProjectCreated={async (createdProject) => {
                      if (createdProject) {
                        setProjectList((currentProjectList) => [createdProject, ...currentProjectList])
                      }
                      await refreshOwnerData()
                      setShowProjectForm(false)
                    }}
                  />
                )}

                {projectListMessage && (
                  <div className="rounded-xl border border-warm/20 bg-warm/10 px-4 py-3 text-sm font-semibold text-warm">
                    {projectListMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {projectList.map((project) => (
                    <ProjectListCard
                      key={project.id}
                      project={project}
                      onSelect={(selectedProjectDetails) => {
                        setSelectedProject(selectedProjectDetails)
                        setSelectedProjectTab('timeline')
                      }}
                    />
                  ))}
                </div>
                {!projectList.length && <EmptyState title="No projects created" message="Use Create Project to add your first construction project." />}
              </div>
            )}
          </>
        )}

        {activeId === 'contractors' && (
          <Card title="Nearby Contractors" icon={HardHat} action={<span className="text-xs font-semibold text-graphite/45">Pincode: {firstProject?.pincode || user?.pincode || 'not set'}</span>}>
            {constructionType === 'SELF_CONSTRUCTION' ? (
              <EmptyState title="Contractors hidden" message="Contractors are shown when construction type is CONTRACTOR." />
            ) : (
              <div className="space-y-3">
                {requestMessage && (
                  <div className="rounded-xl border border-forest-100 bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800">
                    {requestMessage}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {contractorList.map((contractor) => (
                    <div key={contractor.id} className="rounded-xl border border-forest-100 bg-white p-4">
                      <div className="flex items-start justify-between">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-50 text-forest-700"><HardHat className="h-5 w-5" /></span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-2 py-0.5 text-[10px] font-bold text-forest-700"><BadgeCheck className="h-3 w-3" /> Contractor</span>
                      </div>
                      <p className="mt-2 font-display text-sm font-bold text-graphite">{contractor.name}</p>
                      <p className="text-[11px] text-graphite/50">{contractor.company_name}</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-graphite/60">
                        <span className="flex items-center gap-1 text-gold"><Star className="h-3 w-3 fill-current" />{contractor.rating}</span>
                        <span>{contractor.experience_years} yrs</span>
                        <span>{contractor.completed_projects} projects</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/contractors/${contractor.user_id}`)}
                          className="rounded-xl border border-forest-100 bg-white py-2 text-xs font-bold text-forest-700 transition hover:bg-forest-50"
                        >
                          View Profile
                        </button>
                        <button
                          disabled={sendingReceiverId === contractor.user_id}
                          onClick={() => sendOwnerContractorRequest(contractor)}
                          className="rounded-xl border border-forest-100 bg-cream/40 py-2 text-xs font-bold text-forest-700 transition hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {sendingReceiverId === contractor.user_id ? 'Sending...' : 'Send Request'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {!contractorList.length && <EmptyState title="No nearby contractors" message="Matching contractors will appear by pincode, sorted by rating." />}
                </div>
              </div>
            )}
          </Card>
        )}

        {activeId === 'suppliers' && (
          <Card title="Nearby Suppliers" icon={Truck}>
            {constructionType === 'CONTRACTOR' ? (
              <EmptyState title="Suppliers hidden" message="Direct suppliers are shown when construction type is SELF_CONSTRUCTION." />
            ) : (
              <div className="space-y-3">
                {requestMessage && (
                  <div className="rounded-xl border border-forest-100 bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800">
                    {requestMessage}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {supplierList.map((supplier) => (
                    <div key={supplier.id} className="rounded-xl border border-forest-100 bg-white p-4">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-50 text-forest-700"><Boxes className="h-5 w-5" /></span>
                      <p className="mt-2 font-display text-sm font-bold text-graphite">{supplier.store_name}</p>
                      <p className="text-[11px] text-graphite/50">{supplier.categories}</p>
                      <p className="mt-2 text-[11px] font-bold text-gold">{supplier.rating} rating</p>
                      <button
                        disabled={sendingReceiverId === supplier.user_id}
                        onClick={() => sendOwnerSupplierRequest(supplier)}
                        className="mt-3 w-full rounded-xl border border-forest-100 bg-cream/40 py-2 text-xs font-bold text-forest-700 transition hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sendingReceiverId === supplier.user_id ? 'Sending...' : 'Send Request'}
                      </button>
                    </div>
                  ))}
                  {!supplierList.length && <EmptyState title="No nearby suppliers" message="Matching suppliers will appear by pincode, sorted by rating." />}
                </div>
              </div>
            )}
          </Card>
        )}

        {activeId === 'estimates' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            <Card title="Construction Calculator" icon={Calculator}>
              <div className="space-y-2.5">
                {[
                  ['Location', firstProject?.address || ''],
                  ['Pincode', firstProject?.pincode || ''],
                  ['Plot Area', firstProject?.land_area || ''],
                  ['Floors', firstProject?.floors || ''],
                  ['Construction Type', firstProject?.construction_type || ''],
                  ['Building Type', firstProject?.building_type || ''],
                  ['Budget', firstProject?.budget ? inr(firstProject.budget) : ''],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-graphite/60">{label}</span>
                    <span className="w-36 rounded-lg border border-forest-100 bg-cream/40 px-3 py-1.5 text-right text-sm font-semibold text-graphite">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-forest-50 p-4">
                <p className="text-[11px] font-medium text-graphite/55">Estimated Total Cost</p>
                <p className="font-display text-xl font-extrabold text-forest-700">{inr(estimatedCost)}</p>
              </div>
            </Card>
            <Card title="Material Estimate" icon={Package}><p className="font-display text-xl font-extrabold text-forest-700">{inr(estimatedCost * 0.62)}</p><p className="mt-2 text-sm text-graphite/55">Material estimate based on current project inputs.</p></Card>
            <Card title="Labour Estimate" icon={HardHat}><p className="font-display text-xl font-extrabold text-forest-700">{inr(estimatedCost * 0.28)}</p><p className="mt-2 text-sm text-graphite/55">Labour estimate based on current project inputs.</p></Card>
          </div>
        )}

        {activeId === 'escrow' && (
          <Card title="Escrow Milestones" icon={Wallet}>
            <div className="space-y-2">
              {(firstProject?.escrow_milestones || []).map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between rounded-xl border border-forest-50 px-3 py-2.5">
                  <span className="text-sm font-medium text-graphite">{milestone.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold text-graphite">{inr(milestone.amount)}</span>
                    <StatusPill status={milestone.status} />
                  </span>
                </div>
              ))}
              {!firstProject?.escrow_milestones?.length && <EmptyState title="No escrow milestones" message="Milestones are created when a project is saved." />}
            </div>
          </Card>
        )}

        {activeId === 'messages' && <MessageThread />}

        {activeId === 'profile' && (
          <div className="space-y-5">
            <Card title="Owner Profile" icon={UserRound}>
              {profileImageMessage && <p className="mb-3 text-xs font-semibold text-forest-700">{profileImageMessage}</p>}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[160px_minmax(0,1fr)]">
                <div className="flex justify-center lg:block">
                  {user?.profile_image_url ? (
                    <img src={imageUrl(user.profile_image_url)} alt="" className="h-36 w-36 rounded-full object-cover ring-1 ring-forest-100" />
                  ) : (
                    <span className="grid h-36 w-36 place-items-center rounded-full bg-forest-50 text-2xl font-bold text-forest-700 ring-1 ring-forest-100">{userShell.initials}</span>
                  )}
                </div>
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold text-graphite">{user?.name || 'Home Owner'}</h2>
                      <p className="mt-1 text-sm font-semibold text-graphite/60">{user?.email || ''}</p>
                      <p className="mt-2 text-sm leading-relaxed text-graphite/70">{user?.address || 'Address not set'}</p>
                    </div>
                    <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-bold text-forest-700">House Owner</span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ProfileField label="Projects" value={projectList.length} />
                    <ProfileField label="Pincode" value={user?.pincode} />
                    <ProfileField label="Messages" value={unreadMessageCount ? `${unreadMessageCount} unread` : 'No unread'} />
                  </div>
                </div>
              </div>
            </Card>

            <ProfileTabNav
              items={[
                { id: 'overview', label: 'Overview' },
                { id: 'personal', label: 'Personal Information' },
                { id: 'preferences', label: 'Project Preferences' },
                { id: 'media', label: 'Profile Image' },
              ]}
              activeId={activeProfileTab}
              onChange={setActiveProfileTab}
            />

            {activeProfileTab === 'overview' && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <Card title="Profile Summary" icon={UserRound}>
                  <p className="text-sm leading-relaxed text-graphite/70">Manage your construction projects, nearby partners, requests, estimates and messages from this owner account.</p>
                </Card>
                <Card title="Current Projects" icon={Home}>
                  <ProfileField label="Total Projects" value={projectList.length} />
                </Card>
                <Card title="Account Status" icon={ShieldCheck}>
                  <ProfileField label="Status" value="Active" />
                </Card>
              </div>
            )}

            {activeProfileTab === 'personal' && (
              <form onSubmit={(event) => saveOwnerProfileChanges(event).catch((error) => setProfileImageMessage(error.response?.data?.detail || 'Unable to save profile.'))}>
                <Card title="Personal Information" icon={UserRound}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <input value={ownerProfileEditDetails.name || ''} onChange={(event) => updateOwnerProfileEditField('name', event.target.value)} placeholder="Name" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                    <input value={user?.email || ''} disabled placeholder="Email" className="h-10 rounded-xl border border-forest-100 bg-forest-50 px-3 text-sm text-graphite/55" />
                    <input value={ownerProfileEditDetails.phone || ''} onChange={(event) => updateOwnerProfileEditField('phone', event.target.value)} placeholder="Phone" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                    <input value={ownerProfileEditDetails.pincode || ''} onChange={(event) => updateOwnerProfileEditField('pincode', event.target.value)} placeholder="Pincode" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                    <input value={ownerProfileEditDetails.address || ''} onChange={(event) => updateOwnerProfileEditField('address', event.target.value)} placeholder="Address" className="h-10 rounded-xl border border-forest-100 px-3 text-sm md:col-span-2 xl:col-span-3" />
                  </div>
                  <button className="mt-4 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-bold text-white">Save Personal Information</button>
                </Card>
              </form>
            )}

            {activeProfileTab === 'preferences' && (
              <form onSubmit={(event) => saveOwnerProfileChanges(event).catch((error) => setProfileImageMessage(error.response?.data?.detail || 'Unable to save profile.'))}>
                <Card title="Project Preferences" icon={Home}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <select value={ownerProfileEditDetails.building_type || 'RESIDENTIAL'} onChange={(event) => updateOwnerProfileEditField('building_type', event.target.value)} className="h-10 rounded-xl border border-forest-100 px-3 text-sm">
                      <option value="RESIDENTIAL">Residential</option>
                      <option value="COMMERCIAL">Commercial</option>
                      <option value="VILLA">Villa</option>
                      <option value="DUPLEX">Duplex</option>
                    </select>
                    <select value={ownerProfileEditDetails.construction_type || 'CONTRACTOR'} onChange={(event) => updateOwnerProfileEditField('construction_type', event.target.value)} className="h-10 rounded-xl border border-forest-100 px-3 text-sm">
                      <option value="CONTRACTOR">Contractor Based</option>
                      <option value="SELF_CONSTRUCTION">Self Construction</option>
                    </select>
                    <input type="number" value={ownerProfileEditDetails.budget || ''} onChange={(event) => updateOwnerProfileEditField('budget', event.target.value)} placeholder="Budget" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                    <input type="number" value={ownerProfileEditDetails.land_area || ''} onChange={(event) => updateOwnerProfileEditField('land_area', event.target.value)} placeholder="Land area" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                    <input type="number" value={ownerProfileEditDetails.floors || ''} onChange={(event) => updateOwnerProfileEditField('floors', event.target.value)} placeholder="Floors" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                    <ProfileField label="Latest Project" value={firstProject?.title} />
                  </div>
                  <button className="mt-4 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-bold text-white">Save Project Preferences</button>
                </Card>
              </form>
            )}

            {activeProfileTab === 'media' && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                <ProfileImageUpload
                  imageSource={user?.profile_image_url}
                  title="Profile Image"
                  note="Upload your profile photo."
                  onUpload={(file) => uploadOwnerProfileImage(file).catch((error) => setProfileImageMessage(error.response?.data?.detail || 'Profile image upload failed.'))}
                />
                <Card title="Media Guidelines" icon={ShieldCheck}>
                  <p className="text-sm leading-relaxed text-graphite/65">
                    Use a clear face photo so contractors, suppliers and support can identify your account quickly.
                    Personal and project preference details are edited in their dedicated tabs.
                  </p>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
