import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import config from './../../config/config';

/**The POST request object receives the email and password in req.body. This email is used to retrieve a matching user from the database. Then, the password authentication method defined in UserSchema is used to verify the password that's received in req.body from the client. */
const signin = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status('401')
        .json({ error: "Cet utilisateur n'est pas inscrit" });

    if (!user.authenticate(req.body.password)) {
      return res
        .status('401')
        .send({ error: "L'email et le mot de passe ne correspondent pas" });
    }
    /**If the password is successfully verified, the JWT module is used to generate a signed JWT using a secret key and the user's _id value. */
    const token = jwt.sign({ _id: user._id }, config.jwtSecret);

    res.cookie('t', token, { expire: new Date() + 9999 });
    /**The signed JWT is returned to the authenticated client, along with the user's details. Optionally, we can also set the token to a cookie in the response object so that it is available to the client-side if cookies are the chosen form of JWT storage. */
    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status('401').json({ error: 'Impossible de se connecter' });
  }
};

/**Signout */
const signout = (req, res) => {
  res.clearCookie('t');
  return res.status('200').json({
    message: 'Déconnecté',
  });
};
/**The requireSignin method uses express-jwt to verify that the incoming request has a valid JWT in the Authorization header.If the token is valid, it appends the verified user's ID in an 'auth' key to the request object; otherwise, it throws an authentication error. */
const requireSignin = expressJwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
  userProperty: 'auth',
});

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!authorized) {
    return res.status('403').json({
      error: 'Utilisateur non autorisé',
    });
  }
  next();
};

export default {
  signin,
  signout,
  requireSignin,
  hasAuthorization,
};
