import "./App.css";
import Login from "./Login";
import Register from "./Register";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";

function App() {
  const path = window.location.pathname;

  if (path === "/register") {
    return <Register />;
  }

  if (path === "/admin") {
    return <AdminDashboard />;
  }

  if (path === "/student") {
    return <StudentDashboard />;
  }

  return <Login />;
}

export default App;