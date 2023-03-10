
const http=require("http")
const Socket=require("websocket").server
const server=http.createServer(()=>{})
const port=process.env.PORT || 3000
server.listen(port,()=>{
    
})

const webSocket=new Socket({httpServer:server})


const users=[]
console.log(`server started at port ${port}`)

webSocket.on('request',(req)=>{
    const connection=req.accept()
    
    console.log("connection accepted")
    
    connection.on('message',(msg)=>{
        const data =JSON.parse(msg.utf8Data)
        console.log(data) 
        const user=findUser(data.name)

        switch(data.type){
            case "store_user" :
                if(user!=null){
                    connection.send(JSON.stringify({
                        type:'user already exists'
                    }))
                return
                }
                const newUser={
                    name:data.name,conn:connection
                }
                users.push(newUser)

            break

            case "start_call":
                let userToCall=findUser(data.target)
                console.log(userToCall)


                if(userToCall){
                    connection.send(JSON.stringify({
                        type:"call_response", data:"user is ready for call"
                    }))
                }
                else{
                    connection.send(JSON.stringify({
                        type:"call_response", data:"user is not online"
                }))
                }
                
            break

            case "create_offer":
                let userToReceiveOffer = findUser(data.target)
                if (userToReceiveOffer){
                    userToReceiveOffer.conn.send(JSON.stringify({
                        type:"offer_received", data:data.data.sdp ,name:data.name
                    }))
                }
                break

            case "create_answer":
                let userToReceiveAnswer=findUser(data.target)
                if (userToReceiveAnswer){
                    userToReceiveAnswer.conn.send(JSON.stringify({
                        type:"answer_received", data:data.data.sdp,name:data.name
                    }))
                }
                break

            case "ice candidate":
                let userToReceiveIceCandidate=findUser(data.target)
                if(userToReceiveIceCandidate){
                    userToReceiveIceCandidate.conn.send(JSON.stringify({
                        type:"ice_candidate",
                        name:data.name,
                        data:{
                            sdpMLineIndex:data.data.sdpMLineIndex,
                            sdpMid:data.data.sdpMid,
                            sdpCandidate:data.data.sdpCandidate
                        }
                    }))
                }
            }
            
            })

    console.log(users)

    connection.on('close',()=>{
        users.forEach( user =>{
            if(user.conn===connection){
                users.splice(users.indexOf(user),1)
                console.log(user)
            }
        })
    })








})

const findUser=username=>{
    for(let i=0;i<users.length;i++)
        if(users[i].name===username)
            return users[i]  
}