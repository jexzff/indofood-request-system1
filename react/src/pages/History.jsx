import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory } from '../services/api'

function History() {
  const navigate = useNavigate()

  const [history, setHistory] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // =====================================================
  // CEK ROLE
  // =====================================================

  const getRole = () => {
    return (
      sessionStorage.getItem('loginRole') ||
      localStorage.getItem('loginRole') ||
      ''
    )
  }

  // =====================================================
  // DELETED KEY
  // HANYA UNTUK MENYEMBUNYIKAN DARI TAMPILAN
  // DATA MYSQL TIDAK DIHAPUS
  // =====================================================

  const getDeletedKey = () => {
    const role = getRole()

    if (role === 'admin') {
      return 'adminHistoryDeleted'
    }

    return 'operatorHistoryDeleted'
  }

  // =====================================================
  // GET DELETED IDS
  // =====================================================

  const getDeletedIds = () => {
    try {
      return (
        JSON.parse(
          localStorage.getItem(getDeletedKey())
        ) || []
      )
    } catch {
      return []
    }
  }

  // =====================================================
  // SAVE DELETED IDS
  // =====================================================

  const saveDeletedIds = (ids) => {
    localStorage.setItem(
      getDeletedKey(),
      JSON.stringify(ids)
    )
  }

  // =====================================================
  // UNIQUE KEY
  // =====================================================

  const getItemKey = (item) => {
    const type =
      item.type ||
      item.transaction_type ||
      'request'

    if (
      item.id !== undefined &&
      item.id !== null
    ) {
      return `${type}-${String(item.id)}`
    }

    if (item.transaction_number) {
      return `${type}-${item.transaction_number}`
    }

    if (item.request_number) {
      return `${type}-${item.request_number}`
    }

    if (item.return_number) {
      return `${type}-${item.return_number}`
    }

    return `${type}-${JSON.stringify(item)}`
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatHistoryDate = (value) => {
    if (!value) {
      return '-'
    }

    const text = String(value).trim()

    const simpleMatch = text.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    )

    if (simpleMatch) {
      return `${simpleMatch[3]}/${simpleMatch[2]}/${simpleMatch[1]}`
    }

    const date = new Date(text)

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(
        'id-ID',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }
      )
    }

    return text
  }

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatHistoryTime = (value) => {
    if (!value) {
      return '-'
    }

    const text = String(value).trim()

    if (
      /^\d{2}:\d{2}:\d{2}$/.test(text)
    ) {
      return text.slice(0, 5)
    }

    if (
      /^\d{2}:\d{2}$/.test(text)
    ) {
      return text
    }

    return text.slice(0, 5)
  }

  // =====================================================
  // FORMAT DATA DARI MYSQL
  // =====================================================

  const formatHistoryData = (data) => {
    if (!Array.isArray(data)) {
      return []
    }

    return data.map((item) => {
      const type =
        String(
          item.transaction_type ||
            item.type ||
            ''
        ).toLowerCase() === 'return'
          ? 'return'
          : 'request'

      const transactionNumber =
        item.transaction_number ||
        item.request_number ||
        item.return_number ||
        ''

      const date =
        formatHistoryDate(
          item.transaction_date
        )

      const time =
        formatHistoryTime(
          item.transaction_time
        )

      return {
        ...item,

        id: item.id,

        type,

        transaction_number:
          transactionNumber,

        request_number:
          type === 'request'
            ? transactionNumber
            : item.request_number,

        return_number:
          type === 'return'
            ? transactionNumber
            : item.return_number,

        operator:
          item.operator ||
          item.operator_name ||
          item.nama_operator ||
          'Operator',

        line:
          item.line ?? '',

        shift:
          item.shift ?? '',

        bumbu:
          item.bumbu !== null &&
          item.bumbu !== undefined
            ? Number(item.bumbu)
            : null,

        minyak:
          item.minyak !== null &&
          item.minyak !== undefined
            ? Number(item.minyak)
            : null,

        actual_bumbu:
          item.actual_bumbu !== null &&
          item.actual_bumbu !== undefined
            ? Number(item.actual_bumbu)
            : null,

        actual_minyak:
          item.actual_minyak !== null &&
          item.actual_minyak !== undefined
            ? Number(item.actual_minyak)
            : null,

        status:
          item.status || 'Waiting',

        date,

        time,

        transaction_date:
          item.transaction_date,

        transaction_time:
          item.transaction_time,

        created_at:
          item.created_at,

        updated_at:
          item.updated_at,

        confirmed_at:
          item.confirmed_at,

        received_at:
          item.received_at,

        description:
          item.description || '',
      }
    })
  }

  // =====================================================
  // LOAD HISTORY DARI MYSQL
  // =====================================================

  const loadHistory = async () => {
    try {
      const response = await getHistory()

      let data = []

      if (Array.isArray(response)) {
        data = response
      } else if (
        Array.isArray(response?.data)
      ) {
        data = response.data
      } else if (
        Array.isArray(response?.history)
      ) {
        data = response.history
      } else if (
        Array.isArray(response?.value)
      ) {
        data = response.value
      } else if (
        Array.isArray(response?.data?.data)
      ) {
        data = response.data.data
      }

      const formatted =
        formatHistoryData(data)

      const deletedIds =
        getDeletedIds()

      const deletedSet =
        new Set(deletedIds)

      const visibleHistory =
        formatted.filter(
          (item) =>
            !deletedSet.has(
              getItemKey(item)
            )
        )

      // =================================================
      // SORT TERBARU
      // =================================================

      visibleHistory.sort(
        (a, b) => {
          const dateA =
            a.created_at
              ? new Date(
                  a.created_at
                ).getTime()
              : Number(a.id) || 0

          const dateB =
            b.created_at
              ? new Date(
                  b.created_at
                ).getTime()
              : Number(b.id) || 0

          return dateB - dateA
        }
      )

      setHistory(
        visibleHistory
      )
    } catch (error) {
      console.error(
        'Gagal mengambil history:',
        error
      )

      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    loadHistory()

    const interval =
      setInterval(() => {
        loadHistory()
      }, 1000)

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
  // DONE
  // HANYA SEMBUNYIKAN DARI TAMPILAN
  // MYSQL TETAP AMAN
  // =====================================================

  const handleDone = () => {
    if (history.length === 0) {
      return
    }

    const role =
      getRole()

    const roleName =
      role === 'admin'
        ? 'Admin Teknik'
        : 'Operator'

    const confirmDelete =
      window.confirm(
        `Hapus semua riwayat transaksi ${roleName} dari tampilan?`
      )

    if (!confirmDelete) {
      return
    }

    const currentDeleted =
      getDeletedIds()

    const deletedSet =
      new Set(currentDeleted)

    history.forEach(
      (item) => {
        deletedSet.add(
          getItemKey(item)
        )
      }
    )

    saveDeletedIds(
      Array.from(deletedSet)
    )

    setHistory([])

    setFilter('all')

    setSearch('')
  }

  // =====================================================
  // NORMALIZE TEXT
  // =====================================================

  const normalizeText = (value) => {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .trim()
  }

  // =====================================================
  // NAMA BULAN
  // =====================================================

  const monthNames = {
    januari: 1,
    jan: 1,
    februari: 2,
    feb: 2,
    maret: 3,
    mar: 3,
    april: 4,
    apr: 4,
    mei: 5,
    may: 5,
    juni: 6,
    jun: 6,
    juli: 7,
    jul: 7,
    agustus: 8,
    agu: 8,
    agt: 8,
    aug: 8,
    september: 9,
    sep: 9,
    oktober: 10,
    okt: 10,
    oct: 10,
    november: 11,
    nov: 11,
    desember: 12,
    des: 12,
    dec: 12,
  }

  // =====================================================
  // NAMA HARI
  // =====================================================

  const dayNames = [
    'minggu',
    'senin',
    'selasa',
    'rabu',
    'kamis',
    'jumat',
    'sabtu',
  ]

  // =====================================================
  // PARSE TANGGAL
  // =====================================================

  const parseDate = (value) => {
    if (!value) {
      return null
    }

    const text =
      String(value).trim()

    // DD/MM/YYYY

    let match =
      text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/
      )

    if (match) {
      let day =
        Number(match[1])

      let month =
        Number(match[2])

      let year =
        Number(match[3])

      if (year < 100) {
        year += 2000
      }

      const result =
        new Date(
          year,
          month - 1,
          day
        )

      if (
        !Number.isNaN(
          result.getTime()
        )
      ) {
        return result
      }
    }

    // DD-MM-YYYY

    match =
      text.match(
        /^(\d{1,2})-(\d{1,2})-(\d{2,4})/
      )

    if (match) {
      let day =
        Number(match[1])

      let month =
        Number(match[2])

      let year =
        Number(match[3])

      if (year < 100) {
        year += 2000
      }

      const result =
        new Date(
          year,
          month - 1,
          day
        )

      if (
        !Number.isNaN(
          result.getTime()
        )
      ) {
        return result
      }
    }

    // YYYY-MM-DD

    match =
      text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})/
      )

    if (match) {
      const year =
        Number(match[1])

      const month =
        Number(match[2])

      const day =
        Number(match[3])

      const result =
        new Date(
          year,
          month - 1,
          day
        )

      if (
        !Number.isNaN(
          result.getTime()
        )
      ) {
        return result
      }
    }

    const result =
      new Date(text)

    if (
      !Number.isNaN(
        result.getTime()
      )
    ) {
      return result
    }

    return null
  }

  // =====================================================
  // AMBIL SEMUA DATA SEARCH
  // =====================================================

  const getSearchData = (item) => {
    const transactionNumber =
      item.transaction_number ||
      item.request_number ||
      item.return_number ||
      ''

    const line =
      item.line ?? ''

    const shift =
      item.shift ?? ''

    const operator =
      item.operator ||
      item.operator_name ||
      item.nama_operator ||
      ''

    const dateValue =
      item.date ||
      item.transaction_date ||
      ''

    const timeValue =
      item.time ||
      item.transaction_time ||
      ''

    let dateObject =
      parseDate(dateValue)

    if (!dateObject) {
      dateObject =
        parseDate(
          item.created_at
        )
    }

    const values = []

    values.push(
      transactionNumber
    )

    values.push(line)

    values.push(shift)

    values.push(operator)

    values.push(dateValue)

    values.push(timeValue)

    values.push(
      item.status || ''
    )

    values.push(
      item.bumbu ?? ''
    )

    values.push(
      item.minyak ?? ''
    )

    values.push(
      item.actual_bumbu ?? ''
    )

    values.push(
      item.actual_minyak ?? ''
    )

    if (dateObject) {
      const day =
        String(
          dateObject.getDate()
        ).padStart(2, '0')

      const month =
        String(
          dateObject.getMonth() + 1
        ).padStart(2, '0')

      const year =
        String(
          dateObject.getFullYear()
        )

      const shortYear =
        year.slice(-2)

      const dayNumber =
        dateObject.getDay()

      const dayName =
        dayNames[dayNumber]

      const monthNumber =
        Number(month)

      const monthName =
        Object.keys(
          monthNames
        ).find(
          (name) =>
            monthNames[name] ===
            monthNumber
        ) || ''

      values.push(day)
      values.push(month)
      values.push(year)
      values.push(shortYear)
      values.push(dayName)
      values.push(monthName)

      values.push(
        `${day}/${month}/${year}`
      )

      values.push(
        `${day}-${month}-${year}`
      )

      values.push(
        `${day}.${month}.${year}`
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

      values.push(
        `${monthName} ${year}`
      )

      values.push(
        `${month}/${year}`
      )

      values.push(
        `${month}-${year}`
      )
    }

    if (timeValue) {
      const timeText =
        String(timeValue)
          .trim()
          .toLowerCase()

      values.push(timeText)

      const timeMatch =
        timeText.match(
          /(\d{1,2})[:.](\d{2})/
        )

      if (timeMatch) {
        const hour =
          String(
            Number(
              timeMatch[1]
            )
          ).padStart(
            2,
            '0'
          )

        const minute =
          timeMatch[2]

        values.push(
          `${hour}:${minute}`
        )

        values.push(
          `${hour}.${minute}`
        )

        values.push(
          `${hour}${minute}`
        )
      }
    }

    return values
      .map(normalizeText)
      .filter(Boolean)
  }

  // =====================================================
  // MATCH SEARCH
  // =====================================================

  const matchesSearch = (
    item,
    searchValue
  ) => {
    const keyword =
      normalizeText(
        searchValue
      )

    if (!keyword) {
      return true
    }

    const searchData =
      getSearchData(item)

    const lineMatch =
      keyword.match(
        /^line\s+(.+)$/
      )

    if (lineMatch) {
      const target =
        normalizeText(
          lineMatch[1]
        )

      return (
        normalizeText(
          item.line
        ) === target
      )
    }

    const shiftMatch =
      keyword.match(
        /^shift\s+(.+)$/
      )

    if (shiftMatch) {
      const target =
        normalizeText(
          shiftMatch[1]
        )

      return (
        normalizeText(
          item.shift
        ) === target
      )
    }

    const words =
      keyword
        .split(/\s+/)
        .filter(Boolean)

    return words.every(
      (word) => {
        if (
          word === 'line' ||
          word === 'shift'
        ) {
          return true
        }

        return searchData.some(
          (value) =>
            value === word ||
            value.includes(word)
        )
      }
    )
  }

  // =====================================================
  // FILTER HISTORY
  // =====================================================

  const filteredHistory =
    history.filter(
      (item) => {
        const matchesType =
          filter === 'all' ||
          item.type === filter

        const matchesSearchResult =
          matchesSearch(
            item,
            search
          )

        return (
          matchesType &&
          matchesSearchResult
        )
      }
    )

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (item) => {
    const rawStatus =
      String(
        item.status ||
          item.request_status ||
          item.return_status ||
          ''
      ).toLowerCase()

    if (
      rawStatus === 'confirmed' ||
      rawStatus === 'confirm'
    ) {
      return {
        text: 'CONFIRMED',
        className:
          'bg-green-100 text-green-700',
      }
    }

    if (
      rawStatus === 'received' ||
      rawStatus === 'diterima'
    ) {
      return {
        text: 'RECEIVED',
        className:
          'bg-green-100 text-green-700',
      }
    }

    if (
      rawStatus === 'processing' ||
      rawStatus === 'processed'
    ) {
      return {
        text: 'PROCESSING',
        className:
          'bg-blue-100 text-blue-700',
      }
    }

    if (
      rawStatus === 'rejected' ||
      rawStatus === 'ditolak'
    ) {
      return {
        text: 'REJECTED',
        className:
          'bg-red-100 text-red-700',
      }
    }

    return {
      text: 'WAITING',
      className:
        'bg-yellow-100 text-yellow-700',
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
      return String(value)
    }

    return date.toLocaleString(
      'id-ID',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }

  // =====================================================
  // FORMAT NILAI
  // =====================================================

  const displayValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '-'
    }

    return value
  }

  // =====================================================
  // ROLE
  // =====================================================

  const role =
    getRole()

  const isAdmin =
    role === 'admin'

  const backPath =
    isAdmin
      ? '/admin'
      : '/operator'

  // =====================================================
  // HISTORY ITEM
  // =====================================================

  const HistoryItem = ({
    item,
  }) => {
    const isRequest =
      item.type === 'request'

    const status =
      getStatus(item)

    const transactionNumber =
      item.transaction_number ||
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
        {/* HEADER */}

        <div
          className={`px-5 py-4 ${
            isRequest
              ? 'bg-green-50'
              : 'bg-red-50'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* TRANSAKSI */}

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
                  {displayValue(
                    transactionNumber
                  )}
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
                  {displayValue(
                    item.line
                  )}
                </p>
              </div>

              <div className="bg-white/70 rounded-2xl px-4 py-3">
                <p className="text-[9px] font-black tracking-wider text-slate-400">
                  SHIFT
                </p>

                <p className="font-black text-slate-800 mt-1">
                  {displayValue(
                    item.shift
                  )}
                </p>
              </div>

              <div className="bg-white/70 rounded-2xl px-4 py-3">
                <p className="text-[9px] font-black tracking-wider text-slate-400">
                  TANGGAL
                </p>

                <p className="font-bold text-slate-700 text-sm mt-1">
                  {displayValue(
                    item.date
                  )}
                </p>
              </div>

              <div className="bg-white/70 rounded-2xl px-4 py-3">
                <p className="text-[9px] font-black tracking-wider text-slate-400">
                  WAKTU
                </p>

                <p className="font-bold text-slate-700 text-sm mt-1">
                  {displayValue(
                    item.time
                  )}
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

          <div className="flex flex-col lg:flex-row lg:items-start gap-4">

            {/* BARANG */}

            <div className="flex-1">

              <p className="text-[10px] font-black tracking-widest text-slate-400 mb-2">
                DETAIL BARANG
              </p>

              <div className="flex flex-wrap gap-3">

                {/* BUMBU */}

                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 min-w-[170px]">

                  <p className="text-xs font-bold text-slate-500">
                    Bumbu
                  </p>

                  <div className="flex items-center gap-3 mt-1">

                    <span className="font-black text-slate-800">
                      {displayValue(
                        item.bumbu
                      )}
                    </span>

                    <span className="text-xs text-slate-400">
                      RQS
                    </span>

                    <span className="text-slate-300">
                      /
                    </span>

                    <span className="font-black text-blue-700">
                      {displayValue(
                        item.actual_bumbu
                      )}
                    </span>

                    <span className="text-xs text-slate-400">
                      ACT
                    </span>

                  </div>
                </div>

                {/* MINYAK */}

                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 min-w-[170px]">

                  <p className="text-xs font-bold text-slate-500">
                    Minyak
                  </p>

                  <div className="flex items-center gap-3 mt-1">

                    <span className="font-black text-slate-800">
                      {displayValue(
                        item.minyak
                      )}
                    </span>

                    <span className="text-xs text-slate-400">
                      RQS
                    </span>

                    <span className="text-slate-300">
                      /
                    </span>

                    <span className="font-black text-blue-700">
                      {displayValue(
                        item.actual_minyak
                      )}
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
                {displayValue(
                  item.operator ||
                    item.operator_name ||
                    item.nama_operator
                )}
              </p>

            </div>

          </div>

          {/* WAKTU DATABASE */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">

            {/* TRANSACTION DATE */}

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                TANGGAL TRANSAKSI
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1">
                {formatHistoryDate(
                  item.transaction_date
                )}
              </p>

            </div>

            {/* TRANSACTION TIME */}

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                WAKTU TRANSAKSI
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1">
                {formatHistoryTime(
                  item.transaction_time
                )}
              </p>

            </div>

            {/* CREATED */}

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                DIBUAT
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1">
                {formatDateTime(
                  item.created_at
                )}
              </p>

            </div>

            {/* UPDATED */}

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                DIUPDATE
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1">
                {formatDateTime(
                  item.updated_at
                )}
              </p>

            </div>

          </div>

          {/* DATA TAMBAHAN */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                STATUS
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1">
                {displayValue(
                  item.status
                )}
              </p>

            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                ID TRANSAKSI
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1">
                {displayValue(
                  item.id
                )}
              </p>

            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                JENIS
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1 uppercase">
                {displayValue(
                  item.type
                )}
              </p>

            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                NOMOR TRANSAKSI
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1">
                {displayValue(
                  item.transaction_number
                )}
              </p>

            </div>

          </div>

          {/* CONFIRMED / RECEIVED */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                DIKONFIRMASI
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1">
                {formatDateTime(
                  item.confirmed_at
                )}
              </p>

            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">

              <p className="text-[10px] font-black tracking-widest text-slate-400">
                DITERIMA
              </p>

              <p className="text-sm font-bold text-slate-700 mt-1">
                {formatDateTime(
                  item.received_at
                )}
              </p>

            </div>

          </div>

          {/* KETERANGAN */}

          <div className="mt-4 px-4 py-3 bg-slate-50 rounded-2xl">

            <p className="text-[10px] font-black tracking-wider text-slate-400">
              KETERANGAN
            </p>

            <p className="text-sm text-slate-600 mt-1">
              {displayValue(
                item.description
              )}
            </p>

          </div>

        </div>
      </div>
    )
  }

  // =====================================================
  // RETURN
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

          {/* SUB HEADER */}

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
                    {isAdmin
                      ? 'Admin Teknik'
                      : 'Operator'}
                  </p>

                  <p className="text-xs font-bold text-slate-500">
                    Riwayat Transaksi
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
                    TOTAL
                  </span>

                  <span className="text-sm font-black text-blue-700">
                    {filteredHistory.length}
                  </span>

                </div>

                <button
                  onClick={handleDone}
                  disabled={
                    history.length === 0
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                    history.length === 0
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : 'bg-blue-700 text-white hover:bg-blue-800 active:scale-95'
                  }`}
                >
                  DONE
                </button>

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
            Lihat seluruh riwayat request dan return barang.
          </p>

        </div>

        {/* SEARCH */}

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm mb-5">

          <div className="flex flex-col lg:flex-row gap-4">

            <div className="flex-1">

              <label className="block text-xs font-black text-slate-500 mb-2">
                CARI TRANSAKSI
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Cari line, shift, nomor request, operator, tanggal, hari, bulan, tahun, atau jam..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />

            </div>

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

        {/* SEARCH RESULT */}

        {search.trim() && (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100">

            <p className="text-sm text-blue-700">

              Menampilkan{' '}

              <span className="font-black">
                {filteredHistory.length}
              </span>{' '}

              hasil untuk pencarian:

              <span className="font-black ml-1">
                "{search}"
              </span>

            </p>

          </div>
        )}

        {/* SUMMARY */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

          <div className="bg-white rounded-3xl border border-slate-200 p-4">

            <p className="text-[10px] font-black tracking-wider text-slate-400">
              TOTAL TRANSAKSI
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
                    item.type ===
                    'request'
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
                    item.type ===
                    'return'
                ).length
              }
            </p>

          </div>

        </div>

        {/* HISTORY */}

        {loading ? (

          <div className="bg-white rounded-3xl border border-slate-200 py-16 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
              ⏳
            </div>

            <h3 className="font-extrabold text-slate-700 mt-4">
              Memuat Riwayat
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Mengambil data transaksi dari database.
            </p>

          </div>

        ) : filteredHistory.length > 0 ? (

          <div className="space-y-4">

            {filteredHistory.map(
              (item, index) => (

                <HistoryItem
                  key={
                    getItemKey(item) ||
                    `${item.transaction_number}-${index}`
                  }
                  item={item}
                />

              )
            )}

          </div>

        ) : (

          <div className="bg-white rounded-3xl border border-slate-200 py-16 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
              📋
            </div>

            <h3 className="font-extrabold text-slate-700 mt-4">

              {search.trim()
                ? 'Data Tidak Ditemukan'
                : 'Belum Ada Riwayat'}

            </h3>

            <p className="text-sm text-slate-400 mt-1">

              {search.trim()
                ? `Tidak ada riwayat yang sesuai dengan "${search}".`
                : 'Data request atau return akan muncul di sini.'}

            </p>

          </div>

        )}

      </main>

    </div>
  )
}

export default History