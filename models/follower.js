var mongoose=require('mongoose');

const Schema = mongoose.Schema;

const follower= new Schema({
    emailoffollower:{
        type: String,
        required: true,
        maxlength: 100
    },
    emailoffollowee:{
        type: String,
        required: true,
        maxlength: 100
    }

});

module.exports=mongoose.model('follower',follower);

