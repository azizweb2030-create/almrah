export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-beige-primary flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-2xl font-black text-green-primary mb-2">لا يوجد اتصال</h1>
        <button onClick={()=>window.location.reload()} className="btn-primary mt-4 px-8">إعادة المحاولة</button>
      </div>
    </div>
  )
}
