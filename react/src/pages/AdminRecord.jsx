import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminRecord() {
  const navigate = useNavigate()

  const [records, setRecords] = useState([])
  const [filterLine, setFilterLine] = useState('all')
  const [filterShift, setFilterShift] = useState('all')

  // =====================================================
  // SAFE JSON
  // =====================================================

  const getStorage = (key) => {
    try {
      return JSON.parse(
        localStorage.getItem(key)
      ) || []
    } catch {
      return []
    }
  }

  // =====================================================
  // CEK REQUEST SUDAH CONFIRM
  // =====================================================

  const isConfirmedRequest = (item) => {
    if (!item) return false

    return (
      item.type === 'request' &&
      (
        item.status === 'Confirmed' ||
        item.request_status === 'Confirmed' ||
        item.confirmed === true ||
        item.button_status === 'CONFIRMED'
      )
    )
  }

  // =====================================================
  // BUAT RECORD DARI REQUEST CONFIRM
  // =====================================================

  const createRecordsFromConfirmedRequests = () => {
    const savedRecords =
      getStorage('indofood_records')

    const requestHistory =
      getStorage('requestHistory')

    const requests =
      getStorage('indofood_requests')

    // ===================================================
    // GABUNG DATA REQUEST
    // ===================================================

    const requestMap = new Map()

    ;[
      ...requestHistory,
      ...requests,
    ].forEach((item) => {
      if (
        item &&
        item.id !== undefined
      ) {
        requestMap.set(
          String(item.id),
          item
        )
      }
    })

    const allRequests =
      Array.from(
        requestMap.values()
      )

    // ===================================================
    // RECORD YANG SUDAH ADA
    // ===================================================

    const existingIds = new Set(
      savedRecords.map((item) =>
        String(item.id)
      )
    )

    const newRecords = []

    // ===================================================
    // PROSES REQUEST CONFIRM
    // ===================================================

    allRequests
      .filter(isConfirmedRequest)
      .forEach((request) => {

        const baseId =
          String(request.id)

        // =================================================
        // WAKTU
        // =================================================

        const confirmedDate =
          request.confirmed_at
            ? new Date(
                request.confirmed_at
              )
            : new Date()

        const jam =
          confirmedDate.toLocaleTimeString(
            'id-ID',
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          )

        // =================================================
        // JAM KIRIM
        // =================================================

        const jamKirim =
          request.jam_kirim ||
          request.delivery_time ||
          request.request_time ||
          request.time ||
          jam

        // =================================================
        // DATA UMUM
        // =================================================

        const commonData = {
          line:
            Number(request.line) || 0,

          shift:
            Number(request.shift) || 0,

          request_id:
            request.id,

          request_number:
            request.request_number || '-',

          no_po:
            request.no_po ||
            request.request_number ||
            '-',

          flavour:
            request.flavour ||
            request.flavor ||
            'INDOMIE SOTO',

          jam_kirim:
            jamKirim,

          jam:
            request.jam ||
            jam,

          operator:
            request.operator ||
            'Operator',

          createdAt:
            request.created_at ||
            request.confirmed_at ||
            new Date().toISOString(),

          confirmed_at:
            request.confirmed_at ||
            new Date().toISOString(),

          status:
            'Confirmed',

          source:
            'confirmed-request',
        }

        // =================================================
        // RECORD BUMBU
        // =================================================

        const rqsBumbu =
          Number(
            request.bumbu || 0
          )

        if (rqsBumbu > 0) {

          const recordId =
            `${baseId}-bumbu`

          if (
            !existingIds.has(
              recordId
            )
          ) {

            const actualBumbu =
              request.actual_bumbu ??
              request.actual ??
              0

            newRecords.push({
              ...commonData,

              id: recordId,

              jenis: 'BUMBU',

              rqs:
                rqsBumbu,

              act:
                Number(
                  actualBumbu || 0
                ),

              actual_bumbu:
                Number(
                  actualBumbu || 0
                ),

              actual:
                Number(
                  actualBumbu || 0
                ),
            })

            existingIds.add(
              recordId
            )
          }
        }

        // =================================================
        // RECORD MINYAK
        // =================================================

        const rqsMinyak =
          Number(
            request.minyak || 0
          )

        if (rqsMinyak > 0) {

          const recordId =
            `${baseId}-minyak`

          if (
            !existingIds.has(
              recordId
            )
          ) {

            const actualMinyak =
              request.actual_minyak ??
              0

            newRecords.push({
              ...commonData,

              id: recordId,

              jenis: 'MINYAK',

              rqs:
                rqsMinyak,

              act:
                Number(
                  actualMinyak || 0
                ),

              actual_minyak:
                Number(
                  actualMinyak || 0
                ),

              actual:
                Number(
                  actualMinyak || 0
                ),
            })

            existingIds.add(
              recordId
            )
          }
        }
      })

    // ===================================================
    // SIMPAN RECORD
    // ===================================================

    const mergedRecords = [
      ...newRecords,
      ...savedRecords,
    ]

    localStorage.setItem(
      'indofood_records',
      JSON.stringify(
        mergedRecords
      )
    )

    return mergedRecords
  }

  // =====================================================
  // LOAD RECORD
  // =====================================================

  const loadRecords = () => {

    // ===================================================
    // OTOMATIS BUAT RECORD DARI REQUEST YANG CONFIRM
    // ===================================================

    const syncedRecords =
      createRecordsFromConfirmedRequests()

    // ===================================================
    // SORT TERBARU
    // ===================================================

    const sorted = [
      ...syncedRecords,
    ].sort((a, b) => {

      const dateA =
        new Date(
          a.createdAt ||
          a.created_at ||
          a.confirmed_at ||
          0
        ).getTime()

      const dateB =
        new Date(
          b.createdAt ||
          b.created_at ||
          b.confirmed_at ||
          0
        ).getTime()

      return dateB - dateA
    })

    setRecords(sorted)
  }

  // =====================================================
  // EFFECT
  // =====================================================

  useEffect(() => {

    loadRecords()

    // cek setiap 500 ms
    const interval =
      setInterval(() => {
        loadRecords()
      }, 500)

    // event custom dari sistem
    const handleUpdate = () => {
      loadRecords()
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
  // DONE
  // =====================================================

  const handleDone = (id) => {

    const updated =
      records.filter(
        (item) =>
          String(item.id) !==
          String(id)
      )

    setRecords(updated)

    localStorage.setItem(
      'indofood_records',
      JSON.stringify(
        updated
      )
    )
  }

  // =====================================================
  // FILTER
  // =====================================================

  const filteredRecords =
    records.filter((item) => {

      const lineMatch =
        filterLine === 'all' ||
        String(item.line) ===
          String(filterLine)

      const shiftMatch =
        filterShift === 'all' ||
        String(item.shift) ===
          String(filterShift)

      return (
        lineMatch &&
        shiftMatch
      )
    })

  // =====================================================
  // FORMAT WAKTU
  // =====================================================

  const formatTime = (value) => {

    if (!value) {
      return '-'
    }

    return value
  }

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100 pb-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-blue-700 text-white rounded-b-[32px] shadow-lg">

        <div className="max-w-7xl mx-auto px-5 py-7">

          <button
            onClick={() =>
              navigate('/admin')
            }
            className="text-sm text-blue-100 hover:text-white mb-5"
          >
            ← Kembali ke Dashboard
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">

            <div>

              <p className="text-xs font-bold tracking-widest text-blue-200">
                INDOFOOD · DEPARTEMEN TEKNIK
              </p>

              <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
                Hasil Record
              </h1>

              <p className="text-blue-100 mt-2">
                Record hasil request dan pengiriman barang
              </p>

            </div>

            <div className="bg-white/10 rounded-2xl px-5 py-4">

              <p className="text-xs text-blue-200">
                TOTAL RECORD
              </p>

              <p className="text-3xl font-extrabold mt-1">
                {records.length}
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-5 py-7">

        {/* =================================================
            FILTER
        ================================================= */}

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm mb-6">

          <div className="flex flex-col sm:flex-row gap-4">

            {/* LINE */}

            <div className="flex-1">

              <label className="block text-xs font-extrabold text-slate-500 mb-2">
                FILTER LINE
              </label>

              <select
                value={filterLine}
                onChange={(e) =>
                  setFilterLine(
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500"
              >

                <option value="all">
                  Semua Line
                </option>

                {Array.from(
                  { length: 11 },
                  (_, index) =>
                    index + 16
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

            <div className="flex-1">

              <label className="block text-xs font-extrabold text-slate-500 mb-2">
                FILTER SHIFT
              </label>

              <select
                value={filterShift}
                onChange={(e) =>
                  setFilterShift(
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500"
              >

                <option value="all">
                  Semua Shift
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

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        {filteredRecords.length > 0 ? (

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

            {/* TABLE HEADER */}

            <div className="hidden xl:grid grid-cols-[60px_150px_180px_130px_80px_100px_80px_100px_80px_90px] bg-blue-700 text-white">

              <div className="px-3 py-4 text-xs font-extrabold text-center">
                NO
              </div>

              <div className="px-3 py-4 text-xs font-extrabold">
                NO PO
              </div>

              <div className="px-3 py-4 text-xs font-extrabold">
                FLAVOUR JENIS
              </div>

              <div className="px-3 py-4 text-xs font-extrabold">
                JENIS
              </div>

              <div className="px-3 py-4 text-xs font-extrabold text-center">
                RQS
              </div>

              <div className="px-3 py-4 text-xs font-extrabold text-center">
                JAM KIRIM
              </div>

              <div className="px-3 py-4 text-xs font-extrabold text-center">
                ACT
              </div>

              <div className="px-3 py-4 text-xs font-extrabold text-center">
                JAM
              </div>

              <div className="px-3 py-4 text-xs font-extrabold text-center">
                SHIFT
              </div>

              <div className="px-3 py-4 text-xs font-extrabold text-center">
                AKSI
              </div>

            </div>

            {/* RECORD */}

            {filteredRecords.map(
              (item, index) => (

                <div
                  key={item.id}
                  className="border-t border-slate-100 hover:bg-blue-50/40 transition"
                >

                  {/* DESKTOP */}

                  <div className="hidden xl:grid grid-cols-[60px_150px_180px_130px_80px_100px_80px_100px_80px_90px] items-center">

                    {/* NO */}

                    <div className="px-3 py-4 text-center font-extrabold text-slate-600">
                      {index + 1}
                    </div>

                    {/* PO */}

                    <div className="px-3 py-4">

                      <span className="font-bold text-slate-700">
                        {item.no_po || '-'}
                      </span>

                    </div>

                    {/* FLAVOUR */}

                    <div className="px-3 py-4">

                      <p className="font-extrabold text-slate-800">
                        {item.flavour ||
                          item.flavor ||
                          'INDOMIE SOTO'}
                      </p>

                    </div>

                    {/* JENIS */}

                    <div className="px-3 py-4">

                      <span
                        className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                          String(
                            item.jenis
                          ).toUpperCase() ===
                          'MINYAK'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.jenis ||
                          'BUMBU'}
                      </span>

                    </div>

                    {/* RQS */}

                    <div className="px-3 py-4 text-center">

                      <span className="font-extrabold text-slate-800">
                        {item.rqs ?? 0}
                      </span>

                    </div>

                    {/* JAM KIRIM */}

                    <div className="px-3 py-4 text-center">

                      <span className="font-bold text-slate-600">
                        {formatTime(
                          item.jam_kirim
                        )}
                      </span>

                    </div>

                    {/* ACT */}

                    <div className="px-3 py-4 text-center">

                      <span className="inline-flex min-w-[48px] justify-center px-3 py-2 rounded-xl bg-blue-100 text-blue-700 font-extrabold">
                        {item.act ?? 0}
                      </span>

                    </div>

                    {/* JAM */}

                    <div className="px-3 py-4 text-center">

                      <span className="font-bold text-slate-600">
                        {formatTime(
                          item.jam
                        )}
                      </span>

                    </div>

                    {/* SHIFT */}

                    <div className="px-3 py-4 text-center">

                      <span className="inline-flex w-9 h-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-extrabold">
                        {item.shift || '-'}
                      </span>

                    </div>

                    {/* DONE */}

                    <div className="px-3 py-4 text-center">

                      <button
                        onClick={() =>
                          handleDone(
                            item.id
                          )
                        }
                        className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-extrabold transition"
                      >
                        DONE
                      </button>

                    </div>

                  </div>

                  {/* =================================================
                      MOBILE / TABLET
                  ================================================= */}

                  <div className="xl:hidden p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-[10px] font-extrabold tracking-widest text-slate-400">
                          RECORD #{index + 1}
                        </p>

                        <h3 className="text-lg font-extrabold text-slate-800 mt-1">
                          {item.flavour ||
                            item.flavor ||
                            'INDOMIE SOTO'}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          NO PO:{' '}
                          {item.no_po ||
                            '-'}
                        </p>

                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 text-xs font-extrabold">
                        LINE {item.line}
                      </span>

                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">

                      {/* JENIS */}

                      <div className="bg-slate-50 rounded-2xl p-3">

                        <p className="text-[10px] font-bold text-slate-400">
                          JENIS
                        </p>

                        <p className="font-extrabold text-slate-700 mt-1">
                          {item.jenis ||
                            'BUMBU'}
                        </p>

                      </div>

                      {/* RQS */}

                      <div className="bg-slate-50 rounded-2xl p-3">

                        <p className="text-[10px] font-bold text-slate-400">
                          RQS
                        </p>

                        <p className="font-extrabold text-slate-700 mt-1">
                          {item.rqs ?? 0}
                        </p>

                      </div>

                      {/* JAM KIRIM */}

                      <div className="bg-slate-50 rounded-2xl p-3">

                        <p className="text-[10px] font-bold text-slate-400">
                          JAM KIRIM
                        </p>

                        <p className="font-extrabold text-slate-700 mt-1">
                          {item.jam_kirim ||
                            '-'}
                        </p>

                      </div>

                      {/* ACT */}

                      <div className="bg-blue-50 rounded-2xl p-3">

                        <p className="text-[10px] font-bold text-blue-500">
                          ACT
                        </p>

                        <p className="font-extrabold text-blue-700 mt-1">
                          {item.act ?? 0}
                        </p>

                      </div>

                      {/* JAM */}

                      <div className="bg-slate-50 rounded-2xl p-3">

                        <p className="text-[10px] font-bold text-slate-400">
                          JAM
                        </p>

                        <p className="font-extrabold text-slate-700 mt-1">
                          {item.jam || '-'}
                        </p>

                      </div>

                      {/* SHIFT */}

                      <div className="bg-slate-50 rounded-2xl p-3">

                        <p className="text-[10px] font-bold text-slate-400">
                          SHIFT
                        </p>

                        <p className="font-extrabold text-slate-700 mt-1">
                          {item.shift ||
                            '-'}
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        handleDone(
                          item.id
                        )
                      }
                      className="w-full mt-4 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold transition"
                    >
                      ✓ DONE — HAPUS RECORD
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="bg-white rounded-[32px] border border-slate-200 py-20 text-center shadow-sm">

            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center text-4xl">
              📋
            </div>

            <h2 className="text-xl font-extrabold text-slate-700 mt-5">
              Belum ada hasil record
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              Request yang sudah dikonfirmasi akan muncul di sini.
            </p>

          </div>

        )}

        {/* =================================================
            BOTTOM BUTTON
        ================================================= */}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">

          <button
            onClick={() =>
              navigate('/admin')
            }
            className="flex-1 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold transition"
          >
            ← Dashboard Admin
          </button>

          <button
            onClick={() =>
              navigate('/admin/history')
            }
            className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold transition"
          >
            Riwayat Transaksi
          </button>

        </div>

      </main>

    </div>
  )
}

export default AdminRecord