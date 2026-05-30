import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data, error } = await supabase
    .from('vet_isolation')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  // Map from form fields to actual DB schema
  // Form: animal_id, disease, disease_other, treatment, duration_text, start_date, severity
  // DB: animal_id, status(disease), medicine(treatment), usage_notes(disease_other+duration_text), start_date, severity, active, daily_log
  const { data, error } = await supabase
    .from('vet_isolation')
    .insert({
      user_id: user.id,
      animal_id: body.animal_id,
      status: body.disease || body.status || '',
      medicine: body.treatment || null,
      usage_notes: [body.disease_other, body.duration_text].filter(Boolean).join(' · ') || null,
      start_date: body.start_date || new Date().toISOString().split('T')[0],
      severity: body.severity || 'عادية',
      active: true,
      daily_log: [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Return with mapped fields for frontend compatibility
  return NextResponse.json({
    data: {
      ...data,
      disease: data.status,
      treatment: data.medicine,
    }
  }, { status: 201 })
}
