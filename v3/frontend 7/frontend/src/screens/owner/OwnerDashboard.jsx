import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Boxes, Calculator, FileText, HardHat, Home, MessageSquare, ShieldCheck, Truck, UserRound } from 'lucide-react'
import DashboardShell from '../../dashboard/DashboardShell.jsx'
import DashboardCard from '../../components/dashboard/DashboardCard.jsx'
import EmptyState from '../../components/dashboard/EmptyState.jsx'
import StatusPill from '../../components/dashboard/StatusPill.jsx'
import MessageThread from '../../components/dashboard/MessageThread.jsx'
import OwnerProjectForm from '../../components/owner/OwnerProjectForm.jsx'
import {
  acceptProjectRequest,
  fetchIncomingRequests,
  fetchNearbyContractors,
  fetchNearbySuppliers,
  fetchOwnerProjects,
  rejectProjectRequest,
  sendProjectRequest,
} from '../../services/gharService.js'

const nav = [
  { id: 'requests', label: 'Requests', icon: FileText },
  { id: 'projects', label: 'Projects', icon: Home },
  { id: 'contractors', label: 'Contractors', icon: HardHat },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'estimates', label: 'Estimates', icon: Calculator },
  { id: 'escrow', label: 'Escrow', icon: ShieldCheck },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

function Money({ value }) {
  return <span>{Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
}

export default function OwnerDashboard() {
  const { user } = useSelector((state) => state.auth)
  const [activeId, setActiveId] = useState('requests')
  const [projectList, setProjectList] = useState([])
  const [requestList, setRequestList] = useState([])
  const [contractorList, setContractorList] = useState([])
  const [supplierList, setSupplierList] = useState([])

  const userShell = useMemo(() => ({ name: user?.name || 'Owner', initials: (user?.name || 'O').slice(0, 2).toUpperCase() }), [user])

  const refreshOwnerData = () => {
    fetchOwnerProjects().then(setProjectList)
    fetchIncomingRequests().then(setRequestList)
    fetchNearbyContractors().then(setContractorList)
    fetchNearbySuppliers().then(setSupplierList)
  }

  useEffect(refreshOwnerData, [])

  const currentConstructionType = projectList[0]?.construction_type || user?.owner_profile?.construction_type
  const estimate = projectList[0]
    ? {
        cost: Number(projectList[0].land_area || 0) * Number(projectList[0].floors || 1) * 2200,
        duration: Math.max(90, Number(projectList[0].floors || 1) * 90),
      }
    : null

  return (
    <DashboardShell nav={nav} activeId={activeId} onNavClick={setActiveId} user={userShell}>
      {activeId === 'requests' && (
        <DashboardCard title="Incoming Requests" icon={FileText}>
          <div className="space-y-3">
            {requestList.map((request) => (
              <div key={request.id} className="flex flex-col gap-3 rounded-xl border border-forest-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-sm font-bold text-graphite">{request.sender_name}</p>
                  <p className="text-xs text-graphite/55">{request.request_type} request for {request.project_title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={request.status} />
                  <button onClick={async () => { await acceptProjectRequest(request.id); refreshOwnerData() }} className="rounded-xl bg-forest-700 px-3 py-2 text-xs font-bold text-white">Accept</button>
                  <button onClick={async () => { await rejectProjectRequest(request.id); refreshOwnerData() }} className="rounded-xl border border-forest-100 px-3 py-2 text-xs font-bold text-graphite/65">Reject</button>
                </div>
              </div>
            ))}
            {!requestList.length && <EmptyState title="No requests yet" message="Nearby contractors and suppliers can send requests after your project is listed." icon={FileText} />}
          </div>
        </DashboardCard>
      )}

      {activeId === 'projects' && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <OwnerProjectForm onProjectCreated={refreshOwnerData} />
          <DashboardCard title="Owner Projects" icon={Home}>
            <div className="space-y-3">
              {projectList.map((project) => (
                <article key={project.id} className="rounded-xl border border-forest-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-base font-bold text-graphite">{project.title}</p>
                      <p className="text-xs text-graphite/55">{project.address} - {project.pincode}</p>
                    </div>
                    <StatusPill status={project.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <span><b>{project.completion_percentage || 0}%</b><br /><small className="text-graphite/50">Completion</small></span>
                    <span><b><Money value={project.budget} /></b><br /><small className="text-graphite/50">Budget</small></span>
                    <span><b>{project.construction_type}</b><br /><small className="text-graphite/50">Type</small></span>
                    <span><b>{project.floors}</b><br /><small className="text-graphite/50">Floors</small></span>
                  </div>
                </article>
              ))}
              {!projectList.length && <EmptyState title="No projects created" message="Create your first project to start nearby matching." icon={Home} />}
            </div>
          </DashboardCard>
        </div>
      )}

      {activeId === 'contractors' && (
        <DashboardCard title="Nearby Contractors" icon={HardHat}>
          {currentConstructionType === 'SELF_CONSTRUCTION' ? <EmptyState title="Contractors hidden" message="Contractors are shown when construction type is CONTRACTOR." /> : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {contractorList.map((contractor) => (
                <article key={contractor.id} className="rounded-xl border border-forest-100 p-4">
                  <p className="font-display text-sm font-bold text-graphite">{contractor.name}</p>
                  <p className="text-xs text-graphite/55">{contractor.company_name}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-graphite/65">
                    <span>{contractor.rating} rating</span><span>{contractor.experience_years} yrs</span><span>{contractor.completed_projects} done</span>
                  </div>
                  <button onClick={() => sendProjectRequest({ receiver_id: contractor.user_id, project_id: projectList[0]?.id, request_type: 'OWNER_TO_CONTRACTOR' })} className="mt-4 w-full rounded-xl bg-forest-700 py-2 text-xs font-bold text-white">Send request</button>
                </article>
              ))}
            </div>
          )}
        </DashboardCard>
      )}

      {activeId === 'suppliers' && (
        <DashboardCard title="Nearby Suppliers" icon={Truck}>
          {currentConstructionType === 'CONTRACTOR' ? <EmptyState title="Suppliers hidden" message="Direct supplier matching is shown for SELF_CONSTRUCTION projects." /> : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {supplierList.map((supplier) => (
                <article key={supplier.id} className="rounded-xl border border-forest-100 p-4">
                  <p className="font-display text-sm font-bold text-graphite">{supplier.store_name}</p>
                  <p className="text-xs text-graphite/55">{supplier.categories}</p>
                  <p className="mt-2 text-xs font-bold text-gold">{supplier.rating} rating</p>
                  <button onClick={() => sendProjectRequest({ receiver_id: supplier.user_id, project_id: projectList[0]?.id, request_type: 'OWNER_TO_SUPPLIER' })} className="mt-4 w-full rounded-xl bg-forest-700 py-2 text-xs font-bold text-white">Send request</button>
                </article>
              ))}
            </div>
          )}
        </DashboardCard>
      )}

      {activeId === 'estimates' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <DashboardCard title="Construction Estimate" icon={Calculator}>
            {estimate ? <div className="space-y-3 text-sm"><p>Estimated cost: <b><Money value={estimate.cost} /></b></p><p>Estimated duration: <b>{estimate.duration} days</b></p><p>Material estimate: <b><Money value={estimate.cost * 0.62} /></b></p><p>Labour estimate: <b><Money value={estimate.cost * 0.28} /></b></p></div> : <EmptyState title="No estimate source" message="Create a project to calculate estimate history." />}
          </DashboardCard>
          <DashboardCard title="Estimate History" icon={FileText} className="lg:col-span-2">
            <EmptyState title="No stored estimates" message="Backend stores estimates created from the calculator endpoint." />
          </DashboardCard>
        </div>
      )}

      {activeId === 'escrow' && (
        <DashboardCard title="Escrow Milestones" icon={ShieldCheck}>
          <div className="space-y-3">{(projectList[0]?.escrow_milestones || []).map((milestone) => <div key={milestone.id} className="flex items-center justify-between rounded-xl border border-forest-100 p-3"><span className="font-medium">{milestone.name}</span><span><Money value={milestone.amount} /> <StatusPill status={milestone.status} /></span></div>)}</div>
        </DashboardCard>
      )}

      {activeId === 'messages' && <MessageThread />}
      {activeId === 'profile' && <DashboardCard title="Owner Profile" icon={UserRound}><pre className="whitespace-pre-wrap text-sm text-graphite/70">{JSON.stringify(user, null, 2)}</pre></DashboardCard>}
    </DashboardShell>
  )
}
