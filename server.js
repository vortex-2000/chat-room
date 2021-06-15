const express= require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');

const formatMessage=require('./utils/messages');

const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
  } = require('./utils/users');

const app=express();
const server=http.createServer(app);
const io=socketio(server);

app.use(express.static(path.join(__dirname,'public')));


const botName='chatCord Bot';


//SOCKET SYNTAX 'EVENT NAME',ARGS
//"TO"===========WILL SEND DATA TO OTHER SIDE
//"ON"===========WILL CATCH DATA FROM OTHER SIDE BASED ON EVENT NAME
//io.emit();   //SENDS TO ALL USERS
//socket.broadcast.emit()   //SENDs THIS ALL USERS EXCEPT THE ONEWHO SENDS/BROADCASTS IT
//socket.emit   ////SENDS THIS TO CLIENT SIDE(ONLY TO A PARTICULAR CLIENT)


//RUNS WHEN CLIENT CONNECTS
io.on('connection',socket=>{

    socket.on('joinRoom',({username,room})=>{
        //console.log('New WS Connection...');    //LOGS ON THE SERVER SIDE


        const user=userJoin(socket.id,username,room);

        socket.join(user.room);

        socket.emit('message',formatMessage(botName,'WELCOME TO CHATROOM'));   //SENDS THIS TO CLIENT SIDE(ONLY TO A PARTICULAR CLIENT)

        socket.broadcast
            .to(user.room)
            .emit('message',formatMessage(botName,`${user.username} has joined`));    //SENDs THIS ALL USERS EXCEPT THE ONEWHO SENDS/BROADCASTS IT

        //io.emit();   //SENDS TO ALL USERS

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
        });
    });



    //LISTEN / CATCH from client chatMessage
    socket.on('chatMessage',msg=>{
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })


    socket.on('disconnect',()=>{
        const user=userLeave(socket.id);

        if(user){
            io.to(user.room).emit(
                'message',
                formatMessage(botName,`${user.username} has left`)
            );

             // Send users and room info
            // io.to(user.room).emit('roomUsers', {
            //     room: user.room,
            //     users: getRoomUsers(user.room)
            // });
        }


    });
});

const PORT=3000 ||process.env.PORT;

server.listen(PORT,()=>console.log(`Server running on port ${PORT}`))

