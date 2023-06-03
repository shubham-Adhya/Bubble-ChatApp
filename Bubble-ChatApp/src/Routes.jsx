import { useContext } from "react";
import RegisterandLoginForm from "./components/Register/RegisterandLoginForm";
import { UserContext } from "./components/Register/UserContext";
import Chat from "./components/Chat/Chat";

export default function Routes(){
    const {username} =useContext(UserContext);
    if(username){
        return <Chat/>
    }
    return (
        <RegisterandLoginForm/>
    )
} 