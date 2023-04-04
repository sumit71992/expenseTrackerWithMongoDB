const getDb = require("../util/database").getDb;

class User {
  constructor(name, email, password, totalExpenses, isPremium) {
    this.name = name;
    (this.email = email), (this.password = password);
    this.totalExpenses = totalExpenses;
    this.isPremium = isPremium;
  }
  save() {
    const db = getDb();
    db.collection("Users").insertOne(this).then((res)=>{
        console.log(res);
    }).catch((err)=>{
        console.log(err);
    });
  }
}

module.exports = User;
