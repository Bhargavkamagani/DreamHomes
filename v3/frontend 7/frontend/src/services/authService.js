import { apiClient } from './apiClient.js'

const demoAccounts = [
  {
    email: 'owner@gharbano.test',
    password: 'Owner@123',
    user: {
      id: 1001,
      name: 'Demo Owner',
      email: 'owner@gharbano.test',
      phone: '+91 90000 00001',
      role: 'OWNER',
      address: 'Demo Site Road, Hyderabad',
      pincode: '500001',
      rating: 4.8,
      owner_profile: {
        construction_type: 'CONTRACTOR',
        building_type: 'RESIDENTIAL',
      },
    },
  },
  {
    email: 'contractor@gharbano.test',
    password: 'Contractor@123',
    user: {
      id: 1002,
      name: 'Demo Contractor',
      email: 'contractor@gharbano.test',
      phone: '+91 90000 00002',
      role: 'CONTRACTOR',
      address: 'Builder Colony, Hyderabad',
      pincode: '500001',
      rating: 4.7,
    },
  },
  {
    email: 'supplier@gharbano.test',
    password: 'Supplier@123',
    user: {
      id: 1003,
      name: 'Demo Supplier',
      email: 'supplier@gharbano.test',
      phone: '+91 90000 00003',
      role: 'SUPPLIER',
      address: 'Material Market, Hyderabad',
      pincode: '500001',
      rating: 4.6,
    },
  },
]

function createDemoAuthResponse(user) {
  return {
    access_token: `demo-access-token-${user.role.toLowerCase()}`,
    refresh_token: `demo-refresh-token-${user.role.toLowerCase()}`,
    user,
  }
}

export async function loginUser(credentials) {
  const demoAccount = demoAccounts.find((account) => (
    account.email === credentials.email && account.password === credentials.password
  ))

  if (demoAccount) {
    return createDemoAuthResponse(demoAccount.user)
  }

  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

export async function signupUser(profileDetails) {
  const response = await apiClient.post('/auth/signup', profileDetails)
  return response.data
}

export async function completeUserProfile(profileDetails) {
  const response = await apiClient.patch('/auth/complete-profile', profileDetails)
  return response.data
}

export async function updateUserProfileImage(profileImageUrl) {
  const response = await apiClient.patch('/auth/profile-image', { profile_image_url: profileImageUrl })
  return response.data
}

export async function updateBusinessLogo(logoUrl) {
  const response = await apiClient.patch('/auth/business-logo', { logo_url: logoUrl })
  return response.data
}
