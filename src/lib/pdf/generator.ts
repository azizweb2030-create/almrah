'use client'

export async function generateFlockReport(data: {
  farmName?: string
  totalSheep: number
  totalBirths: number
  aliveBabies: number
  totalDeaths: number
  activeVet: number
  births: any[]
  bahm?: number
  rakhalWean?: number
  rakhalReady?: number
  kharafSale?: number
  breeding?: number
  activeRams?: number
}) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const today = new Date().toLocaleDateString('ar-SA')

  // Header
  doc.setFillColor(30, 90, 16)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(201, 168, 76)
  doc.setFontSize(22)
  doc.text('تقرير القطيع', 105, 16, { align: 'center' })
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.text(data.farmName || 'المراح', 105, 24, { align: 'center' })
  doc.setFontSize(10)
  doc.text(today, 105, 31, { align: 'center' })

  let y = 52

  // الإحصائيات الرئيسية
  doc.setTextColor(30, 90, 16)
  doc.setFontSize(13)
  doc.text('الإحصائيات العامة', 190, y, { align: 'right' })
  y += 8

  const mainStats = [
    { l:'إجمالي القطيع', v:data.totalSheep },
    { l:'الأمهات المنتجات', v:data.totalBirths },
    { l:'في شبك التلقيح', v:data.breeding||0 },
    { l:'الفحول النشطة', v:data.activeRams||0 },
    { l:'المواليد الأحياء', v:data.aliveBabies },
    { l:'إجمالي النفوق', v:data.totalDeaths },
    { l:'حالات بيطرية', v:data.activeVet },
  ]

  mainStats.forEach((stat, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = col === 0 ? 110 : 15
    const sy = y + (row * 22)
    doc.setFillColor(248, 244, 238)
    doc.roundedRect(x, sy, 85, 18, 3, 3, 'F')
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.text(stat.l, x + 80, sy + 7, { align: 'right' })
    doc.setTextColor(30, 90, 16)
    doc.setFontSize(15)
    doc.text(String(stat.v), x + 80, sy + 15, { align: 'right' })
  })

  y += Math.ceil(mainStats.length / 2) * 22 + 10

  // مراحل المواليد
  if ((data.bahm||0) + (data.rakhalWean||0) + (data.rakhalReady||0) + (data.kharafSale||0) > 0) {
    doc.setTextColor(30, 90, 16)
    doc.setFontSize(13)
    doc.text('تصنيف المواليد', 190, y, { align: 'right' })
    y += 8

    const stages = [
      { l:'البهم (0-3 شهر)', v:data.bahm||0, c:[59,130,246] },
      { l:'رخال مفطومة (3-7 شهر)', v:data.rakhalWean||0, c:[245,158,11] },
      { l:'رخال جاهزة للإنتاج (7+ شهر)', v:data.rakhalReady||0, c:[30,90,16] },
      { l:'خرفان جاهزة للبيع (3+ شهر)', v:data.kharafSale||0, c:[147,51,234] },
    ]

    stages.forEach((s, i) => {
      const x = i % 2 === 0 ? 110 : 15
      if (i % 2 === 0 && i > 0) y += 20
      doc.setFillColor(s.c[0], s.c[1], s.c[2])
      doc.roundedRect(x, y, 85, 16, 3, 3, 'F')
      doc.setTextColor(255,255,255)
      doc.setFontSize(9)
      doc.text(s.l, x+80, y+6, { align:'right' })
      doc.setFontSize(13)
      doc.text(String(s.v), x+80, y+13, { align:'right' })
    })
    y += 28
  }

  // جدول الولادات
  if (data.births.length > 0) {
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setTextColor(30, 90, 16)
    doc.setFontSize(13)
    doc.text('سجلات الولادة', 190, y, { align: 'right' })
    y += 8

    doc.setFillColor(30, 90, 16)
    doc.rect(15, y, 180, 8, 'F')
    doc.setTextColor(255,255,255)
    doc.setFontSize(9)
    doc.text('الشبك', 30, y+5.5, { align:'center' })
    doc.text('المواليد', 70, y+5.5, { align:'center' })
    doc.text('التاريخ', 115, y+5.5, { align:'center' })
    doc.text('رقم الأم', 175, y+5.5, { align:'center' })
    y += 8

    data.births.slice(0, 25).forEach((b:any, i) => {
      if (y > 275) { doc.addPage(); y = 20 }
      if (i%2===0) { doc.setFillColor(248,244,238); doc.rect(15,y,180,7,'F') }
      doc.setTextColor(50,50,50)
      doc.setFontSize(9)
      const alive=(b.babies||[]).filter((bb:any)=>bb.health!=='نفوق').length
      doc.text(b.in_breeding?'✓':'—', 30, y+5, { align:'center' })
      doc.text(String(alive), 70, y+5, { align:'center' })
      doc.text(b.birth_date||'—', 115, y+5, { align:'center' })
      doc.text(`${b.mom_id}${b.mom_color?' ('+b.mom_color+')':''}`, 185, y+5, { align:'right' })
      y += 7
    })
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i=1; i<=pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(30,90,16)
    doc.rect(0, 287, 210, 10, 'F')
    doc.setTextColor(255,255,255)
    doc.setFontSize(8)
    doc.text(`صفحة ${i} من ${pageCount}`, 15, 294)
    doc.text('منصة المراح - إدارة المواشي الاحترافية', 105, 294, { align:'center' })
    doc.text(today, 195, 294, { align:'right' })
  }

  doc.save(`تقرير-المراح-${new Date().toISOString().split('T')[0]}.pdf`)
}
