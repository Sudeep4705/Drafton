import { BrowserRouter, Route, Routes } from "react-router-dom"
import UserLayout from "./Layouts/UserLayout"


function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<UserLayout/>}>
        
      </Route>
    </Routes>
    </BrowserRouter>
      
    </>
  )
}

export default App
