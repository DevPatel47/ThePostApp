const mangoose = require('mongoose');

const postSchema = new mangoose.Schema({
    user: {
        type: mangoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true
    },
    likes: [
        {
            type: mangoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    comments: [
        {
            user: {
                type: mangoose.Schema.Types.ObjectId,
                ref: 'user'
            },
            content: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

module.exports = mangoose.model('post', postSchema);