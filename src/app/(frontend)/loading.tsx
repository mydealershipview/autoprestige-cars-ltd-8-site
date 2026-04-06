export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase mb-2">Loading...</h2>
        <p className="text-white/60 text-sm">Please wait while we load your content</p>
      </div>
    </div>
  )
}
