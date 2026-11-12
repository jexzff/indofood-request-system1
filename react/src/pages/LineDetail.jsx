import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function LineDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const lineNumber = Number(id)

  const [records, setRecords] = useState([])
  const [currentTime, setCurrentTime] = useState('')

  // =====================================================
  // GET STORAGE
  // =====================================================

  const getStorageArray = (key) => {
    try {
      const data = JSON.parse(localStorage.getItem(key))
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  }

  // =====================================================
  // GET UNIQUE KEY
  // =====================================================

  const getRecordKey = (item) => {
    const type =
      item.type === 'return'
        ? 'return'
        : 'request'

    const idValue =
      item.id !== undefined &&
      item.id !== null
        ? String(item.id)
        : ''

    /*
      kalau id kosong, gunakan kombinasi
      data penting supaya tetap unik
    */

    if (!idValue) {
      return [
        type,
        item.line || '',
        item.no_po || item.noPO || item.po || '',
        item.shift || '',
        item.created_at || item.createdAt || '',
      ].join('-')
    }

    return `${type}-${idValue}`
  }

  // =====================================================
  // LOAD DATA REQUEST + RETURN
  // =====================================================

  const loadRecords = () => {
    // ---------------------------------------------------
    // REQUEST
    // ---------------------------------------------------

    const requestData =
      getStorageArray('indofood_requests').map(
        (item) => ({
          ...item,
          type: 'request',
        })
      )

    // ---------------------------------------------------
    // RETURN
    // ---------------------------------------------------

    const returnKeys = [
      'indofood_returns',
      'returnHistory',
      'operator_returns',
      'returns',
    ]

    let returnData = []

    returnKeys.forEach((key) => {
      const data = getStorageArray(key)

      returnData = [
        ...returnData,
        ...data.map((item) => ({
          ...item,
          type: 'return',
        })),
      ]
    })

    // ---------------------------------------------------
    // GABUNG
    // ---------------------------------------------------

    const allData = [
      ...requestData,
      ...returnData,
    ]

    // ---------------------------------------------------
    // HILANGKAN DUPLIKAT
    // ---------------------------------------------------

    const uniqueMap = new Map()

    allData.forEach((item) => {
      const key = getRecordKey(item)

      /*
        Kalau data yang sama muncul di beberapa
        storage return, jangan ditampilkan berkali-kali.
      */

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item)
      } else {
        /*
          gabungkan data terbaru supaya status,
          ACT, receive, dll tetap ikut.
        */

        uniqueMap.set(
          key,
          {
            ...uniqueMap.get(key),
            ...item,
          }
        )
      }
    })

    // ---------------------------------------------------
    // FILTER LINE
    // ---------------------------------------------------

    const lineData =
      Array.from(uniqueMap.values()).filter(
        (item) =>
          Number(item.line) === lineNumber
      )

    // ---------------------------------------------------
    // FORMAT
    // ---------------------------------------------------

    const formatted =
      lineData.map((item) => ({
        ...item,

        type:
          item.type === 'return'
            ? 'return'
            : 'request',

        actual_bumbu:
          item.actual_bumbu === null ||
          item.actual_bumbu === undefined ||
          item.actual_bumbu === ''
            ? ''
            : Number(item.actual_bumbu),

        actual_minyak:
          item.actual_minyak === null ||
          item.actual_minyak === undefined ||
          item.actual_minyak === ''
            ? ''
            : Number(item.actual_minyak),

        confirmed_bumbu:
          item.confirmed_bumbu === true,

        confirmed_minyak:
          item.confirmed_minyak === true,

        received_bumbu:
          item.received_bumbu === true,

        received_minyak:
          item.received_minyak === true,

        confirmed_at_bumbu:
          item.confirmed_at_bumbu || null,

        confirmed_at_minyak:
          item.confirmed_at_minyak || null,

        received_at_bumbu:
          item.received_at_bumbu || null,

        received_at_minyak:
          item.received_at_minyak || null,
      }))

    /*
      return paling baru ditaruh lebih atas
      tanpa mengganggu urutan data lainnya.
    */

    formatted.sort((a, b) => {
      const aTime =
        new Date(
          a.created_at ||
          a.createdAt ||
          0
        ).getTime()

      const bTime =
        new Date(
          b.created_at ||
          b.createdAt ||
          0
        ).getTime()

      return bTime - aTime
    })

    setRecords(formatted)
  }

  // =====================================================
  // AUTO LOAD
  // =====================================================

  useEffect(() => {
    loadRecords()

    const dataTimer = setInterval(() => {
      loadRecords()
    }, 500)

    const clockTimer = setInterval(() => {
      const now = new Date()

      setCurrentTime(
        now.toLocaleTimeString(
          'id-ID',
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        )
      )
    }, 1000)

    return () => {
      clearInterval(dataTimer)
      clearInterval(clockTimer)
    }
  }, [lineNumber])

  // =====================================================
  // RQS
  // =====================================================

  const getRqs = (item, jenis) => {
    if (jenis === 'BUMBU') {
      return Number(item.bumbu || 0)
    }

    return Number(item.minyak || 0)
  }

  // =====================================================
  // ACT
  // =====================================================

  const getAct = (item, jenis) => {
    if (jenis === 'BUMBU') {
      return item.actual_bumbu === ''
        ? ''
        : Number(item.actual_bumbu || 0)
    }

    return item.actual_minyak === ''
      ? ''
      : Number(item.actual_minyak || 0)
  }

  // =====================================================
  // RECORD KEY
  // =====================================================

  const isSameRecord = (
    item,
    targetId,
    targetType
  ) => {
    return (
      String(item.id) === String(targetId) &&
      item.type === targetType
    )
  }

  // =====================================================
  // CEK CONFIRM / RECEIVE
  // =====================================================

  const isJenisConfirmed = (
    item,
    jenis
  ) => {
    if (item.type === 'return') {
      return jenis === 'BUMBU'
        ? item.received_bumbu === true
        : item.received_minyak === true
    }

    return jenis === 'BUMBU'
      ? item.confirmed_bumbu === true
      : item.confirmed_minyak === true
  }

  // =====================================================
  // UPDATE ACT
  // =====================================================

  const updateActual = (
    itemId,
    itemType,
    jenis,
    value
  ) => {
    let number =
      value === ''
        ? ''
        : Number(value)

    const item =
      records.find(
        (record) =>
          isSameRecord(
            record,
            itemId,
            itemType
          )
      )

    if (!item) return

    // -----------------------------------------------
    // SUDAH CONFIRM / RECEIVE
    // -----------------------------------------------

    if (
      isJenisConfirmed(
        item,
        jenis
      )
    ) {
      return
    }

    // -----------------------------------------------
    // VALIDASI ANGKA
    // -----------------------------------------------

    if (number !== '') {
      if (Number.isNaN(number)) {
        number = 0
      }

      if (number < 0) {
        number = 0
      }

      /*
        ACT maksimal mengikuti RQS.
        Kalau RQS 10, ACT maksimal 10.
      */

      const rqs =
        getRqs(
          item,
          jenis
        )

      if (number > rqs) {
        number = rqs
      }
    }

    // -----------------------------------------------
    // UPDATE
    // -----------------------------------------------

    const updated =
      records.map((record) => {
        if (
          !isSameRecord(
            record,
            itemId,
            itemType
          )
        ) {
          return record
        }

        if (jenis === 'BUMBU') {
          return {
            ...record,
            actual_bumbu: number,
          }
        }

        return {
          ...record,
          actual_minyak: number,
        }
      })

    setRecords(updated)

    saveAllData(updated)
  }

  // =====================================================
  // CEK SEMUA JENIS
  // =====================================================

  const isAllConfirmed = (item) => {
    const bumbuRqs =
      Number(item.bumbu || 0)

    const minyakRqs =
      Number(item.minyak || 0)

    let bumbuDone
    let minyakDone

    if (item.type === 'return') {
      bumbuDone =
        bumbuRqs <= 0 ||
        item.received_bumbu === true

      minyakDone =
        minyakRqs <= 0 ||
        item.received_minyak === true
    } else {
      bumbuDone =
        bumbuRqs <= 0 ||
        item.confirmed_bumbu === true

      minyakDone =
        minyakRqs <= 0 ||
        item.confirmed_minyak === true
    }

    return (
      bumbuDone &&
      minyakDone
    )
  }

  // =====================================================
  // SAVE ALL DATA
  // =====================================================

  const saveAllData = (updatedRecords) => {
    // ===================================================
    // REQUEST
    // ===================================================

    const adminRequests =
      getStorageArray(
        'indofood_requests'
      )

    const requestChanges =
      new Map()

    updatedRecords
      .filter(
        (item) =>
          item.type !== 'return'
      )
      .forEach((item) => {
        requestChanges.set(
          String(item.id),
          item
        )
      })

    const updatedRequests =
      adminRequests.map((item) => {
        const changed =
          requestChanges.get(
            String(item.id)
          )

        if (!changed) {
          return item
        }

        return {
          ...item,
          ...changed,
          type: undefined,
        }
      }).map((item) => {
        const clean = { ...item }
        delete clean.type
        return clean
      })

    localStorage.setItem(
      'indofood_requests',
      JSON.stringify(
        updatedRequests
      )
    )

    // ===================================================
    // RETURN
    // ===================================================

    const returnKeys = [
      'indofood_returns',
      'returnHistory',
      'operator_returns',
      'returns',
    ]

    const returnChanges =
      new Map()

    updatedRecords
      .filter(
        (item) =>
          item.type === 'return'
      )
      .forEach((item) => {
        returnChanges.set(
          String(item.id),
          item
        )
      })

    returnKeys.forEach((key) => {
      const oldData =
        getStorageArray(key)

      if (!oldData.length) {
        return
      }

      const updatedReturn =
        oldData.map((item) => {
          const changed =
            returnChanges.get(
              String(item.id)
            )

          if (!changed) {
            return item
          }

          const cleanChanged = {
            ...changed,
          }

          delete cleanChanged.type

          return {
            ...item,
            ...cleanChanged,
          }
        })

      localStorage.setItem(
        key,
        JSON.stringify(
          updatedReturn
        )
      )
    })

    // ===================================================
    // HISTORY
    // ===================================================

    const oldHistory =
      getStorageArray(
        'requestHistory'
      )

    const historyMap =
      new Map()

    oldHistory.forEach((item) => {
      const key =
        getRecordKey({
          ...item,
          type:
            item.type === 'return'
              ? 'return'
              : 'request',
        })

      historyMap.set(
        key,
        item
      )
    })

    updatedRecords.forEach((item) => {
      const key =
        getRecordKey(item)

      const old =
        historyMap.get(key) || {}

      const cleanItem = {
        ...item,
      }

      delete cleanItem.type

      historyMap.set(
        key,
        {
          ...old,
          ...cleanItem,
          type: item.type,
        }
      )
    })

    localStorage.setItem(
      'requestHistory',
      JSON.stringify(
        Array.from(
          historyMap.values()
        )
      )
    )
  }

  // =====================================================
  // CONFIRM / RECEIVE
  // =====================================================

  const confirmRecord = (
    itemId,
    itemType,
    jenis
  ) => {
    const item =
      records.find(
        (record) =>
          isSameRecord(
            record,
            itemId,
            itemType
          )
      )

    if (!item) return

    // -----------------------------------------------
    // SUDAH SELESAI
    // -----------------------------------------------

    if (
      isJenisConfirmed(
        item,
        jenis
      )
    ) {
      return
    }

    const rqs =
      getRqs(
        item,
        jenis
      )

    const act =
      getAct(
        item,
        jenis
      )

    // -----------------------------------------------
    // WAJIB ISI ACT
    // -----------------------------------------------

    if (
      rqs > 0 &&
      (
        act === '' ||
        act === null ||
        act === undefined
      )
    ) {
      alert(
        `isi ACT ${jenis.toLowerCase()} terlebih dahulu.`
      )

      return
    }

    // -----------------------------------------------
    // VALIDASI ACT
    // -----------------------------------------------

    if (
      Number(act) > rqs
    ) {
      alert(
        `ACT ${jenis.toLowerCase()} tidak boleh lebih dari RQS.`
      )

      return
    }

    if (
      Number(act) < 0
    ) {
      alert(
        `ACT ${jenis.toLowerCase()} tidak boleh kurang dari 0.`
      )

      return
    }

    const now =
      new Date()

    const time =
      now.toLocaleTimeString(
        'id-ID',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      )

    const fullTime =
      now.toLocaleString(
        'id-ID'
      )

    // -----------------------------------------------
    // UPDATE
    // -----------------------------------------------

    const updated =
      records.map((record) => {
        if (
          !isSameRecord(
            record,
            itemId,
            itemType
          )
        ) {
          return record
        }

        const result = {
          ...record,
        }

        // =============================================
        // BUMBU
        // =============================================

        if (
          jenis === 'BUMBU'
        ) {
          result.actual_bumbu =
            Number(act)

          if (
            record.type === 'return'
          ) {
            result.received_bumbu =
              true

            result.received_at_bumbu =
              fullTime
          } else {
            result.confirmed_bumbu =
              true

            result.confirmed_at_bumbu =
              fullTime
          }
        }

        // =============================================
        // MINYAK
        // =============================================

        if (
          jenis === 'MINYAK'
        ) {
          result.actual_minyak =
            Number(act)

          if (
            record.type === 'return'
          ) {
            result.received_minyak =
              true

            result.received_at_minyak =
              fullTime
          } else {
            result.confirmed_minyak =
              true

            result.confirmed_at_minyak =
              fullTime
          }
        }

        // =============================================
        // STATUS
        // =============================================

        const allDone =
          isAllConfirmed(result)

        if (allDone) {
          if (
            record.type === 'return'
          ) {
            result.status =
              'Received'

            result.received =
              true

            result.confirmed =
              false
          } else {
            result.status =
              'Confirmed'

            result.confirmed =
              true

            result.received =
              false
          }

          result.confirmed_at =
            fullTime

          result.jam =
            time
        } else {
          result.status =
            'Processing'

          result.confirmed =
            false

          result.received =
            false
        }

        return result
      })

    setRecords(updated)

    saveAllData(updated)
  }

  // =====================================================
  // TOTAL BUMBU
  // =====================================================

  const totalBumbuRqs =
    records.reduce(
      (total, item) =>
        total +
        Number(item.bumbu || 0),
      0
    )

  const totalBumbuAct =
    records.reduce(
      (total, item) =>
        total +
        Number(
          item.actual_bumbu || 0
        ),
      0
    )

  // =====================================================
  // TOTAL MINYAK
  // =====================================================

  const totalMinyakRqs =
    records.reduce(
      (total, item) =>
        total +
        Number(item.minyak || 0),
      0
    )

  const totalMinyakAct =
    records.reduce(
      (total, item) =>
        total +
        Number(
          item.actual_minyak || 0
        ),
      0
    )

  // =====================================================
  // FORMAT JAM
  // =====================================================

  const getTime = (item) => {
    if (item.time) {
      return item.time
    }

    if (item.jam) {
      return item.jam
    }

    if (item.created_at) {
      return new Date(
        item.created_at
      ).toLocaleTimeString(
        'id-ID',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    }

    return '-'
  }

  // =====================================================
  // JAM SELESAI
  // =====================================================

  const getConfirmedTime = (
    item,
    jenis
  ) => {
    if (
      jenis === 'BUMBU'
    ) {
      return (
        item.confirmed_at_bumbu ||
        item.received_at_bumbu ||
        '--:--'
      )
    }

    return (
      item.confirmed_at_minyak ||
      item.received_at_minyak ||
      '--:--'
    )
  }

  // =====================================================
  // CREATE ROWS
  // =====================================================

  const createRows = (jenis) => {
    const rows = []

    records.forEach((item) => {
      const rqs =
        getRqs(
          item,
          jenis
        )

      if (rqs <= 0) {
        return
      }

      rows.push({
        ...item,
        jenis,
        rqs,
      })
    })

    return rows
  }

  const bumbuRows =
    createRows('BUMBU')

  const minyakRows =
    createRows('MINYAK')

  // =====================================================
  // RENDER ROW
  // =====================================================

  const renderRow = (
    item,
    index
  ) => {
    const rqs =
      item.rqs

    const act =
      item.jenis === 'BUMBU'
        ? item.actual_bumbu
        : item.actual_minyak

    const isConfirmed =
      isJenisConfirmed(
        item,
        item.jenis
      )

    const isReturn =
      item.type === 'return'

    const statusText =
      isConfirmed
        ? isReturn
          ? '✓ RECEIVED'
          : '✓ DONE'
        : isReturn
          ? 'RECEIVE'
          : 'CONFIRM'

    return (
      <tr
        key={`${item.type}-${item.id}-${item.jenis}`}
        className={`border-b border-slate-200 transition ${
          isConfirmed
            ? 'bg-slate-50'
            : 'bg-white hover:bg-blue-50/40'
        }`}
      >

        {/* NO */}

        <td className="px-3 py-4 text-center font-extrabold text-slate-700">
          {index + 1}
        </td>

        {/* NO PO */}

        <td className="px-3 py-4">
          <div className="font-bold text-slate-700 whitespace-nowrap">
            {item.no_po ||
              item.noPO ||
              item.po ||
              '-'}
          </div>
        </td>

        {/* FLAVOR */}

        <td className="px-3 py-4">
          <div className="font-extrabold text-slate-700 whitespace-nowrap">
            {item.flavor ||
              item.flavour ||
              item.flafour ||
              'INDOMIE'}
          </div>
        </td>

        {/* JENIS */}

        <td className="px-3 py-4">
          <span
            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-extrabold ${
              item.jenis === 'BUMBU'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {item.jenis}
          </span>
        </td>

        {/* RQS */}

        <td className="px-3 py-4 text-center">
          <span className="text-lg font-extrabold text-slate-800">
            {rqs}
          </span>
        </td>

        {/* JAM KIRIM */}

        <td className="px-3 py-4 text-center">
          <span className="text-sm font-bold text-slate-600 whitespace-nowrap">
            {getTime(item)}
          </span>
        </td>

        {/* ACT */}

        <td className="px-3 py-4">
          <div className="flex justify-center">
            <input
              type="number"
              min="0"
              max={rqs}
              step="1"
              value={
                act === ''
                  ? ''
                  : act
              }
              disabled={isConfirmed}
              placeholder="0"
              onChange={(e) =>
                updateActual(
                  item.id,
                  item.type,
                  item.jenis,
                  e.target.value
                )
              }
              className={`w-20 px-2 py-2.5 text-center rounded-xl border font-extrabold outline-none transition ${
                isConfirmed
                  ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-white border-blue-200 text-blue-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
              }`}
            />
          </div>
        </td>

        {/* JAM TERIMA */}

        <td className="px-3 py-4 text-center">
          <span
            className={`text-sm font-extrabold whitespace-nowrap ${
              isConfirmed
                ? 'text-green-600'
                : 'text-slate-400'
            }`}
          >
            {getConfirmedTime(
              item,
              item.jenis
            )}
          </span>
        </td>

        {/* SHIFT */}

        <td className="px-3 py-4 text-center">
          <span className="inline-flex items-center justify-center min-w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-sm">
            {item.shift || '-'}
          </span>
        </td>

        {/* STATUS */}

        <td className="px-3 py-4">
          {isConfirmed ? (
            <span
              className={`inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap ${
                isReturn
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {statusText}
            </span>
          ) : (
            <button
              type="button"
              onClick={() =>
                confirmRecord(
                  item.id,
                  item.type,
                  item.jenis
                )
              }
              className={`px-3 py-2 rounded-xl text-white text-xs font-extrabold transition active:scale-95 ${
                isReturn
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {statusText}
            </button>
          )}
        </td>

      </tr>
    )
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-5 sm:px-7">

          <div className="flex items-center justify-between py-5">

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
                    Admin Teknik
                  </p>

                  <p className="text-xs font-bold text-slate-500">
                    Detail Line {lineNumber}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">

                  <span className="w-2 h-2 rounded-full bg-green-500" />

                  <div>

                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                      WAKTU
                    </p>

                    <p className="text-sm font-black text-blue-700 leading-none mt-0.5">
                      {currentTime || '--:--'}
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-green-500" />

                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wide">
                    Sistem Online
                  </span>

                </div>

                <button
                  onClick={() =>
                    navigate('/admin')
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

        {/* TITLE */}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

          <div>

            <p className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
              Monitoring Produksi
            </p>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
              Line {lineNumber}
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Monitoring request dan return barang produksi.
            </p>

          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

              <span className="text-lg font-black text-blue-700">
                {lineNumber}
              </span>

            </div>

            <div>

              <p className="text-[10px] font-black tracking-wider text-slate-400">
                LINE PRODUKSI
              </p>

              <p className="text-sm font-extrabold text-slate-700">
                {records.length} TRANSAKSI
              </p>

            </div>

          </div>

        </div>

        {/* INFO CARDS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <p className="text-xs font-extrabold tracking-wide text-slate-400">
              TOTAL RQS BUMBU
            </p>

            <p className="text-3xl font-extrabold text-blue-700 mt-2">
              {totalBumbuRqs}
            </p>

            <span className="text-xs font-bold text-slate-400">
              Dus
            </span>

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <p className="text-xs font-extrabold tracking-wide text-slate-400">
              TOTAL ACT BUMBU
            </p>

            <p className="text-3xl font-extrabold text-green-600 mt-2">
              {totalBumbuAct}
            </p>

            <span className="text-xs font-bold text-slate-400">
              Dus
            </span>

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <p className="text-xs font-extrabold tracking-wide text-slate-400">
              TOTAL RQS MINYAK
            </p>

            <p className="text-3xl font-extrabold text-orange-600 mt-2">
              {totalMinyakRqs}
            </p>

            <span className="text-xs font-bold text-slate-400">
              Dus
            </span>

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <p className="text-xs font-extrabold tracking-wide text-slate-400">
              TOTAL ACT MINYAK
            </p>

            <p className="text-3xl font-extrabold text-green-600 mt-2">
              {totalMinyakAct}
            </p>

            <span className="text-xs font-bold text-slate-400">
              Dus
            </span>

          </div>

        </div>

        {/* TABLE */}

        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">

            <div className="flex items-center justify-between gap-3">

              <div>

                <h2 className="text-lg font-extrabold text-slate-800">
                  Record Line {lineNumber}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Monitoring request dan return barang produksi
                </p>

              </div>

              <div className="flex items-center gap-2">

                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />

                <span className="text-xs font-bold text-slate-500">
                  {records.length} TRANSAKSI
                </span>

              </div>

            </div>

          </div>

          {records.length > 0 ? (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1250px] border-collapse">

                <thead>

                  <tr className="bg-blue-700 text-white">

                    <th className="px-3 py-4 text-xs font-extrabold">
                      NO
                    </th>

                    <th className="px-3 py-4 text-xs font-extrabold text-left">
                      NO PO
                    </th>

                    <th className="px-3 py-4 text-xs font-extrabold text-left">
                      FLAVOR / JENIS
                    </th>

                    <th className="px-3 py-4 text-xs font-extrabold">
                      JENIS
                    </th>

                    <th className="px-3 py-4 text-xs font-extrabold">
                      RQS
                    </th>

                    <th className="px-3 py-4 text-xs font-extrabold">
                      JAM KIRIM
                    </th>

                    <th className="px-3 py-4 text-xs font-extrabold">
                      ACT
                    </th>

                    <th className="px-3 py-4 text-xs font-extrabold">
                      JAM
                    </th>

                    <th className="px-3 py-4 text-xs font-extrabold">
                      SHIFT
                    </th>

                    <th className="px-3 py-4 text-xs font-extrabold">
                      STATUS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {/* BUMBU */}

                  {bumbuRows.length > 0 && (
                    <>

                      {bumbuRows.map(
                        (item, index) =>
                          renderRow(
                            item,
                            index
                          )
                      )}

                      <tr className="bg-blue-50 border-b-4 border-white">

                        <td
                          colSpan="4"
                          className="px-4 py-4 text-right font-extrabold text-blue-800"
                        >
                          TOTAL BUMBU
                        </td>

                        <td className="px-4 py-4 text-center font-extrabold text-blue-800">
                          {totalBumbuRqs}
                        </td>

                        <td />

                        <td className="px-4 py-4 text-center font-extrabold text-green-700">
                          {totalBumbuAct}
                        </td>

                        <td colSpan="3" />

                      </tr>

                    </>
                  )}

                  {/* MINYAK */}

                  {minyakRows.length > 0 && (
                    <>

                      {minyakRows.map(
                        (item, index) =>
                          renderRow(
                            item,
                            index
                          )
                      )}

                      <tr className="bg-orange-50">

                        <td
                          colSpan="4"
                          className="px-4 py-4 text-right font-extrabold text-orange-800"
                        >
                          TOTAL MINYAK
                        </td>

                        <td className="px-4 py-4 text-center font-extrabold text-orange-800">
                          {totalMinyakRqs}
                        </td>

                        <td />

                        <td className="px-4 py-4 text-center font-extrabold text-green-700">
                          {totalMinyakAct}
                        </td>

                        <td colSpan="3" />

                      </tr>

                    </>
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="py-20 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">

                <span className="text-2xl text-slate-400">
                  —
                </span>

              </div>

              <h3 className="mt-4 font-extrabold text-slate-700">
                Belum ada transaksi
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Belum ada data request atau return untuk Line {lineNumber}.
              </p>

            </div>

          )}

        </div>

        {/* INFO */}

        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-5">

          <div className="flex gap-3">

            <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center">

              <span className="font-extrabold text-blue-700">
                i
              </span>

            </div>

            <div>

              <p className="text-sm font-extrabold text-blue-800">
                Informasi Monitoring
              </p>

              <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                Data request ditampilkan sebagai CONFIRM,
                sedangkan data return operator ditampilkan sebagai
                RECEIVE. Setelah Admin Teknik mengisi ACT dan
                melakukan konfirmasi, status transaksi akan otomatis
                berubah.
              </p>

            </div>

          </div>

        </div>

        <button
          onClick={() =>
            navigate('/admin')
          }
          className="w-full mt-5 py-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold transition"
        >
          KEMBALI KE DASHBOARD
        </button>

      </main>

    </div>
  )
}

export default LineDetail