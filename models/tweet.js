var mongoose=require('mongoose');

const Schema = mongoose.Schema;

const Tweet= new Schema({
    tweet:{
        type: String,
        required: true,
        maxlength: 140
    },
    author:{
        type: String,
        required: true,
    },
    timestamp:{
        type: Date,
        required: true

    },
    token:{
        type: String
    }
});

module.exports=mongoose.model('Tweet',Tweet);
