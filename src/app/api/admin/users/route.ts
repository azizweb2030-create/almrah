import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// الحقول المسموح للمدير بتعديلها فقط (whitelist)
const ALLOWED_UPDATE_FIELDS = [
  'full_name',
  'phone',
  'farm_name',
  'role',
  'subscription_plan',
  'subscription_status',
  'subscription_expires_at',
  'notifications_enabled',
  'email_notifications',
  'ai_tokens_limit',
  'economy_mode',
] as const

type AllowedField = typeof ALLOWED_UPDATE_FIELDS[number]

async function getAdminSupabase() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return profile?.role === 'admin' ? supabase : null
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await getAdminSupabase()
    if (!supabase) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const q = new URL(req.url).searchParams.get('q') || ''
    let query = supabase
      .from('profiles')
      .select('id, user_id, full_name, email, phone, farm_name, role, subscription_plan, subscription_status, subscription_expires_at, ai_tokens_used, ai_tokens_limit, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await getAdminSupabase()
    if (!supabase) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const { userId, updates } = await req.json()

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'معرّف المستخدم مطلوب' }, { status: 400 })
    }

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return NextResponse.json({ error: 'بيانات التحديث غير صالحة' }, { status: 400 })
    }

    // فلترة الحقول المسموح بها فقط
    const safeUpdates: Partial<Record<AllowedField, unknown>> = {}
    for (const key of Object.keys(updates)) {
      if ((ALLOWED_UPDATE_FIELDS as readonly string[]).includes(key)) {
        safeUpdates[key as AllowedField] = updates[key]
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: 'لا توجد حقول صالحة للتحديث' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}
