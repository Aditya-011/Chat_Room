//const { name } = require("ejs");

//////////////     DECLARATIONS     //////////////////////////////
const socket = io();
let name;

let textarea = document.querySelector("#textarea");
let messageArea = document.querySelector(".message__area");
name = document.querySelector(".name").innerHTML;
let curname = name;
//////////////////////////////////////////////////////

//var time = new Date().toLocaleTimeString();
//console.log(time);
//console.log(name);
textarea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    if (textarea.value) {
      sendMessage(e.target.value);
    }
  }
});
document.querySelector(".sendBtn").addEventListener("click", () => {
  if (textarea.value) {
    sendMessage(textarea.value);
  }
});
////////////////   SEND MESSAGE TO SOCKET SERVER     ///////
function sendMessage(messages) {
  let msg = {
    user: name,
    messages: messages.trim(),
    time: new Date().toLocaleTimeString(),
  };

  ///////      APPEND MESSAGE TO CHATROOM  /////////
  if (msg.messages != "/deleteall") {
    appendMessage(msg, "outgoing");
    textarea.value = "";
    scrollToBottom();
  } else {
    textarea.value = "";
    scrollToBottom();
  }

  /////////////////////    SEND MESSAGE TO SOCKET SERVER
  socket.emit("chatmessage", msg);
}

/////////////////////////////     RENDER MESSAGES FROM CLOUD    ///////////
socket.on("output-messages", (data) => {
  // console.log(data);

  data.forEach((msg) => {
    if (msg.user != curname) {
      appendMessage(msg, "incoming");
      //console.log(`${msg.user} & ${curname}`);
    } else {
      appendMessage(msg, "outgoing");
    }
    //console.log("from db");
    scrollToBottom();
  });
});

/////////////   RENDER MESSAGES     //////////////
function appendMessage(msg, type) {
  let mainDiv = document.createElement("div");
  console.log(typeof msg.messages);
  let className = type;
  mainDiv.classList.add(className, "message");

  let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.messages}</p>
        <p class="time">${msg.time}</p>
    `;
  mainDiv.innerHTML = markup;
  messageArea.appendChild(mainDiv);
}

///////////        RECEIVE MESSAGES FROM SOCKET SERVER    ////////
socket.on("message", (msg) => {
  if (msg.user != curname) {
    appendMessage(msg, "incoming");
  }
  scrollToBottom();
});

///////////////   SCROLL TO LAST MESSAGE    /////////////
function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight;
}
