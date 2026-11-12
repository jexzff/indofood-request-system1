import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRequest } from '../services/api'

function RequestForm() {

  const navigate = useNavigate()

  const [line, setLine] = useState('')

  const [shift, setShift] = useState('')

  const [form, setForm] = useState({
    bumbu: '',
    minyak: '',
  })

  const [message, setMessage] = useState('')

  const [submitted, setSubmitted] = useState(false)

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    setMessage('')
  }

  // =====================================================
  // GENERATE NOMOR REQUEST
  // =====================================================

  const generateRequestNumber = () => {
    const now = new Date()

    const date =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0')

    const time =
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0')

    const random = Math.floor(
      100 + Math.random() * 900
    )

    return `REQ-${date}-${time}-${random}`
  }

  // =====================================================
  // SUBMIT REQUEST
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (submitted) {
      return
    }

    setMessage('')

    // ===================================================
    // VALIDASI LINE
    // ===================================================

    if (!line) {
      setMessage(
        'pilih line produksi terlebih dahulu.'
      )
      return
    }

    // ===================================================
    // VALIDASI SHIFT
    // ===================================================

    if (!shift) {
      setMessage(
        'pilih shift terlebih dahulu.'
      )
      return
    }

    // ===================================================
    // VALIDASI JUMLAH
    // ===================================================

    const bumbu = Number(form.bumbu || 0)
    const minyak = Number(form.minyak || 0)

    if (bumbu <= 0 && minyak <= 0) {
      setMessage(
        'isi minimal salah satu jumlah barang.'
      )
      return
    }

    // ===================================================
    // WAKTU
    // ===================================================

    const now = new Date()

    const currentDate =
      now.toLocaleDateString('id-ID')

    const currentTime =
      now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })

    // ===================================================
    // ID & NOMOR REQUEST
    // ===================================================

    const id =
      Date.now() +
      Math.floor(Math.random() * 1000)

    const requestNumber =
      generateRequestNumber()

    // ===================================================
    // OPERATOR
    // ===================================================

    const operator =
      localStorage.getItem('operatorName') ||
      'Operator'

    // ===================================================
    // DATA REQUEST
    // ===================================================

    const requestData = {
      id,

      request_number: requestNumber,

      type: 'request',
      is_return: false,

      date: currentDate,
      time: currentTime,
      request_time: currentTime,
      created_at: now.toISOString(),

      line: Number(line),
      shift: Number(shift),

      bumbu,
      minyak,

      actual: null,
      actual_bumbu: null,
      actual_minyak: null,

      operator,

      status: 'Waiting',
      request_status: 'Waiting',

      button_status: 'REQUEST',

      process_started: false,
      started_at: null,

      confirmed: false,
      confirmed_at: null,

      received_at: null,
    }

    // ===================================================
    // KIRIM DATA KE BACKEND API
    // ===================================================

    try {

      await createRequest({
        request_number: requestNumber,
        operator,
        line: String(line),
        shift: String(shift),
        bumbu,
        minyak,
        requested_at: now
          .toISOString()
          .slice(0, 19)
          .replace('T', ' '),
      })

      // =================================================
      // AMBIL DATA LAMA
      // =================================================

      const oldHistory =
        JSON.parse(
          localStorage.getItem('requestHistory')
        ) || []

      const oldRequests =
        JSON.parse(
          localStorage.getItem('indofood_requests')
        ) || []

      // =================================================
      // SIMPAN HISTORY
      // =================================================

      const newHistory = [
        requestData,
        ...oldHistory,
      ]

      localStorage.setItem(
        'requestHistory',
        JSON.stringify(newHistory)
      )

      // =================================================
      // SIMPAN REQUEST
      // =================================================

      const newRequests = [
        requestData,
        ...oldRequests,
      ]

      localStorage.setItem(
        'indofood_requests',
        JSON.stringify(newRequests)
      )

      // =================================================
      // EVENT UPDATE ADMIN
      // =================================================

      window.dispatchEvent(
        new Event('indofood-data-updated')
      )

      // =================================================
      // STORAGE EVENT
      // =================================================

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'indofood_requests',
          newValue: JSON.stringify(newRequests),
          storageArea: localStorage,
        })
      )

      // =================================================
      // SELESAI
      // =================================================

      setSubmitted(true)

      setMessage(
        `${requestNumber} berhasil dikirim ke Admin Teknik.`
      )

    } catch (error) {

      console.error(
        'Gagal mengirim request:',
        error
      )

      setSubmitted(false)

      setMessage(
        error.message ||
        'Request gagal dikirim ke server.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-5xl mx-auto px-5 sm:px-7">

          {/* TOP HEADER */}

          <div className="flex items-center justify-between py-5">

            {/* BRAND */}

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

            {/* SYSTEM INFO */}

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

          {/* NAVIGATION */}

          <div className="border-t border-slate-100 py-3">

            <div className="flex items-center justify-between">

              <button
                type="button"
                onClick={() =>
                  navigate('/operator')
                }
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-blue-700 transition-all"
              >

                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-50">

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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>

                </div>

                Kembali ke Dashboard

              </button>

              <div className="flex items-center gap-2">

                <span
                  className={`w-2 h-2 rounded-full ${
                    submitted
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                  }`}
                />

                <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wide">

                  {submitted
                    ? 'Request Terkirim'
                    : 'Siap Membuat Request'}

                </span>

              </div>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          PAGE TITLE
      ===================================================== */}

      <section className="max-w-5xl mx-auto px-5 sm:px-7 pt-7 pb-3">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <span className="w-8 h-1 rounded-full bg-blue-700" />

              <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">
                Request Barang
              </span>

            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Buat Request Produksi
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Masukkan kebutuhan barang untuk line produksi.
            </p>

          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">

            <span className="w-2 h-2 rounded-full bg-green-500" />

            Sistem Online

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="max-w-5xl mx-auto px-5 sm:px-7 py-5">

        <form onSubmit={handleSubmit}>

          {/* =================================================
              INFORMASI PRODUKSI
          ================================================= */}

          <div className="bg-white rounded-[26px] border border-slate-200 shadow-[0_10px_35px_rgba(15,23,42,0.06)] overflow-hidden">

            <div className="p-6 sm:p-7">

              {/* CARD HEADER */}

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">

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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>

                </div>

                <div>

                  <h2 className="text-base sm:text-lg font-black text-slate-800">
                    Informasi Produksi
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Tentukan line dan shift produksi.
                  </p>

                </div>

              </div>

              {/* INPUT */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

                {/* LINE */}

                <div>

                  <label className="block text-[10px] font-black tracking-[0.12em] text-slate-500 mb-2">
                    LINE PRODUKSI
                  </label>

                  <div className="relative">

                    <select
                      value={line}
                      onChange={(e) =>
                        setLine(e.target.value)
                      }
                      disabled={submitted}
                      className="appearance-none w-full px-4 py-3.5 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 font-bold outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                    >

                      <option value="">
                        Pilih Line Produksi
                      </option>

                      {Array.from(
                        { length: 11 },
                        (_, index) =>
                          index + 16
                      ).map((number) => (

                        <option
                          key={number}
                          value={number}
                        >
                          Line {number}
                        </option>

                      ))}

                    </select>

                    <svg
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>

                  </div>

                </div>

                {/* SHIFT */}

                <div>

                  <label className="block text-[10px] font-black tracking-[0.12em] text-slate-500 mb-2">
                    SHIFT PRODUKSI
                  </label>

                  <div className="relative">

                    <select
                      value={shift}
                      onChange={(e) =>
                        setShift(e.target.value)
                      }
                      disabled={submitted}
                      className="appearance-none w-full px-4 py-3.5 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 font-bold outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
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

                    <svg
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>

                  </div>

                </div>

              </div>

            </div>

            {/* SUMMARY */}

            <div className="px-6 sm:px-7 py-3.5 bg-slate-50 border-t border-slate-100">

              <div className="flex items-center gap-2 flex-wrap">

                {line && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    LINE {line}
                  </span>
                )}

                {shift && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    SHIFT {shift}
                  </span>
                )}

                {!line && !shift && (
                  <span className="text-[11px] font-semibold text-slate-400">
                    Belum ada informasi produksi yang dipilih.
                  </span>
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              DATA REQUEST
          ================================================= */}

          <div className="bg-white rounded-[26px] border border-slate-200 shadow-[0_10px_35px_rgba(15,23,42,0.06)] mt-5 overflow-hidden">

            {/* HEADER */}

            <div className="p-6 sm:p-7 border-b border-slate-100">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">

                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v12m6-6H6"
                      />
                    </svg>

                  </div>

                  <div>

                    <h2 className="text-base sm:text-lg font-black text-slate-800">
                      Data Request
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Masukkan jumlah barang yang dibutuhkan.
                    </p>

                  </div>

                </div>

                <div
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                    submitted
                      ? 'bg-green-50 border-green-100 text-green-700'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >

                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      submitted
                        ? 'bg-green-500'
                        : 'bg-slate-400'
                    }`}
                  />

                  <span className="text-[10px] font-black">
                    {submitted
                      ? 'REQUEST TERKIRIM'
                      : 'BELUM REQUEST'}
                  </span>

                </div>

              </div>

            </div>

            {/* BARANG */}

            <div className="p-6 sm:p-7">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* BUMBU */}

                <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-blue-200 hover:bg-blue-50/30">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                      <span className="w-3 h-3 rounded-full bg-blue-600" />

                    </div>

                    <div>

                      <h3 className="text-sm font-black text-slate-800">
                        Bumbu
                      </h3>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Satuan: Dus
                      </p>

                    </div>

                  </div>

                  <div className="mt-5">

                    <label className="block text-[10px] font-black tracking-wide text-slate-500 mb-2">
                      JUMLAH REQUEST
                    </label>

                    <div className="relative">

                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        name="bumbu"
                        value={form.bumbu}
                        onChange={handleChange}
                        disabled={submitted}
                        placeholder="0"
                        className="w-full px-4 py-4 pr-16 rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                        DUS
                      </span>

                    </div>

                  </div>

                </div>

                {/* MINYAK */}

                <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-blue-200 hover:bg-blue-50/30">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">

                      <span className="w-3 h-3 rounded-full bg-blue-600" />

                    </div>

                    <div>

                      <h3 className="text-sm font-black text-slate-800">
                        Minyak
                      </h3>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Satuan: Dus
                      </p>

                    </div>

                  </div>

                  <div className="mt-5">

                    <label className="block text-[10px] font-black tracking-wide text-slate-500 mb-2">
                      JUMLAH REQUEST
                    </label>

                    <div className="relative">

                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        name="minyak"
                        value={form.minyak}
                        onChange={handleChange}
                        disabled={submitted}
                        placeholder="0"
                        className="w-full px-4 py-4 pr-16 rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                        DUS
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* INFO ALUR */}

              <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">

                <div className="flex items-start gap-3">

                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">

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
                        d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                      />
                    </svg>

                  </div>

                  <div>

                    <p className="text-xs font-black text-blue-800">
                      Alur Request
                    </p>

                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      Isi jumlah barang → pilih line & shift → klik START → request langsung diterima oleh Stock Keeper untuk diproses.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (

            <div
              className={`mt-5 rounded-2xl px-4 py-3.5 border flex items-center gap-3 ${
                submitted
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >

              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  submitted
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}
              >

                {submitted ? (

                  <svg
                    className="w-4 h-4 text-green-600"
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

                ) : (

                  <span className="text-sm font-black text-red-600">
                    !
                  </span>

                )}

              </div>

              <p
                className={`text-xs sm:text-sm font-bold ${
                  submitted
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}
              >
                {message}
              </p>

            </div>

          )}

          {/* =================================================
              START BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={submitted}
            className={`w-full mt-5 py-4 rounded-2xl text-sm text-white font-black shadow-lg transition-all duration-200 ${
              submitted
                ? 'bg-green-600 cursor-default shadow-green-100'
                : 'bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 active:translate-y-0 shadow-blue-200'
            }`}
          >

            <div className="flex items-center justify-center gap-2">

              {submitted ? (

                <>
                  <svg
                    className="w-5 h-5"
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

                  REQUEST TERKIRIM
                </>

              ) : (

                <>
                  START REQUEST

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
                </>

              )}

            </div>

          </button>

          <p className="text-center text-[11px] text-slate-400 mt-4 mb-5">

            {submitted
              ? 'Request sudah dikirim ke Admin Teknik.'
              : 'Pastikan line, shift, dan jumlah barang sudah benar.'}

          </p>

        </form>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="max-w-5xl mx-auto px-5 sm:px-7 pb-7">

        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">

          <p className="text-[10px] font-bold text-slate-400">
            Indofood RRC System
          </p>

          <p className="text-[10px] text-slate-400">
            Departemen Teknik • Internal Use Only
          </p>

        </div>

      </footer>

    </div>
  )
}

export default RequestForm