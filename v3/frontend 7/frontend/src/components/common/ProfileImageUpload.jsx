import { Camera, Upload, UserRound } from 'lucide-react'
import { imageUrl } from '../../services/apiClient.js'

export default function ProfileImageUpload({ imageSource, title = 'Profile Image', note = 'Upload a clear profile image.', onUpload, className = '' }) {
  return (
    <div className={`rounded-xl border border-forest-100 bg-white p-3 ${className}`}>
      <div className="flex items-center gap-3">
        {imageSource ? (
          <img src={imageUrl(imageSource)} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-forest-100" />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-full bg-forest-50 text-forest-700 ring-1 ring-forest-100">
            <UserRound className="h-7 w-7" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-graphite">{title}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-graphite/50">{note}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-forest-100 bg-cream/40 px-3 text-xs font-bold text-forest-700">
              <Upload className="h-4 w-4" /> Upload
              <input type="file" accept="image/*" onChange={(event) => onUpload?.(event.target.files?.[0])} className="sr-only" />
            </label>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-forest-100 bg-cream/40 px-3 text-xs font-bold text-forest-700">
              <Camera className="h-4 w-4" /> Camera
              <input type="file" accept="image/*" capture="environment" onChange={(event) => onUpload?.(event.target.files?.[0])} className="sr-only" />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
