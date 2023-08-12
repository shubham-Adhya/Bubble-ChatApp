import axios from "axios"
import { UserContextProvider } from "./components/Register/UserContext";
import Routes from "./Routes";
// import { BrowserRouter,Routes, Route } from "react-router-dom";

function App() {
  axios.defaults.baseURL="http://localhost:8080/";
  axios.defaults.withCredentials= true;

  return (
    <UserContextProvider>
      <Routes/>
    </UserContextProvider>
  )
}

export default App
