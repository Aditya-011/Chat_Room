require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const PORT = process.env.PORT || 3000;
const passport = require("passport");
const cookieSession = require("cookie-session");
require("./passport-setup");
const io = require("socket.io")(http);
const mongoose = require("mongoose");
const Msg = require("./models/messages");
const db = process.env.DBURL;
////////////////////        MONGO SETUP ////////////////////

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then(() => {
    console.log("DB Connected...");
  })
  .catch((err) => console.log(err));

///////////////     MIDDLEWARES     /////////////////
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// For an actual app you should configure this with an experation time, better keys, proxy and secure
app.use(
  cookieSession({
    name: "tuto-session",
    keys: ["key1", "key2"],
  })
);

// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};
////////////////////  PASSPORT SETUP    ////////////////////
// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

//////////////      ROUTES      //////////////
// Example protected and unprotected routes
app.get("/", (req, res) => res.render("pages/index"));
app.get("/failed", (req, res) => res.send("You Failed to log in!"));

// In this route you can see that if the user is logged in u can acess his info in: req.user
app.get("/good", isLoggedIn, (req, res) => {
  res.render("pages/middle", {
    name: req.user.displayName,
    pic: req.user.photos[0].value,
    email: req.user.emails[0].value,
  });
});

// Auth Routes
app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/good");
  }
);

app.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});
app.get("/chatroom", (req, res) => {
  res.render("pages/chat", {
    name: req.user.displayName,
    pic: req.user.photos[0].value,
    email: req.user.emails[0].value,
  });
});

// Socket

///////////////////////////////      SOCKET CONNECTION     //////////////////

io.on("connection", (socket) => {
  Msg.find().then((result) => {
    socket.emit("output-messages", result);
  });
  //console.log("a user connected");
  //socket.emit("message", "Hello world");
  socket.on("disconnect", () => {
    //console.log("user disconnected");
  });
  socket.on("chatmessage", (msg) => {
    // console.log(msg);
    const user = msg.user;
    const messages = msg.messages;
    const time = msg.time;
    const date = new Date().getDate();
    //REMOVE MESSAGES FROM DB
    //console.log(user);
    //console.log(process.env.ADMIN);
    //console.log(messages);
    if (user == process.env.ADMIN && messages == "/deleteall") {
      //console.log("flagged");
      Msg.remove()
        .then(function () {
          console.log("Data deleted"); // Success
        })
        .catch(function (error) {
          console.log(error); // Failure
        });
    }
    const message = new Msg({
      user,
      messages,
      time,
      date,
    });

    if (msg.messages != "/deleteall") {
      message.save().then(() => {
        //console.log("J9");
        io.emit("message", msg);
      });
    }
  });
});
////////////////////////////////////      SERVER //////////////////////////////
http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
