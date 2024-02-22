import dotenv from 'dotenv';


dotenv.config();

const config = {
    redis:{
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    jwt:{
        secret: process.env.JWT_SECRET
    }
}

export default config;