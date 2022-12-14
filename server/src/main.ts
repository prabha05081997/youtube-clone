import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { connectToDatabase, disconnectFromDatabase } from './utils/database';
import logger from './utils/logger';
import { CORS_ORIGIN } from './constants';
import helmet from 'helmet';
import userRoute from './modules/user/user.route'
import authRoute from './modules/auth/auth.route'
import videoRoute from './modules/videos/video.route'
import deserializeUser from './middleware/deserializeUser';

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}))
app.use(helmet())
app.use(deserializeUser);

app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/videos', videoRoute);

const server = app.listen(PORT, async () => {
    await connectToDatabase();
    logger.info(`server listening at http://localhost:${PORT}`)
})

const signals = ["SIGTERM", "SIGINT"]

function gracefulShutdown(signal: string) {
    process.on(signal, async () => {
        logger.info("Good bye, got signal", signal)
        server.close();

        await disconnectFromDatabase();

        //disconnect from the db
        logger.info('my work here is done')
        
        process.exit(0)
    })
}

for (let i = 0; i < signals.length; i++) {
    gracefulShutdown(signals[i])
}