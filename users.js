const mongoose = require("mongoose");

const userCollection = "users";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        isRequired: true,
    },
    password: {
        type: String,
        isRequired: true,
    },
});

const UserModel = mongoose.model(userCollection, userSchema);
module.exports = {
    UserModel
}
