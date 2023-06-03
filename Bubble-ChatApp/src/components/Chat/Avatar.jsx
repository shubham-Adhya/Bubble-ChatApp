 export default function Avatar({userId,username,online}){
    const colors=['bg-red-200','bg-green-200', 'bg-purple-200', 
                    'bg-blue-200','bg-yellow-200', 'bg-teal-200','bg-lime-200','bg-sky-300','bg-cyan-300','bg-indigo-300']

    const userIdBase10 = parseInt(userId, 16);
    const colorIndex=(userIdBase10 % colors.length)
    const color=colors[colorIndex]
    return (
        <div className={"w-8 h-8 relative rounded-full flex items-center "+ color}>
            <div className="text-center w-full opacity-80 font-semibold">
                {username[0].toUpperCase()}    
            </div>
            {online && (
                <div className=" absolute w-3 h-3 bg-green-500 rounded-full -bottom-1 -right-0 border border-white"></div>
            )}
            {!online && (
                <div className=" absolute w-3 h-3 bg-gray-400 rounded-full -bottom-1 -right-0 border border-white"></div>
            )}
        </div>
    )
 }