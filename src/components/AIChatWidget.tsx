import { useState, useRef, useEffect } from 'react'
import { aiApi } from '../api/ai'
import { Send, Bot, User, Sparkles, HelpCircle, X, MessageSquare, Minimize2, AlertTriangle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface Message { role: 'user' | 'ai'; content: string }

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const SESSION_ID = generateId()

const MEDICAL_DISCLAIMERS = {
  bm: '⚠️ Peringatan Kesihatan: Produk Asian Mum adalah makanan kesihatan tambahan (functional food) & bukan ubat. Sila rujuk doktor atau pakar perubatan bertauliah untuk sebarang diagnosis atau nasihat perubatan.',
  en: '⚠️ Medical Disclaimer: Asian Mum products are functional food supplements and NOT medicine. Please consult a qualified medical doctor for any illness, diagnosis, or prescription.',
  cn: '⚠️ 医疗免责声明：Asian Mum 全线产品为天然功能性膳食营养饮，非医疗药品。如有任何病症或身体不适，请务必咨询专业执业医师。',
}

function getFallbackReply(query: string, lang: 'bm' | 'en' | 'cn'): string {
  const q = query.toLowerCase()

  // 1. Unrelated topics filter (coding, politics, gaming, general homework)
  const isUnrelated =
    q.includes('python') || q.includes('javascript') || q.includes('code') || q.includes('program') ||
    q.includes('politik') || q.includes('kerajaan') || q.includes('politician') || q.includes('politics') ||
    q.includes('homework') || q.includes('kerja sekolah') || q.includes('matematik') || q.includes('math') ||
    q.includes('cuaca') || q.includes('weather') || q.includes('bitcoin') || q.includes('crypto')

  if (isUnrelated) {
    if (lang === 'cn') {
      return '抱歉，我是 Asian Mum 官方 AI 营养健康顾问，仅专注于解答关于 Asian Mum 健康食品（益生元紫薯饮、牛油果辣木、Beaufica 蔓越莓）及创业合伙人计划的相关问题。有关其他非相关话题，我无法提供协助。'
    }
    if (lang === 'en') {
      return 'I am the official Asian Mum AI Nutri-Advisor. I can only assist with questions regarding Asian Mum health foods (Prebiotic Purple Sweet Potato, Avocado Moringa, Beaufica Cranberry) and our Entrepreneur Program. I cannot answer unrelated topics.'
    }
    return 'Maaf, saya adalah pembantu AI Nutri-Advisor rasmi Asian Mum dan hanya boleh menjawab soalan berkaitan makanan kesihatan Asian Mum (Prebiotik Ubi Ungu, Avokado Moringa, Beaufica Kranberi) dan program usahawan kami. Saya tidak dapat membantu topik di luar skop ini.'
  }

  // 2. Severe medical conditions guardrail
  const isSevereMedical =
    q.includes('kanser') || q.includes('cancer') || q.includes('癌症') ||
    q.includes('buah pinggang') || q.includes('kidney') || q.includes('肾病') ||
    q.includes('jantung') || q.includes('heart attack') || q.includes('心脏病') ||
    q.includes('diabetes kronik') || q.includes('strok') || q.includes('stroke') || q.includes('中风') ||
    q.includes('ubat hospital') || q.includes('prescription')

  if (isSevereMedical) {
    if (lang === 'cn') {
      return '⚠️ **重要医疗提醒**：针对重大慢性疾病或正在接受医院治疗的情况，Asian Mum 全系列产品仅作为日常膳食营养调理，**绝不能替代任何医生处方或药物治疗**。请务必将产品成分清单出示给您的主治医师，并在医生的专业指导下决定是否饮用。祝您早日康复！'
    }
    if (lang === 'en') {
      return '⚠️ **Important Medical Caution**: For serious medical conditions or ongoing hospital treatment, Asian Mum products are functional dietary supplements and **CANNOT replace medical diagnosis, prescriptions, or physician care**. Please consult your doctor or healthcare professional with our ingredients list before consumption.'
    }
    return '⚠️ **Peringatan Perubatan Penting**: Untuk sebarang penyakit kronik atau rawatan hospital yang sedang dijalankan, produk Asian Mum adalah makanan tambahan sahaja dan **TIDAK BOLEH menggantikan nasihat atau ubat daripada doktor**. Sila dapatkan kebenaran daripada doktor perubatan anda terlebih dahulu sebelum mengambil sebarang produk kesihatan.'
  }

  // 3. Chinese Domain Responses
  if (lang === 'cn' || /[\u4e00-\u9fa5]/.test(query)) {
    if (q.includes('便秘') || q.includes('胀气') || q.includes('肠胃') || q.includes('消化') || q.includes('益生元') || q.includes('紫薯')) {
      return '您好！针对日常肠道调理与消化健康，推荐 **Asian Mum 紫薯益生元高纤营养饮** 💜。\n\n• 每份含有 10.4g 日本紫甘薯天然益生元菊粉，温和滋养肠道益生菌。\n• 建议每日早晨空腹温水冲泡 1 包。\n\n*(注：本品为膳食营养补充品，非药品。如腹痛严重或长期排便异常，请咨询医生。)*'
    }
    if (q.includes('beaufica') || q.includes('蔓越莓') || q.includes('卡琪花蒂玛') || q.includes('妇科') || q.includes('泌尿') || q.includes('女性') || q.includes('内分泌')) {
      return '🌸 **Asian Mum Beaufica 蔓越莓卡琪花蒂玛植物饮** 是专为女性日常内调研制的草本精萃饮。\n\n• 纯正卡琪花蒂玛萃取，温和调理女性内分泌活力\n• 野生蔓越莓与红石榴多酚抗氧，呵护泌尿私密健康\n• 独立便携条装，建议每日餐后 1 条。\n\n*(注：草本植物饮非药品，不能替代妇科药物；备孕或孕期请遵循医嘱。)*'
    }
    if (q.includes('孕妇') || q.includes('产后') || q.includes('小孩') || q.includes('坐月子') || q.includes('备孕')) {
      return 'Asian Mum 的益生元系列（紫薯、牛油果辣木及浓黑可可燕麦）均为 **100% 纯植物基、零蔗糖添加、无乳糖配方**，适合全家及哺乳期妈妈日常补纤。\n\n对于 Beaufica 卡琪花蒂玛等传统草本产品，建议在产后坐月子期间或哺乳平稳后开始饮用。如有特殊体质，建议先向产检医生咨询。'
    }
    if (q.includes('代理') || q.includes('创业') || q.includes('佣金') || q.includes('分销') || q.includes('mlm') || q.includes('批发')) {
      return '👑 **Asian Mum 亚洲妈妈社群创业计划**：\n1. 零售与批发差价：30% - 40% 丰厚利润\n2. 三级团队佣金分红：第1层 5%, 第2层 3%, 第3层 1%\n3. BV/PV 积分即时结算至数字钱包。\n\n您可以点击导航栏“注册”申请成为创业合伙人！'
    }
    return '感谢您的咨询！Asian Mum 全系列健康食品坚持 100% 植物基、富含高纤益生元与清真 Halal 认证。欢迎向我提问有关紫薯、牛油果辣木、Beaufica 蔓越莓或创业合作的问题！\n\n*(免责声明：产品为营养食品而非药品，医疗问题请遵医嘱。)*'
  }

  // 4. English Domain Responses
  if (lang === 'en') {
    if (q.includes('bloat') || q.includes('constipat') || q.includes('gut') || q.includes('digest') || q.includes('fibre') || q.includes('sweet potato')) {
      return 'Hello! For daily digestive comfort and gut wellness, we recommend **Asian Mum Purple Sweet Potato Prebiotic** 💜.\n\n• Formulated with 10.4g natural inulin prebiotic fibre from Japanese purple yam.\n• Mix 1 sachet with warm water every morning before breakfast.\n\n*(Disclaimer: This is a dietary food supplement, not medicine. If digestive symptoms persist, please consult a doctor.)*'
    }
    if (q.includes('beaufica') || q.includes('cranberry') || q.includes('kacip fatimah') || q.includes('uti') || q.includes('women') || q.includes('period') || q.includes('skin')) {
      return '🌸 **Asian Mum Beaufica Cranberry & Kacip Fatimah** is an artisan botanical elixir for women\'s wellness.\n\n• Pure Kacip Fatimah extract helps support natural female vitality\n• Wild cranberry powder & pomegranates protect urinary tract (UTI) wellness\n• Convenient ready-to-drink sachet, take 1 daily after meals.\n\n*(Disclaimer: Botanical supplements are not intended to cure clinical conditions. Seek doctor\'s advice if pregnant.)*'
    }
    if (q.includes('pregnant') || q.includes('postpartum') || q.includes('lactat') || q.includes('breastfeed') || q.includes('kids')) {
      return 'All Asian Mum prebiotic beverages (Purple Sweet Potato, Avocado Moringa & Cocoa Oat) are **100% plant-based, lactose-free, and contain zero added sugar**, suitable for general wellness. For herbal botanical formulations like Beaufica Kacip Fatimah, we recommend starting during postpartum recovery. Always consult your obstetrician for clinical advice.'
    }
    if (q.includes('mlm') || q.includes('business') || q.includes('commission') || q.includes('wholesale') || q.includes('dealer') || q.includes('earn')) {
      return '👑 **Asian Mum Entrepreneur Program** features 3 key income channels:\n1. 30% - 40% Wholesale margin\n2. 3-Tier Network Override (5% Level 1, 3% Level 2, 1% Level 3)\n3. Monthly BV/PV points credited straight to your digital wallet.\n\nYou can click "Register" to join our entrepreneur network today!'
    }
    return 'Thank you for contacting Asian Mum! We specialize in 100% plant-based, prebiotic fibre nutrition and Halal-certified wellness. Please ask about our products or business model!\n\n*(Medical Disclaimer: Asian Mum products are food supplements, not medicine. Seek medical advice for health ailments.)*'
  }

  // 5. Default Malay (BM) Responses
  if (q.includes('kembung') || q.includes('sembelit') || q.includes('usus') || q.includes('pencernaan') || q.includes('serat')) {
    return 'Salam sejahtera! Untuk penjagaan usus harian dan melancarkan pencernaan, kami mengesyorkan **Asian Mum Prebiotik Ubi Ungu (Purple Sweet Potato)** 💜.\n\n• Dirumus dengan 10.4g serat inulin semulajadi dari ubi keledek ungu Jepun.\n• Amalkan 1 paket dibancuh air suam setiap pagi sebelum sarapan.\n\n*(Peringatan: Produk ini adalah makanan kesihatan tambahan & bukan ubat. Sila rujuk doktor jika masalah sembelit berlarutan.)*'
  }
  if (q.includes('beaufica') || q.includes('wanita') || q.includes('kacip fatimah') || q.includes('uti') || q.includes('period') || q.includes('kulit')) {
    return '🌸 **Asian Mum Beaufica Kranberi & Kacip Fatimah** adalah formulasi botani khas untuk wanita.\n\n• Ekstrak Kacip Fatimah tulen untuk tenaga & keseimbangan dalaman wanita\n• Serbuk kranberi liar dan delima kaya antioksidan untuk saluran kencing (UTI) & keserian kulit\n• Ambil 1 sachet sehari selepas makan.\n\n*(Peringatan: Produk herba botani bukan ubat preskripsi. Rujuk doktor jika hamil.)*'
  }
  if (q.includes('ibu') || q.includes('mengandung') || q.includes('pantang') || q.includes('bersalin') || q.includes('anak')) {
    return 'Rangkaian prebiotik Asian Mum (Ubi Ungu, Avokado Moringa & Koko Oat) adalah **100% berasaskan tumbuhan, bebas laktosa & tanpa gula tambahan**, selamat untuk seisi keluarga. Untuk herba botani seperti Beaufica Kacip Fatimah, disyorkan mula diamalkan semasa waktu berpantang. Sila rujuk doktor jika mempunyai sebarang alahan atau nasihat perubatan khas.'
  }
  if (q.includes('mlm') || q.includes('usahawan') || q.includes('komisen') || q.includes('borong') || q.includes('daftar') || q.includes('duit')) {
    return '👑 **Program Usahawan Asian Mum** menawarkan 3 ganjaran utama:\n1. Keuntungan Borong: 30% - 40% (Harga borong serendah RM 42)\n2. Komisen Rangkaian 3 Peringkat: 5% Level 1, 3% Level 2, 1% Level 3\n3. Mata BV/PV bulanan ke Dompet Digital.\n\nAnda boleh klik butang "Daftar" di atas untuk mendaftar sebagai rakan niaga hari ini!'
  }
  return 'Terima kasih atas pertanyaan anda! Makanan kesihatan Asian Mum mengutamakan 100% bahan botani semulajadi, prebiotik inulin, dan pensijilan Halal.\n\n*(Peringatan Kesihatan: Produk Asian Mum adalah makanan kesihatan tambahan dan BUKAN ubat perubatan. Sila rujuk doktor untuk sebarang rawatan penyakit.)*'
}

export function AIChatWidget({ isOpen, onClose, onOpen }: { isOpen?: boolean; onClose?: () => void; onOpen?: () => void }) {
  const { lang, t } = useLanguage()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  
  const open = isOpen !== undefined ? isOpen : internalOpen
  const setOpen = (val: boolean) => {
    if (val) onOpen?.()
    else onClose?.()
    setInternalOpen(val)
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: t.aiChat.greeting,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [rateLimitWarning, setRateLimitWarning] = useState(false)
  const lastRequestTimes = useRef<number[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  // Sync greeting when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'ai') {
        return [{ role: 'ai', content: t.aiChat.greeting }]
      }
      return prev
    })
  }, [lang, t.aiChat.greeting])

  useEffect(() => {
    if (open && !isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, isMinimized])

  async function sendMessage(textToSend?: string) {
    const msg = (textToSend || input).trim()
    if (!msg || loading) return

    // Client-side rate limiter: max 8 messages per 60s
    const now = Date.now()
    lastRequestTimes.current = lastRequestTimes.current.filter(t => now - t < 60000)
    if (lastRequestTimes.current.length >= 8) {
      setRateLimitWarning(true)
      setTimeout(() => setRateLimitWarning(false), 5000)
      return
    }
    lastRequestTimes.current.push(now)

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await aiApi.customerChat(msg, SESSION_ID)
      if (res?.reply) {
        setMessages((prev) => [...prev, { role: 'ai', content: res.reply }])
      } else {
        const fallback = getFallbackReply(msg, lang)
        setMessages((prev) => [...prev, { role: 'ai', content: fallback }])
      }
    } catch {
      const fallback = getFallbackReply(msg, lang)
      setMessages((prev) => [...prev, { role: 'ai', content: fallback }])
    } finally {
      setLoading(false)
    }
  }

  const medicalDisclaimer = MEDICAL_DISCLAIMERS[lang] || MEDICAL_DISCLAIMERS.bm

  return (
    <>
      {/* ── Floating Launcher Trigger Button ──────────────────────────────── */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setIsMinimized(false) }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-emerald-950/40 cursor-pointer animate-bounce-short"
          style={{ background: 'linear-gradient(135deg, #2F4C2C, #4E7749)', border: '2px solid rgba(197, 150, 59, 0.4)' }}
          aria-label="Open AI Nutri-Advisor"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-black tracking-wide pr-1">AI Nutri-Advisor</span>
        </button>
      )}

      {/* ── Floating Chat Popup Modal ─────────────────────────────────────── */}
      {open && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-14 rounded-2xl shadow-xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl shadow-2xl'
          } flex flex-col bg-white border border-emerald-900/15 overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95`}
        >
          
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3.5 text-white select-none shrink-0"
            style={{ background: 'linear-gradient(135deg, #2F4C2C, #3A5D36)' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black leading-none truncate text-white">AI Nutri-Advisor Asian Mum</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-200 font-semibold mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {t.aiChat.activeStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-100 hover:bg-white/10 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <MessageSquare className="h-4 w-4" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-100 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body (Messages & Prompts) */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 bg-emerald-50/20">
              
              {/* Medical Notice Banner */}
              <div className="bg-amber-50 border-b border-amber-200/80 px-3.5 py-2 text-[10px] text-amber-900 flex items-start gap-1.5 leading-snug shrink-0">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{medicalDisclaimer}</span>
              </div>

              {/* Rate limit warning banner */}
              {rateLimitWarning && (
                <div className="bg-rose-50 border-b border-rose-200 px-3.5 py-1.5 text-[10px] text-rose-800 font-bold flex items-center gap-1.5 shrink-0 animate-pulse">
                  <span>⚠️ Had pertanyaan dicapai (Maksimum 8 soalan seminit). Sila tunggu sebentar.</span>
                </div>
              )}

              {/* Messages scroll area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5 text-emerald-800">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-emerald-800 text-white rounded-br-none font-medium shadow-xs'
                          : 'bg-white text-gray-800 border border-emerald-900/10 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5 text-amber-900 font-bold text-[10px]">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2.5 items-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="px-3.5 py-2 rounded-2xl bg-white border border-emerald-900/10 text-xs text-gray-600 flex items-center gap-2 shadow-2xs">
                      <span>{t.aiChat.thinking}</span>
                      <span className="inline-flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-2 border-t border-emerald-900/5 bg-white/80 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {t.aiChat.quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="shrink-0 text-[10px] font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="h-2.5 w-2.5 text-emerald-600" /> {prompt.slice(0, 32)}…
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-emerald-900/10 shrink-0 flex gap-2">
                <input
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl text-gray-900 placeholder-gray-400 outline-none bg-gray-50 border border-gray-200 focus:border-emerald-700 focus:bg-white transition-all"
                  placeholder={t.aiChat.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="btn-primary px-3.5 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}
    </>
  )
}
