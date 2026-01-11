import mongoose from 'mongoose';

const validRoles = {
    values: ["ADMIN", "USER"],
    message: "{VALUE} is not a valid role"
};

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "Username is required"],
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        default: "USER",
        enum: validRoles
    },
    active: {
        type: Boolean,
        default: true
    },
    favoriteJokes: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Joke' }
    ]
});

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.role;
    delete userObject.__v;
    delete userObject.active;

    return userObject;
}

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.User || mongoose.model('User', UserSchema);
