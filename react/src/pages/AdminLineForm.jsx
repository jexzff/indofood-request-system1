import { useEffect, useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  getRequests,
  getReturns,
  confirmRequest as confirmRequestAPI,
  confirmReturn as confirmReturnAPI,
} from '../services/api'

function AdminLineForm() {
  const navigate = useNavigate()
  const { line } = useParams()

  const [history, setHistory] = useState([])
  const [message, setMessage] = useState('')
  const [loadingId, setLoadingId] = useState(null)

  const lineNumber = Number(line)

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadHistory = () => {
    const saved =
      JSON.parse(
        localStorage.getItem('requestHistory')
      ) || []

    setHistory(saved)
  }

  useEffect(() => {
    loadHistory()

    const interval = setInterval(
      loadHistory,
      500
    )

    return () =>
      clearInterval(interval)
  }, [])

  // =====================================================
  // DATA LINE
  // =====================================================

  const lineData = history.filter(
    (item) =>
      Number(item.line) === lineNumber
  )

  const pendingRequests =
    lineData.filter(
      (item) =>
        String(item.type).toLowerCase() ===
          'request' &&
        String(item.status).toLowerCase() !==
          'confirmed'
    )

  const pendingReturns =
    lineData.filter(
      (item) =>
        String(item.type).toLowerCase() ===
          'return' &&
        String(item.status).toLowerCase() !==
          'received'
    )

  // =====================================================
  // UPDATE LOCAL TRANSACTION
  // =====================================================

  const updateTransaction = (
    id,
    changes
  ) => {

    const saved =
      JSON.parse(
        localStorage.getItem('requestHistory')
      ) || []

    const updated = saved.map(
      (item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item
    )

    localStorage.setItem(
      'requestHistory',
      JSON.stringify(updated)
    )

    setHistory(updated)
  }

  // =====================================================
  // ACT INPUT
  // =====================================================

  const updateActual = (
    item,
    field,
    value
  ) => {

    updateTransaction(item.id, {
      [field]:
        value === ''
          ? ''
          : Number(value),
    })
  }

  // =====================================================
  // START REQUEST
  // =====================================================

  const startRequest = (item) => {

    updateTransaction(item.id, {
      process_started: true,
      button_status: 'CONFIRM',
      started_at:
        new Date().toISOString(),
    })

    setMessage(
      `${item.request_number} sedang diproses.`
    )
  }

  // =====================================================
  // CONFIRM REQUEST
  // =====================================================

  const confirmRequest = async (item) => {

    if (loadingId === item.id) {
      return
    }

    const requestNumber =
      item.request_number

    if (!requestNumber) {
      setMessage(
        'Nomor request tidak ditemukan.'
      )
      return
    }

    setLoadingId(item.id)
    setMessage('')

    try {

      // =================================================
      // AMBIL DATA REQUEST DARI DATABASE
      // =================================================

      const response =
        await getRequests()

      const requests =
        Array.isArray(response)
          ? response
          : response?.data || []

      const databaseRequest =
        requests.find(
          (request) =>
            String(
              request.request_number
            ) === String(requestNumber)
        )

      if (!databaseRequest) {
        throw new Error(
          `Request ${requestNumber} tidak ditemukan di database.`
        )
      }

      // =================================================
      // ACT
      // =================================================

      const actual = {
        bumbu:
          item.actual_bumbu === '' ||
          item.actual_bumbu == null
            ? 0
            : Number(item.actual_bumbu),

        minyak:
          item.actual_minyak === '' ||
          item.actual_minyak == null
            ? 0
            : Number(item.actual_minyak),
      }

      // =================================================
      // KIRIM KONFIRMASI KE API
      // =================================================

      await confirmRequestAPI(
        databaseRequest.id,
        actual
      )

      // =================================================
      // UPDATE LOCAL STORAGE
      // =================================================

      updateTransaction(item.id, {
        status: 'Confirmed',
        button_status: 'CONFIRMED',
        confirmed_at:
          new Date().toISOString(),
        process_started: true,
      })

      setMessage(
        `${requestNumber} berhasil dikonfirmasi dan disimpan ke database.`
      )

    } catch (error) {

      console.error(
        'CONFIRM REQUEST ERROR:',
        error
      )

      setMessage(
        error?.message ||
        'Gagal mengonfirmasi request.'
      )

    } finally {

      setLoadingId(null)

    }
  }

  // =====================================================
  // START RETURN
  // =====================================================

  const startReturn = (item) => {

    updateTransaction(item.id, {
      process_started: true,
      button_status: 'RECEIVE',
      started_at:
        new Date().toISOString(),
    })

    setMessage(
      `${item.request_number || item.return_number || 'Return'} sedang diproses.`
    )
  }

  // =====================================================
  // RECEIVE RETURN
  // =====================================================

  const receiveReturn = async (item) => {

    if (loadingId === item.id) {
      return
    }

    const returnNumber =
      item.return_number ||
      item.request_number

    if (!returnNumber) {
      setMessage(
        'Nomor return tidak ditemukan.'
      )
      return
    }

    setLoadingId(item.id)
    setMessage('')

    try {

      // =================================================
      // AMBIL DATA RETURN DARI DATABASE
      // =================================================

      const response =
        await getReturns()

      const returns =
        Array.isArray(response)
          ? response
          : response?.data || []

      const databaseReturn =
        returns.find(
          (itemReturn) =>
            String(
              itemReturn.return_number
            ) === String(returnNumber)
        )

      if (!databaseReturn) {
        throw new Error(
          `Return ${returnNumber} tidak ditemukan di database.`
        )
      }

      // =================================================
      // ACT RETURN
      // =================================================

      const actual = {
        bumbu:
          item.actual_bumbu === '' ||
          item.actual_bumbu == null
            ? 0
            : Number(item.actual_bumbu),

        minyak:
          item.actual_minyak === '' ||
          item.actual_minyak == null
            ? 0
            : Number(item.actual_minyak),
      }

      // =================================================
      // KIRIM KONFIRMASI KE API
      // =================================================

      await confirmReturnAPI(
        databaseReturn.id,
        actual
      )

      // =================================================
      // UPDATE LOCAL STORAGE
      // =================================================

      updateTransaction(item.id, {
        status: 'Received',
        button_status: 'RECEIVED',
        received_at:
          new Date().toISOString(),
        process_started: true,
      })

      setMessage(
        `${returnNumber} berhasil diterima dan disimpan ke database.`
      )

    } catch (error) {

      console.error(
        'RECEIVE RETURN ERROR:',
        error
      )

      setMessage(
        error?.message ||
        'Gagal menerima return.'
      )

    } finally {

      setLoadingId(null)

    }
  }

  // =====================================================
  // ACT INPUT COMPONENT
  // =====================================================

  const ActualInput = ({
    item,
    field,
    disabled,
  }) => {

    return (
      <input
        type="number"
        min="0"
        value={
          item[field] ?? ''
        }
        disabled={disabled}
        placeholder="ACT"
        onChange={(e) =>
          updateActual(
            item,
            field,
            e.target.value
          )
        }
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-center font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
      />
    )
  }

  // =====================================================
  // TRANSACTION CARD
  // =====================================================

  const TransactionCard = ({
    item,
  }) => {

    const isRequest =
      String(item.type).toLowerCase() ===
      'request'

    const isFinished =
      String(item.status).toLowerCase() ===
        'confirmed' ||
      String(item.status).toLowerCase() ===
        'received'

    const started =
      item.process_started === true

    const isLoading =
      loadingId === item.id

    const transactionNumber =
      item.request_number ||
      item.return_number ||
      'TRANSAKSI'

    return (
      <div
        className={`bg-white rounded-3xl border overflow-hidden shadow-sm ${
          isRequest
            ? 'border-green-200'
            : 'border-red-200'
        }`}
      >

        {/* HEADER */}

        <div
          className={`px-6 py-5 ${
            isRequest
              ? 'bg-green-50'
              : 'bg-red-50'
          }`}
        >

          <div className="flex items-center justify-between">

            <div>

              <p
                className={`text-xs font-extrabold ${
                  isRequest
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {isRequest
                  ? 'REQUEST BARANG'
                  : 'RETURN BARANG'}
              </p>

              <h2 className="text-xl font-extrabold text-slate-800 mt-1">
                {transactionNumber}
              </h2>

            </div>

            <span
              className={`px-4 py-2 rounded-full text-xs font-extrabold ${
                isFinished
                  ? 'bg-slate-100 text-slate-500'
                  : started
                    ? isRequest
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
              }`}
            >

              {isFinished
                ? item.status
                : started
                  ? 'PROCESSING'
                  : 'WAITING'}

            </span>

          </div>

        </div>


        {/* CONTENT */}

        <div className="p-6">

          {/* INFO */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">

            <div className="bg-slate-50 rounded-2xl p-4">

              <p className="text-xs text-slate-400">
                LINE
              </p>

              <p className="font-extrabold text-slate-800 mt-1">
                {item.line}
              </p>

            </div>


            <div className="bg-slate-50 rounded-2xl p-4">

              <p className="text-xs text-slate-400">
                SHIFT
              </p>

              <p className="font-extrabold text-slate-800 mt-1">
                {item.shift}
              </p>

            </div>


            <div className="bg-slate-50 rounded-2xl p-4">

              <p className="text-xs text-slate-400">
                TANGGAL
              </p>

              <p className="font-bold text-slate-800 mt-1">
                {item.date || '-'}
              </p>

            </div>


            <div className="bg-slate-50 rounded-2xl p-4">

              <p className="text-xs text-slate-400">
                WAKTU
              </p>

              <p className="font-bold text-slate-800 mt-1">
                {item.time || '-'}
              </p>

            </div>

          </div>


          {/* BARANG */}

          <div className="border border-slate-200 rounded-2xl overflow-hidden">

            <div className="grid grid-cols-3 bg-slate-50 px-5 py-4">

              <span className="text-xs font-extrabold text-slate-500">
                BARANG
              </span>

              <span className="text-xs font-extrabold text-slate-500 text-center">
                {isRequest
                  ? 'RQS'
                  : 'RETURN'}
              </span>

              <span className="text-xs font-extrabold text-slate-500 text-center">
                ACT
              </span>

            </div>


            {/* BUMBU */}

            <div className="grid grid-cols-3 items-center gap-3 px-5 py-5 border-t border-slate-100">

              <div>

                <p className="font-extrabold text-slate-800">
                  Bumbu
                </p>

                <p className="text-xs text-slate-400">
                  Dus
                </p>

              </div>

              <p className="text-center font-extrabold text-slate-800">
                {item.bumbu || 0}
              </p>

              <ActualInput
                item={item}
                field="actual_bumbu"
                disabled={
                  isFinished ||
                  !started
                }
              />

            </div>


            {/* MINYAK */}

            <div className="grid grid-cols-3 items-center gap-3 px-5 py-5 border-t border-slate-100">

              <div>

                <p className="font-extrabold text-slate-800">
                  Minyak
                </p>

                <p className="text-xs text-slate-400">
                  Dus
                </p>

              </div>

              <p className="text-center font-extrabold text-slate-800">
                {item.minyak || 0}
              </p>

              <ActualInput
                item={item}
                field="actual_minyak"
                disabled={
                  isFinished ||
                  !started
                }
              />

            </div>

          </div>


          {/* KETERANGAN */}

          {item.description && (

            <div className="mt-5 p-4 rounded-2xl bg-slate-50">

              <p className="text-xs font-extrabold text-slate-400 mb-1">
                KETERANGAN OPERATOR
              </p>

              <p className="text-sm text-slate-600">
                {item.description}
              </p>

            </div>

          )}


          {/* OPERATOR */}

          <div className="flex justify-between mt-5 text-xs text-slate-400">

            <span>
              Operator:{' '}
              {item.operator ||
                'Operator'}
            </span>

            <span>
              {isRequest
                ? 'Request'
                : 'Return'}
            </span>

          </div>


          {/* BUTTON */}

          {!isFinished && (

            <button
              disabled={isLoading}
              onClick={() => {

                if (isRequest) {

                  if (!started) {
                    startRequest(item)
                  } else {
                    confirmRequest(item)
                  }

                } else {

                  if (!started) {
                    startReturn(item)
                  } else {
                    receiveReturn(item)
                  }

                }

              }}
              className={`w-full mt-6 py-4 rounded-2xl font-extrabold text-white transition ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : !started
                    ? 'bg-blue-700 hover:bg-blue-800'
                    : isRequest
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
              }`}
            >

              {isLoading
                ? 'MENYIMPAN...'
                : !started
                  ? 'START'
                  : isRequest
                    ? 'CONFIRM'
                    : 'RECEIVE'}

            </button>

          )}

        </div>

      </div>
    )
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="bg-blue-800 text-white shadow-lg">

        <div className="max-w-5xl mx-auto px-5 py-7">

          <button
            onClick={() =>
              navigate('/admin')
            }
            className="text-sm text-blue-100 hover:text-white mb-5"
          >
            ← Kembali ke Dashboard
          </button>

          <div className="flex items-end justify-between gap-4">

            <div>

              <p className="text-xs font-bold tracking-widest text-blue-200">
                INDOFOOD · DEPARTEMEN TEKNIK
              </p>

              <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
                Line {lineNumber}
              </h1>

              <p className="text-blue-100 mt-2">
                Form Request & Return Barang
              </p>

            </div>

            <div className="hidden sm:block bg-white/10 rounded-2xl px-5 py-4">

              <p className="text-xs text-blue-200">
                TOTAL MENUNGGU
              </p>

              <p className="text-2xl font-extrabold mt-1">
                {pendingRequests.length +
                  pendingReturns.length}
              </p>

            </div>

          </div>

        </div>

      </header>


      {/* CONTENT */}

      <main className="max-w-5xl mx-auto px-5 py-7">

        {/* MESSAGE */}

        {message && (

          <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 font-semibold">
            {message}
          </div>

        )}


        {/* REQUEST */}

        {pendingRequests.length > 0 && (

          <section>

            <div className="flex items-center gap-3 mb-4">

              <span className="w-3 h-3 rounded-full bg-green-500" />

              <div>

                <h2 className="text-xl font-extrabold text-slate-800">
                  Request Barang
                </h2>

                <p className="text-sm text-slate-400">
                  {pendingRequests.length}{' '}
                  request masuk
                </p>

              </div>

            </div>

            <div className="space-y-5">

              {pendingRequests.map(
                (item) => (
                  <TransactionCard
                    key={item.id}
                    item={item}
                  />
                )
              )}

            </div>

          </section>

        )}


        {/* RETURN */}

        {pendingReturns.length > 0 && (

          <section
            className={
              pendingRequests.length > 0
                ? 'mt-10'
                : ''
            }
          >

            <div className="flex items-center gap-3 mb-4">

              <span className="w-3 h-3 rounded-full bg-red-500" />

              <div>

                <h2 className="text-xl font-extrabold text-slate-800">
                  Return Barang
                </h2>

                <p className="text-sm text-slate-400">
                  {pendingReturns.length}{' '}
                  return masuk
                </p>

              </div>

            </div>

            <div className="space-y-5">

              {pendingReturns.map(
                (item) => (
                  <TransactionCard
                    key={item.id}
                    item={item}
                  />
                )
              )}

            </div>

          </section>

        )}


        {/* EMPTY */}

        {pendingRequests.length === 0 &&
          pendingReturns.length === 0 && (

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-12 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-green-50 flex items-center justify-center text-2xl text-green-600">
                ✓
              </div>

              <h2 className="font-extrabold text-slate-700 mt-4">
                Tidak ada transaksi
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Belum ada request atau return
                yang masuk ke Line {lineNumber}.
              </p>

            </div>

          )}

      </main>

    </div>
  )
}

export default AdminLineForm