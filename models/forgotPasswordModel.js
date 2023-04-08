const mongoose  = require('mongoose');
const Schema = mongoose.Schema;

const forgotSchema = new Schema({
_id:{
    type: String,
},
isActive:{
    type: Boolean
},
userId:{
    type: Schema.Types.ObjectId
}
});
module.exports = mongoose.model("Forgot",forgotSchema);