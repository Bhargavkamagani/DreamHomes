import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, Home, IndianRupee, MapPin, Search } from 'lucide-react'

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function requestInitials(name) {
  return (name || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function statusLabel(status) {
  if (status === 'pending') return 'New'
  return (status || 'pending').slice(0, 1).toUpperCase() + (status || 'pending').slice(1)
}

function requestAgeLabel(createdAt) {
  if (!createdAt) return ''
  return createdAt
}

export default function RequestsPanel({ title, subtitle, requestList, onAccept, onReject }) {
  const [activeStatus, setActiveStatus] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRequestId, setExpandedRequestId] = useState(null)

  const locationOptions = useMemo(() => {
    const locations = requestList
      .map((request) => request.project_pincode || request.sender_pincode || request.project_address || request.sender_address)
      .filter(Boolean)
    return [...new Set(locations)]
  }, [requestList])

  const filteredRequests = useMemo(() => {
    return requestList.filter((request) => {
      const matchesStatus = activeStatus === 'all' || request.status === activeStatus || (activeStatus === 'pending' && request.status === 'pending')
      const requestLocation = request.project_pincode || request.sender_pincode || request.project_address || request.sender_address
      const matchesLocation = selectedLocation === 'all' || requestLocation === selectedLocation
      const requestBudget = Number(request.budget || 0)
      const matchesBudget =
        selectedBudget === 'all'
        || (selectedBudget === 'under_25' && requestBudget > 0 && requestBudget < 2500000)
        || (selectedBudget === '25_50' && requestBudget >= 2500000 && requestBudget <= 5000000)
        || (selectedBudget === '50_100' && requestBudget > 5000000 && requestBudget <= 10000000)
        || (selectedBudget === 'above_100' && requestBudget > 10000000)
      const searchableText = [
        request.sender_name,
        request.sender_role,
        request.project_title,
        request.project_address,
        request.project_pincode,
        request.request_type,
      ].join(' ').toLowerCase()
      return matchesStatus && matchesLocation && matchesBudget && searchableText.includes(searchTerm.toLowerCase())
    })
  }, [activeStatus, requestList, searchTerm, selectedBudget, selectedLocation])

  const counts = {
    all: requestList.length,
    pending: requestList.filter((request) => request.status === 'pending').length,
    accepted: requestList.filter((request) => request.status === 'accepted').length,
    rejected: requestList.filter((request) => request.status === 'rejected').length,
  }

  const tabs = [
    { id: 'all', label: 'All Requests', count: counts.all },
    { id: 'pending', label: 'New', count: counts.pending },
    { id: 'accepted', label: 'Accepted', count: counts.accepted },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
  ]

  return (
    <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-card">
      <div className="mb-5">
        <h2 className="font-display text-3xl font-extrabold text-graphite">{title}</h2>
        <p className="mt-2 text-sm font-medium text-graphite/55">{subtitle}</p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[220px_220px_220px_minmax(0,1fr)]">
        <label className="relative flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-4 py-3 text-sm font-bold text-graphite shadow-sm">
          <Filter className="h-4 w-4 shrink-0 text-forest-700" />
          <select
            value={activeStatus}
            onChange={(event) => setActiveStatus(event.target.value)}
            className="w-full appearance-none bg-transparent pr-6 font-bold outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">New</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <span className="pointer-events-none absolute right-4 text-graphite/45">⌄</span>
        </label>
        <label className="relative flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-4 py-3 text-sm font-bold text-graphite shadow-sm">
          <MapPin className="h-4 w-4 shrink-0 text-forest-700" />
          <select
            value={selectedLocation}
            onChange={(event) => setSelectedLocation(event.target.value)}
            className="w-full appearance-none bg-transparent pr-6 font-bold outline-none"
          >
            <option value="all">All Locations</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 text-graphite/45">⌄</span>
        </label>
        <label className="relative flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-4 py-3 text-sm font-bold text-graphite shadow-sm">
          <IndianRupee className="h-4 w-4 shrink-0 text-forest-700" />
          <select
            value={selectedBudget}
            onChange={(event) => setSelectedBudget(event.target.value)}
            className="w-full appearance-none bg-transparent pr-6 font-bold outline-none"
          >
            <option value="all">All Budgets</option>
            <option value="under_25">Under ₹25 Lakhs</option>
            <option value="25_50">₹25 - ₹50 Lakhs</option>
            <option value="50_100">₹50 Lakhs - ₹1 Cr</option>
            <option value="above_100">Above ₹1 Cr</option>
          </select>
          <span className="pointer-events-none absolute right-4 text-graphite/45">⌄</span>
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-forest-100 bg-white px-4 py-3 text-sm font-semibold text-graphite/55 shadow-sm">
          <Search className="h-5 w-5 text-forest-700" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search owner, location..."
            className="w-full bg-transparent outline-none"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-forest-100">
        <div className="dash-scroll flex overflow-x-auto border-b border-forest-100 bg-white">
          {tabs.map((tab) => {
            const active = activeStatus === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatus(tab.id)}
                className={`shrink-0 border-b-2 px-8 py-4 text-sm font-extrabold ${
                  active ? 'border-blue-600 text-blue-700' : 'border-transparent text-graphite hover:text-forest-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            )
          })}
        </div>

        <div>
          {filteredRequests.map((request) => {
            const pending = request.status === 'pending'
            const expanded = expandedRequestId === request.id
            return (
              <article key={request.id} className="border-b border-forest-100 last:border-b-0">
                <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[5rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.25fr)] lg:items-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-forest-100 to-forest-200 font-display text-lg font-extrabold text-forest-800">
                    {requestInitials(request.sender_name)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-extrabold text-graphite">{request.sender_name}</h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-graphite/60"><MapPin className="h-4 w-4" /> {request.project_address || request.sender_address || request.project_pincode || 'Location not set'}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-graphite/60"><Home className="h-4 w-4" /> {request.project_title} {request.land_area ? `• ${request.land_area} Sq.ft` : ''}</p>
                    {Number(request.budget || 0) > 0 && <p className="mt-1 flex items-center gap-2 text-sm font-bold text-graphite/70"><IndianRupee className="h-4 w-4" /> Budget: {formatMoney(request.budget)}</p>}
                  </div>

                  <div className="text-sm text-graphite/60">
                    <p>Posted: <span className="font-bold text-graphite/70">{requestAgeLabel(request.created_at)}</span></p>
                    <p className="mt-2 inline-flex rounded-full bg-forest-50 px-3 py-1 text-xs font-bold uppercase text-forest-700">{statusLabel(request.status)}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button onClick={() => setExpandedRequestId(expanded ? null : request.id)} className="rounded-xl border border-forest-100 bg-white px-4 py-3 text-sm font-bold text-graphite shadow-sm">
                      View Details
                    </button>
                    <button disabled={!pending} onClick={() => onAccept(request.id)} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45">
                      Accept
                    </button>
                    <button disabled={!pending} onClick={() => onReject(request.id)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-45">
                      Reject
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-forest-50 bg-cream/30 px-5 py-4">
                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
                      <p><span className="text-graphite/45">Request Type</span><br /><b>{request.request_type}</b></p>
                      <p><span className="text-graphite/45">Construction</span><br /><b>{request.construction_type || 'Not set'}</b></p>
                      <p><span className="text-graphite/45">Building</span><br /><b>{request.building_type || 'Not set'}</b></p>
                      <p><span className="text-graphite/45">Pincode</span><br /><b>{request.project_pincode || request.sender_pincode || 'Not set'}</b></p>
                    </div>
                  </div>
                )}
              </article>
            )
          })}

          {!filteredRequests.length && (
            <div className="px-5 py-16 text-center">
              <p className="font-display text-base font-bold text-graphite">No requests found</p>
              <p className="mt-1 text-sm text-graphite/50">Requests matching this status/search will appear here.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-3">
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-forest-100 text-graphite/60"><ChevronLeft className="h-4 w-4" /></button>
        <button className="grid h-9 w-9 place-items-center rounded-lg bg-blue-700 text-sm font-bold text-white">1</button>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-forest-100 text-sm font-bold text-graphite/60">2</button>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-forest-100 text-sm font-bold text-graphite/60">3</button>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-forest-100 text-graphite/60"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </section>
  )
}
