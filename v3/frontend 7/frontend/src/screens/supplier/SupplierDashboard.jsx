import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FileText, Globe, Mail, MapPin, MessageSquare, Package, Phone, Search, Truck, UserRound } from 'lucide-react'
import MessageThread from '../../components/dashboard/MessageThread.jsx'
import ProfileImageUpload from '../../components/common/ProfileImageUpload.jsx'
import RequestsPanel from '../../components/dashboard/RequestsPanel.jsx'
import ProductForm from '../../components/supplier/ProductForm.jsx'
import { Card, EmptyState, Hero, NavBar, StatCards, Topbar } from '../../dashboard/RoleDashboardUi.jsx'
import { SmartImage } from '../../lib/ui.jsx'
import { imageUrl } from '../../services/apiClient.js'
import { completeUserProfile, updateBusinessLogo, updateUserProfileImage } from '../../services/authService.js'
import { uploadLocalFile } from '../../services/uploadService.js'
import { setAuthenticatedUser } from '../../redux/authSlice.js'
import { acceptProjectRequest, deleteSupplierProduct, fetchConversations, fetchIncomingRequests, fetchNotifications, fetchSupplierClients, fetchSupplierProducts, fetchSupplierProfile, markModuleNotificationsRead, rejectProjectRequest, sendProjectRequest } from '../../services/gharService.js'

const baseNav = [
  { id: 'requests', label: 'Requests' },
  { id: 'findClients', label: 'Find Clients' },
  { id: 'products', label: 'Products' },
  { id: 'messages', label: 'Messages' },
  { id: 'profile', label: 'Profile' },
]

const defaultProjectImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'
const defaultStoreImage = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=80'
const supplierDocumentTypes = [
  'Shop License',
  'GST Certificate',
  'PAN Card',
  'Trade License',
  'Material Quality Certificate',
  'Insurance Certificate',
]

const splitEditableList = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean)

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

function SupplierProfilePanel({ profile, errorMessage, uploadMessage, onProfileImageUpload, onStoreLogoUpload, onSaveProfile }) {
  const [activeProfileTab, setActiveProfileTab] = useState('overview')
  const [editDetails, setEditDetails] = useState({})
  useEffect(() => {
    if (!profile) return
    setEditDetails({
      name: profile.name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      pincode: profile.pincode || '',
      store_name: profile.store_name || '',
      about: profile.about || '',
      gstin: profile.gstin || '',
      pan: profile.pan || '',
      website: profile.website || '',
      business_type: profile.business_type || '',
      registration_year: profile.registration_year || '',
      categories: (profile.categories || []).join(', '),
      service_locations: (profile.delivery_locations || []).join(', '),
      documents: (profile.documents || []).join(', '),
      gallery: (profile.gallery || []).join(', '),
    })
  }, [profile])
  if (errorMessage) {
    return <Card title="Supplier Profile" icon={UserRound}><EmptyState title="Profile not loaded" message={errorMessage} /></Card>
  }
  if (!profile) {
    return <Card title="Supplier Profile" icon={UserRound}><EmptyState title="Loading profile" message="Fetching your completed supplier profile details." /></Card>
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
      <Card title="Supplier Profile" icon={UserRound}>
        {uploadMessage && <p className="mb-3 text-xs font-semibold text-forest-700">{uploadMessage}</p>}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="flex justify-center lg:block">
            <SmartImage
              src={profile.profile_image_url ? imageUrl(profile.profile_image_url) : defaultStoreImage}
              alt={profile.store_name}
              className="h-40 w-40 rounded-2xl object-cover"
            />
          </div>
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-graphite">{profile.store_name}</h2>
                <p className="mt-1 text-sm font-semibold text-graphite/60">{profile.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-graphite/70">{profile.about || 'About store not added.'}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${profile.profile_complete ? 'bg-forest-50 text-forest-700' : 'bg-warm/10 text-warm'}`}>
                {profile.profile_complete ? 'Profile Complete' : 'Profile Incomplete'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <DetailItem label="Store" value={profile.store_name} />
              <DetailItem label="Categories" value={profile.categories?.length || 0} />
              <DetailItem label="Rating" value={profile.rating} />
            </div>
          </div>
        </div>
      </Card>

      <ProfileTabNav items={profileTabs} activeId={activeProfileTab} onChange={setActiveProfileTab} />

      {activeProfileTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card title="About Store" icon={UserRound}>
            <p className="text-sm leading-relaxed text-graphite/70">{profile.about || 'About store not added.'}</p>
          </Card>
          <Card title="Quick Stats" icon={Package}>
            <div className="grid grid-cols-1 gap-3">
              <DetailItem label="Product Categories" value={profile.categories?.length || 0} />
              <DetailItem label="Delivery Locations" value={profile.delivery_locations?.length || 0} />
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
            <Card title="Business Information" icon={Package}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <input value={editDetails.store_name || ''} onChange={(event) => updateEditField('store_name', event.target.value)} placeholder="Store name" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input value={editDetails.gstin || ''} onChange={(event) => updateEditField('gstin', event.target.value)} placeholder="GSTIN" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input value={editDetails.pan || ''} onChange={(event) => updateEditField('pan', event.target.value)} placeholder="PAN" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input value={editDetails.website || ''} onChange={(event) => updateEditField('website', event.target.value)} placeholder="Website" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input value={editDetails.business_type || ''} onChange={(event) => updateEditField('business_type', event.target.value)} placeholder="Business type" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <input type="number" value={editDetails.registration_year || ''} onChange={(event) => updateEditField('registration_year', event.target.value)} placeholder="Registration year" className="h-10 rounded-xl border border-forest-100 px-3 text-sm" />
                <textarea value={editDetails.about || ''} onChange={(event) => updateEditField('about', event.target.value)} placeholder="About store" className="min-h-24 rounded-xl border border-forest-100 px-3 py-2 text-sm md:col-span-2 xl:col-span-3" />
              </div>
            </Card>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <Card title="Product Categories" icon={Package}>
                <div className="flex flex-wrap gap-2">
                  <textarea value={editDetails.categories || ''} onChange={(event) => updateEditField('categories', event.target.value)} placeholder="Categories, comma separated" className="min-h-24 w-full rounded-xl border border-forest-100 px-3 py-2 text-sm" />
                </div>
              </Card>
              <Card title="Delivery Locations" icon={MapPin}>
                <div className="flex flex-wrap gap-2">
                  <textarea value={editDetails.service_locations || ''} onChange={(event) => updateEditField('service_locations', event.target.value)} placeholder="Delivery locations, comma separated" className="min-h-24 w-full rounded-xl border border-forest-100 px-3 py-2 text-sm" />
                </div>
              </Card>
            </div>
            <button className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-bold text-white">Save Business Information</button>
          </div>
        </form>
      )}

      {activeProfileTab === 'documents' && (
        <Card title="Documents" icon={FileText}>
          <p className="mb-3 text-sm font-semibold text-graphite/45">Upload Shop License, GST, PAN, Trade License, Quality and Insurance certificates if available.</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {supplierDocumentTypes.map((documentType) => (
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
            {!galleryImages.length && <EmptyState title="No gallery images" message="Uploaded store/product images appear here." />}
          </div>
          <button onClick={saveProfileChanges} className="mt-4 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-bold text-white">Save Gallery</button>
        </Card>
      )}

      {activeProfileTab === 'media' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <ProfileImageUpload imageSource={profile.profile_image_url} title="Store Image" note="Upload a clear store or supplier profile image." onUpload={onProfileImageUpload} />
            <ProfileImageUpload imageSource={profile.store_logo_url} title="Store Logo" note="Update your store logo." onUpload={onStoreLogoUpload} />
          </div>
          <Card title="Media Guidelines" icon={UserRound}>
            <p className="text-sm leading-relaxed text-graphite/65">
              Keep one clear store image and one store logo. Business, documents and gallery content are managed in their own tabs.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function SupplierDashboard() {
  const { user, accessToken, refreshToken } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [activeId, setActiveId] = useState('requests')
  const [requestList, setRequestList] = useState([])
  const [clientList, setClientList] = useState([])
  const [productList, setProductList] = useState([])
  const [requestMessage, setRequestMessage] = useState('')
  const [sendingReceiverId, setSendingReceiverId] = useState(null)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [notificationBadgeCounts, setNotificationBadgeCounts] = useState({})
  const [supplierProfileDetails, setSupplierProfileDetails] = useState(null)
  const [supplierProfileError, setSupplierProfileError] = useState('')
  const [profileImageMessage, setProfileImageMessage] = useState('')
  const userShell = useMemo(() => ({
    name: user?.name || 'Supplier',
    initials: (user?.name || 'S').slice(0, 2).toUpperCase(),
    profileImageUrl: user?.profile_image_url || '',
  }), [user])

  const refreshSupplierData = () => {
    fetchIncomingRequests().then(setRequestList).catch(() => setRequestList([]))
    fetchSupplierProducts().then(setProductList).catch(() => setProductList([]))
    fetchSupplierClients().then(setClientList).catch(() => setClientList([]))
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
            project: 'findClients',
            contractor: 'findClients',
            supplier: 'findClients',
            estimate: 'findClients',
            escrow: 'findClients',
            general: 'profile',
          }
          const tabId = moduleTabMap[notification.module]
          if (tabId) nextBadgeCounts[tabId] = (nextBadgeCounts[tabId] || 0) + 1
        })
        setNotificationBadgeCounts(nextBadgeCounts)
      })
      .catch(() => setNotificationBadgeCounts({}))
  }

  useEffect(refreshSupplierData, [])
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
    if (activeId !== 'profile' || !user?.id) return
    setSupplierProfileError('')
    fetchSupplierProfile(user.id)
      .then(setSupplierProfileDetails)
      .catch((error) => setSupplierProfileError(error.response?.data?.detail || 'Unable to load supplier profile details.'))
  }, [activeId, user?.id])

  const sendSupplierClientRequest = async (client) => {
    setRequestMessage('')
    setSendingReceiverId(client.user_id)
    try {
      await sendProjectRequest({
        receiver_id: client.user_id,
        project_id: client.project_id,
        request_type: `SUPPLIER_TO_${client.type}`,
      })
      setRequestMessage(`Request sent to ${client.name}.`)
      refreshSupplierData()
    } catch (error) {
      setRequestMessage(error.response?.data?.detail || 'Unable to send request.')
    } finally {
      setSendingReceiverId(null)
    }
  }

  const uploadSupplierProfileImage = async (file) => {
    if (!file) return
    setProfileImageMessage('Uploading profile image...')
    const uploadedFile = await uploadLocalFile(file)
    const updatedUser = await updateUserProfileImage(uploadedFile.url)
    dispatch(setAuthenticatedUser({ accessToken, refreshToken, user: updatedUser }))
    setSupplierProfileDetails((currentProfileDetails) => currentProfileDetails ? { ...currentProfileDetails, profile_image_url: uploadedFile.url } : currentProfileDetails)
    setProfileImageMessage('Profile image updated.')
  }

  const uploadSupplierStoreLogo = async (file) => {
    if (!file) return
    setProfileImageMessage('Uploading store logo...')
    const uploadedFile = await uploadLocalFile(file)
    const updatedProfile = await updateBusinessLogo(uploadedFile.url)
    setSupplierProfileDetails(updatedProfile)
    setProfileImageMessage('Store logo updated.')
  }

  const saveSupplierProfileChanges = async (profileUpdates) => {
    setProfileImageMessage('Saving profile changes...')
    const updatedUser = await completeUserProfile({
      ...profileUpdates,
      profile_image_url: supplierProfileDetails?.profile_image_url || '',
      store_logo_url: supplierProfileDetails?.store_logo_url || '',
      registration_year: profileUpdates.registration_year === '' ? null : Number(profileUpdates.registration_year),
    })
    dispatch(setAuthenticatedUser({ accessToken, refreshToken, user: updatedUser }))
    const refreshedProfile = await fetchSupplierProfile(user.id)
    setSupplierProfileDetails(refreshedProfile)
    setProfileImageMessage('Profile changes saved.')
  }

  const selectDashboardSection = (sectionId) => {
    setActiveId(sectionId)
    const tabNotificationModules = {
      requests: ['request'],
      findClients: ['project', 'contractor', 'supplier', 'estimate', 'escrow'],
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
    <div className="min-h-screen bg-cream">
      <Topbar user={userShell} roleLabel="Supplier" />
      <main className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6">
        <Hero
          title={`Welcome${user?.name ? `, ${user.name}` : ''}!`}
          description="Manage owner and contractor requests, find nearby clients, maintain product inventory, and handle conversations from one supplier dashboard."
          actionLabel="Manage Products"
          onAction={() => selectDashboardSection('products')}
          user={userShell}
        />
        <NavBar items={nav} activeId={activeId} onNav={selectDashboardSection} />
        <StatCards items={[
          { label: 'Requests', value: requestList.length, icon: FileText, note: 'Incoming' },
          { label: 'Clients', value: clientList.length, icon: Search, note: 'Nearby' },
          { label: 'Products', value: productList.length, icon: Package, note: 'Inventory' },
          { label: 'Categories', value: new Set(productList.map((product) => product.category)).size, icon: Truck, note: 'Active' },
          { label: 'Messages', value: 'MVP', icon: MessageSquare, note: 'Polling' },
        ]} />

        {activeId === 'requests' && (
          <RequestsPanel
            title="Supplier Requests"
            subtitle="Requests from owners and contractors near you."
            requestList={requestList}
            onAccept={async (requestId) => { await acceptProjectRequest(requestId); refreshSupplierData() }}
            onReject={async (requestId) => { await rejectProjectRequest(requestId); refreshSupplierData() }}
          />
        )}

        {activeId === 'findClients' && (
          <Card title="Nearby Clients" icon={Search}>
            {requestMessage && (
              <div className="mb-3 rounded-xl border border-forest-100 bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800">
                {requestMessage}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {clientList.map((client) => (
                <article key={`${client.type}-${client.user_id}-${client.project_id || 'profile'}`} className="overflow-hidden rounded-xl border border-forest-100 bg-white">
                  {client.project_title && (
                    <SmartImage
                      src={client.project_image_url ? imageUrl(client.project_image_url) : defaultProjectImage}
                      alt={client.project_title}
                      className="h-36 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <p className="font-display font-bold">{client.name}</p>
                    <p className="text-xs text-graphite/55">{client.type} - {client.pincode}</p>
                    {client.project_title && <p className="mt-1 text-xs font-semibold text-forest-700">{client.project_title}</p>}
                    <button
                      disabled={sendingReceiverId === client.user_id}
                      onClick={() => sendSupplierClientRequest(client)}
                      className="mt-4 w-full rounded-xl bg-forest-700 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sendingReceiverId === client.user_id ? 'Sending...' : 'Send request'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!clientList.length && <EmptyState title="No nearby clients" message="Self-construction owners and contractors with matching pincode appear here." />}
          </Card>
        )}

        {activeId === 'products' && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
            <ProductForm onProductSaved={refreshSupplierData} />
            <Card title="Inventory" icon={Package}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {productList.map((product) => (
                  <article key={product.id} className="rounded-xl border border-forest-100 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-display font-bold">{product.name}</p>
                        <p className="text-xs text-graphite/55">{product.category} - {product.quantity} {product.unit}</p>
                      </div>
                      <button onClick={async () => { await deleteSupplierProduct(product.id); refreshSupplierData() }} className="text-xs font-bold text-warm">Delete</button>
                    </div>
                    <p className="mt-3 text-sm font-bold">₹{Number(product.price || 0).toLocaleString('en-IN')} / {product.unit}</p>
                  </article>
                ))}
              </div>
              {!productList.length && <EmptyState title="No products" message="Add cement, steel, sand, bricks, tiles, paint, electrical, and plumbing items." />}
            </Card>
          </div>
        )}

        {activeId === 'messages' && <MessageThread />}
        {activeId === 'profile' && (
          <SupplierProfilePanel
            profile={supplierProfileDetails}
            errorMessage={supplierProfileError}
            uploadMessage={profileImageMessage}
            onProfileImageUpload={(file) => uploadSupplierProfileImage(file).catch((error) => setProfileImageMessage(error.response?.data?.detail || 'Profile image upload failed.'))}
            onStoreLogoUpload={(file) => uploadSupplierStoreLogo(file).catch((error) => setProfileImageMessage(error.response?.data?.detail || 'Store logo upload failed.'))}
            onSaveProfile={(profileUpdates) => saveSupplierProfileChanges(profileUpdates).catch((error) => setProfileImageMessage(error.response?.data?.detail || 'Unable to save profile.'))}
          />
        )}
      </main>
    </div>
  )
}
