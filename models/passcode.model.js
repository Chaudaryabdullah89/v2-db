
import mongoose from 'mongoose';

const PasscodeSchema = new mongoose.Schema({
  passcode: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 15,
  }
})

const Passcode = mongoose.model('Passcode', PasscodeSchema)


export default Passcode;