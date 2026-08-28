import { BrowserRouter, Route, Routes } from "react-router-dom"
import UserLayout from "./Layouts/UserLayout"
import Login from "./Components/Login"
import Home from "./Pages/Home"



function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<UserLayout/>}>
        <Route index element={<Login/>}/>
        <Route path="home" element={<Home/>}/>
      </Route>
    </Routes>
    </BrowserRouter>
      
    </>
  )
}

export default App
