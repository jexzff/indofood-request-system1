import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminHistory() {
  const navigate = useNavigate()

  const [history, setHistory] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  const loadHistory = () => {
    try {
      const saved =
        JSON.parse(
          localStorage.getItem('requestHistory')
        ) || []

      setHistory(
        Array.isArray(saved)
          ? saved
          : []
      )
    } catch {
      setHistory([])
    }
  }

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    loadHistory()

    const interval = setInterval(() => {
      loadHistory()
    }, 500)

    const handleUpdate = () => {
      loadHistory()
    }

    window.addEventListener(
      'indofood-data-updated',
      handleUpdate
    )

    window.addEventListener(
      'storage',
      handleUpdate
    )

    return () => {
      clearInterval(interval)

      window.removeEventListener(
        'indofood-data-updated',
        handleUpdate
      )

      window.removeEventListener(
        'storage',
        handleUpdate
      )
    }
  }, [])

  // =====================================================
  // NORMALIZE TEXT
  // =====================================================

  const normalizeText = (value) => {
    return String(value ?? '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  // =====================================================
  // PARSE TANGGAL
  // =====================================================

  const parseDate = (item) => {
    const possibleValues = [
      item.created_at,
      item.confirmed_at,
      item.received_at,
      item.started_at,
      item.date
    ]

    for (const value of possibleValues) {
      if (!value) continue

      const date = new Date(value)

      if (!Number.isNaN(date.getTime())) {
        return date
      }

      // format DD/MM/YYYY
      const match = String(value).match(
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
      )

      if (match) {
        const day = Number(match[1])
        const month = Number(match[2]) - 1
        const year = Number(match[3])

        const parsed =
          new Date(
            year,
            month,
            day
          )

        if (
          !Number.isNaN(
            parsed.getTime()
          )
        ) {
          return parsed
        }
      }
    }

    return null
  }

  // =====================================================
  // DATA TANGGAL UNTUK SEARCH
  // =====================================================

  const getDateSearchValues = (item) => {
    const date = parseDate(item)

    const values = []

    // tanggal dari field asli
    if (item.date) {
      values.push(
        normalizeText(item.date)
      )
    }

    if (date) {
      const day =
        String(
          date.getDate()
        ).padStart(2, '0')

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, '0')

      const year =
        String(
          date.getFullYear()
        )

      // =================================================
      // FORMAT ANGKA
      // =================================================

      values.push(
        `${day}/${month}/${year}`
      )

      values.push(
        `${day}-${month}-${year}`
      )

      values.push(
        `${day}/${month}/${year.slice(2)}`
      )

      values.push(
        `${day}-${month}-${year.slice(2)}`
      )

      values.push(
        `${day}${month}${year}`
      )

      // =================================================
      // HARI
      // =================================================

      const dayNames = [
        'minggu',
        'senin',
        'selasa',
        'rabu',
        'kamis',
        'jumat',
        'sabtu'
      ]

      const monthNames = [
        'januari',
        'februari',
        'maret',
        'april',
        'mei',
        'juni',
        'juli',
        'agustus',
        'september',
        'oktober',
        'november',
        'desember'
      ]

      const dayName =
        dayNames[
          date.getDay()
        ]

      const monthName =
        monthNames[
          date.getMonth()
        ]

      // =================================================
      // FORMAT LENGKAP
      // =================================================

      values.push(
        dayName
      )

      values.push(
        monthName
      )

      values.push(
        year
      )

      values.push(
        `${day} ${monthName} ${year}`
      )

      values.push(
        `${dayName}, ${day} ${monthName} ${year}`
      )

      values.push(
        `${dayName} ${day} ${monthName} ${year}`
      )

      // format tanpa tahun
      values.push(
        `${day} ${monthName}`
      )

      // angka bulan
      values.push(
        `${day}/${month}`
      )

      values.push(
        `${day}-${month}`
      )
    }

    // =================================================
    // WAKTU
    // =================================================

    if (item.time) {
      values.push(
        normalizeText(item.time)
      )
    }

    if (item.jam) {
      values.push(
        normalizeText(item.jam)
      )
    }

    if (date) {
      const hour =
        String(
          date.getHours()
        ).padStart(2, '0')

      const minute =
        String(
          date.getMinutes()
        ).padStart(2, '0')

      const second =
        String(
          date.getSeconds()
        ).padStart(2, '0')

      values.push(
        `${hour}:${minute}`
      )

      values.push(
        `${hour}:${minute}:${second}`
      )
    }

    return values.map(
      normalizeText
    )
  }

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredHistory =
    history.filter((item) => {

      // =================================================
      // FILTER REQUEST / RETURN
      // =================================================

      const matchesFilter =
        filter === 'all' ||
        item.type === filter

      if (!matchesFilter) {
        return false
      }

      // =================================================
      // KEYWORD
      // =================================================

      const keyword =
        normalizeText(search)

      // kalau search kosong
      if (!keyword) {
        return true
      }

      // =================================================
      // DATA YANG BISA DICARI
      // =================================================

      const requestNumber =
        normalizeText(
          item.request_number
        )

      const returnNumber =
        normalizeText(
          item.return_number
        )

      const line =
        normalizeText(
          item.line
        )

      const shift =
        normalizeText(
          item.shift
        )

      const operator =
        normalizeText(
          item.operator
        )

      const description =
        normalizeText(
          item.description
        )

      const dateValues =
        getDateSearchValues(item)

      // =================================================
      // GABUNG SEMUA DATA
      // =================================================

      const searchableValues = [
        requestNumber,
        returnNumber,
        line,
        shift,
        operator,
        description,
        ...dateValues
      ].filter(Boolean)

      // =================================================
      // CARI YANG SESUAI
      // =================================================

      return searchableValues.some(
        (value) =>
          value.includes(keyword)
      )
    })

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (item) => {

    const rawStatus =
      normalizeText(
        item.status ||
        item.request_status ||
        item.return_status
      )

    // REQUEST
    if (item.type === 'request') {

      if (
        rawStatus === 'confirmed' ||
        rawStatus === 'confirm' ||
        item.confirmed === true
      ) {
        return {
          text: 'CONFIRMED',
          className:
            'bg-green-100 text-green-700'
        }
      }

      if (
        rawStatus === 'processing' ||
        rawStatus === 'processed' ||
        item.process_started === true
      ) {
        return {
          text: 'PROCESSING',
          className:
            'bg-blue-100 text-blue-700'
        }
      }

      if (
        rawStatus === 'received' ||
        rawStatus === 'diterima'
      ) {
        return {
          text: 'RECEIVED',
          className:
            'bg-green-100 text-green-700'
        }
      }

      if (
        rawStatus === 'rejected' ||
        rawStatus === 'ditolak'
      ) {
        return {
          text: 'REJECTED',
          className:
            'bg-red-100 text-red-700'
        }
      }

      return {
        text: 'WAITING',
        className:
          'bg-yellow-100 text-yellow-700'
      }
    }

    // RETURN
    if (item.type === 'return') {

      if (
        rawStatus === 'received' ||
        rawStatus === 'diterima' ||
        item.received === true
      ) {
        return {
          text: 'RECEIVED',
          className:
            'bg-green-100 text-green-700'
        }
      }

      if (
        rawStatus === 'processing' ||
        rawStatus === 'processed' ||
        item.process_started === true
      ) {
        return {
          text: 'PROCESSING',
          className:
            'bg-blue-100 text-blue-700'
        }
      }

      if (
        rawStatus === 'confirmed' ||
        rawStatus === 'confirm'
      ) {
        return {
          text: 'CONFIRMED',
          className:
            'bg-green-100 text-green-700'
        }
      }

      if (
        rawStatus === 'rejected' ||
        rawStatus === 'ditolak'
      ) {
        return {
          text: 'REJECTED',
          className:
            'bg-red-100 text-red-700'
        }
      }

      return {
        text: 'WAITING',
        className:
          'bg-yellow-100 text-yellow-700'
      }
    }

    return {
      text: 'WAITING',
      className:
        'bg-slate-100 text-slate-600'
    }
  }

  // =====================================================
  // FORMAT TANGGAL UPDATE
  // =====================================================

  const formatDateTime = (value) => {

    if (!value) {
      return '-'
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value
    }

    return date.toLocaleString(
      'id-ID',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    )
  }

  // =====================================================
  // HISTORY ITEM
  // =====================================================

  const HistoryItem = ({ item }) => {

    const isRequest =
      item.type === 'request'

    const status =
      getStatus(item)

    const transactionNumber =
      item.request_number ||
      item.return_number ||
      'TRANSAKSI'

    return (
      <div
        className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${
          isRequest
            ? 'border-green-200'
            : 'border-red-200'
        }`}
      >

        {/* TOP */}

        <div
          className={`px-5 py-4 ${
            isRequest
              ? 'bg-green-50'
              : 'bg-red-50'
          }`}
        >

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* IDENTITAS */}

            <div className="flex items-center gap-3 min-w-[220px]">

              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-black ${
                  isRequest
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {isRequest
                  ? '↗'
                  : '↙'}
              </div>

              <div>

                <p
                  className={`text-[10px] font-black tracking-widest ${
                    isRequest
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {isRequest
                    ? 'REQUEST BARANG'
                    : 'RETURN BARANG'}
                </p>

                <p className="text-lg font-black text-slate-800">
                  {transactionNumber}
                </p>

              </div>

            </div>

            {/* INFO */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">

              <div className="bg-white/70 rounded-2xl px-4 py-3">

                <p className="text-[9px] font-black tracking-wider text-slate-400">
                  LINE
                </p>

                <p className="font-black text-slate-800 mt-1">
                  {item.line || '-'}
                </p>

              </div>

              <div className="bg-white/70 rounded-2xl px-4 py-3">

                <p className="text-[9px] font-black tracking-wider text-slate-400">
                  SHIFT
                </p>

                <p className="font-black text-slate-800 mt-1">
                  {item.shift || '-'}
                </p>

              </div>

              <div className="bg-white/70 rounded-2xl px-4 py-3">

                <p className="text-[9px] font-black tracking-wider text-slate-400">
                  TANGGAL
                </p>

                <p className="font-bold text-slate-700 text-sm mt-1">
                  {item.date || '-'}
                </p>

              </div>

              <div className="bg-white/70 rounded-2xl px-4 py-3">

                <p className="text-[9px] font-black tracking-wider text-slate-400">
                  WAKTU
                </p>

                <p className="font-bold text-slate-700 text-sm mt-1">
                  {item.time || item.jam || '-'}
                </p>

              </div>

            </div>

            {/* STATUS */}

            <div className="flex items-center justify-end">

              <span
                className={`px-4 py-2 rounded-full text-[10px] font-black tracking-wide whitespace-nowrap ${status.className}`}
              >
                {status.text}
              </span>

            </div>

          </div>

        </div>

        {/* DETAIL */}

        <div className="px-5 py-4">

          <div className="flex flex-col lg:flex-row lg:items-center gap-4">

            {/* BARANG */}

            <div className="flex-1">

              <p className="text-[10px] font-black tracking-widest text-slate-400 mb-2">
                DETAIL BARANG
              </p>

              <div className="flex flex-wrap gap-3">

                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 min-w-[150px]">

                  <p className="text-xs font-bold text-slate-500">
                    Bumbu
                  </p>

                  <div className="flex items-center gap-3 mt-1">

                    <span className="font-black text-slate-800">
                      {item.bumbu || 0}
                    </span>

                    <span className="text-xs text-slate-400">
                      RQS
                    </span>

                    <span className="text-slate-300">
                      /
                    </span>

                    <span className="font-black text-blue-700">
                      {item.actual_bumbu ?? '-'}
                    </span>

                    <span className="text-xs text-slate-400">
                      ACT
                    </span>

                  </div>

                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 min-w-[150px]">

                  <p className="text-xs font-bold text-slate-500">
                    Minyak
                  </p>

                  <div className="flex items-center gap-3 mt-1">

                    <span className="font-black text-slate-800">
                      {item.minyak || 0}
                    </span>

                    <span className="text-xs text-slate-400">
                      RQS
                    </span>

                    <span className="text-slate-300">
                      /
                    </span>

                    <span className="font-black text-blue-700">
                      {item.actual_minyak ?? '-'}
                    </span>

                    <span className="text-xs text-slate-400">
                      ACT
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* OPERATOR */}

            <div className="lg:min-w-[180px]">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                OPERATOR
              </p>

              <p className="font-bold text-slate-700 mt-1">
                {item.operator || 'Operator'}
              </p>

            </div>

            {/* UPDATE */}

            <div className="lg:min-w-[190px]">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                UPDATE TERAKHIR
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1">

                {isRequest
                  ? formatDateTime(
                      item.confirmed_at ||
                      item.started_at ||
                      item.created_at
                    )
                  : formatDateTime(
                      item.received_at ||
                      item.started_at ||
                      item.created_at
                    )}

              </p>

            </div>

          </div>

          {/* KETERANGAN */}

          {item.description && (

            <div className="mt-4 px-4 py-3 bg-slate-50 rounded-2xl">

              <p className="text-[10px] font-black tracking-wider text-slate-400">
                KETERANGAN
              </p>

              <p className="text-sm text-slate-600 mt-1">
                {item.description}
              </p>

            </div>

          )}

        </div>

      </div>
    )
  }

  // =====================================================
  // ROLE
  // =====================================================

  const backPath = '/admin'

  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-5 sm:px-7">

          <div className="flex items-center justify-between py-5">

            {/* LOGO */}

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

            {/* SISTEM */}

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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 00-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-.688-.057-1.362-.164-2.016z"
                  />
                </svg>

              </div>

            </div>

          </div>

          {/* HEADER BAWAH */}

          <div className="border-t border-slate-100 py-3">

            <div className="flex items-center justify-between">

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
                    Admin Teknik
                  </p>

                  <p className="text-xs font-bold text-slate-500">
                    Riwayat Transaksi
                  </p>

                </div>

              </div>

              {/* KANAN */}

              <div className="flex items-center gap-4">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-green-500" />

                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wide">
                    Sistem Online
                  </span>

                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">

                  <span className="text-[10px] font-black text-slate-400">
                    TOTAL
                  </span>

                  <span className="text-sm font-black text-blue-700">
                    {filteredHistory.length}
                  </span>

                </div>

                <button
                  onClick={() =>
                    navigate(backPath)
                  }
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-blue-700 transition-all"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>

                  </div>

                  <span className="hidden sm:inline">
                    Kembali
                  </span>

                </button>

              </div>

            </div>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <main className="max-w-7xl mx-auto px-5 py-7">

        <div className="mb-5">

          <h2 className="text-xl font-extrabold text-slate-800">
            Riwayat Transaksi
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Lihat dan cari seluruh riwayat request dan return barang.
          </p>

        </div>

        {/* SEARCH + FILTER */}

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm mb-5">

          <div className="flex flex-col lg:flex-row gap-4">

            {/* SEARCH */}

            <div className="flex-1">

              <label className="block text-xs font-black text-slate-500 mb-2">
                CARI TRANSAKSI
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Cari nomor request, line, shift, operator, tanggal, bulan, tahun, hari, atau jam..."
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                />

                {search && (

                  <button
                    onClick={() =>
                      setSearch('')
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-200 text-slate-500 hover:bg-slate-300 font-bold"
                  >
                    ×
                  </button>

                )}

              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                Contoh: <b>16</b>, <b>shift 1</b>, <b>REQ-001</b>, <b>operator</b>, <b>21/09/2026</b>, <b>kamis</b>, <b>september</b>, atau <b>14:30</b>
              </p>

            </div>

            {/* FILTER */}

            <div className="lg:w-64">

              <label className="block text-xs font-black text-slate-500 mb-2">
                JENIS TRANSAKSI
              </label>

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >

                <option value="all">
                  Semua Transaksi
                </option>

                <option value="request">
                  Request Barang
                </option>

                <option value="return">
                  Return Barang
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* HASIL PENCARIAN */}

        {search.trim() && (

          <div className="mb-5 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">

            <p className="text-sm font-bold text-blue-700">

              Hasil pencarian untuk:

              <span className="ml-1 font-black">
                "{search}"
              </span>

            </p>

            <p className="text-xs text-blue-500 mt-1">

              Ditemukan {filteredHistory.length} transaksi yang sesuai.

            </p>

          </div>

        )}

        {/* SUMMARY */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

          <div className="bg-white rounded-3xl border border-slate-200 p-4">

            <p className="text-[10px] font-black tracking-wider text-slate-400">
              HASIL DITAMPILKAN
            </p>

            <p className="text-2xl font-black text-slate-800 mt-1">
              {filteredHistory.length}
            </p>

          </div>

          <div className="bg-green-50 rounded-3xl border border-green-100 p-4">

            <p className="text-[10px] font-black tracking-wider text-green-600">
              REQUEST
            </p>

            <p className="text-2xl font-black text-green-700 mt-1">

              {
                filteredHistory.filter(
                  (item) =>
                    item.type === 'request'
                ).length
              }

            </p>

          </div>

          <div className="bg-red-50 rounded-3xl border border-red-100 p-4">

            <p className="text-[10px] font-black tracking-wider text-red-600">
              RETURN
            </p>

            <p className="text-2xl font-black text-red-700 mt-1">

              {
                filteredHistory.filter(
                  (item) =>
                    item.type === 'return'
                ).length
              }

            </p>

          </div>

        </div>

        {/* HISTORY */}

        {filteredHistory.length > 0 ? (

          <div className="space-y-4">

            {filteredHistory.map(
              (item, index) => (

                <HistoryItem
                  key={
                    item.id
                      ? `${item.type}-${item.id}`
                      : `${item.type}-${item.request_number || item.return_number}-${index}`
                  }
                  item={item}
                />

              )
            )}

          </div>

        ) : (

          <div className="bg-white rounded-3xl border border-slate-200 py-16 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
              🔍
            </div>

            <h3 className="font-extrabold text-slate-700 mt-4">
              Tidak ada hasil
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Tidak ditemukan riwayat yang sesuai dengan pencarian.
            </p>

            {search && (

              <button
                onClick={() =>
                  setSearch('')
                }
                className="mt-4 px-4 py-2 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800"
              >
                Reset Pencarian
              </button>

            )}

          </div>

        )}

      </main>

    </div>
  )
}

export default AdminHistory