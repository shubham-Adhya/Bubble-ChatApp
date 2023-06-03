import { useContext, useEffect, useRef, useState } from "react"
import Logo from "./Logo";
import { UserContext } from "../Register/UserContext";
import {uniqBy} from 'lodash';
import axios from 'axios'
import Contact from "./Contact";

export default function Chat(){
    let [ws, setWs]=useState(null);
    const [onlinePeople, setOnlinePeople]=useState({});
    const [offlinePeople, setOfflinePeople]=useState({});
    const [selectedUserId,setselectedUserId]=useState(null);
    const [newMessageText, setnewMessageText]=useState('');
    const [messages, setmessages]= useState([]);
    const {username,id, setId, setLoggedInUserName}=useContext(UserContext)
    const divUnderMessages= useRef()

    useEffect(()=>{
        connectToWs()
    },[])
    function connectToWs(){
        const ws = new WebSocket('ws://localhost:8080');
        setWs(ws);
        ws.addEventListener('message',handleMessage);
        ws.addEventListener('close',()=>{
            setTimeout(()=>{
                console.log('Disconnected. Trying to Reconnect...')
                connectToWs()
            },1000)
        });
    }
    function showOnlinePeople(peopleArray){
        const people=new Object();
        peopleArray.forEach(({userId,userName}) => {
            people[userId]=userName
        });
        setOnlinePeople(people)
    }

    // 'message' event callback
    function handleMessage(ev){
        const messageData=JSON.parse(ev.data);
        // console.log({ev,messageData})
        if('online' in messageData){
            showOnlinePeople(messageData.online)
        }else if('text' in messageData){
            setmessages(prev=>([...prev,{...messageData}]))
        }
    }
    function selectContact(userId){
        setselectedUserId(userId)
    }

    function logout(){
        axios.post('/user/logout')
            .then(()=>{
                setWs(null);
                setId(null);
                setLoggedInUserName(null);
            })
        
    }

    function sendMessage(ev){
        ev.preventDefault();
        ws.send(JSON.stringify({
            message: {
                recipient: selectedUserId,
                text: newMessageText
            }
        }))
        setnewMessageText('')
        setmessages(prev=>([...prev,{
            text: newMessageText, 
            sender: id,
            recipient: selectedUserId,
            _id: Date.now()
        }]));
    }

    useEffect(()=>{     
        const div=divUnderMessages.current;
        if(div) div.scrollIntoView({behavior: 'smooth' , block: 'end'});
    },[messages])

    useEffect(()=>{
        axios.get('/user/people')
            .then((res)=>{
                const offlinePeopleArr= res.data
                    .filter(p=> p._id !== id)
                    .filter(p=> !Object.keys(onlinePeople).includes(p._id))

                const offlinePeople={}
                offlinePeopleArr.forEach(p => {
                    offlinePeople[p._id]=p.userName;
                });

                setOfflinePeople(offlinePeople);

            })
    },[onlinePeople])

    useEffect(()=>{
        if(selectedUserId){
            axios.get(`/messages/${selectedUserId}`)
                .then((res)=>{
                    const {data}=res;
                    setmessages(data)
                })
        }
    },[selectedUserId])

    const messagesWithoutDupes=uniqBy(messages, '_id')
    const onlinePeopleExclOurUser= {...onlinePeople};
    delete onlinePeopleExclOurUser[id];

    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 flex flex-col">
                <div className="flex-grow">
                    <Logo/>
                    {Object.keys(onlinePeopleExclOurUser).map(userId=>(
                        <Contact 
                            key={userId}
                            id={userId} 
                            username={onlinePeopleExclOurUser[userId]}
                            onClick={()=>selectContact(userId)}
                            selected={userId===selectedUserId}
                            online={true}/>
                    ))}
                    {Object.keys(offlinePeople).map(userId=>(
                        <Contact 
                            key={userId}
                            id={userId} 
                            username={offlinePeople[userId]}
                            onClick={()=>selectContact(userId)}
                            selected={userId===selectedUserId}
                            online={false}/>
                    ))}
                </div>
                <div className="p-2 text-center flex items-center justify-center">
                    <span className="mr-2 text-sm text-gray-00 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                        {username}
                    </span>
                    <button 
                        className="text-sm text-gray-500 bg-blue-100 py-1 px-2 border rounded-sm"
                        onClick={logout}>Logout</button>
                </div>
            </div>
            <div className="flex flex-col bg-blue-50 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId && (
                        <div className="flex h-full flex-grow items-center justify-center">
                            <div className="text-gray-400">
                                &larr; Select person from the sidebar
                            </div>
                        </div>
                    )}
                    {!!selectedUserId && (
                        <div className=" relative h-full">
                            <div className=" overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                            {messagesWithoutDupes.map(message=>(
                                <div key={message._id} className={(message.sender===id ? ' text-right':'text-left')}>
                                    <div className={'text-left inline-block p-2 my-2 rounded-md text-sm '+(message.sender === id ? 'bg-blue-700 text-white': 'bg-white text-gray-500')}>
                                        {/* sender: {message.sender}<br/>
                                        my id: {id}<br/> */}
                                        {message.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={divUnderMessages}></div>
                            </div>
                        </div>
                    )}
                </div>
                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                    <input type="text" 
                            value={newMessageText}
                            onChange={ev=>setnewMessageText(ev.target.value)}
                            placeholder="Type your message here" 
                            className="bg-white border p-2 flex-grow rounded-md"/>
                    <button type="submit" className="bg-blue-500 p-2 text-white rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 -rotate-45">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                    </form>
                )}
            </div>
        </div>
    )
}