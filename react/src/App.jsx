import { Navigate, Route, Routes } from 'react-router-dom'

import Login from './pages/Login'

import AdminDashboard from './pages/AdminDashboard'
import OperatorDashboard from './pages/OperatorDashboard'
import OperatorReturn from './pages/OperatorReturn'

import History from './pages/History'
import LineDetail from './pages/LineDetail'
import Record from './pages/Record'

import RequestForm from './pages/RequestForm'
import ReturnForm from './pages/ReturnForm'




function ProtectedRoute({ children, role }) {

  const isLoggedIn =
    sessionStorage.getItem('isLoggedIn') === 'true'

  const loginRole =
    sessionStorage.getItem('loginRole')

  if (!isLoggedIn || !loginRole) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (loginRole !== role) {

    if (loginRole === 'admin') {
      return (
        <Navigate
          to="/admin"
          replace
        />
      )
    }

    if (loginRole === 'operator') {
      return (
        <Navigate
          to="/operator"
          replace
        />
      )
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}


function App() {

  return (
    <Routes>

      {/* LOGIN */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =================================================
          ADMIN
      ================================================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/line/:id"
        element={
          <ProtectedRoute role="admin">
            <LineDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/history"
        element={
          <ProtectedRoute role="admin">
            <History />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/record"
        element={
          <ProtectedRoute role="admin">
            <Record />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          OPERATOR
      ================================================= */}

      <Route
        path="/operator"
        element={
          <ProtectedRoute role="operator">
            <OperatorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator/line/:id"
        element={
          <ProtectedRoute role="operator">
            <LineDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator/history"
        element={
          <ProtectedRoute role="operator">
            <History />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator/request"
        element={
          <ProtectedRoute role="operator">
            <RequestForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator/return"
        element={
          <ProtectedRoute role="operator">
            <ReturnForm />
          </ProtectedRoute>
        }
      />


      {/* DEFAULT */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  )
}

export default App