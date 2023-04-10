const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();

//define user array for get user details
const users = [
  { id: 1, username: "admin", password: "password", role: "admin" },
  { id: 2, username: "user", password: "password", role: "user" },
];

//configure passport
passport.use(
  new LocalStrategy(function (username, password, done) {
    const user = users.find((u) => u.username === username);
    if (!user) {
      return done(null, false, { message: "incorrect user name " });
    }
    if (user.password !== password) {
      return done(null, false, { message: "incorrect password" });
    }
    return done(null, user);
  })
);

//used to serialize the user object into a unique identifier,
// which can then be stored in the session.
//The first argument is the user object that was returned by the authentication strategy,
// and the second argument is a callback function that takes two arguments:
// an error object (or null if there is no error), and the serialized user identifier.

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//deserialize the user object from the session.
// The first argument is the serialized user identifier,
// and the second argument is a callback function that takes two arguments:
// an error object (or null if there is no error), and the deserialized user object.

passport.deserializeUser(function (id, done) {
  const user = users.find((u) => u.id === id);
  done(null, user);
});

//configure app
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//custom middleware to check user roles
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).send("unothorized");
  }
}

function isUser(req, res, next) {
  if (req.user && (req.user.role === "admin" || req.user.role === "user")) {
    next();
  } else {
    res.status(401).send("unothorized");
  }
}

//define routes
app.get("/", function (req, res) {
  res.send("Welcome to my app!");
});

app.get("/admin", isAdmin, function (req, res) {
  res.send("Welcome, Admin!");
});

app.get("/user", isUser, function (req, res) {
  res.send("Welcome, User!");
});

app.get("/login", function (req, res) {
  res.send(`
    <h1>Login</h1>
    <form method="post" action="/login">
      <div>
        <label>Username:</label>
        <input type="text" name="username">
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password">
      </div>
      <div>
        <input type="submit" value="Log In">
      </div>
    </form>
  `);
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

// start server
app.listen(3000, function () {
  console.log("Server listening on port 3000");
});
