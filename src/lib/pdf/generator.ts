'use client'

export async function generateFlockReport(data: {
  farmName?: string
  totalSheep: number
  totalBirths: number
  aliveBabies: number
  totalDeaths: number
  activeVet: number
  births: any[]
}) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Header
  doc.setFillColor(30, 90, 16)
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.text('تقرير القطيع - المراح', 105, 15, { align: 'center' })
  doc.setFontSize(11)
  doc.text(data.farmName || 'منصة المراح', 105, 23, { align: 'center' })
  doc.text(new Date().toLocaleDateString('ar-SA'), 105, 30, { align: 'center' })

  // Stats boxes
  doc.setTextColor(30, 90, 16)
  doc.setFontSize(14)
  doc.text('الإحصائيات العامة', 170, 50, { align: 'right' })

  const stats = [
    { label: 'إجمالي القطيع', value: data.totalSheep },
    { label: 'سجلات الولادة', value: data.totalBirths },
    { label: 'المواليد الأحياء', value: data.aliveBabies },
    { label: 'إجمالي النفوق', value: data.totalDeaths },
    { label: 'حالات بيطرية نشطة', value: data.activeVet },
  ]

  let y = 60
  stats.forEach((stat, i) => {
    const x = i % 2 === 0 ? 15 : 110
    if (i % 2 === 0 && i > 0) y += 25
    doc.setFillColor(248, 244, 238)
    doc.roundedRect(x, y, 85, 20, 3, 3, 'F')
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.text(stat.label, x + 80, y + 7, { align: 'right' })
    doc.setTextColor(30, 90, 16)
    doc.setFontSize(16)
    doc.text(String(stat.value), x + 80, y + 16, { align: 'right' })
  })

  y += 45
  // Births table
  if (data.births.length > 0) {
    doc.setTextColor(30, 90, 16)
    doc.setFontSize(13)
    doc.text('آخر سجلات الولادة', 195, y, { align: 'right' })
    y += 8

    doc.setFillColor(30, 90, 16)
    doc.rect(15, y, 180, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text('الشبك', 35, y + 5.5, { align: 'center' })
    doc.text('المواليد', 75, y + 5.5, { align: 'center' })
    doc.text('التاريخ', 120, y + 5.5, { align: 'center' })
    doc.text('رقم الأم', 175, y + 5.5, { align: 'center' })
    y += 8

    data.births.slice(0, 20).forEach((b, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 244, 238)
        doc.rect(15, y, 180, 7, 'F')
      }
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(9)
      doc.text(b.in_breeding ? 'نعم' : '—', 35, y + 5, { align: 'center' })
      doc.text(String((b.babies || []).filter((bb: any) => bb.health !== 'نفوق').length), 75, y + 5, { align: 'center' })
      doc.text(b.birth_date || '—', 120, y + 5, { align: 'center' })
      doc.text(`${b.mom_id} ${b.mom_color ? `(${b.mom_color})` : ''}`, 185, y + 5, { align: 'right' })
      y += 7
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })
  }

  // Footer
  doc.setFillColor(30, 90, 16)
  doc.rect(0, 285, 210, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text('منصة المراح - إدارة المواشي الاحترافية', 105, 293, { align: 'center' })

  doc.save(`تقرير-المراح-${new Date().toISOString().split('T')[0]}.pdf`)
}
