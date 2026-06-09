import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import DashboardCard from '../dashboard/DashboardCard.jsx'
import { saveTimelineUpdate } from '../../services/gharService.js'

function calculateTimelineDay(selectedDate, timelineEntries) {
  if (!selectedDate) return ''
  if (!timelineEntries?.length) return 'Day 1'

  const sortedEntries = [...timelineEntries]
    .filter((entry) => entry.date)
    .sort((firstEntry, secondEntry) => new Date(firstEntry.date) - new Date(secondEntry.date))

  if (!sortedEntries.length) return 'Day 1'
  const firstTimelineDate = new Date(sortedEntries[0].date)
  const selectedTimelineDate = new Date(selectedDate)
  const dayNumber = Math.max(1, Math.round((selectedTimelineDate - firstTimelineDate) / 86400000) + 1)
  return `Day ${dayNumber}`
}

export default function TimelineUpdateForm({ projectId, timelineEntries = [], onTimelineSaved }) {
  const [timelineDetails, setTimelineDetails] = useState({ title: '', description: '', date: '', completion_status: 'active' })
  const [imageFileList, setImageFileList] = useState([])
  const autoDayLabel = calculateTimelineDay(timelineDetails.date, timelineEntries)

  const saveTimelineEntry = async (event) => {
    event.preventDefault()
    const formData = new FormData()
    Object.entries(timelineDetails).forEach(([key, value]) => formData.append(key, value))
    Array.from(imageFileList).forEach((imageFile) => formData.append('images', imageFile))
    await saveTimelineUpdate(projectId, formData)
    setTimelineDetails({ title: '', description: '', date: '', completion_status: 'active' })
    setImageFileList([])
    onTimelineSaved?.()
  }

  return (
    <DashboardCard title="Timeline Update" icon={CalendarPlus}>
      <form onSubmit={saveTimelineEntry} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input required value={timelineDetails.title} onChange={(event) => setTimelineDetails({ ...timelineDetails, title: event.target.value })} placeholder="Title" className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
        <div className="grid grid-cols-[1fr_7rem] gap-2">
          <input required type="date" value={timelineDetails.date} onChange={(event) => setTimelineDetails({ ...timelineDetails, date: event.target.value })} className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
          <input readOnly value={autoDayLabel} placeholder="Day" className="rounded-xl border border-forest-100 bg-forest-50 px-3 py-2 text-center text-sm font-bold text-forest-700" />
        </div>
        <textarea required value={timelineDetails.description} onChange={(event) => setTimelineDetails({ ...timelineDetails, description: event.target.value })} placeholder="Description" className="min-h-24 rounded-xl border border-forest-100 px-3 py-2 text-sm md:col-span-2" />
        <select value={timelineDetails.completion_status} onChange={(event) => setTimelineDetails({ ...timelineDetails, completion_status: event.target.value })} className="rounded-xl border border-forest-100 px-3 py-2 text-sm">
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="delayed">Delayed</option>
        </select>
        <input type="file" multiple accept="image/*" onChange={(event) => setImageFileList(event.target.files)} className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
        <button className="btn-primary h-11 rounded-xl md:col-span-2">Save timeline update</button>
      </form>
    </DashboardCard>
  )
}
