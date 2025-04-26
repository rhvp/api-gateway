import bcrypt, { genSaltSync } from 'bcryptjs';

class Crypt {
    async hashPassword (password:string) {
        return bcrypt.hash(password, genSaltSync(10))
    }

    async compareHash (string:string, hash:string) {
        return bcrypt.compare(string, hash);
    }
}

export const crypt = new Crypt();