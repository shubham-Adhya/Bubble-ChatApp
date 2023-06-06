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
        connectToWs();
    }, [selectedUserId])
    function connectToWs(){
        const ws = new WebSocket('ws://ill-erin-rooster-gown.cyclic.app');
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
        const people={};
        peopleArray.forEach(({userId,userName}) => {
            people[userId]=userName
        });
        setOnlinePeople(people)
    }

    // 'message' event callback
    async function handleMessage(ev){
        const messageData=JSON.parse(ev.data);
        // console.log({ev,messageData})
        if('online' in messageData){
            showOnlinePeople(messageData.online)
        }else if('text' in messageData){
            // console.log(messageData)
            if(messageData.sender === selectedUserId){
                setmessages(prev=>([...prev,{...messageData}]))
            }
        }
    }
    

    function logout(){
        axios.post('/user/logout')
            .then(()=>{
                setWs(null);
                setId(null);
                setLoggedInUserName(null);
            })
        
    }

    function sendMessage(ev, file = null){
        if(ev){
            ev.preventDefault();
        } 
        
        ws.send(JSON.stringify({
            message: {
                recipient: selectedUserId,
                text: newMessageText,
                file,
            }
        }));
        
        if(file){
            axios.get(`/messages/${selectedUserId}`)
            .then((res)=>{
                // console.log(res.data)
                setmessages(res.data)
            })
        }else{
            setnewMessageText('')
            setmessages(prev=>([...prev,{
                text: newMessageText, 
                sender: id,
                recipient: selectedUserId,
                _id: Date.now(),
            }]));
        }

        
    }

    function sendFile(ev){
        const reader=new FileReader();
        reader.readAsDataURL(ev.target.files[0]); //base64 encoded
        reader.onload=()=>{
            sendMessage(null, {
                name: ev.target.files[0].name,
                data: reader.result.split(',')[1],
            })
        }
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
    }, [onlinePeople])

    useEffect(()=>{
        if(selectedUserId){
            axios.get(`/messages/${selectedUserId}`)
                .then((res)=>{
                    setmessages(res.data)
                })
        }
    },[selectedUserId])

    const onlinePeopleExclOurUser= {...onlinePeople};
    delete onlinePeopleExclOurUser[id];
    
    const messagesWithoutDupes=uniqBy(messages, '_id')

    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 flex flex-col">
                <div className="flex-grow">
                    <Logo/>
                    {Object.keys(onlinePeopleExclOurUser).map(userId=>(
                        <Contact 
                            key={userId}
                            id={userId} 
                            online={true}
                            username={onlinePeopleExclOurUser[userId]}
                            onClick={()=>{
                                setselectedUserId(userId);
                                // console.log(onlinePeopleExclOurUser[userId], selectedUserId)
                                // console.log({userId,selectedUserId});
                            }}
                            selected={userId===selectedUserId}/>
                    ))}
                    {Object.keys(offlinePeople).map(userId=>(
                        <Contact 
                            key={userId}
                            id={userId} 
                            online={false}
                            username={offlinePeople[userId]}
                            onClick={()=>{
                                setselectedUserId(userId);
                                // console.log({userId,selectedUserId});
                            }}
                            selected={userId===selectedUserId}
                            />
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
                                        {message.file && (
                                            <div className="">
                                                <a className="border-b flex items-center gap-1" rel='noreferrer' target="_blank" href={axios.defaults.baseURL + 'uploads/'+ message.file}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                                </svg>
                                                    {message.file}
                                                </a>
                                            </div>
                                        )}
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
                    <label className="cursor-pointer bg-blue-200 p-2 text-gray-600 rounded-md border border-blue-300">
                        <input type="file" className="hidden" onChange={sendFile}/>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                        </svg>
                    </label>
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