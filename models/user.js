const mangoose = require('mongoose');

const userSchema = new mangoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    posts: [
        {
            type: mangoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]
});

module.exports = mangoose.model('user', userSchema);