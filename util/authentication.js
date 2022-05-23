const ResponseTransformer = require('./response');

const authentication = (needStaff = 0) => (req, res, next) => {
  const { user } = req.session;
  if (!user) {
    const { response, httpCode } = new ResponseTransformer({ errCode: 3441 });
    return res.status(httpCode).json(
      { code: response.code, error: response.error, data: response.data },
    );
  }

  // staff use
  if (needStaff === 1) {
    if (!user.staff_id) {
      const { response, httpCode } = new ResponseTransformer({ errCode: 3442 });
      return res.status(httpCode).json(
        { code: response.code, error: response.error, data: response.data },
      );
    }
  }
  // Both student and staff can use
  return next();
};

module.exports = { authentication };
