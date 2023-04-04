const { BOOLEAN } = require("sequelize");
const Sequelize  = require("sequelize");
const sequelize = require('../util/database');

const Forgot = sequelize.define('forgot',{
id:{
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
},
isActive: Sequelize.BOOLEAN
});
module.exports = Forgot;