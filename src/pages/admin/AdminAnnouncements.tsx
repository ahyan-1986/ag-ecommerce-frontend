import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Check, X, GripVertical } from 'lucide-react'
import { announcementApi, Announcement } from '../../api/announcement'
import RichTextEditor from '../../components/RichTextEditor'

export default function AdminAnnouncements() {
  const qc = useQueryClient()
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: announcementApi.getAdmin,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement>>({})
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  const saveAnnouncement = useMutation({
    mutationFn: async () => {
      let annId = currentAnnouncement.id

      if (!annId) {
        const res = await announcementApi.create({
          ...currentAnnouncement,
          isActive: currentAnnouncement.isActive ?? true,
          priority: currentAnnouncement.priority ?? 0,
        })
        annId = res.id
      } else {
        await announcementApi.update(annId, currentAnnouncement)
      }

      if (attachmentFile && annId) {
        await announcementApi.uploadAttachment(annId, attachmentFile)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-announcements'] })
      setIsEditing(false)
      setCurrentAnnouncement({})
      setAttachmentFile(null)
    }
  })

  const toggleActive = useMutation({
    mutationFn: (ann: Announcement) => announcementApi.update(ann.id, { ...ann, isActive: !ann.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-announcements'] }),
  })

  const deleteAnnouncement = useMutation({
    mutationFn: announcementApi.deleteAnnouncement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-announcements'] }),
  })

  const openEditor = (ann?: Announcement) => {
    if (ann) {
      setCurrentAnnouncement(ann)
    } else {
      setCurrentAnnouncement({ isActive: true, priority: 0 })
    }
    setIsEditing(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Announcements</h1>
          <p className="text-sm text-gray-400 mt-1">Manage announcements shown on the member dashboard.</p>
        </div>
        <button onClick={() => openEditor()}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-semibold">
          <Plus className="h-4 w-4" /> Add Announcement
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-gray-900">
          <h2 className="text-lg font-bold text-gray-900">{currentAnnouncement.id ? 'Edit Announcement' : 'New Announcement'}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={currentAnnouncement.title || ''} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-gray-900" placeholder="e.g. System Maintenance" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <RichTextEditor
                  value={currentAnnouncement.content || ''}
                  onChange={content => setCurrentAnnouncement({ ...currentAnnouncement, content })}
                  lightMode={true}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority (Higher = Top)</label>
                <input type="number" value={currentAnnouncement.priority || 0} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-gray-900" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={currentAnnouncement.isActive ?? true} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, isActive: e.target.checked })}
                    className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
              <input type="file" onChange={e => setAttachmentFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-gray-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
              {currentAnnouncement.attachmentName && !attachmentFile && (
                <p className="text-sm text-gray-500 mt-2">Current attachment: {currentAnnouncement.attachmentName}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => { setIsEditing(false); setAttachmentFile(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button onClick={() => saveAnnouncement.mutate()} disabled={saveAnnouncement.isPending || !currentAnnouncement.title || !currentAnnouncement.content}
              className="px-6 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg disabled:opacity-50">
              {saveAnnouncement.isPending ? 'Saving...' : 'Save Announcement'}
            </button>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading announcements...</td></tr>
              ) : announcements.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No announcements found. Click Add Announcement to create one.</td></tr>
              ) : announcements.map((ann) => (
                <tr key={ann.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <GripVertical className="h-4 w-4 opacity-50 cursor-move" />
                      <span className="font-medium text-gray-900">{ann.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{ann.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleActive.mutate(ann)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        ann.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {ann.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {ann.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditor(ann)} className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => { if(confirm('Delete announcement?')) deleteAnnouncement.mutate(ann.id) }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
