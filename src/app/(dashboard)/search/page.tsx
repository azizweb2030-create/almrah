'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    const j = await res.json()
    setResults(j.data)
    setLoading(false)
  }, [])

  const totalResults = results ? (
    (results.births?.length||0) + (results.babies?.length||0) +
    (results.rams?.length||0) + (results.deaths?.length||0) + (results.vet?.length||0)
  ) : 0

  return (
    <div className="space-y-4">
      <h1 className="page-title">🔍 البحث الموحد</h1>
      <div className="relative">
        <input
          className="input pr-10"
          placeholder="ابحث برقم الحيوان..."
          value={query}
          onChange={e => { setQuery(e.target.value); search(e.target.value) }}
          autoFocus
        />
        {loading && <span className="absolute left-3 top-3 text-gray-400 text-sm">⏳</span>}
      </div>

      {query.length >= 2 && results && (
        <div className="space-y-4">
          {totalResults === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gray-400">لا نتائج لـ "{query}"</p>
            </div>
          ) : (
            <>
              {/* مواليد */}
              {(results.babies||[]).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">🍼 مواليد ({results.babies.length})</p>
                  <div className="space-y-1.5">
                    {results.babies.map((b:any) => (
                      <div key={b.id} className="card flex items-center gap-3 py-2.5">
                        <span className={b.gender==='رخل'?'text-pink-500':'text-blue-500'}>
                          {b.gender==='رخل'?'♀':'♂'}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{b.baby_id}</p>
                          <p className="text-xs text-gray-500">{b.gender} · {b.color||'—'} · {b.health}</p>
                        </div>
                        {b.stage && <span className="badge badge-green text-xs">{b.stage}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* سجلات الولادة */}
              {(results.births||[]).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">🐑 أمهات ({results.births.length})</p>
                  <div className="space-y-1.5">
                    {results.births.map((b:any) => (
                      <Link key={b.id} href={`/births/${b.id}`}>
                        <div className="card-hover flex items-center justify-between py-2.5">
                          <div>
                            <p className="font-medium text-sm">الأم: {b.mom_id} {b.mom_color&&`· ${b.mom_color}`}</p>
                            <p className="text-xs text-gray-500">{b.birth_date}</p>
                          </div>
                          <span className="text-gray-400">‹</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* فحول */}
              {(results.rams||[]).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">🐏 فحول ({results.rams.length})</p>
                  <div className="space-y-1.5">
                    {results.rams.map((r:any) => (
                      <div key={r.id} className="card flex items-center gap-3 py-2.5">
                        <span className="text-2xl">🐏</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{r.ram_id}{r.name&&` — ${r.name}`}</p>
                          <p className="text-xs text-gray-500">{r.color||'—'}</p>
                        </div>
                        <span className={r.dead?'badge-red text-xs':'badge-green text-xs'}>{r.dead?'نافق':'نشط'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* نفوق */}
              {(results.deaths||[]).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">📋 نفوق ({results.deaths.length})</p>
                  <div className="space-y-1.5">
                    {results.deaths.map((d:any) => (
                      <div key={d.id} className="card flex items-center gap-3 py-2.5">
                        <span className="text-2xl">📋</span>
                        <div>
                          <p className="font-medium text-sm">{d.animal_id} {d.color&&`· ${d.color}`}</p>
                          <p className="text-xs text-gray-500">{d.death_date} · {d.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* بيطرة */}
              {(results.vet||[]).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">🩺 بيطرة ({results.vet.length})</p>
                  <div className="space-y-1.5">
                    {results.vet.map((v:any) => (
                      <Link key={v.id} href={`/vet/isolation/${v.id}`}>
                        <div className="card-hover flex items-center justify-between py-2.5">
                          <div>
                            <p className="font-medium text-sm">{v.animal_id}</p>
                            <p className="text-xs text-gray-500">{v.disease||v.status}</p>
                          </div>
                          <span className={v.active?'badge-red text-xs':'badge-green text-xs'}>{v.active?'نشط':'مُغلق'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {query.length < 2 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500 text-sm">اكتب رقم الحيوان للبحث</p>
          <p className="text-gray-400 text-xs mt-1">يبحث في المواليد، الأمهات، الفحول، النفوق، والبيطرة</p>
        </div>
      )}
    </div>
  )
}
