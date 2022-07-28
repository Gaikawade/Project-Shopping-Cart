const jwt = require("jsonwebtoken");

const authentication = function (req, res, next) {
    try {
        let token=req.headers[`Authorization`];
        if(!token) token=req.headers[`authorization`];
        if (!token) return res.status(401).send({ status: false, msg: "Token must be present in Auth" });

        let splitToken = token.split(' ');

        jwt.verify(splitToken[1], "SecreteValue", (error, decodedToken) => {
            if (error) {
                const message = error.message == "jwt expired" ? "Token is expired" : "Token is invalid";
                return res.status(401).send({ status: false, message });
            }
            req.userId = decodedToken.userId;
            next();
        })

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
}
module.exports = { authentication };