export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GateKeep</h1>
          <p className="text-gray-500 mt-1 text-sm">Every seat accounted for. Every event under control.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
