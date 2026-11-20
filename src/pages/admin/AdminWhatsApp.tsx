import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { whatsappApi } from '../../api/whatsapp'
import { Send, Plus, Loader2, X } from 'lucide-react'

const ROSE = '#3A5D36'; const PINK = '#C5963B';

const card = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 } as const
const th = 'pb-3 pr-4 text-left text-xs font-bold tracking-widest uppercase text-gray-600'
const td = 'py-3 pr-4 text-sm'

export default function AdminWhatsApp() {
  const qc = useQueryClient()
  const [showBlast, setShowBlast] = useState(false)
  const { data: blasts, isLoading, isError } = useQuery({
    queryKey: ['admin', 'whatsapp', 'blasts'],
    queryFn: () => whatsappApi.listBlasts(),
  })

  const send = useMutation({
    mutationFn: (id: string) => whatsappApi.sendBlast(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'blasts'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">WhatsApp Blast</h1>
        <button onClick={() => setShowBlast(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-black"
          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
          <Plus className="h-4 w-4" /> Create Blast
        </button>
      </div>
      <div style={card}>
        <p className="text-xs font-bold tracking-widest uppercase text-gray-600 mb-5">Blast History</p>
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading blasts...
          </div>
        )}
        {isError && <div className="py-10 text-center text-red-400 text-sm">Failed to load blast history.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className={th}>Template</th>
                  <th className={th}>Recipients</th>
                  <th className={th}>Sent / Failed</th>
                  <th className={th}>Status</th>
                  <th className={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!blasts?.items?.length && (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-700 text-sm">No blasts yet</td></tr>
                )}
                {blasts?.items?.map((blast) => (
                  <tr key={blast.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className={td + ' text-white font-medium'}>{blast.templateName}</td>
                    <td className={td + ' text-gray-400'}>{blast.recipientCount}</td>
                    <td className={td + ' text-gray-400'}>
                      <span style={{ color: '#4ade80' }}>{blast.sentCount}</span> / <span style={{ color: '#f87171' }}>{blast.failedCount}</span>
                    </td>
                    <td className={td}>
                      <span style={{
                        background: blast.status === 'sent' ? 'rgba(34,197,94,0.1)' : blast.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: blast.status === 'sent' ? '#4ade80' : blast.status === 'failed' ? '#f87171' : '#fbbf24',
                        border: `1px solid ${blast.status === 'sent' ? 'rgba(34,197,94,0.2)' : blast.status === 'failed' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                        borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                      }}>{blast.status}</span>
                    </td>
                    <td className={td}>
                      {blast.status === 'pending' && (
                        <button onClick={() => send.mutate(blast.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-black"
                          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                          <Send className="h-3.5 w-3.5" /> Send
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
      {showBlast && <CreateBlastModal onClose={() => setShowBlast(false)} />}
    </div>
  )
}

function CreateBlastModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [templateName, setTemplateName] = useState('')
  const [audience, setAudience] = useState('all')
  const ROSE = '#3A5D36'; const PINK = '#C5963B';
  

  const create = useMutation({
    mutationFn: () => whatsappApi.createBlast({ templateName, audience }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'whatsapp', 'blasts'] }); onClose() },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#111', border: '1px solid rgba(233,30,140,0.18)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-white">Create WhatsApp Blast</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Template Name</label>
            <input className="dark-input" value={templateName} placeholder="WhatsApp template name" onChange={(e) => setTemplateName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Audience</label>
            <select className="dark-select" value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="all">All Customers</option>
              <option value="customers">Customers Only</option>
              <option value="dealers">Consultants Only</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
          <button disabled={create.isPending} onClick={() => create.mutate()}
            className="px-5 py-2.5 rounded-xl text-sm font-black text-black disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            {create.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
