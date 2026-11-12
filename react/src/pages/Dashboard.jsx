import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const navigate = useNavigate()

  const [requests, setRequests] = useState([])
  const [returns, setReturns] = useState([])

  useEffect(() => {
    loadData()

    const interval = setInterval(() => {
      loadData()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    const savedRequests =
      JSON.parse(localStorage.getItem('indofood_requests')) || []

    const savedReturns =
      JSON.parse(localStorage.getItem('indofood_returns')) || []

    setRequests(savedRequests)
    setReturns(savedReturns)
  }

  // =========================
  // UPDATE ACT REQUEST
  // =========================

  const updateRequestAct = (id, value) => {
    const updated = requests.map((item) =>
      item.id === id
        ? {
            ...item,
            actual: value,
          }
        : item
    )

    setRequests(updated)

    localStorage.setItem(
      'indofood_requests',
      JSON.stringify(updated)
    )
  }

  // =========================
  // UPDATE ACT RETURN
  // =========================

  const updateReturnAct = (id, value) => {
    const updated = returns.map((item) =>
      item.id === id
        ? {
            ...item,
            actual: value,
          }
        : item
    )

    setReturns(updated)

    localStorage.setItem(
      'indofood_returns',
      JSON.stringify(updated)
    )
  }

  // =========================
  // CONFIRM REQUEST
  // =========================

  const confirmRequest = (id) => {
    const updated = requests.map((item) =>
      item.id === id
        ? {
            ...item,
            status: 'confirmed',
            confirmedAt: new Date().toLocaleString('id-ID'),
          }
        : item
    )

    setRequests(updated)

    localStorage.setItem(
      'indofood_requests',
      JSON.stringify(updated)
    )
  }

  // =========================
  // RECEIVE RETURN
  // =========================

  const receiveReturn = (id) => {
    const updated = returns.map((item) =>
      item.id === id
        ? {
            ...item,
            status: 'received',
            receivedAt: new Date().toLocaleString('id-ID'),
          }
        : item
    )

    setReturns(updated)

    localStorage.setItem(
      'indofood_returns',
      JSON.stringify(updated)
    )
  }

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-10">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="bg-blue-700 text-white px-6 py-7 rounded-b-[32px] shadow-lg">

        <p className="text-sm text-blue-200">
          PT INDOFOOD
        </p>

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-extrabold mt-1">
              Dashboard Admin Teknik
            </h1>

            <p className="text-sm text-blue-100 mt-1">
              Monitoring Request & Return Barang
            </p>
          </div>

          <div className="bg-white/10 px-4 py-2 rounded-2xl text-center">

            <p className="text-xs text-blue-100">
              Menunggu
            </p>

            <p className="text-xl font-bold">
              {requests.filter(
                (item) => item.status !== 'confirmed'
              ).length +
                returns.filter(
                  (item) => item.status !== 'received'
                ).length}
            </p>

          </div>

        </div>

      </div>


      {/* ========================= */}
      {/* CONTENT */}
      {/* ========================= */}

      <div className="max-w-6xl mx-auto px-5 mt-6">

        {/* ========================= */}
        {/* REQUEST */}
        {/* ========================= */}

        {requests
          .filter((item) => item.status !== 'confirmed')
          .map((item) => (

            <div
              key={item.id}
              className="admin-card request-card"
            >

              {/* CONTENT */}

              <div className="flex-1">

                <div className="flex items-center gap-3">

                  <div className="w-3 h-3 rounded-full bg-green-500" />

                  <div>

                    <h2 className="text-lg font-bold text-slate-800">
                      Request Barang
                    </h2>

                    <p className="text-sm text-slate-500">
                      Line {item.line} · Shift {item.shift}
                    </p>

                  </div>

                </div>


                {/* DATA */}

                <div className="mt-5 bg-slate-50 rounded-2xl p-4">

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div>
                      <p className="data-label">
                        Barang
                      </p>

                      <p className="data-value">
                        {item.item || item.barang || 'Bumbu'}
                      </p>
                    </div>


                    <div>
                      <p className="data-label">
                        RQS
                      </p>

                      <p className="data-value">
                        {item.rqs ?? item.bumbu ?? 0} Dus
                      </p>
                    </div>


                    <div>
                      <p className="data-label">
                        Operator
                      </p>

                      <p className="data-value">
                        {item.operator || '-'}
                      </p>
                    </div>


                    <div>
                      <p className="data-label">
                        Status
                      </p>

                      <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        REQUEST
                      </span>
                    </div>

                  </div>

                </div>


                {/* ACT */}

                <div className="mt-4">

                  <label className="data-label">
                    ACTUAL / ACT
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={item.actual ?? item.rqs ?? item.bumbu ?? 0}
                    onChange={(e) =>
                      updateRequestAct(
                        item.id,
                        Number(e.target.value)
                      )
                    }
                    className="admin-act-input"
                  />

                </div>


                {/* CONFIRM */}

                <button
                  onClick={() => confirmRequest(item.id)}
                  className="admin-confirm-request"
                >
                  CONFIRM
                </button>

              </div>


              {/* LAMPU */}

              <div className="indicator-container">

                <div className="indicator-light indicator-request" />

                <span className="indicator-text text-green-600">
                  REQUEST
                </span>

              </div>

            </div>

          ))}


        {/* ========================= */}
        {/* RETURN */}
        {/* ========================= */}

        {returns
          .filter((item) => item.status !== 'received')
          .map((item) => (

            <div
              key={item.id}
              className="admin-card return-card"
            >

              <div className="flex-1">

                <div className="flex items-center gap-3">

                  <div className="w-3 h-3 rounded-full bg-red-500" />

                  <div>

                    <h2 className="text-lg font-bold text-slate-800">
                      Return Barang
                    </h2>

                    <p className="text-sm text-slate-500">
                      Line {item.line} · Shift {item.shift}
                    </p>

                  </div>

                </div>


                {/* DATA */}

                <div className="mt-5 bg-slate-50 rounded-2xl p-4">

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div>
                      <p className="data-label">
                        Barang
                      </p>

                      <p className="data-value">
                        {item.item || item.barang || 'Bumbu'}
                      </p>
                    </div>


                    <div>
                      <p className="data-label">
                        RETURN
                      </p>

                      <p className="data-value">
                        {item.returnQty ??
                          item.quantity ??
                          item.return ??
                          0}{' '}
                        Dus
                      </p>
                    </div>


                    <div>
                      <p className="data-label">
                        Operator
                      </p>

                      <p className="data-value">
                        {item.operator || '-'}
                      </p>
                    </div>


                    <div>
                      <p className="data-label">
                        Status
                      </p>

                      <span className="inline-flex px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                        RETURN
                      </span>
                    </div>

                  </div>

                </div>


                {/* ACT */}

                <div className="mt-4">

                  <label className="data-label">
                    ACTUAL / ACT
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      item.actual ??
                      item.returnQty ??
                      item.quantity ??
                      item.return ??
                      0
                    }
                    onChange={(e) =>
                      updateReturnAct(
                        item.id,
                        Number(e.target.value)
                      )
                    }
                    className="admin-act-input"
                  />

                </div>


                {/* RECEIVE */}

                <button
                  onClick={() => receiveReturn(item.id)}
                  className="admin-confirm-return"
                >
                  RECEIVE
                </button>

              </div>


              {/* LAMPU */}

              <div className="indicator-container">

                <div className="indicator-light indicator-return" />

                <span className="indicator-text text-red-600">
                  RETURN
                </span>

              </div>

            </div>

          ))}


        {/* ========================= */}
        {/* KOSONG */}
        {/* ========================= */}

        {requests.filter(
          (item) => item.status !== 'confirmed'
        ).length === 0 &&
          returns.filter(
            (item) => item.status !== 'received'
          ).length === 0 && (

            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-200">

              <div className="text-4xl mb-3">
                ✓
              </div>

              <h2 className="font-bold text-slate-800">
                Tidak ada request
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Semua request dan return sudah diproses.
              </p>

            </div>

          )}


        {/* ========================= */}
        {/* BOTTOM */}
        {/* ========================= */}

        <div className="mt-6 grid grid-cols-2 gap-3">

          <button
            onClick={() => navigate('/admin/history')}
            className="py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold shadow-sm"
          >
            Riwayat
          </button>

          <button
            onClick={handleLogout}
            className="py-4 rounded-2xl bg-slate-800 text-white font-bold"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  )
}

export default AdminDashboard