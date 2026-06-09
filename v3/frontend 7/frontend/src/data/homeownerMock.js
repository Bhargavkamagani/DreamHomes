export const currentUser = { name: '', role: 'Homeowner', initials: 'HO' }

export const project = {
  name: '',
  city: '',
  state: '',
  status: '',
  completion: 0,
}

export const stats = {
  completion: 0,
  completionNote: '',
  budgetUsed: 0,
  budgetTotal: 0,
  budgetPct: 0,
  delayRisk: '',
  delayNote: '',
  escrowBalance: 0,
  escrowNote: '',
  healthScore: 0,
  healthLabel: '',
}

export const calculator = {
  fields: [
    { label: 'Plot Area (sq.ft)', value: '' },
    { label: 'Floors', value: '' },
    { label: 'Cement Bags', value: '' },
    { label: 'Sand Loads (Truck)', value: '' },
    { label: 'Steel (MT)', value: '' },
    { label: 'Bricks (Nos.)', value: '' },
  ],
  estimatedTotal: 0,
}

export const estimator = {
  selects: [
    { label: 'Construction Type', value: '' },
    { label: 'Material Quality', value: '' },
    { label: 'Finishing Type', value: '' },
    { label: 'Budget Range', value: '' },
  ],
  estimatedCost: '',
  timeline: '',
  emi: '',
}

export const boq = {
  items: [
    { name: 'Cement', qty: '', cost: 0 },
    { name: 'Steel', qty: '', cost: 0 },
    { name: 'Sand', qty: '', cost: 0 },
    { name: 'Bricks', qty: '', cost: 0 },
    { name: 'Tiles', qty: '', cost: 0 },
    { name: 'Plumbing', qty: '', cost: 0 },
    { name: 'Electrical', qty: '', cost: 0 },
  ],
  total: 0,
}

export const monitoring = {
  photo: '',
  overallProgress: 0,
  riskAlerts: 0,
  riskLevel: '',
  qualityAlerts: 0,
  qualityLevel: '',
}

export const contractor = {
  name: '',
  trust: 0,
  verified: false,
}

export const milestones = [
  { seq: 1, name: 'Foundation', status: 'Pending', payment: 0 },
  { seq: 2, name: 'Ground Floor', status: 'Pending', payment: 0 },
  { seq: 3, name: 'First Floor', status: 'Pending', payment: 0 },
  { seq: 4, name: 'Roof Casting', status: 'Pending', payment: 0 },
]

export const escrow = {
  deposited: 0,
  released: 0,
  pending: 0,
  nextRelease: 0,
  nextReleaseNote: '',
}

export const suppliers = []

export const network = [
  { key: 'engineer', label: 'Hire Civil Engineer' },
  { key: 'materials', label: 'Buy Materials' },
  { key: 'equipment', label: 'Rent Equipment' },
  { key: 'permit', label: 'Find Permit Expert' },
]

export const maintenance = [
  { title: 'Waterproofing', due: '' },
  { title: 'Exterior Paint', due: '' },
  { title: 'Plumbing Check', due: '' },
  { title: 'Electrical Inspection', due: '' },
]
