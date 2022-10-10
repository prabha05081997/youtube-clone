import {getModelForClass, prop, pre} from '@typegoose/typegoose'
import argon2d from 'argon2';

@pre<User>('save', async function (next) {
    if(this.isModified('password') || this.isNew) {
        const hash = await argon2d.hash(this.password)
        this.password = hash;
        return next();
    }
})
export class User {
    @prop({required: true, unique: true})
    public username: string;
 
    @prop({required: true, unique: true})
    public email: string;

    @prop({required: true})
    public password: string;

    public async comparePassword(password: string): Promise<boolean> {
        return argon2d.verify(this.password, password)
    }
}

export const UserModel = getModelForClass(User, {
    schemaOptions: {
        timestamps: true
    }
})