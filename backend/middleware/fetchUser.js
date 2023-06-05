var jwt = require('jsonwebtoken');
const JWT_SEC="MyNameIsArpit@Mall";

const fetchUser = (req, res, next) => {

    // Get the user from the jwt token and add id to req object
    const token = req.header("auth-token");
    if(!token)
        {
           return res.status(401).send({eror : "Please authenticate using a valid token"});
        }
    
    try
        {
            const data = jwt.verify(token,JWT_SEC);
            req.user = data.user;
            next();
        } 
    catch (error) 
        {
            return res.status(401).send({eror : "Please authenticate using a valid token"});
        }
}

module.exports = fetchUser;