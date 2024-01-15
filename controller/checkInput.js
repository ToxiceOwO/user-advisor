//检查输入数据
var models = require('../models');
const HttpStatusCodes = require('../constants/httpStatusCodes');

async function checkEmail(email, res, next) {
  try {
    if (await models.advisor.findOne({ where: { email: email } })) {
      res.status(HttpStatusCodes.FORBIDDEN).send('Email already exists')
      return false;
    }
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!re.test(String(email).toLowerCase())) {
      res.status(HttpStatusCodes.FORBIDDEN).send('Invalid email');
      return false;
    };
    return true;
  } catch (error) {
    console.log(error);
  }
}//正则表达式检查邮箱：@前后各有1个以上的字母、数字、下划线、点、横线，@后有1个以上的字母、数字、横线，再有一个点，最后是2-4个字母


async function checkPhone(phone, res, next) {
  try {
    if (await models.advisor.findOne({ where: { phone: phone } })) {
      res.status(HttpStatusCodes.FORBIDDEN).send('Phone number already exists');
      return false;
    }
    const re = /^\+?[1-9]\d{1,14}$/;

    if (!re.test(String(phone))) {
      res.status(HttpStatusCodes.FORBIDDEN).send('Invalid phone number');
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
  }
}//正则表达式检查电话号码：+号可选，1-14位数字

function checkPassword(password, res, next) {
  try {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!re.test(String(password))) {
      res.status(HttpStatusCodes.FORBIDDEN).send('Invalid password');
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
  }
}//正则表达式检查密码：至少8个字符，至少一个大写字母，一个小写字母和一个数字

async function signupCheck(req, res, next) {
  if (await checkEmail(req.body.email, res, next) && await checkPhone(req.body.phone, res, next) && await checkPassword(req.body.password, res, next) == true) {
    return true;
  }
  else return false;
}

module.exports = {
  signupCheck,
  checkEmail,
  checkPhone,
  checkPassword
}