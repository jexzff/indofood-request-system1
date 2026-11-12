import { useNavigate } from 'react-router-dom'

function OperatorDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('loginRole')
    sessionStorage.removeItem('loginRole')
    sessionStorage.removeItem('isLoggedIn')

    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-5 sm:px-7">

          {/* =================================================
              TOP HEADER
          ================================================= */}

          <div className="flex items-center justify-between py-5">

            {/* =================================================
                BRAND
            ================================================= */}

            <div className="flex items-center">

              <div className="leading-none">

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

            </div>


            {/* =================================================
                SYSTEM INFO
            ================================================= */}

            <div className="hidden sm:flex items-center gap-3">

              <div className="text-right">

                <p className="text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase">
                  Indofood RRC System
                </p>

                <p className="text-xs font-bold text-slate-600 mt-1">
                  Departemen Teknik
                </p>

              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

                <svg
                  className="w-5 h-5 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-.688-.057-1.362-.164-2.016z"
                  />

                </svg>

              </div>

            </div>

          </div>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <div className="border-t border-slate-100 py-3">

            <div className="flex items-center justify-between">

              {/* =================================================
                  OPERATOR DASHBOARD
              ================================================= */}

              <div className="flex items-center gap-2">

                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">

                  <svg
                    className="w-4 h-4 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                    />

                  </svg>

                </div>

                <div>

                  <p className="text-[10px] font-black tracking-[0.15em] text-blue-600 uppercase">
                    Helper Produksi
                  </p>

                  <p className="text-xs font-bold text-slate-500">
                    Dashboard
                  </p>

                </div>

              </div>


              {/* =================================================
                  RIGHT SIDE
              ================================================= */}

              <div className="flex items-center gap-4">

                {/* SYSTEM ONLINE */}

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wide">
                    Sistem Online
                  </span>

                </div>


                {/* SHIFT */}

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">

                  <span className="text-[10px] font-black text-slate-400">
                    SHIFT
                  </span>

                  <span className="text-sm font-black text-blue-700">
                    1 / 2 / 3
                  </span>

                </div>


                {/* LOGOUT */}

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-red-600 transition-all"
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


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-5 sm:px-7 py-7">


        {/* =================================================
            WELCOME / TITLE
        ================================================= */}

        <div className="mb-6">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

            <div>

              <p className="text-[10px] font-black tracking-[0.18em] text-blue-600 uppercase">
                Menu Utama Helper
              </p>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
                Transaksi Produksi
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Kelola request dan return barang produksi dengan mudah.
              </p>

            </div>


            {/* STATUS */}

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">

              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />

              <div>

                <p className="text-[9px] font-black tracking-wider text-slate-400">
                  STATUS SISTEM
                </p>

                <p className="text-xs font-extrabold text-green-600 mt-0.5">
                  ONLINE
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            MAIN MENU
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


          {/* =================================================
              REQUEST
          ================================================= */}

          <button
            onClick={() => navigate('/operator/request')}
            className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 text-left shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-green-300 transition-all duration-200"
          >

            {/* TOP COLOR */}

            <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />


            <div className="flex items-start justify-between">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">

                  <svg
                    className="w-7 h-7 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />

                  </svg>

                </div>


                <div>

                  <p className="text-[10px] font-black tracking-[0.15em] text-green-600">
                    TRANSAKSI 01
                  </p>

                  <h2 className="text-xl font-black text-slate-800 mt-1">
                    Request Barang
                  </h2>

                </div>

              </div>


              <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-green-50 flex items-center justify-center transition">

                <span className="text-xl text-slate-300 group-hover:text-green-600 transition">
                  →
                </span>

              </div>

            </div>


            <div className="mt-6 pt-5 border-t border-slate-100">

              <p className="text-sm text-slate-500 leading-relaxed">
                Buat permintaan bumbu atau minyak sesuai kebutuhan line produksi.
              </p>

            </div>


            <div className="flex items-center justify-between mt-6">

              <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-[10px] font-black tracking-wider">
                REQUEST
              </span>

              <span className="text-xs text-slate-400">
                Kirim ke Stock Keeper
              </span>

            </div>

          </button>


          {/* =================================================
              RETURN
          ================================================= */}

          <button
            onClick={() => navigate('/operator/return')}
            className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 text-left shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-red-300 transition-all duration-200"
          >

            {/* TOP COLOR */}

            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />


            <div className="flex items-start justify-between">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">

                  <svg
                    className="w-7 h-7 text-red-600"
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

                  <p className="text-[10px] font-black tracking-[0.15em] text-red-600">
                    TRANSAKSI 02
                  </p>

                  <h2 className="text-xl font-black text-slate-800 mt-1">
                    Return Barang
                  </h2>

                </div>

              </div>


              <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-red-50 flex items-center justify-center transition">

                <span className="text-xl text-slate-300 group-hover:text-red-600 transition">
                  →
                </span>

              </div>

            </div>


            <div className="mt-6 pt-5 border-t border-slate-100">

              <p className="text-sm text-slate-500 leading-relaxed">
                Catat dan kirim barang bumbu atau minyak yang akan dikembalikan.
              </p>

            </div>


            <div className="flex items-center justify-between mt-6">

              <span className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-[10px] font-black tracking-wider">
                RETURN
              </span>

              <span className="text-xs text-slate-400">
                Kirim ke Stock Keeper
              </span>

            </div>

          </button>

        </div>


        {/* =================================================
            HISTORY
        ================================================= */}

        <div className="mt-5">

          <button
            onClick={() => navigate('/operator/history')}
            className="group w-full bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 text-left shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 transition-all duration-200"
          >

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">

                  <svg
                    className="w-7 h-7 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />

                  </svg>

                </div>


                <div>

                  <p className="text-[10px] font-black tracking-[0.15em] text-blue-600">
                    TRANSAKSI 03
                  </p>

                  <h2 className="text-lg sm:text-xl font-black text-slate-800 mt-1">
                    Riwayat Request & Return
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Lihat seluruh transaksi yang pernah dibuat oleh helper.
                  </p>

                </div>

              </div>


              <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center">

                <span className="text-xl text-slate-300 group-hover:text-blue-600 transition">
                  →
                </span>

              </div>

            </div>

          </button>

        </div>


        {/* =================================================
            INFORMATION CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">


          {/* REQUEST INFO */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">

                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />

              </div>

              <div>

                <p className="text-[10px] font-black tracking-wider text-slate-400">
                  REQUEST
                </p>

                <p className="text-sm font-black text-slate-700 mt-0.5">
                  Permintaan Barang
                </p>

              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Bumbu & minyak produksi
            </p>

          </div>


          {/* RETURN INFO */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">

                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />

              </div>

              <div>

                <p className="text-[10px] font-black tracking-wider text-slate-400">
                  RETURN
                </p>

                <p className="text-sm font-black text-slate-700 mt-0.5">
                  Pengembalian Barang
                </p>

              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Bumbu & minyak produksi
            </p>

          </div>


          {/* SYSTEM INFO */}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">

                <svg
                  className="w-4 h-4 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-.688-.057-1.362-.164-2.016z"
                  />

                </svg>

              </div>

              <div>

                <p className="text-[10px] font-black tracking-wider text-slate-400">
                  SISTEM
                </p>

                <p className="text-sm font-black text-green-600 mt-0.5">
                  Online
                </p>

              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4">
              Sistem berjalan normal
            </p>

          </div>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <p className="text-center text-[10px] font-bold tracking-wider text-slate-400 mt-7">
          INDOFOOD REQUEST SYSTEM · DEPARTEMEN TEKNIK
        </p>

      </main>

    </div>
  )
}

export default OperatorDashboard