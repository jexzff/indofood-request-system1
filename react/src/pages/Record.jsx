import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Record() {
  const navigate = useNavigate()

  const [records, setRecords] = useState([])
  const [doneIds, setDoneIds] = useState([])

  // =====================================================
  // LOAD RECORD
  // =====================================================

  const loadRecords = () => {
    const history =
      JSON.parse(localStorage.getItem('requestHistory')) || []

    const done =
      JSON.parse(localStorage.getItem('indofood_done_records')) || []

    const confirmed = history.filter(
      (item) =>
        item.type === 'request' &&
        (
          item.status === 'Confirmed' ||
          item.status === 'confirmed'
        ) &&
        !done.includes(item.id)
    )

    setRecords(confirmed)
    setDoneIds(done)
  }

  useEffect(() => {
    loadRecords()

    const interval = setInterval(() => {
      loadRecords()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // =====================================================
  // DONE
  // =====================================================

  const handleDone = (id) => {

    const currentDone =
      JSON.parse(
        localStorage.getItem('indofood_done_records')
      ) || []

    const updatedDone = [
      ...currentDone,
      id,
    ]

    localStorage.setItem(
      'indofood_done_records',
      JSON.stringify(updatedDone)
    )

    setDoneIds(updatedDone)

    setRecords((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    )
  }

  // =====================================================
  // UPDATE ACT
  // =====================================================

  const updateActual = (
    id,
    field,
    value
  ) => {

    const history =
      JSON.parse(
        localStorage.getItem('requestHistory')
      ) || []

    const updated = history.map((item) => {

      if (item.id !== id) {
        return item
      }

      return {
        ...item,
        [field]: value,
      }

    })

    localStorage.setItem(
      'requestHistory',
      JSON.stringify(updated)
    )

    setRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    )
  }

  // =====================================================
  // FORMAT JAM
  // =====================================================

  const getJamKirim = (item) => {

    if (item.confirmed_at) {

      const date =
        new Date(item.confirmed_at)

      if (!isNaN(date.getTime())) {

        return date.toLocaleTimeString(
          'id-ID',
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        )

      }

    }

    if (item.confirmedAt) {

      const match =
        item.confirmedAt.match(
          /\d{2}:\d{2}/
        )

      if (match) {
        return match[0]
      }

    }

    return item.time || '-'
  }

  // =====================================================
  // GET PO
  // =====================================================

  const getPO = (item) => {

    return (
      item.no_po ||
      item.noPO ||
      item.po_number ||
      item.poNumber ||
      item.request_number ||
      '-'
    )
  }

  // =====================================================
  // GET FLAVOR
  // =====================================================

  const getFlavor = (item) => {

    return (
      item.flavor ||
      item.flavour ||
      item.flavor_name ||
      item.product ||
      'INDOMIE'
    )
  }

  // =====================================================
  // GET SHIFT
  // =====================================================

  const getShift = (item) => {

    return (
      item.shift ||
      '-'
    )
  }

  return (

    <div className="min-h-screen bg-slate-100 pb-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-blue-700 text-white rounded-b-[34px] shadow-xl">

        <div className="max-w-7xl mx-auto px-5 py-7">

          <button
            onClick={() =>
              navigate('/admin')
            }
            className="text-sm text-blue-100 hover:text-white mb-5"
          >
            ← Kembali ke Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

            <div>

              <p className="text-xs font-bold tracking-widest text-blue-200">
                INDOFOOD CBP SUKSES MAKMUR TBK · DEPARTEMEN TEKNIK
              </p>

              <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
                Hasil Record
              </h1>

              <p className="text-blue-100 mt-2">
                Record hasil request barang yang telah dikonfirmasi.
              </p>

            </div>


            {/* TOTAL */}

            <div className="bg-white/10 border border-white/10 rounded-2xl px-6 py-4">

              <p className="text-[10px] font-bold tracking-widest text-blue-200">
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

        {/* INFO */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-6">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">

              <span className="text-xl text-blue-700 font-bold">
                ▤
              </span>

            </div>

            <div>

              <h2 className="font-extrabold text-slate-800">
                Record Pengiriman
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Data akan tetap tersimpan di riwayat meskipun tombol DONE ditekan.
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            TABLE DESKTOP
        ================================================= */}

        {records.length > 0 ? (

          <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1150px] border-collapse">

                <thead>

                  <tr className="bg-blue-700 text-white">

                    <th className="px-4 py-4 text-xs font-extrabold text-center">
                      NO
                    </th>

                    <th className="px-4 py-4 text-xs font-extrabold text-center">
                      NO PO
                    </th>

                    <th className="px-4 py-4 text-xs font-extrabold text-left">
                      FLAVOUR / JENIS
                    </th>

                    <th className="px-4 py-4 text-xs font-extrabold text-center">
                      JENIS
                    </th>

                    <th className="px-4 py-4 text-xs font-extrabold text-center">
                      RQS
                    </th>

                    <th className="px-4 py-4 text-xs font-extrabold text-center">
                      JAM KIRIM
                    </th>

                    <th className="px-4 py-4 text-xs font-extrabold text-center">
                      ACT
                    </th>

                    <th className="px-4 py-4 text-xs font-extrabold text-center">
                      JAM
                    </th>

                    <th className="px-4 py-4 text-xs font-extrabold text-center">
                      SHIFT
                    </th>

                    <th className="px-4 py-4 text-xs font-extrabold text-center">
                      AKSI
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {records.map((item, index) => {

                    const bumbu =
                      Number(item.bumbu || 0)

                    const minyak =
                      Number(item.minyak || 0)

                    return (

                      <RecordRows
                        key={item.id}
                        item={item}
                        index={index}
                        bumbu={bumbu}
                        minyak={minyak}
                        getPO={getPO}
                        getFlavor={getFlavor}
                        getJamKirim={getJamKirim}
                        getShift={getShift}
                        updateActual={updateActual}
                        handleDone={handleDone}
                      />

                    )

                  })}

                </tbody>

              </table>

            </div>

          </div>

        ) : (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-12 text-center">

            <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center">

              <span className="text-4xl text-slate-400">
                ✓
              </span>

            </div>

            <h2 className="text-xl font-extrabold text-slate-800 mt-5">
              Belum ada hasil record
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Request yang sudah dikonfirmasi akan muncul di halaman ini.
            </p>

          </div>

        )}

      </main>

    </div>
  )
}


// =====================================================
// RECORD ROWS
// =====================================================

function RecordRows({
  item,
  index,
  bumbu,
  minyak,
  getPO,
  getFlavor,
  getJamKirim,
  getShift,
  updateActual,
  handleDone,
}) {

  const hasBumbu = bumbu > 0
  const hasMinyak = minyak > 0

  const rows = []

  if (hasBumbu) {
    rows.push({
      jenis: 'BUMBU',
      rqs: bumbu,
      actualField: 'actual_bumbu',
      actual:
        item.actual_bumbu === null ||
        item.actual_bumbu === undefined ||
        item.actual_bumbu === ''
          ? bumbu
          : item.actual_bumbu,
    })
  }

  if (hasMinyak) {
    rows.push({
      jenis: 'MINYAK',
      rqs: minyak,
      actualField: 'actual_minyak',
      actual:
        item.actual_minyak === null ||
        item.actual_minyak === undefined ||
        item.actual_minyak === ''
          ? minyak
          : item.actual_minyak,
    })
  }

  if (rows.length === 0) {

    rows.push({
      jenis: '-',
      rqs: 0,
      actualField: 'actual_bumbu',
      actual: 0,
    })

  }

  return (
    <>
      {rows.map((row, rowIndex) => (

        <tr
          key={`${item.id}-${row.jenis}`}
          className={`border-b border-slate-200 ${
            rowIndex % 2 === 0
              ? 'bg-white'
              : 'bg-slate-50'
          } hover:bg-blue-50/40 transition`}
        >

          {/* NO */}

          <td className="px-4 py-4 text-center">

            <span className="font-extrabold text-slate-700">
              {index + 1}
            </span>

          </td>


          {/* NO PO */}

          <td className="px-4 py-4 text-center">

            <span className="font-bold text-slate-700 text-sm">
              {getPO(item)}
            </span>

          </td>


          {/* FLAVOR */}

          <td className="px-4 py-4">

            <div>

              <p className="font-extrabold text-slate-800">
                {getFlavor(item)}
              </p>

              <p className="text-[10px] text-slate-400 mt-1">
                LINE {item.line}
              </p>

            </div>

          </td>


          {/* JENIS */}

          <td className="px-4 py-4 text-center">

            <span
              className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-extrabold ${
                row.jenis === 'BUMBU'
                  ? 'bg-blue-100 text-blue-700'
                  : row.jenis === 'MINYAK'
                    ? 'bg-cyan-100 text-cyan-700'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              {row.jenis}
            </span>

          </td>


          {/* REQUEST */}

          <td className="px-4 py-4 text-center">

            <span className="text-lg font-extrabold text-slate-800">
              {row.rqs}
            </span>

            <span className="block text-[9px] text-slate-400 font-bold">
              DUS
            </span>

          </td>


          {/* JAM KIRIM */}

          <td className="px-4 py-4 text-center">

            <span className="font-bold text-slate-700">
              {getJamKirim(item)}
            </span>

          </td>


          {/* ACT */}

          <td className="px-3 py-4 text-center">

            <input
              type="number"
              min="0"
              value={row.actual}
              onChange={(e) =>
                updateActual(
                  item.id,
                  row.actualField,
                  e.target.value
                )
              }
              className="w-20 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-center font-extrabold text-blue-700 outline-none focus:ring-2 focus:ring-blue-300"
            />

          </td>


          {/* JAM */}

          <td className="px-4 py-4 text-center">

            <span className="font-bold text-slate-700">
              {getJamKirim(item)}
            </span>

          </td>


          {/* SHIFT */}

          <td className="px-4 py-4 text-center">

            <span className="inline-flex w-8 h-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-extrabold">
              {getShift(item)}
            </span>

          </td>


          {/* DONE */}

          <td className="px-4 py-4 text-center">

            {rowIndex === 0 && (

              <button
                onClick={() => handleDone(item.id)}
                className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-extrabold shadow-sm transition"
              >
                DONE
              </button>

            )}

          </td>

        </tr>

      ))}

    </>
  )
}

export default Record