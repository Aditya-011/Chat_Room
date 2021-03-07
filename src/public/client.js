//////////////     DECLARATIONS     //////////////////////////////
const socket = io();
let name;
let textarea = document.querySelector("#textarea");
let messageArea = document.querySelector(".message__area");
name = document.querySelector(".name").innerHTML;
//////////////////////////////////////////////////////

//var time = new Date().toLocaleTimeString();
//console.log(time);
//console.log(name);
textarea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    sendMessage(e.target.value, "outgoing");
  }
});
////////////////   SEND MESSAGE TO SOCKET SERVER     ///////
function sendMessage(messages, type) {
  let msg = {
    user: name,
    messages: messages.trim(),
    time: new Date().toLocaleTimeString(),
    type: type,
  };

  ///////      APPEND MESSAGE TO CHATROOM  /////////
  appendMessage(msg, "outgoing");
  textarea.value = "";
  scrollToBottom();

  // Send to server
  socket.emit("chatmessage", msg);
}
socket.on("output-messages", (data) => {
  // console.log(data);

  if (1) {
    data.forEach((msg) => {
      appendMessage(msg, "incoming");
      console.log("from db");
    });
  }
});
function appendMessage(msg, type) {
  let mainDiv = document.createElement("div");
  let className = type;
  mainDiv.classList.add(className, "message");

  let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.messages}<br> ${msg.time}</br></p>
    `;
  mainDiv.innerHTML = markup;
  messageArea.appendChild(mainDiv);
}

// Recieve messages
socket.on("message", (msg) => {
  appendMessage(msg, "incoming");
  scrollToBottom();
});

/////////     DISCONNECT ALERT      ////////////////////
socket.on("disconnect", (name) => {
  console.log(`${name} left`);
});

///////////////   SCROLL TO LAST MESSAGE    /////////////
function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight;
}
