import axios from "axios";
import { UserContextProvider } from "./components/Context/UserContext";
import Renderer from "./Renderer";

function App() {
  axios.defaults.baseURL = "http://localhost:8080/";
  axios.defaults.withCredentials = true;

  return (
    <UserContextProvider>
      <Renderer />
    </UserContextProvider>
  );
}

export default App;
