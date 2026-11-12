import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function OperatorReturn() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    line: '',
    shift: '',
    bumbu: '',
    minyak: '',
    keterangan: '',
  })

  const [loading, setLoading] = useState(false)

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem('loginRole')
    sessionStorage.removeItem('loginRole')
    sessionStorage.removeItem('isLoggedIn')

    navigate('/login')
  }

  // =====================================================
  // SUBMIT RETURN
  // =====================================================

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.line) {
      alert('pilih line produksi terlebih dahulu.')
      return
    }

    if (!form.shift) {
      alert('pilih shift terlebih dahulu.')
      return
    }

    const bumbu = Number(form.bumbu || 0)
    const minyak = Number(form.minyak || 0)

    if (bumbu <= 0 && minyak <= 0) {
      alert('isi minimal salah satu jumlah return.')
      return
    }

    setLoading(true)

    const now = new Date()

    const id =
      `RET-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const tanggal =
      now.toLocaleDateString('id-ID')

    const jam =
      now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })

    const fullTime =
      now.toLocaleString('id-ID')

    // =================================================
    // DATA RETURN
    // =================================================

    const returnData = {
      id,

      type: 'return',

      line: Number(form.line),

      shift: form.shift,

      tanggal,

      jam,

      time: jam,

      created_at: now.toISOString(),

      bumbu,

      minyak,

      actual_bumbu: '',
      actual_minyak: '',

      confirmed_bumbu: false,
      confirmed_minyak: false,

      received_bumbu: false,
      received_minyak: false,

      confirmed_at_bumbu: null,
      confirmed_at_minyak: null,

      received_at_bumbu: null,
      received_at_minyak: null,

      confirmed: false,
      received: false,

      status: 'Processing',

      keterangan:
        form.keterangan.trim(),

      no_po: '-',

      flavor: 'RETURN',

      return_created_at: fullTime,

      source: 'operator',
    }

    // =================================================
    // SIMPAN KE indofood_requests
    // =================================================

    const oldRequests =
      JSON.parse(
        localStorage.getItem(
          'indofood_requests'
        )
      ) || []

    const newRequests = [
      ...oldRequests,
      returnData,
    ]

    localStorage.setItem(
      'indofood_requests',
      JSON.stringify(newRequests)
    )

    // =================================================
    // SIMPAN KE HISTORY
    // =================================================

    const oldHistory =
      JSON.parse(
        localStorage.getItem(
          'requestHistory'
        )
      ) || []

    const newHistory = [
      ...oldHistory,
      returnData,
    ]

    localStorage.setItem(
      'requestHistory',
      JSON.stringify(newHistory)
    )

    // =================================================
    // RESET FORM
    // =================================================

    setForm({
      line: '',
      shift: '',
      bumbu: '',
      minyak: '',
      keterangan: '',
    })

    setLoading(false)

    alert(
      'data return berhasil dikirim ke Admin Teknik.'
    )

    navigate('/operator')
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-5 sm:px-7">

          <div className="flex items-center justify-between py-5">

            {/* BRAND */}

            <div>

              <div className="flex items-baseline">

                <span className="text-[27px] sm:text-[30px] font-black tracking-[-1.5px] text-blue-700">
                  Indofood
                </span>

                <span className="text-[27px] sm:text-[30px] font-black tracking-[-1.5px] text-red-600 ml-1">
                  CBP
                </span>

              </div>

              <div className="flex items-center gap-2 mt-2">

                <div className="w-7 h-[3px] rounded-full bg-blue-700" />

                <div className="w-3 h-[3px] rounded-full bg-red-600" />

                <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.18em] text-slate-400">
                  SUKSES MAKMUR TBK
                </p>

              </div>

            </div>


            {/* SYSTEM */}

            <div className="hidden sm:flex items-center gap-4">

              <div className="text-right">

                <p className="text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase">
                  Indofood RRC System
                </p>

                <p className="text-xs font-bold text-slate-600 mt-1">
                  Departemen Teknik
                </p>

              </div>

              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">

                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 7h11a4 4 0 014 4v1m0 0l-3-3m3 3l-3 3M20 17H9a4 4 0 01-4-4v-1m0 0l3 3m-3-3l3-3"
                  />
                </svg>

              </div>

            </div>

          </div>


          {/* NAVIGATION */}

          <div className="border-t border-slate-100 py-3">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">

                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 7h11a4 4 0 014 4v1m0 0l-3-3m3 3l-3 3M20 17H9a4 4 0 01-4-4v-1m0 0l3 3m-3-3l3-3"
                    />
                  </svg>

                </div>

                <div>

                  <p className="text-[10px] font-black tracking-[0.15em] text-red-600 uppercase">
                    Operator Produksi
                  </p>

                  <p className="text-xs font-bold text-slate-500">
                    Form Return Barang
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-4">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wide">
                    Sistem Online
                  </span>

                </div>


                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-red-600 transition"
                >

                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">

                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>

                  </div>

                  <span className="hidden sm:inline">
                    Logout
                  </span>

                </button>

              </div>

            </div>

          </div>

        </div>

      </header>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="max-w-5xl mx-auto px-5 sm:px-7 py-7">

        {/* TITLE */}

        <div className="mb-6">

          <p className="text-[10px] font-black tracking-[0.18em] text-red-600 uppercase">
            Transaksi 02
          </p>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
            Return Barang
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            isi data barang yang akan dikembalikan ke Admin Teknik.
          </p>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden"
        >

          {/* FORM HEADER */}

          <div className="px-6 sm:px-8 py-6 border-b border-slate-200 bg-red-50/50">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">

                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 7h11a4 4 0 014 4v1m0 0l-3-3m3 3l-3 3M20 17H9a4 4 0 01-4-4v-1m0 0l3 3m-3-3l3-3"
                  />
                </svg>

              </div>

              <div>

                <h2 className="text-lg font-black text-slate-800">
                  Data Return Produksi
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  data ini akan langsung diteruskan ke Admin Teknik.
                </p>

              </div>

            </div>

          </div>


          {/* FORM BODY */}

          <div className="p-6 sm:p-8 space-y-6">

            {/* LINE + SHIFT */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* LINE */}

              <div>

                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Line Produksi
                </label>

                <select
                  name="line"
                  value={form.line}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                >

                  <option value="">
                    Pilih Line
                  </option>

                  {Array.from(
                    { length: 13 },
                    (_, index) => index + 16
                  ).map((line) => (

                    <option
                      key={line}
                      value={line}
                    >
                      Line {line}
                    </option>

                  ))}

                </select>

              </div>


              {/* SHIFT */}

              <div>

                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Shift
                </label>

                <select
                  name="shift"
                  value={form.shift}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                >

                  <option value="">
                    Pilih Shift
                  </option>

                  <option value="1">
                    Shift 1
                  </option>

                  <option value="2">
                    Shift 2
                  </option>

                  <option value="3">
                    Shift 3
                  </option>

                </select>

              </div>

            </div>


            {/* BARANG */}

            <div>

              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                Jumlah Barang Return
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* BUMBU */}

                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">

                  <div className="flex items-center justify-between mb-3">

                    <div>

                      <p className="text-xs font-black text-blue-600 tracking-wider">
                        BUMBU
                      </p>

                      <p className="text-sm font-black text-slate-700 mt-1">
                        Jumlah Return
                      </p>

                    </div>

                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                      <span className="text-sm font-black text-blue-700">
                        B
                      </span>

                    </div>

                  </div>

                  <input
                    type="number"
                    name="bumbu"
                    min="0"
                    step="1"
                    value={form.bumbu}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white text-lg font-black text-blue-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="text-[11px] text-slate-400 mt-2">
                    isi 0 jika tidak ada return bumbu.
                  </p>

                </div>


                {/* MINYAK */}

                <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">

                  <div className="flex items-center justify-between mb-3">

                    <div>

                      <p className="text-xs font-black text-orange-600 tracking-wider">
                        MINYAK
                      </p>

                      <p className="text-sm font-black text-slate-700 mt-1">
                        Jumlah Return
                      </p>

                    </div>

                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">

                      <span className="text-sm font-black text-orange-700">
                        M
                      </span>

                    </div>

                  </div>

                  <input
                    type="number"
                    name="minyak"
                    min="0"
                    step="1"
                    value={form.minyak}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white text-lg font-black text-orange-700 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />

                  <p className="text-[11px] text-slate-400 mt-2">
                    isi 0 jika tidak ada return minyak.
                  </p>

                </div>

              </div>

            </div>


            {/* KETERANGAN */}

            <div>

              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Keterangan
              </label>

              <textarea
                name="keterangan"
                value={form.keterangan}
                onChange={handleChange}
                rows="4"
                placeholder="contoh: sisa material produksi, barang rusak, atau keterangan lainnya..."
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none resize-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />

            </div>


            {/* INFO */}

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">

              <div className="flex gap-3">

                <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-100 flex items-center justify-center">

                  <span className="font-black text-blue-700">
                    i
                  </span>

                </div>

                <div>

                  <p className="text-xs font-black text-slate-700">
                    Informasi
                  </p>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    setelah dikirim, data return akan muncul pada monitoring Line di sisi Admin Teknik. Admin kemudian dapat mengisi ACT dan menekan tombol RECEIVE.
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* BUTTON */}

          <div className="px-6 sm:px-8 py-5 border-t border-slate-200 bg-slate-50">

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate('/operator')
                }
                className="sm:flex-1 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-100 transition"
              >
                BATAL
              </button>

              <button
                type="submit"
                disabled={loading}
                className="sm:flex-[2] py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-black text-sm shadow-sm transition active:scale-[0.99]"
              >
                {loading
                  ? 'MENGIRIM...'
                  : 'KIRIM RETURN KE ADMIN'}
              </button>

            </div>

          </div>

        </form>

      </main>

    </div>
  )
}

export default OperatorReturn