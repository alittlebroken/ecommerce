/*

    Utility file for the auth process

*/

// Check the roles of the user
const checkUserRoles = (...roles) => (req, res, next) => {
    // Do we have a valid user in the request

    if(!req.user){
        const error = new Error('You must be logged in to access this resource.');
        error.status = 401;
        next(error);
    }

    // Check the user is in one of the roles passed in
    const inRole = roles.find(role => req.user.roles === role);
    
    if(!inRole){
        const error = new Error('You do not have access to this resource.');
        error.status = 401;
        next(error);
    }

    // User is in role so just go onto the next middleware
    return next();

}

module.exports = { checkUserRoles };