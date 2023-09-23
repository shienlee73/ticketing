import { Model, Document, Schema, model } from "mongoose";
import { Password } from "../services/Password";

interface UserAttrs {
  email: string;
  password: string;
}

interface IUser extends Document {
  email: string;
  password: string;
}

interface UserModel extends Model<IUser> {
  build(attrs: UserAttrs): IUser;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

userSchema.statics.build = (attrs: IUser) => {
  return new User(attrs);
};

const User = model<IUser, UserModel>("User", userSchema);

export { User };
