import { useNavigate } from 'react-router-dom'

function Report() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-100">

      <header className="bg-blue-900 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <div>
            <h1 className="text-xl font-bold">
              Laporan
            </h1>

            <p className="text-blue-200 text-sm">
              Rekap Request & Pengiriman
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white text-blue-900 rounded-xl"
          >
            Dashboard
          </button>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-slate-500">
              Total Request
            </p>

            <p className="text-3xl font-bold text-blue-700 mt-2">
              24
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-slate-500">
              Diproses
            </p>

            <p className="text-3xl font-bold text-yellow-600 mt-2">
              6
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-slate-500">
              Selesai
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              18
            </p>
          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-xl font-bold text-slate-800 mb-5">
            Rekap Request
          </h2>

          <div className="space-y-4">

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-slate-600">
                Line 16
              </span>

              <span className="font-bold text-blue-700">
                5 Request
              </span>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-slate-600">
                Line 17
              </span>

              <span className="font-bold text-blue-700">
                3 Request
              </span>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-slate-600">
                Line 18
              </span>

              <span className="font-bold text-blue-700">
                4 Request
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">
                Line 19
              </span>

              <span className="font-bold text-blue-700">
                2 Request
              </span>
            </div>

          </div>

        </div>

      </main>
    </div>
  )
}

export default Report