
const chatForm=document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const roomName = document.getElementById('room-name');


const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

  const socket=io();

//   console.log(username,room);

  //join room
  socket.emit('joinRoom',{username,room});


// Get room and users
 socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
  });



 socket.on('message',message=>{
    console.log(message);               //CATCH MESSAGES FROM SERVER
    outputMessage(message);

    chatMessages.scrollTop=chatMessages.scrollHeight;
});


chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    const msg=e.target.elements.msg.value;  //get message text

    socket.emit('chatMessage',msg);    //emit message from client to server

    e.target.elements.msg.value='';

    e.target.elements.msg.focus();
})

//FN (OUTPUT MESSAGE) TO DISPLAY MESSAGE
function outputMessage(message){
    // const div=document.createElement('div');
    // div.classList.add('message');
    // div.innerHML=`<p class="meta">Brad <span>9:12pm</span></p>
    // <p class="text">
    //     ${message}
    // </p>`;
    // document.querySelector('.chat-messages').appendChild(div);

    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

  // Add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}