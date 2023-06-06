import axios from "axios";
import { useState, useContext } from "react";
import {UserContext} from './UserContext.jsx'

export default function RegisterandLoginForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginRegister]= useState('login');
  const {setLoggedInUserName, setId } = useContext(UserContext);
  
  async function handleSumbit(ev){
    ev.preventDefault();
    const url= isLoginOrRegister==='register'? 'register':'login';
    await axios.post(`/user/${url}`,{email,userName:username,password})
    .then((res)=>{
      console.log(res)
      setLoggedInUserName(res.data.userName || username)
      setId(res.data._id)
    })
    .catch((err)=>{
      console.log(err)
    })
  }

  return (
    <div className=" bg-blue-50 h-screen flex items-center">
      <form action="" className="w-64 mx-auto mb-12" onSubmit={handleSumbit}>
        <input
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          type="text"
          placeholder="Email"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        {isLoginOrRegister==='register' && (
          <input
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          placeholder="Username"
          className="block w-full rounded-sm p-2 mb-2 border"
          />
        )}
        <input
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          placeholder="Password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2" type="submit">
          {isLoginOrRegister === 'register'? "Register": "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister==='register' && (
            <div>
              Already a member? &nbsp;
            <button className=" m-1" onClick={()=>setIsLoginRegister('login')}> Login Here</button>
            </div>
          )}
          {isLoginOrRegister==='login' && (
            <div>
              Dont have an account? &nbsp;
            <button className=" m-1" onClick={()=>setIsLoginRegister('register')}> Register Here</button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
