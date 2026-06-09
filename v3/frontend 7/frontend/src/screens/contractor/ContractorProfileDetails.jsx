import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BadgeCheck, BriefcaseBusiness, Building2, Download, FileText, Globe, HardHat,
  Home, Mail, MapPin, MessageSquare, Phone, ShieldCheck, Star, Users,
} from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import { SmartImage } from '../../lib/ui.jsx'
import { imageUrl } from '../../services/apiClient.js'
import { fetchContractorProfile, sendConversationMessage, startConversation } from '../../services/gharService.js'

const defaultAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80'
const tabs = ['overview', 'projects', 'reviews', 'services', 'documents', 'gallery', 'equipment']

function InfoCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-card">
      <h3 className="font-display text-base font-extrabold text-graphite">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function StatBox({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-forest-100 bg-white p-4">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-forest-50 text-forest-700"><Icon className="h-5 w-5" /></span>
      <span>
        <b className="block font-display text-xl text-graphite">{value}</b>
        <small className="text-graphite/55">{label}</small>
      </span>
    </div>
  )
}

function EmptyPanel({ title, message }) {
  return (
    <div className="rounded-2xl border border-dashed border-forest-100 bg-cream/40 p-8 text-center">
      <p className="font-display text-base font-bold text-graphite">{title}</p>
      <p className="mt-1 text-sm text-graphite/55">{message}</p>
    </div>
  )
}

function DetailLine({ label, value }) {
  return (
    <p className="flex items-center justify-between gap-4 border-b border-forest-50 py-2 text-sm text-graphite/70">
      <span>{label}</span>
      <b className="text-right text-graphite">{value || 'Not set'}</b>
    </p>
  )
}

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl bg-forest-50 px-3 py-2 text-xs font-bold text-forest-700">
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </span>
  )
}

function documentUrlFromLabel(documentName) {
  const possibleUrl = String(documentName || '').split(':').slice(1).join(':').trim()
  return possibleUrl.startsWith('/uploads/') || possibleUrl.startsWith('http') ? possibleUrl : ''
}

export default function ContractorProfileDetails() {
  const { contractorId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [messageComposerOpen, setMessageComposerOpen] = useState(false)
  const [messageBody, setMessageBody] = useState('')
  const [messageStatus, setMessageStatus] = useState('')
  const [messageSending, setMessageSending] = useState(false)

  useEffect(() => {
    fetchContractorProfile(contractorId)
      .then(setProfile)
      .catch((error) => setErrorMessage(error.response?.data?.detail || 'Unable to load contractor profile.'))
  }, [contractorId])

  const galleryImages = useMemo(() => profile?.gallery || [], [profile])

  if (errorMessage) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream p-6">
        <div className="rounded-2xl border border-forest-100 bg-white p-6 text-center shadow-card">
          <p className="font-display text-lg font-bold text-graphite">{errorMessage}</p>
          <button onClick={() => navigate(-1)} className="mt-4 rounded-xl bg-forest-700 px-4 py-2 text-sm font-bold text-white">Go back</button>
        </div>
      </main>
    )
  }

  if (!profile) {
    return <main className="grid min-h-screen place-items-center bg-cream text-sm font-bold text-graphite/60">Loading contractor profile...</main>
  }

  const servicesOffered = profile.services_offered || []
  const serviceLocations = profile.service_locations || []
  const equipmentOwned = profile.equipment_owned || []
  const documentList = profile.documents || []

  const sendDirectMessage = async (event) => {
    event.preventDefault()
    if (!messageBody.trim()) {
      setMessageStatus('Type a message before sending.')
      return
    }
    setMessageSending(true)
    setMessageStatus('')
    try {
      const conversation = await startConversation({
        receiver_id: profile.user_id,
        title: profile.company_name || profile.name,
      })
      await sendConversationMessage({
        conversation_id: conversation.id,
        body: messageBody.trim(),
      })
      setMessageBody('')
      setMessageStatus('Message sent. You can continue this conversation from Messages.')
    } catch (error) {
      setMessageStatus(error.response?.data?.detail || 'Unable to send message.')
    } finally {
      setMessageSending(false)
    }
  }

  const renderTabContent = () => {
    if (activeTab === 'overview') {
      return (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-4">
            <InfoCard title="About Contractor">
              <p className="text-sm leading-relaxed text-graphite/70">{profile.about || 'This contractor has not added a company description yet.'}</p>
            </InfoCard>
            <InfoCard title="Work Process">
              <div className="grid grid-cols-2 gap-3 text-center text-xs md:grid-cols-4">
                {['Consultation', 'Planning', 'Execution', 'Handover'].map((step, index) => (
                  <div key={step} className="rounded-xl bg-forest-50 p-4">
                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white font-bold text-forest-700">{index + 1}</span>
                    <p className="mt-2 font-bold">{step}</p>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
          <InfoCard title="Key Information">
            <DetailLine label="Business Type" value={profile.business_type} />
            <DetailLine label="Registration Year" value={profile.registration_year} />
            <DetailLine label="Team Size" value={profile.team_size} />
            <DetailLine label="Insurance" value={profile.insurance_available ? 'Yes' : 'No'} />
            <DetailLine label="License" value={profile.license_number} />
            <DetailLine label="GSTIN" value={profile.gstin} />
            <DetailLine label="PAN" value={profile.pan} />
            <DetailLine label="Website" value={profile.website} />
            <DetailLine label="Pincode" value={profile.pincode} />
          </InfoCard>
        </section>
      )
    }

    if (activeTab === 'projects') {
      return (
        <InfoCard title="Completed Projects">
          {galleryImages.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {galleryImages.map((item, index) => (
                <article key={item} className="overflow-hidden rounded-xl border border-forest-100 bg-white">
                  <SmartImage src={imageUrl(item)} alt="" className="h-44 w-full object-cover" />
                  <div className="p-4 text-sm">
                    <p className="font-bold text-graphite">Completed Project {index + 1}</p>
                    <p className="mt-1 text-xs text-graphite/55">Added to contractor portfolio after project completion.</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyPanel title="No completed projects yet" message="Completed owner projects will become contractor portfolio items here." />
          )}
        </InfoCard>
      )
    }

    if (activeTab === 'reviews') {
      const rating = Number(profile.rating || 0)
      return (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <InfoCard title="Customer Rating">
            <div className="text-center">
              <p className="font-display text-5xl font-extrabold text-graphite">{rating.toFixed(1)}</p>
              <p className="mt-2 text-sm font-bold text-gold">Rating summary</p>
              <p className="mt-1 text-xs text-graphite/50">Reviews are added after completed projects.</p>
            </div>
          </InfoCard>
          <InfoCard title="Customer Reviews">
            <EmptyPanel title="No reviews yet" message="Owner reviews will appear here once a project is completed and reviewed." />
          </InfoCard>
        </section>
      )
    }

    if (activeTab === 'services') {
      return (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <InfoCard title="Services Offered">
            {servicesOffered.length ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {servicesOffered.map((service) => (
                  <div key={service} className="flex items-center gap-3 rounded-xl border border-forest-100 bg-white p-4">
                    <Home className="h-5 w-5 text-forest-700" />
                    <span className="text-sm font-bold text-graphite">{service}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPanel title="No services selected" message="Services selected in complete profile will appear here." />
            )}
          </InfoCard>
          <InfoCard title="Service Locations">
            {serviceLocations.length ? (
              <div className="flex flex-wrap gap-2">
                {serviceLocations.map((location) => <Chip key={location} icon={MapPin}>{location}</Chip>)}
              </div>
            ) : (
              <EmptyPanel title="No locations" message="Service locations will appear here." />
            )}
          </InfoCard>
        </section>
      )
    }

    if (activeTab === 'documents') {
      return (
        <InfoCard title="Documents & Certificates">
          {documentList.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {documentList.map((documentName) => {
                const documentHref = documentUrlFromLabel(documentName)
                return (
                  <a
                    key={documentName}
                    href={documentHref ? imageUrl(documentHref) : undefined}
                    target={documentHref ? '_blank' : undefined}
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-forest-100 bg-white px-4 py-3 text-xs font-bold text-graphite"
                  >
                    <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-warm" /> {documentName}</span>
                    <Download className="h-4 w-4 text-forest-700" />
                  </a>
                )
              })}
            </div>
          ) : (
            <EmptyPanel title="No documents uploaded" message="Business license, GST, PAN, insurance and other certificates will appear here." />
          )}
        </InfoCard>
      )
    }

    if (activeTab === 'gallery') {
      return (
        <InfoCard title="Project Gallery">
          {galleryImages.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              {galleryImages.map((item) => <SmartImage key={item} src={imageUrl(item)} alt="" className="h-44 rounded-xl object-cover" />)}
            </div>
          ) : (
            <EmptyPanel title="No gallery images" message="Uploaded contractor gallery images will appear here." />
          )}
        </InfoCard>
      )
    }

    return (
      <InfoCard title="Equipment Owned">
        {equipmentOwned.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {equipmentOwned.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-forest-100 bg-white p-4">
                <Building2 className="h-5 w-5 text-forest-700" />
                <span className="text-sm font-bold text-graphite">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel title="No equipment listed" message="Equipment selected in complete profile will appear here." />
        )}
      </InfoCard>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white text-graphite">
      <header className="sticky top-0 z-30 border-b border-forest-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6">
          <Logo />
          <button onClick={() => navigate(-1)} className="rounded-full border border-forest-100 bg-white px-4 py-2 text-sm font-bold text-forest-700 shadow-sm">Back</button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-6">
        <div className="text-xs font-semibold text-graphite/55">Dashboard / Contractors / <span className="text-graphite">{profile.company_name}</span></div>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-forest-100 bg-white p-5 shadow-card">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[170px_minmax(0,1fr)_420px]">
              <div>
                <SmartImage src={profile.profile_image_url ? imageUrl(profile.profile_image_url) : defaultAvatar} alt={profile.name} className="h-36 w-36 rounded-full object-cover" />
                <div className="mt-3 rounded-2xl border border-forest-100 bg-cream/50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-graphite/45">Company Logo</p>
                  {profile.company_logo_url ? (
                    <SmartImage src={imageUrl(profile.company_logo_url)} alt={profile.company_name} className="mt-2 h-20 w-20 rounded-xl object-cover" />
                  ) : (
                    <span className="mt-2 grid h-20 w-20 place-items-center rounded-xl bg-white text-xs font-bold text-graphite/45">No logo</span>
                  )}
                </div>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-forest-50 px-3 py-1 text-xs font-bold text-forest-700">
                  <BadgeCheck className="h-3.5 w-3.5" /> {profile.profile_complete ? 'Verified' : 'Profile pending'}
                </span>
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold text-graphite">{profile.company_name}</h1>
                <p className="mt-1 text-sm font-semibold text-graphite/65">{profile.name} - Civil Contractor & Construction Company</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-graphite/65">
                  <span className="inline-flex items-center gap-1 text-gold"><Star className="h-4 w-4 fill-current" /> {profile.rating || 0} rating</span>
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-forest-700" /> {profile.experience_years || 0}+ Years Experience</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-forest-700" /> {profile.address}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-4 text-xs text-graphite/55">
                  {profile.gstin && <span>GSTIN: <b className="text-graphite">{profile.gstin}</b></span>}
                  {profile.pan && <span>PAN: <b className="text-graphite">{profile.pan}</b></span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox icon={BriefcaseBusiness} value={`${profile.completed_projects || 0}+`} label="Projects Completed" />
                <StatBox icon={BadgeCheck} value="98%" label="On-time Delivery" />
                <StatBox icon={Users} value="250+" label="Happy Clients" />
                <StatBox icon={HardHat} value={`${profile.experience_years || 0}+`} label="Years in Business" />
              </div>
            </div>
          </div>

          <InfoCard title="Contact Information">
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-forest-700" /> {profile.phone}</p>
              <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-forest-700" /> {profile.email}</p>
              {profile.website && <p className="flex items-center gap-3"><Globe className="h-4 w-4 text-forest-700" /> {profile.website}</p>}
              <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-forest-700" /> {profile.address} - {profile.pincode}</p>
              <button onClick={() => setMessageComposerOpen((isOpen) => !isOpen)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 py-2.5 text-xs font-bold text-white">
                <MessageSquare className="h-4 w-4" /> Send Message
              </button>
              {messageComposerOpen && (
                <form onSubmit={sendDirectMessage} className="mt-3 space-y-2 rounded-xl border border-forest-100 bg-cream/40 p-3">
                  <textarea
                    value={messageBody}
                    onChange={(event) => setMessageBody(event.target.value)}
                    placeholder={`Message ${profile.company_name || profile.name}`}
                    className="min-h-24 w-full rounded-xl border border-forest-100 bg-white px-3 py-2 text-sm outline-none focus:border-forest-400"
                  />
                  <button disabled={messageSending} className="w-full rounded-xl bg-forest-700 py-2 text-xs font-bold text-white disabled:opacity-60">
                    {messageSending ? 'Sending...' : 'Send'}
                  </button>
                  {messageStatus && <p className="text-xs font-semibold text-graphite/60">{messageStatus}</p>}
                </form>
              )}
            </div>
          </InfoCard>
        </section>

        <nav className="dash-scroll sticky top-16 z-20 flex gap-1 overflow-x-auto rounded-2xl border border-forest-100 bg-white px-2 shadow-card">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 border-b-2 px-5 py-3 text-sm font-bold capitalize ${activeTab === tab ? 'border-forest-700 text-forest-800' : 'border-transparent text-graphite/55'}`}>
              {tab}
            </button>
          ))}
        </nav>

        {renderTabContent()}
      </main>
    </div>
  )
}
