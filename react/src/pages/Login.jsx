import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

function Login() {
  const navigate = useNavigate()

  const [role, setRole] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')

    if (!role) {
      setError('pilih hak akses terlebih dahulu.')
      return
    }

    if (!password) {
      setError('masukkan password terlebih dahulu.')
      return
    }

    setLoading(true)

    try {
      // =================================================
      // NAMA USER
      // =================================================

      const operatorName =
        localStorage.getItem('operatorName') ||
        'Operator'

      const username =
        role === 'admin'
          ? 'admin_teknik'
          : 'operator'

      const userName =
        role === 'admin'
          ? 'Admin Teknik'
          : operatorName

      // =================================================
      // LOGIN KE API
      // =================================================

      const result = await login(
        username,
        password,
        role
      )

      if (!result || result.success !== true) {
        throw new Error(
          result?.message ||
          'Login gagal.'
        )
      }

      // =================================================
      // SIMPAN SESSION
      // =================================================

      sessionStorage.clear()

      sessionStorage.setItem(
        'loginRole',
        role
      )

      sessionStorage.setItem(
        'isLoggedIn',
        'true'
      )

      sessionStorage.setItem(
        'userName',
        result.user?.name || userName
      )

      sessionStorage.setItem(
        'username',
        result.user?.username || username
      )

      // =================================================
      // REDIRECT
      // =================================================

      if (role === 'admin') {
        navigate('/admin', {
          replace: true,
        })
      } else {
        navigate('/operator', {
          replace: true,
        })
      }

    } catch (error) {
      console.error('LOGIN ERROR:', error)

      setError(
        error?.message ||
        'Username, password, atau hak akses salah.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // PILIH ROLE
  // =====================================================

  const selectRole = (selectedRole) => {
    setRole(selectedRole)
    setPassword('')
    setError('')
    setShowPassword(false)
  }

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8 relative overflow-hidden">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-red-500/10 blur-3xl" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-blue-100/60" />

      </div>


      {/* =================================================
          CONTAINER
      ================================================= */}

      <div className="w-full max-w-[480px] relative z-10">

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="text-center mb-6">

          <div className="inline-flex items-center">

            <div className="text-left leading-none">

              <div className="flex items-baseline justify-center">

                <span className="text-[30px] font-black tracking-[-1.5px] text-blue-700">
                  IND
                </span>

                <span className="text-[30px] font-black tracking-[-1.5px] text-red-600">
                  O
                </span>

                <span className="text-[30px] font-black tracking-[-1.5px] text-blue-700">
                  FOOD
                </span>

                <span className="text-[30px] font-black tracking-[-1.5px] text-red-600 ml-1">
                  CBP
                </span>

              </div>

              <div className="flex items-center justify-center gap-2 mt-2">

                <div className="w-7 h-[3px] rounded-full bg-blue-700" />

                <div className="w-3 h-[3px] rounded-full bg-red-600" />

                <p className="text-[9px] font-bold tracking-[0.18em] text-slate-400 whitespace-nowrap">
                  SUKSES MAKMUR TBK
                </p>

                <div className="w-3 h-[3px] rounded-full bg-red-600" />

                <div className="w-7 h-[3px] rounded-full bg-blue-700" />

              </div>

            </div>

          </div>

          <div className="mt-6">

            <p className="text-sm text-slate-500 mt-2">
              Request & Return Control System
            </p>

          </div>

          <div className="flex items-center justify-center gap-2 mt-3">

            <div className="h-px w-8 bg-blue-200" />

            <p className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">
              Departemen Teknik
            </p>

            <div className="h-px w-8 bg-blue-200" />

          </div>

        </div>


        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div className="bg-white rounded-[28px] border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.10)] overflow-hidden">

          <div className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-red-600" />

          <div className="p-6 sm:p-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-6">

              <div className="flex items-center gap-3">

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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />

                  </svg>

                </div>

                <div>

                  <h2 className="text-lg font-black text-slate-800">
                    LOGIN SYSTEM
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Gunakan akun sesuai hak akses
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                ROLE LABEL
            ================================================= */}

            <div className="flex items-center justify-between mb-3">

              {role && (
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    role === 'admin'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-green-50 text-green-700'
                  }`}
                >

                  {role === 'admin'
                    ? 'ADMIN'
                    : 'OPERATOR'}

                </span>
              )}

            </div>


            {/* =================================================
                ROLE CARDS
            ================================================= */}

            <div className="grid grid-cols-2 gap-3">

              {/* ADMIN */}

              <button
                type="button"
                onClick={() => selectRole('admin')}
                className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  role === 'admin'
                    ? 'border-blue-600 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
                }`}
              >

                {role === 'admin' && (
                  <div className="absolute top-3 right-3">

                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">

                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />

                      </svg>

                    </div>

                  </div>
                )}

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                    role === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >

                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 14a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />

                  </svg>

                </div>

                <p className="text-sm font-black text-slate-800">
                  STOCK KEEPER
                </p>

                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Kelola request & return
                </p>

              </button>


              {/* OPERATOR */}

              <button
                type="button"
                onClick={() => selectRole('operator')}
                className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  role === 'operator'
                    ? 'border-green-600 bg-green-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-green-300 hover:bg-green-50/40'
                }`}
              >

                {role === 'operator' && (
                  <div className="absolute top-3 right-3">

                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">

                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />

                      </svg>

                    </div>

                  </div>
                )}

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                    role === 'operator'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 text-green-700'
                  }`}
                >

                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0"
                    />

                  </svg>

                </div>

                <p className="text-sm font-black text-slate-800">
                  HELPER
                </p>

                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Buat request produksi
                </p>

              </button>

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            {role && (

              <form
                onSubmit={handleLogin}
                className="mt-6"
              >

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-xs font-black tracking-wide text-slate-600">
                    PASSWORD
                  </label>

                  <span className="text-[10px] text-slate-400">

                    {role === 'admin'
                      ? 'Admin Teknik'
                      : 'Operator'}

                  </span>

                </div>


                <div className="relative">

                  <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      error
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`}
                  >

                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v2h8z"
                      />

                    </svg>

                  </div>


                  {/* PASSWORD INPUT */}

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    placeholder={
                      role === 'admin'
                        ? 'Masukkan password admin'
                        : 'Masukkan password operator'
                    }
                    autoFocus
                    autoComplete="current-password"
                    className={`w-full pl-12 pr-14 py-4 rounded-2xl border-2 bg-slate-50 text-sm text-slate-800 font-bold outline-none transition-all ${
                      error
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                        : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'
                    }`}
                  />


                  {/* SHOW / HIDE PASSWORD */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                  >

                    {showPassword ? (

                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m3.74-2.61A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-4.132 5.411M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 9L3 3"
                        />

                      </svg>

                    ) : (

                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-3.057-9.542-7z"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          strokeWidth="2"
                        />

                      </svg>

                    )}

                  </button>

                </div>


                {/* ERROR */}

                {error && (

                  <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">

                    <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center shrink-0">

                      <span className="text-xs font-black text-red-600">
                        !
                      </span>

                    </div>

                    <p className="text-xs font-bold text-red-600">
                      {error}
                    </p>

                  </div>

                )}


                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-4 py-4 rounded-2xl text-white text-sm font-black transition-all duration-200 shadow-lg ${
                    loading
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:-translate-y-0.5 active:translate-y-0'
                  } ${
                    role === 'admin'
                      ? 'bg-blue-700 hover:bg-blue-800 shadow-blue-200'
                      : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                  }`}
                >

                  <div className="flex items-center justify-center gap-2">

                    <span>

                      {loading
                        ? 'MEMPROSES...'
                        : role === 'admin'
                          ? 'MASUK SEBAGAI ADMIN'
                          : 'MASUK SEBAGAI OPERATOR'}

                    </span>

                    {!loading && (
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
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />

                      </svg>
                    )}

                  </div>

                </button>

              </form>

            )}


            {/* =================================================
                NO ROLE
            ================================================= */}

            {!role && (

              <div className="mt-5 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 border border-slate-100">

                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-8h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                  />

                </svg>

                <p className="text-[11px] font-bold text-slate-400">
                  Pilih hak akses terlebih dahulu
                </p>

              </div>

            )}

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">

            <div className="flex items-center justify-center gap-2">

              <span className="w-2 h-2 rounded-full bg-green-500" />

              <p className="text-[10px] font-bold text-slate-400">
                System Online
              </p>

              <span className="text-slate-300">
                •
              </span>

              <p className="text-[10px] text-slate-400">
                Departemen Teknik
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            BOTTOM TEXT
        ================================================= */}

        <p className="text-center text-[10px] text-slate-400 mt-5">
          Indofood RRC System • Internal Use Only
        </p>

      </div>

    </div>
  )
}

export default Login