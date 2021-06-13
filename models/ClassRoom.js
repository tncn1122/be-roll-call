const mongoose = require('mongoose');

const classRoomSchema = mongoose.Schema({
    id: {
        type: String,
        unique: true,
        require: true,
        trim: true
    },
    stringDate: [
        {
            type: String,
            require: true
        }
    ]
})

const classRoom = mongoose.model('ClassRoom', classRoomSchema);

module.exports = classRoom;