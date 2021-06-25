import express from 'express';
import path from 'path';
import dotenv from 'dotenv'; // Use our own environment variables when in development
import morgan from 'morgan'; // Prints out requests to the server in server logs

import authRoutes from './routes/auth.js';
import goalRoutes from './routes/goal.js';
import routineRoutes from './routes/routine.js';
import userRoutes from './routes/user.js';

const app = express();

dotenv.config({ path: './config/config.env' });

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
    // Use morgan for logging requests made to the server
    app.use(morgan('dev'));
}

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/goal', goalRoutes);
app.use('/api/v1/routine', routineRoutes);
app.use('/api/v1/user', userRoutes);

// Points requests to host server to refer to React built bundle for our frontend
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (request, response) => response.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')));
}

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`));