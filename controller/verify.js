var jwt = require('jsonwebtoken');
const HttpStatusCodes = require('../constants/httpStatusCodes');

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    req.authorization = bearerToken;
    jwt.verify(bearerToken, 'secret', (err, authData) => {
      if (err) {
        res.sendStatus(HttpStatusCodes.FORBIDDEN);
      } else {
        const timeToExpiration = authData.exp - Math.floor(Date.now() / 1000);
        if (timeToExpiration < 60 * 60) {
          // 生成新令牌
          const newToken = jwt.sign({ user: authData.user }, 'secret', { expiresIn: '1h' });
          // 将新令牌添加到响应头中
          res.setHeader('Authorization', 'Bearer ' + newToken);
        }
        req.authData = authData;
        next();
      }
    });
  } else {
    res.sendStatus(HttpStatusCodes.FORBIDDEN);
  }
}

exports.verifyToken = verifyToken;