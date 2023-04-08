const path = require("path");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const mongoConnect = require('./util/database');
const errorController = require("./controllers/error");

require("dotenv").config();

const app = express();
app.use(compression());

const mainRoutes = require("./routes/expenseRoute");
const userRoutes = require("./routes/userRoute");
const orderRoutes = require("./routes/orderRoute");
const passwordRoutes = require("./routes/passwordRoute");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/expense", mainRoutes);
app.use("/user", userRoutes);
app.use("/order", orderRoutes);
app.use("/password", passwordRoutes);
app.use((req, res) => {
  if(req.url=="/"){
    res.sendFile(path.join(__dirname, `views/signin.html`));
  }else{
    res.sendFile(path.join(__dirname, `views/${req.url}`));
  }
});

app.use(helmet());

app.use(errorController.get404);

mongoConnect().then(() => {
  console.log("Successfully connected to db");
  app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  });
}).catch(err=>{
    console.log(err);
});
