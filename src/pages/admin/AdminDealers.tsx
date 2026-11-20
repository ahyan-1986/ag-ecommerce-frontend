import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../../api/users'
import { CheckCircle, Loader2 } from 'lucide-react'

const ROSE = '#3A5D36'
const PINK  = '#C5963B'
const card = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(233,30,140,0.1)', borderRadius: 16, padding: 24 } as const
const th = 'pb-3 pr-4 text-left text-xs font-bold tracking-widest uppercase text-gray-600'
const td = 'py-3 pr-4 text-sm'

export default function AdminDealers() {
  const [page] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', 'dealer', page],
    queryFn: () => usersApi.list({ role: 'dealer', page }),
  })

  const approve = useMutation({
    mutationFn: (id: string) => usersApi.approveDealer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users', 'dealer'] }),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">Consultants</h1>
      <div style={card}>
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading consultants...
          </div>
        )}
        {isError && <div className="py-10 text-center text-red-400 text-sm">Failed to load consultants.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className={th}>Name</th>
                  <th className={th}>Email</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Status</th>
                  <th className={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.length === 0 && (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-700 text-sm">No consultants found</td></tr>
                )}
                {data?.items?.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(233,30,140,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                          {user.firstName?.[0] ?? '?'}
                        </div>
                        <span className="text-white font-medium">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className={td + ' text-gray-400'}>{user.email}</td>
                    <td className={td + ' text-gray-500'}>{user.phone || '—'}</td>
                    <td className={td}>
                      <span style={{
                        background: user.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                        color: user.isActive ? '#4ade80' : '#fbbf24',
                        border: `1px solid ${user.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                        borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                      }}>
                        {user.isActive ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className={td}>
                      {!user.isActive && (
                        <button onClick={() => approve.mutate(user.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl"
                          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})`, boxShadow: '0 4px 12px rgba(233,30,140,0.3)' }}>
                          <CheckCircle className="h-3.5 w-3.5" /> Approve Consultant
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
