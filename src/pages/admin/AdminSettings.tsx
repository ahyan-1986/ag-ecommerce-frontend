import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useMutation } from '@tanstack/react-query'
import { usersApi } from '../../api/users'
import { CheckCircle } from 'lucide-react'

const ROSE = '#3A5D36'; const PINK = '#C5963B';


export default function AdminSettings() {
  const { user } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [success, setSuccess] = useState(false)

  const update = useMutation({
    mutationFn: () => usersApi.updateProfile({ firstName, lastName }),
    onSuccess: () => { setSuccess(true); setTimeout(() => setSuccess(false), 3000) },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">Settings</h1>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
        <p className="text-xs font-bold tracking-widest uppercase text-gray-600 mb-5">Profile</p>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">First Name</label>
            <input className="dark-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Last Name</label>
            <input className="dark-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" /> Profile updated!
            </div>
          )}
          <button disabled={update.isPending} onClick={() => update.mutate()}
            className="px-5 py-2.5 rounded-xl text-sm font-black text-black disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            {update.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
