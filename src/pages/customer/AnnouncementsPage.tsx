import { useQuery } from '@tanstack/react-query'
import { Megaphone, Calendar, Sparkles } from 'lucide-react'
import { announcementApi } from '../../api/announcement'

export default function AnnouncementsPage() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['member-announcements'],
    queryFn: announcementApi.getActive,
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A36]">Ascend Bulletin</p>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Announcements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Stay updated on new product drops, circle campaigns, and wellness events.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading announcements...</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-orange-200 p-10 text-center">
          <Megaphone className="w-10 h-10 text-orange-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">No active announcements right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <article
              key={a.id}
              className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-soft space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-[11px] font-extrabold">
                  <Sparkles className="w-3.5 h-3.5" /> Official Notice
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(a.createdAt).toLocaleDateString('en-MY', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">{a.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{a.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
