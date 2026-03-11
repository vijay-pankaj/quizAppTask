import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Hooks/useTheame";
import Header from "./Common/Header";
import Sidebar from "./Common/Sidebar";
import Footer from "./Common/Footer";
import Home from "./Components/Home";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import Categories from "./Components/Categories";
import Set from "./Components/Set";
import Quiz from "./Components/Quiz";
import StartTest from "./Components/StartTest";
import Result from "./Components/Result";
import StudentDashboard from "./Components/StudentDashboard"

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Admin from "./Components/AdminPage"

import Protected from "./Auth/Protected"
import AuthProtected from "./Auth/AuthProtected"

function App() {
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">

          <div className="flex-shrink-0 h-screen overflow-y-auto">
            <Sidebar />
          </div>

          <div className="flex flex-col flex-1 h-screen overflow-y-auto">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/"                              element={<Home />} />
                <Route path="/login"                         element={<Login />} />
                <Route path="/signup"                        element={<Signup />} />
                <Route path="/categories"                    element={<Categories />} />
                <Route path="/categories/:categoryId/sets"   element={<Set />} />
                <Route path="/sets/:setId/quiz"              element={<Quiz />} />
                <Route path="/sets/:setId/start-test"        element={<StartTest />} />
                <Route path="/result/:resultId"              element={<Result />} />
                <Route path="/admin"                         element={<Admin />} />
                <Route path="/StudentDashboard"              element={<StudentDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>

        </div>
        <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  theme="colored"
/>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;