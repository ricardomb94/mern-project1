import User from '../models/user.model';
import errorHandler from './../helpers/dbErrorHandler';
import extend from 'lodash/extend';

// const create = (req, res, next) => {};
// const list = (req, res, next) => {};
// const userByID = (req, res, next) => {};
// const read = (req, res, next) => {};
// const update = (req, res, next) => {};
// const remove = (req, res, next) => {};

//Create new user
const create = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    return res.status(200).json({
      message: 'Vous êtes inscrit avec succès!',
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};
/**Find all the users from the database */
const list = async (req, res) => {
  try {
    let users = await User.find().select('name email updated created');
    res.json(users);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

/**Find user by id*/
const userByID = async (req, res, next, id) => {
  try {
    let user = await User.findById(id);
    if (!user)
      return res.status('400').json({
        error: 'Utilisateur non trouvé',
      });
    req.profile = user;
    next();
  } catch (err) {
    return res.status('400').json({
      error: "L'utilisateur spécifié n'existe pas",
    });
  }
};

/**Read */
const read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

/**Update user */
const update = async (req, res) => {
  try {
    /**Let's retrieve the user details from req.profile and then uses the lodash module to extend and merge the changes that came in the request body to update the user data. */
    let user = req.profile;
    user = extend(user, req.body);
    user.updated = Date.now();
    await user.save();
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

/*
  *The remove function retrieves the user from req.profile and uses the remove() query to delete the user from the database.
*/
const remove = async (req, res) => {
  try {
    let user = req.profile;
    let deletedUser = await user.remove();
    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    res.json(deletedUser);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
};
