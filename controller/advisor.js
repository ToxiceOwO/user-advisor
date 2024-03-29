var express = require('express');
var router = express.Router();
var models = require('../models');
var jwt = require('jsonwebtoken');
var check = require('../controller/checkInput.js');
var bcrypt = require('bcrypt');
const e = require('express');
const secret = 'secret';
const HttpStatusCodes = require('../constants/httpStatusCodes');
const advisorStatus = require('../constants/advisorStatus');
const ordersConstants = require('../constants/orders.js');
const orderStatus = ordersConstants.orderStatus;
const orderType = ordersConstants.orderType;
const { where } = require('sequelize');
const saltRounds = 10;
const SUCCESS = 'success';
const FAIL = 'fail';
const INTERNAL_ERROR = 'internal error';
const MAXPRICE = 1000;
const MINPRICE = 0;
const coinLogs = require('../constants/coinLogs');
const order_ = require('../controller/order')
const errorCode = require('../constants/errorCode');

var signup = async function (req, res, next) {
  const advisorSignupData = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    password: req.body.password,
  };//允许注册的顾问信息
  if (advisorSignupData.phone == undefined || advisorSignupData.email == undefined || advisorSignupData.password == undefined) {
    res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid input,both phone and email are required', code: errorCode.MISSING_INPUT });
    return;
  }
  try {
    if (await check.signupCheck(req, res, next) == false)
      return;
    advisorSignupData.password = await bcrypt.hash(req.body.password, saltRounds);
    await models.advisor.create(advisorSignupData);
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问注册

var login = async function (req, res, next) {
  try {
    var advisor = await models.advisor.findOne({ where: { email: req.body.email } });
    if (!advisor) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ status: FAIL, error: 'Advisor not found', code: errorCode.ACCOUNT_NOT_FOUND });
    }
    if (await bcrypt.compare(req.body.password, advisor.password)) {
      var token = jwt.sign({ id: advisor.id, accountType: 1 }, secret, { expiresIn: '24h' });
      res.json({ status: SUCCESS, token: token });
    } else {
      res.json({ status: FAIL, error: 'Invalid password,please check your enter.', code: errorCode.PASSWORD_NOT_MATCH });
    }
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}
//顾问登录

var update = async function (req, res, next) {
  try {
    if (req.body.password) {
      if (!check.checkPassword(req.body.password, res))
        return;
    }
    if (req.body.email) {
      if (!check.checkEmail(req.body.email, res))
        return;
    }
    if (req.body.phone) {
      if (!check.checkPhone(req.body.phone, res))
        return;
    }
    const allowedAdvisorUpdateData = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      password: req.body.password,
      price_per_order: req.body.price_per_order,
    };//允许更新的顾问信息
    if (req.body.password && check.checkPassword(req.body.password, res, next)) {
      allowedAdvisorUpdateData.password = await bcrypt.hash(req.body.password, saltRounds);
    }
    Object.keys(allowedAdvisorUpdateData).forEach(key => allowedAdvisorUpdateData[key] === undefined && delete allowedAdvisorUpdateData[key]);
    const advisor = await models.advisor.findByPk(req.authData.id);
    await advisor.update(allowedAdvisorUpdateData);
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });

  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问信息更新

var getAdvisorInfo = async function (req, res, next) {
  try {
    var id = parseInt(req.authData.id);
    var advisor = await models.advisor.findOne({
      where: { id: id },
      attributes: { exclude: ['password'] }
    });
    if (advisor) {
      res.json({ status: SUCCESS, advisor: advisor });
    } else {
      res.status(HttpStatusCodes.NOT_FOUND).json({ status: FAIL, error: 'advisor not found', code: errorCode.ADVISOR_NOT_FOUND });
    }

  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问访问自己主页

var patch = async function (req, res, next) {
  try {
    var advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    advisor.update(req.body);
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }//顾问信息部分更新
}

var getOrderList = async function (req, res, next) {
  try {
    const orders = await order_.getOrdersByAdvisorId(req.authData.id);
    res.json({ status: SUCCESS, orderList: orders });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问获取订单列表

var respondOrder = async function (req, res, next) {
  const t = await models.sequelize.transaction();
  try {
    const orderId = req.body.orderId;
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    const order = await models.order.findByPk(orderId);
    order.content_reply_message = req.body.content_reply_message;
    order.is_finished = true;
    if (order.advisorid != advisorId) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'You are not the advisor of this order', code: errorCode.ORDER_PERMISSION_AUTH_FAILED });
      return;
    }
    if (order.status != orderStatus.PENDING && order.status != orderStatus.URGENT) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid order status', code: errorCode.ORDER_STATUS_NOT_MATCH });
      return;
    }
    advisor.coin += order.price;
    var coinChange = order.price;
    if (order.status == orderStatus.URGENT) {
      coinChange += order.price * 0.5;
    }
    order.status = orderStatus.FINISHED;
    order.time_finished = Date.now();
    await advisor.increment('coin', { by: coinChange, transaction: t });
    await orderres.json({ status: SUCCESS, code: errorCode.NO_ERROR }); ({ transaction: t });
    await models.coin_log.create({
      account_type: coinLogs.accountType.ADVISOR,
      account_id: advisorId,
      coin_change: coinChange,
      action: coinLogs.coinAction.respondOrder
    }, { transaction: t });
    await t.commit();

    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问响应订单

/*
var changeTextStatus = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    advisor.text_status = !advisor.text_status;
    await advisorres.json({ status: SUCCESS, code:errorCode.NO_ERROR  });();
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问开关文字咨询，无需前端传入参数

var changeVoiceStatus = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    advisor.voice_status = !advisor.voice_status;
    await advisorres.json({ status: SUCCESS, code:errorCode.NO_ERROR  });();
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问开关语音咨询

var changeVideoStatus = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    advisor.video_status = !advisor.video_status;
    await advisorres.json({ status: SUCCESS, code:errorCode.NO_ERROR  });();
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问开关视频咨询

var changeLiveTextStatus = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    advisor.live_text_status = !advisor.live_text_status;
    await advisorres.json({ status: SUCCESS, code:errorCode.NO_ERROR  });();
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问开关文字直播

var changeLiveVideoStatus = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    advisor.live_video_status = !advisor.live_video_status;
    await advisorres.json({ status: SUCCESS, code:errorCode.NO_ERROR  });();
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问开关视频直播

var changeTextPrice = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    price = parseFloat(req.body.text_price);
    if (price < MINPRICE || price > MAXPRICE) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid price' });
      return;
    }
    advisor.text_price = price;
    await advisorres.json({ status: SUCCESS, code:errorCode.NO_ERROR  });();
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问修改文字咨询价格，前端传入的是一个对象，对象的属性是text_price

var changeVoicePrice = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    price = parseFloat(req.body.voice_price);
    if (price < MINPRICE || price > MAXPRICE) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid price' });
      return;
    }
    advisor.voice_price = price;
    await advisorres.json({ status: SUCCESS, code:errorCode.NO_ERROR  });();
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问修改语音咨询价格,前端传入的是一个对象，对象的属性是voice_price

var changeVideoPrice = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    price = parseFloat(req.body.video_price);
    if (price < MINPRICE || price > MAXPRICE) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid price' });
      return;
    }
    advisor.video_price = price;
    await advisorres.json({ status: SUCCESS, code:errorCode.NO_ERROR  });();
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问修改视频咨询价格，前端传入的是一个对象，对象的属性是video_price

var changeLiveTextPrice = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    price = parseFloat(req.body.live_text_price);
    if (price < MINPRICE || price > MAXPRICE) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid price' });
      return;
    }
    advisor.live_text_price = price;
    await advisorres.json({ status: SUCCESS, code:errorCode.NO_ERROR  });();
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问修改文字直播价格，前端传入的是一个对象，对象的属性是live_text_price

var changeLiveVideoPrice = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    price = parseFloat(req.body.live_video_price);
    if (price < MINPRICE || price > MAXPRICE) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid price' });
      return;
    }
    advisor.live_video_price = price;
    await advisorres.json({ status: SUCCESS, code:errorCode.NO_ERROR  });();
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问修改视频直播价格，前端传入的是一个对象，对象的属性是live_video_price
*/
var changeAdvisorStatus = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    await models.advisor.update({ status: models.sequelize.literal('NOT status') }, { where: { id: advisorId } });
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message, code:errorCode.INVALID_ORDER_TYPE });
  }
}//顾问开关顾问状态

var showCoinLogs = async function (req, res, next) {
  try {
    var page = parseInt(req.body.page) || 1; // 默认为第1页
    var pageSize = parseInt(req.body.pageSize) || 10; // 默认每页显示10条
    var offset = (page - 1) * pageSize; // 计算偏移量
    const advisorId = req.authData.id;
    const coinLog = await models.coin_log.findAll({
      where: {
        account_type: coinLogs.accountType.ADVISOR,
        account_id: advisorId,
      },
      limit: pageSize,
      offset: offset,
    });
    res.json({ status: SUCCESS, coinLogs: coinLog });
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//顾问获取自己的金币记录

/*
var addOrderType = async function (req, res, next) {
  try {
    const advisorid = req.authData.id;
    const orderType = req.body.orderType;
    const price = req.body.price;
    const type = req.body.type;
    await models.advisor_order_type.create({
      advisorid: advisorid,
      order_type: orderType,
      type: type,
      price: price,
    });
    res.json({ status: SUCCESS, code:errorCode.NO_ERROR  });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}
*/

var changeOrderType = async function (req, res, next) {
  try {
    const advisorid = req.authData.id;
    const type = parseInt(req.body.type);
    const price = req.body.price;
    const status = req.body.status;
    if (type < 0 || type > 4) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid type' });
      return;
    }
    var currentType = await models.advisor_order_type.findOne({
      where: {
        advisorid: advisorid,
        type: type,
      }
    });
    if (currentType) {
      currentType.price = price;
      currentType.status = status;
      await res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
    }
    else {
      await models.advisor_order_type.create({
        advisorid: advisorid,
        type: type,
        price: price,
        status: status,
      });
    }
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

module.exports = {
  signup,
  login,
  update,
  getAdvisorInfo,
  patch,
  changeAdvisorStatus,
  getOrderList,
  respondOrder,
  /*changeTextStatus,
  changeVoiceStatus,
  changeVideoStatus,
  changeLiveTextStatus,
  changeLiveVideoStatus,
  changeTextPrice,
  changeVoicePrice,
  changeVideoPrice,
  changeLiveTextPrice,
  changeLiveVideoPrice,*/
  showCoinLogs,
  //addOrderType,
  changeOrderType,

}; 