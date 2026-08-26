import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/citizen/Dashboard";
import ReportComplaint from "./pages/citizen/ReportComplaint";
import ComplaintsList from "./pages/citizen/ComplaintsList";
import ComplaintDetail from "./pages/citizen/ComplaintDetail";
import DepartmentDashboard from "./pages/department/DepartmentDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Protected Route Component to restrict views by Auth and User Roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#ffffff",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: "600",
        }}
      >
        <h3>Authenticating Official Portal Credentials...</h3>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect if role is not authorized
    if (currentUser.role === "citizen") return <Navigate to="/citizen/dashboard" replace />;
    if (currentUser.role === "department_head") return <Navigate to="/department/dashboard" replace />;
    if (currentUser.role === "staff") return <Navigate to="/staff/dashboard" replace />;
    if (currentUser.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Citizen Dashboard & Lodge Grievance Protected routes */}
            <Route
              path="/citizen/dashboard"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/report"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <ReportComplaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/complaints"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <ComplaintsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/complaint/:id"
              element={
                <ProtectedRoute allowedRoles={["citizen", "department_head", "staff", "admin"]}>
                  <ComplaintDetail />
                </ProtectedRoute>
              }
            />

            {/* Department Head Routes */}
            <Route
              path="/department/dashboard"
              element={
                <ProtectedRoute allowedRoles={["department_head", "admin"]}>
                  <DepartmentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/department/complaint/:id"
              element={
                <ProtectedRoute allowedRoles={["department_head", "admin"]}>
                  <ComplaintDetail />
                </ProtectedRoute>
              }
            />

            {/* Government Staff Routes */}
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute allowedRoles={["staff"]}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/task/:id"
              element={
                <ProtectedRoute allowedRoles={["staff", "department_head", "admin"]}>
                  <ComplaintDetail />
                </ProtectedRoute>
              }
            />

            {/* Commissioner / Admin Route */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default Route redirecting based on auth */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
