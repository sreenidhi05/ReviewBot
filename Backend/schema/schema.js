const mongoose = require('mongoose')// import validator from 'validator';

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'], // Regex for email validation,
        // validate: {
        //     validator: (value) => validator.isEmail(value),
        //     message: 'Please enter a valid email address',
        // }
    },

    username:{
        type: String,
        required: true,
        unique: true
    },

    password:{
        type: String,
        required: true
    },
    
    history: { 
        type: [String],
         default: [] 
        }
},
{
    timestamps: true // createdAt, updatedAt
});

const User = mongoose.model("User", userSchema);



module.exports = {User};
