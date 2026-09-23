import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import SharedBrain from "./pages/SharedBrain";
import SharedNote from "./pages/SharedNote";
// import SynaTest from "./pages/SynaTest";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/brain/:shareLink"
        element={<SharedBrain />}
      />

      <Route
        path="/note/share/:shareLink"
        element={<SharedNote />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
{/* 
        <Route
          path="/syna-test"
          element={<SynaTest />}
        /> */}
      </Route>

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;