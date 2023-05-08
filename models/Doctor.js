const mongoose = require("mongoose");
const DoctorToken = require("./DoctorToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const doctorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// fire a function before doc saved to db
doctorSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const DAY = 1000 * 60 * 60 * 24;
const createToken = (id, days = 1) => {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: DAY * days,
  });
};

doctorSchema.statics.login = function (username, password) {
  return new Promise((resolve, reject) => {
    this.findOne({ username })
      .then((doctor) => {
        if (!doctor) reject("Username is inccorrect");
        else {
          bcrypt.compare(password, doctor.password, (err, isCorrect) => {
            if (err) reject("Password compiling error");
            if (isCorrect) {
              const doctorToken = new DoctorToken({ doctorId: doctor._id });
              DoctorToken.findOneAndDelete({ doctorId: doctor._id })
                .then(() => {
                  doctorToken.save().then((dbToken) => {
                    const { password, createdAt, updatedAt, ...data } =
                      doctor._doc;
                    const token = createToken(dbToken._id);
                    resolve({ doctor: data, token });
                  });
                })
                .catch(reject);
            } else reject("Password is incorrect");
          });
        }
      })
      .catch();
  });
};

const Doctor = mongoose.model("doctor", doctorSchema);

module.exports = Doctor;
