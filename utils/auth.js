/*

    Utility file for the auth process

*/

// Check the roles of the user
const checkUserRoles = (roles) => (req, res, next) => {
    // Do we have a valid user in the request
    if(!req.user){
        const error = new Error('You must be logged in to access this resource.');
        error.status = 401;
        next(err);
    }

    // Check the user is in one of the roles passed in
    const inRole = roles.find(role => req.user.role === role);
    if(!inRole){
        const error = new Error('You do not have access this resource.');
        error.status = 401;
        next(err);
    }

    // User is in role so just go onto the next middleware
    return next();

}

module.exports = { checkUserRoles };