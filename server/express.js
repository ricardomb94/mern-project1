import Template from './../template';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import morgan from 'morgan';
import path from 'path';

//comment out before building for production
import devBundle from './devBundle';

const CURRENT_WORKING_DIR = process.cwd();

const app = express();

//comment out before building for production
devBundle.compile(app);
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')));

/*... configure express ... */
// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
