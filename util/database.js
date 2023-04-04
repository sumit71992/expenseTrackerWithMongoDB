const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (callback)=>{
    MongoClient.connect(
        "mongodb+srv://expense:kbickysingh@expensetracker.tbv9mcd.mongodb.net/expensetracker?retryWrites=true&w=majority"
      )
        .then((result)=>{
          console.log("Connected to db");
          _db = result.db();
          callback();
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
};

const getDb = () =>{
    if(_db){
        return _db;
    }
    throw "Something went wrong while connecting to database"
}
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
