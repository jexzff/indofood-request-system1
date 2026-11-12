import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const navigate = useNavigate()

  const [history, setHistory] = useState([])

  const lines = Array.from(
    { length: 11 },
    (_, index) => index + 16
  )

  // =====================================================
  // STATUS NORMALIZER
  // =====================================================

  const normalizeStatus = (item) => {
    if (!item) return ''

    // REQUEST
    if (item.type === 'request') {
      if (
        item.status === 'Confirmed' ||
        item.confirmed === true ||
        item.request_status === 'Confirmed'
      ) {
        return 'Confirmed'
      }

      return item.status || 'Processing'
    }

    // RETURN
    if (item.type === 'return') {
      if (
        item.status === 'Confirmed' ||
        item.status === 'Received' ||
        item.confirmed === true ||
        item.received === true ||
        item.return_status === 'Received'
      ) {
        return 'Received'
      }

      return item.status || 'Processing'
    }

    return item.status || 'Processing'
  }

  // =====================================================
  // AMBIL ARRAY DARI LOCAL STORAGE
  // =====================================================

  const getStorageArray = (key) => {
    try {
      const saved = localStorage.getItem(key)

      if (!saved) {
        return []
      }

      const parsed = JSON.parse(saved)

      return Array.isArray(parsed)
        ? parsed
        : []
    } catch (error) {
      console.error(
        `Gagal membaca localStorage: ${key}`,
        error
      )

      return []
    }
  }

  // =====================================================
  // CARI SEMUA DATA RETURN
  //
  // return operator bisa saja disimpan dengan nama
  // indofood_returns / returns / returnHistory
  // =====================================================

  const getReturnData = () => {
    const possibleKeys = [
      'indofood_returns',
      'returns',
      'returnHistory',
      'indofood_return_history'
    ]

    const allReturns = []

    possibleKeys.forEach((key) => {
      const data = getStorageArray(key)

      data.forEach((item) => {
        if (!item) return

        allReturns.push({
          ...item,
          type: 'return',
          status: normalizeStatus({
            ...item,
            type: 'return'
          })
        })
      })
    })

    return allReturns
  }

  // =====================================================
  // BUAT RECORD DARI REQUEST YANG SUDAH CONFIRM
  // =====================================================

  const syncConfirmedRecords = (requests) => {
    const savedRecords =
      getStorageArray(
        'indofood_records'
      )

    const records = [...savedRecords]

    requests
      .filter(
        (item) =>
          item &&
          item.type === 'request' &&
          normalizeStatus(item) === 'Confirmed'
      )
      .forEach((request) => {

        // =================================================
        // CEK REQUEST SUDAH PERNAH DIBUAT RECORD
        // =================================================

        const alreadyExists = records.some(
          (record) =>
            String(record.request_id) ===
            String(request.id)
        )

        if (alreadyExists) {
          return
        }

        // =================================================
        // DATA DASAR
        // =================================================

        const baseRecord = {
          request_id:
            request.id,

          request_number:
            request.request_number ||
            request.requestNumber ||
            '-',

          line:
            request.line ||
            '-',

          shift:
            request.shift ||
            '-',

          operator:
            request.operator ||
            'Operator',

          createdAt:
            request.created_at ||
            request.createdAt ||
            new Date().toISOString(),

          confirmed_at:
            request.confirmed_at ||
            new Date().toISOString(),

          no_po:
            request.no_po ||
            request.noPO ||
            '-',

          flavour:
            request.flavour ||
            request.flavor ||
            'INDOMIE SOTO',

          jam_kirim:
            request.jam_kirim ||
            request.request_time ||
            request.time ||
            '-',

          status:
            'Confirmed'
        }

        // =================================================
        // BUMBU
        // =================================================

        const bumbu =
          Number(
            request.bumbu || 0
          )

        if (bumbu > 0) {
          records.push({
            ...baseRecord,

            id:
              `${request.id}-bumbu`,

            jenis:
              'BUMBU',

            rqs:
              bumbu,

            act:
              request.actual_bumbu ??
              request.actual ??
              0,

            jam:
              request.actual_bumbu_time ||
              request.jam ||
              '-'
          })
        }

        // =================================================
        // MINYAK
        // =================================================

        const minyak =
          Number(
            request.minyak || 0
          )

        if (minyak > 0) {
          records.push({
            ...baseRecord,

            id:
              `${request.id}-minyak`,

            jenis:
              'MINYAK',

            rqs:
              minyak,

            act:
              request.actual_minyak ??
              request.actual ??
              0,

            jam:
              request.actual_minyak_time ||
              request.jam ||
              '-'
          })
        }
      })

    // =====================================================
    // SIMPAN RECORD
    // =====================================================

    localStorage.setItem(
      'indofood_records',
      JSON.stringify(records)
    )

    return records
  }

  // =====================================================
  // SINKRONISASI HISTORY
  //
  // SUMBER DATA:
  // 1. indofood_requests
  // 2. indofood_returns
  // 3. returns
  // 4. returnHistory
  // 5. indofood_return_history
  // 6. requestHistory lama
  // =====================================================

  const syncHistory = () => {

    // ===================================================
    // REQUEST
    // ===================================================

    const requests =
      getStorageArray(
        'indofood_requests'
      )

    // ===================================================
    // RETURN
    // ===================================================

    const returnData =
      getReturnData()

    // ===================================================
    // HISTORY LAMA
    // ===================================================

    const oldHistory =
      getStorageArray(
        'requestHistory'
      )

    // ===================================================
    // BUAT RECORD REQUEST CONFIRM
    // ===================================================

    syncConfirmedRecords(
      requests
    )

    // ===================================================
    // HISTORY MAP
    // ===================================================

    const historyMap =
      new Map()

    // ===================================================
    // MASUKKAN HISTORY LAMA
    // ===================================================

    oldHistory.forEach(
      (item, index) => {

        if (!item) {
          return
        }

        /*
         * kalau id ada gunakan id.
         * kalau tidak ada gunakan kombinasi
         * type + index supaya tidak hilang.
         */

        const key =
          item.id !== undefined
            ? `${item.type || 'unknown'}-${item.id}`
            : `${item.type || 'unknown'}-old-${index}`

        historyMap.set(
          String(key),
          {
            ...item,
            status:
              normalizeStatus(item)
          }
        )
      }
    )

    // ===================================================
    // MASUKKAN SEMUA REQUEST
    // ===================================================

    requests.forEach(
      (item, index) => {

        if (!item) {
          return
        }

        const key =
          item.id !== undefined
            ? `request-${item.id}`
            : `request-old-${index}`

        historyMap.set(
          String(key),
          {
            ...(historyMap.get(
              String(key)
            ) || {}),

            ...item,

            type:
              'request',

            status:
              normalizeStatus(item)
          }
        )
      }
    )

    // ===================================================
    // MASUKKAN SEMUA RETURN
    // ===================================================

    returnData.forEach(
      (item, index) => {

        if (!item) {
          return
        }

        /*
         * beberapa data operator mungkin memakai
         * id, return_id, atau request_number.
         */

        const uniqueId =
          item.id ??
          item.return_id ??
          item.returnId ??
          item.request_number ??
          item.requestNumber ??
          `return-${index}`

        const key =
          `return-${uniqueId}`

        historyMap.set(
          String(key),
          {
            ...(historyMap.get(
              String(key)
            ) || {}),

            ...item,

            type:
              'return',

            status:
              normalizeStatus({
                ...item,
                type: 'return'
              })
          }
        )
      }
    )

    // ===================================================
    // HASIL AKHIR
    // ===================================================

    const mergedHistory =
      Array.from(
        historyMap.values()
      )

    // ===================================================
    // URUTKAN DARI DATA TERBARU
    // ===================================================

    mergedHistory.sort(
      (a, b) => {

        const dateA =
          new Date(
            a.confirmed_at ||
            a.received_at ||
            a.created_at ||
            a.createdAt ||
            a.date ||
            0
          ).getTime()

        const dateB =
          new Date(
            b.confirmed_at ||
            b.received_at ||
            b.created_at ||
            b.createdAt ||
            b.date ||
            0
          ).getTime()

        return dateB - dateA
      }
    )

    // ===================================================
    // SIMPAN KE REQUEST HISTORY
    // ===================================================

    localStorage.setItem(
      'requestHistory',
      JSON.stringify(
        mergedHistory
      )
    )

    // ===================================================
    // EVENT UPDATE
    // ===================================================

    window.dispatchEvent(
      new Event(
        'indofood-data-updated'
      )
    )

    return mergedHistory
  }

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadHistory = () => {

    const mergedHistory =
      syncHistory()

    setHistory(
      mergedHistory
    )
  }

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {

    loadHistory()

    const interval =
      setInterval(() => {
        loadHistory()
      }, 500)

    return () => {
      clearInterval(
        interval
      )
    }

  }, [])

  // =====================================================
  // DATA PER LINE
  // =====================================================

  const getLineData = (line) => {

    const lineData =
      history.filter(
        (item) =>
          Number(item.line) ===
          Number(line)
      )

    // =================================================
    // SEMUA REQUEST
    // =================================================

    const requests =
      lineData.filter(
        (item) =>
          item.type === 'request'
      )

    // =================================================
    // SEMUA RETURN
    // =================================================

    const returns =
      lineData.filter(
        (item) =>
          item.type === 'return'
      )

    // =================================================
    // REQUEST MENUNGGU
    // =================================================

    const pendingRequests =
      requests.filter(
        (item) =>
          normalizeStatus(item) !==
          'Confirmed'
      )

    // =================================================
    // RETURN MENUNGGU
    // =================================================

    const pendingReturns =
      returns.filter(
        (item) =>
          normalizeStatus(item) !==
          'Received'
      )

    // =================================================
    // REQUEST SELESAI
    // =================================================

    const hasConfirmedRequest =
      requests.some(
        (item) =>
          normalizeStatus(item) ===
          'Confirmed'
      )

    // =================================================
    // RETURN SELESAI
    // =================================================

    const hasReceivedReturn =
      returns.some(
        (item) =>
          normalizeStatus(item) ===
          'Received'
      )

    // =================================================
    // LAMPU REQUEST
    // =================================================

    const hasPendingRequest =
      pendingRequests.length > 0

    // =================================================
    // LAMPU RETURN
    // =================================================

    const hasPendingReturn =
      pendingReturns.length > 0

    // =================================================
    // STATUS TEXT
    // =================================================

    let statusText =
      'Kosong'

    if (
      requests.length === 0 &&
      returns.length === 0
    ) {

      statusText =
        'Kosong'

    } else if (
      requests.length > 0 &&
      returns.length > 0 &&
      !hasPendingRequest &&
      !hasPendingReturn
    ) {

      statusText =
        'Request diterima & Return diterima'

    } else if (
      hasConfirmedRequest &&
      !hasPendingRequest &&
      !hasPendingReturn
    ) {

      statusText =
        'Request diterima'

    } else if (
      hasReceivedReturn &&
      !hasPendingReturn &&
      !hasPendingRequest
    ) {

      statusText =
        'Return diterima'

    } else {

      statusText =
        'Menunggu diproses'
    }

    return {
      requests,
      returns,
      pendingRequests,
      pendingReturns,
      hasPendingRequest,
      hasPendingReturn,
      hasConfirmedRequest,
      hasReceivedReturn,
      statusText
    }
  }

  // =====================================================
  // OPEN LINE
  // =====================================================

  const openLine = (line) => {
    navigate(
      `/admin/line/${line}`
    )
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      'loginRole'
    )

    sessionStorage.removeItem(
      'loginRole'
    )

    sessionStorage.removeItem(
      'isLoggedIn'
    )

    navigate(
      '/login'
    )
  }

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-5 sm:px-7">

          <div className="flex items-center justify-between py-5">

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
                    Stock Keeper
                  </p>

                  <p className="text-xs font-bold text-slate-500">
                    Dashboard
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-green-500" />

                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wide">
                    Sistem Online
                  </span>

                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">

                  <span className="text-[10px] font-black text-slate-400">
                    TOTAL LINE
                  </span>

                  <span className="text-sm font-black text-blue-700">
                    {lines.length}
                  </span>

                </div>

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


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-5 py-7">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

          <div>

            <h2 className="text-xl font-extrabold text-slate-800">
              Monitoring Line Produksi
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Pilih line untuk melihat request atau return yang masuk.
            </p>

          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-2xl border border-slate-200">

            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-green-500" />

              <span className="text-xs font-bold text-slate-600">
                REQUEST
              </span>

            </div>

            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-red-500" />

              <span className="text-xs font-bold text-slate-600">
                RETURN
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            HISTORY
        ================================================= */}

        <div className="mb-6">

          <button
            onClick={() =>
              navigate(
                '/admin/history'
              )
            }
            className="w-full bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left"
          >

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">

                  <span className="text-xl font-extrabold text-blue-700">
                    ↺
                  </span>

                </div>

                <div>

                  <p className="text-xs font-bold tracking-wider text-blue-500">
                    HISTORY
                  </p>

                  <h3 className="text-lg font-extrabold text-slate-800 mt-1">
                    Riwayat Transaksi
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Lihat seluruh riwayat request dan return barang.
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <div className="hidden sm:block text-right">

                  <p className="text-xs text-slate-400 font-bold">
                    TOTAL TRANSAKSI
                  </p>

                  <p className="text-xl font-extrabold text-blue-700">
                    {history.length}
                  </p>

                </div>

                <span className="text-slate-300 text-2xl">
                  →
                </span>

              </div>

            </div>

          </button>

        </div>


        {/* =================================================
            LINE CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

          {lines.map((line) => {

            const data =
              getLineData(line)

            const {
              pendingRequests,
              pendingReturns,
              hasPendingRequest,
              hasPendingReturn,
              statusText
            } = data

            const total =
              pendingRequests.length +
              pendingReturns.length

            return (

              <button
                key={line}
                onClick={() =>
                  openLine(line)
                }
                className="text-left bg-white rounded-3xl border border-slate-200 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-sm"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[11px] font-bold tracking-wider text-slate-400">
                      LINE PRODUKSI
                    </p>

                    <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                      {line}
                    </h3>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="flex flex-col items-center">

                      <span
                        className={`indicator-light ${
                          hasPendingRequest
                            ? 'indicator-request'
                            : 'indicator-off'
                        }`}
                      />

                      <span className="text-[9px] font-bold text-slate-400 mt-1">
                        RQS
                      </span>

                    </div>

                    <div className="flex flex-col items-center">

                      <span
                        className={`indicator-light ${
                          hasPendingReturn
                            ? 'indicator-return'
                            : 'indicator-off'
                        }`}
                      />

                      <span className="text-[9px] font-bold text-slate-400 mt-1">
                        RET
                      </span>

                    </div>

                  </div>

                </div>


                <div
                  className={`mt-5 rounded-2xl px-4 py-3 ${
                    statusText === 'Kosong'
                      ? 'bg-slate-50'
                      : statusText === 'Request diterima'
                      ? 'bg-green-50'
                      : statusText === 'Return diterima'
                      ? 'bg-red-50'
                      : statusText === 'Request diterima & Return diterima'
                      ? 'bg-blue-50'
                      : 'bg-yellow-50'
                  }`}
                >

                  <p className="text-[10px] font-bold tracking-wider text-slate-400">
                    STATUS
                  </p>

                  <p
                    className={`text-sm font-extrabold mt-1 ${
                      statusText === 'Kosong'
                        ? 'text-slate-500'
                        : statusText === 'Request diterima'
                        ? 'text-green-700'
                        : statusText === 'Return diterima'
                        ? 'text-red-700'
                        : statusText === 'Request diterima & Return diterima'
                        ? 'text-blue-700'
                        : 'text-yellow-700'
                    }`}
                  >
                    {statusText}
                  </p>

                </div>


                <div className="mt-4 pt-4 border-t border-slate-100">

                  <div className="flex justify-between items-center">

                    <span className="text-sm text-slate-500">
                      Menunggu diproses
                    </span>

                    <span className="font-extrabold text-slate-800">
                      {total}
                    </span>

                  </div>

                  <div className="flex gap-2 mt-3">

                    <span
                      className={`flex-1 text-center py-1.5 rounded-xl text-xs font-bold ${
                        hasPendingRequest
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      RQS {pendingRequests.length}
                    </span>

                    <span
                      className={`flex-1 text-center py-1.5 rounded-xl text-xs font-bold ${
                        hasPendingReturn
                          ? 'bg-red-50 text-red-700'
                          : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      RET {pendingReturns.length}
                    </span>

                  </div>

                </div>


                <div className="flex justify-between items-center mt-4">

                  <span className="text-xs text-slate-400">
                    Klik untuk membuka
                  </span>

                  <span className="text-slate-300 text-lg">
                    →
                  </span>

                </div>

              </button>

            )
          })}

        </div>

      </main>

    </div>
  )
}

export default AdminDashboard 