const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')

const app = express()
const PORT = 8000

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors())
app.use(express.json())

// ===============================
// KONEKSI MYSQL
// ===============================

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'indofood_rrc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// ===============================
// TEST KONEKSI DATABASE
// ===============================

async function testDatabase() {
  try {
    const connection = await db.getConnection()

    console.log('MySQL berhasil terhubung')

    connection.release()
  } catch (error) {
    console.error(
      'Gagal terhubung ke MySQL:',
      error.message
    )
  }
}

// ===============================
// TEST API
// ===============================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Indofood API berjalan',
  })
})

// ===============================
// LOGIN
// ===============================

app.post('/api/login', async (req, res) => {
  try {
    const {
      username,
      password,
      role,
    } = req.body

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          'Username, password, dan role wajib diisi',
      })
    }

    const [users] = await db.query(
      `
      SELECT
        id,
        name,
        username,
        role
      FROM users
      WHERE username = ?
      AND password = ?
      AND role = ?
      LIMIT 1
      `,
      [
        username,
        password,
        role,
      ]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          'Username, password, atau role salah',
      })
    }

    res.json({
      success: true,
      message: 'Login berhasil',
      user: users[0],
    })
  } catch (error) {
    console.error(
      'LOGIN ERROR:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Terjadi kesalahan pada server',
    })
  }
})

// ===============================
// GET USERS
// ===============================

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        id,
        name,
        username,
        role,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
      `
    )

    res.json(rows)
  } catch (error) {
    console.error(
      'GET USERS ERROR:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal mengambil data users',
    })
  }
})

// ===============================
// CREATE USER
// ===============================

app.post('/api/users', async (req, res) => {
  try {
    const {
      name,
      username,
      password,
      role,
    } = req.body

    if (
      !name ||
      !username ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Nama, username, password, dan role wajib diisi',
      })
    }

    if (
      role !== 'admin' &&
      role !== 'operator'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Role harus admin atau operator',
      })
    }

    const [existingUsers] = await db.query(
      `
      SELECT id
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
      [username]
    )

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          'Username sudah digunakan',
      })
    }

    await db.query(
      `
      INSERT INTO users
      (
        name,
        username,
        password,
        role
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        name,
        username,
        password,
        role,
      ]
    )

    res.status(201).json({
      success: true,
      message:
        'User berhasil disimpan',
    })
  } catch (error) {
    console.error(
      'CREATE USER ERROR:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal menyimpan user',
    })
  }
})

// ===============================
// GET REQUEST
// ===============================

app.get('/api/requests', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM requests
      ORDER BY created_at DESC
      `
    )

    res.json(rows)
  } catch (error) {
    console.error(
      'GET REQUEST ERROR:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal mengambil data request',
    })
  }
})

// ===============================
// CREATE REQUEST
// ===============================

app.post('/api/requests', async (req, res) => {
  try {
    const {
      request_number,
      operator,
      line,
      shift,
      bumbu = 0,
      minyak = 0,
      requested_at,
    } = req.body

    if (
      !request_number ||
      !operator ||
      !line ||
      !shift
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Data request belum lengkap',
      })
    }

    await db.query(
      `
      INSERT INTO requests
      (
        request_number,
        operator,
        line,
        shift,
        bumbu,
        minyak,
        status,
        requested_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        request_number,
        operator,
        line,
        shift,
        Number(bumbu) || 0,
        Number(minyak) || 0,
        'Waiting',
        requested_at || new Date(),
      ]
    )

    res.status(201).json({
      success: true,
      message:
        'Request berhasil disimpan',
    })
  } catch (error) {
    console.error(
      'CREATE REQUEST ERROR:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal menyimpan request',
    })
  }
})

// ===============================
// GET RETURN
// ===============================

app.get('/api/returns', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM returns
      ORDER BY created_at DESC
      `
    )

    res.json(rows)
  } catch (error) {
    console.error(
      'GET RETURN ERROR:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal mengambil data return',
    })
  }
})

// ===============================
// CREATE RETURN
// ===============================

app.post('/api/returns', async (req, res) => {
  try {
    const {
      return_number,
      operator,
      line,
      shift,
      bumbu = 0,
      minyak = 0,
      returned_at,
    } = req.body

    if (
      !return_number ||
      !operator ||
      !line ||
      !shift
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Data return belum lengkap',
      })
    }

    await db.query(
      `
      INSERT INTO returns
      (
        return_number,
        operator,
        line,
        shift,
        bumbu,
        minyak,
        status,
        returned_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        return_number,
        operator,
        line,
        shift,
        Number(bumbu) || 0,
        Number(minyak) || 0,
        'Waiting',
        returned_at || new Date(),
      ]
    )

    res.status(201).json({
      success: true,
      message:
        'Return berhasil disimpan',
    })
  } catch (error) {
    console.error(
      'CREATE RETURN ERROR:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal menyimpan return',
    })
  }
})

// ===============================
// CONFIRM REQUEST
// ===============================

app.put(
  '/api/requests/:id/confirm',
  async (req, res) => {
    try {
      const { id } = req.params
      const { actual } = req.body

      const actualData = actual || {}

      const actualBumbu =
        Number(actualData.bumbu) || 0

      const actualMinyak =
        Number(actualData.minyak) || 0

      const [rows] = await db.query(
        `
        SELECT *
        FROM requests
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      )

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            'Request tidak ditemukan',
        })
      }

      const requestData = rows[0]

      if (
        actualBumbu >
        requestData.bumbu
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Actual bumbu tidak boleh lebih besar dari request',
        })
      }

      if (
        actualMinyak >
        requestData.minyak
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Actual minyak tidak boleh lebih besar dari request',
        })
      }

      const now = new Date()

      await db.query(
        `
        UPDATE requests
        SET
          actual_bumbu = ?,
          actual_minyak = ?,
          status = 'Received',
          started_at = COALESCE(started_at, ?),
          confirmed_at = ?,
          received_at = ?
        WHERE id = ?
        `,
        [
          actualBumbu,
          actualMinyak,
          now,
          now,
          now,
          id,
        ]
      )

      await db.query(
        `
        INSERT INTO transaction_history
        (
          transaction_type,
          transaction_number,
          operator,
          line,
          shift,
          bumbu,
          minyak,
          actual_bumbu,
          actual_minyak,
          status,
          transaction_date,
          transaction_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          'request',
          requestData.request_number,
          requestData.operator,
          requestData.line,
          requestData.shift,
          requestData.bumbu,
          requestData.minyak,
          actualBumbu,
          actualMinyak,
          'Received',
          now
            .toISOString()
            .slice(0, 10),
          now
            .toTimeString()
            .slice(0, 8),
        ]
      )

      res.json({
        success: true,
        message:
          'Request berhasil dikonfirmasi',
      })
    } catch (error) {
      console.error(
        'CONFIRM REQUEST ERROR:',
        error
      )

      res.status(500).json({
        success: false,
        message:
          'Gagal mengonfirmasi request',
      })
    }
  }
)

// ===============================
// CONFIRM RETURN
// ===============================

app.put(
  '/api/returns/:id/confirm',
  async (req, res) => {
    try {
      const { id } = req.params
      const { actual } = req.body

      const actualData = actual || {}

      const actualBumbu =
        Number(actualData.bumbu) || 0

      const actualMinyak =
        Number(actualData.minyak) || 0

      const [rows] = await db.query(
        `
        SELECT *
        FROM returns
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      )

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            'Return tidak ditemukan',
        })
      }

      const returnData = rows[0]

      const now = new Date()

      await db.query(
        `
        UPDATE returns
        SET
          status = 'Received',
          started_at = COALESCE(started_at, ?),
          confirmed_at = ?,
          received_at = ?
        WHERE id = ?
        `,
        [
          now,
          now,
          now,
          id,
        ]
      )

      await db.query(
        `
        INSERT INTO transaction_history
        (
          transaction_type,
          transaction_number,
          operator,
          line,
          shift,
          bumbu,
          minyak,
          actual_bumbu,
          actual_minyak,
          status,
          transaction_date,
          transaction_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          'return',
          returnData.return_number,
          returnData.operator,
          returnData.line,
          returnData.shift,
          returnData.bumbu,
          returnData.minyak,
          actualBumbu,
          actualMinyak,
          'Received',
          now
            .toISOString()
            .slice(0, 10),
          now
            .toTimeString()
            .slice(0, 8),
        ]
      )

      res.json({
        success: true,
        message:
          'Return berhasil dikonfirmasi',
      })
    } catch (error) {
      console.error(
        'CONFIRM RETURN ERROR:',
        error
      )

      res.status(500).json({
        success: false,
        message:
          'Gagal mengonfirmasi return',
      })
    }
  }
)

// ===============================
// HISTORY
// ===============================

app.get('/api/history', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM transaction_history
      ORDER BY created_at DESC
      `
    )

    res.json(rows)
  } catch (error) {
    console.error(
      'GET HISTORY ERROR:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal mengambil history',
    })
  }
})

// ===============================
// START SERVER
// ===============================

app.listen(PORT, async () => {
  console.log(
    `Server API berjalan di http://127.0.0.1:${PORT}`
  )

  await testDatabase()
})