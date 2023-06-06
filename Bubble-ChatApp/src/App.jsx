import axios from "axios"
import { UserContextProvider } from "./components/Register/UserContext";
import Routes from "./Routes";


function App() {
  axios.defaults.baseURL="http://ill-erin-rooster-gown.cyclic.app";
  axios.defaults.withCredentials= true;

  return (
    <UserContextProvider>
      <Routes/>
    </UserContextProvider>
  )
}

export default App
