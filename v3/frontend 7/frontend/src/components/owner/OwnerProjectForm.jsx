import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import DashboardCard from '../dashboard/DashboardCard.jsx'
import PincodeAreaHint from '../common/PincodeAreaHint.jsx'
import { usePincodeAreaLookup } from '../../hooks/usePincodeAreaLookup.js'
import { createProjectRequest } from '../../services/gharService.js'

const defaultProject = {
  title: '',
  description: '',
  address: '',
  pincode: '',
  building_type: 'RESIDENTIAL',
  construction_type: 'CONTRACTOR',
  budget: '',
  land_area: '',
  floors: 1,
}

export default function OwnerProjectForm({ onProjectCreated }) {
  const [projectDetails, setProjectDetails] = useState(defaultProject)

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
    await createProjectRequest(projectDetails)
    setProjectDetails(defaultProject)
    onProjectCreated?.()
  }

  return (
    <DashboardCard title="Create Project" icon={Plus}>
      <form onSubmit={submitProject} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input required value={projectDetails.title} onChange={(event) => updateProjectField('title', event.target.value)} placeholder="Project title" className="rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400" />
        <label className="block">
          <input required value={projectDetails.pincode} onChange={(event) => updateProjectField('pincode', event.target.value)} placeholder="Pincode" className="w-full rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400" />
          <PincodeAreaHint lookupState={pincodeLookupState} />
        </label>
        <input required value={projectDetails.address} onChange={(event) => updateProjectField('address', event.target.value)} placeholder="Site address" className="rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400 md:col-span-2" />
        <textarea required value={projectDetails.description} onChange={(event) => updateProjectField('description', event.target.value)} placeholder="Project description" className="min-h-24 rounded-xl border border-forest-100 px-3 py-2 text-sm outline-none focus:border-forest-400 md:col-span-2" />
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
        <button className="btn-primary h-11 rounded-xl md:col-span-2">Create project</button>
      </form>
    </DashboardCard>
  )
}
