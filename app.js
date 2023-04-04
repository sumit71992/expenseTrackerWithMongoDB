const path = require("path");
const fs = require("fs");
// const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const morgan = require("morgan");
const mongoConnect = require('./util/database').mongoConnect;
const errorController = require("./controllers/error");

require("dotenv").config();

const app = express();
app.use(compression());
// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

// const mainRoutes = require("./routes/expenseRoute");
const userRoutes = require("./routes/userRoute");
// const orderRoutes = require("./routes/orderRoute");
// const passwordRoutes = require("./routes/passwordRoute");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// app.use("/expense", mainRoutes);
app.use("/user", userRoutes);
// app.use("/order", orderRoutes);
// app.use("/password", passwordRoutes);
app.use((req, res) => {
  if(req.url=="/"){
    res.sendFile(path.join(__dirname, `views/signin.html`));
  }else{
    res.sendFile(path.join(__dirname, `views/${req.url}`));
  }
});

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(errorController.get404);

mongoConnect(()=>{
  app.listen(port);
})
