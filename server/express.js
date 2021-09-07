import Template from './../template';
import authRoutes from './routes/auth.routes';
import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import devBundle from './devBundle';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import userRoutes from './routes/user.routes';

//comment out before building for production


const CURRENT_WORKING_DIR = process.cwd();

const app = express();

//comment out before building for production
devBundle.compile(app);
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')));

/*... configure express ... */
// parse body params and attache them to req.body
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use(cookieParser());
app.use(compress());
// secure apps by setting various HTTP headers
app.use(helmet());
// enable CORS - Cross Origin Resource Sharing
app.use(cors());
app.use(morgan('combined'));

/**..Mont routes.. */
app.use('/', authRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.status(200).send(Template());
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: err.name + ': ' + err.message });
  } else if (err) {
    res.status(400).json({ error: err.name + ': ' + err.message });
    console.log(err);
  }
});
export default app;
