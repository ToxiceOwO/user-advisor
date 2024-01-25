var express = require('express');
var router = express.Router();
var models = require('../models');
var jwt = require('jsonwebtoken');
var verifyToken = require('./verify').verifyToken;
var bcrypt = require('bcrypt');
var check = require('../controller/checkInput.js');
var Redis = require('ioredis');
var redis = new Redis();
var comment = require('./order.js');
const e = require('express');
const secret = 'secret';
const HttpStatusCodes = require('../constants/httpStatusCodes');
const saltRounds = 10;
const ordersConstants = require('../constants/orders.js');
const { param } = require('../routes/advisor.js');
const orderStatus = ordersConstants.orderStatus;
const orderType = ordersConstants.orderType;
const orderType_NUMBER = ordersConstants.orderTypeNum;
const SUCCESS = 'success';
const FAIL = 'fail';
const INTERNAL_ERROR = 'internal error';
const coinLogs = require('../constants/coinLogs');
const order_ = require('../controller/order.js');
const errorCode = require('../constants/errorCode.js');

var login = async function (req, res, next) {
  try {
    var user = await models.user.findOne({ where: { email: req.body.email } });
    if (user == null) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'User not found', code: errorCode.ACCOUNT_NOT_FOUND });
      return;
    };
    if (await bcrypt.compare(req.body.password, user.password)) {
      var token = jwt.sign({ id: user.id, accountType:0 }, secret, { expiresIn: '24h' });
      res.json({ status: SUCCESS, token: token });
    } else {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid login', code: errorCode.PASSWORD_NOT_MATCH });
    }
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, errorMessage: error.message, code: errorCode.NO_ERROR });
  }
}

var getInfo = async function (req, res, next) {
  try {
    var user = await models.user.findOne({
      where: { id: req.authData.id },
      attributes: { exclude: ['password'] }
    });
    if (user) {
      res.json({ user: user });
    } else {
      res.status(HttpStatusCodes.NOT_FOUND).json({ status: FAIL, error: 'user not found', code: errorCode.USER_NOT_FOUND, });
    }


  } catch (error) {
    console.log(error);
  }
}

var signup = async function (req, res, next) {
  const userSignData = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    birth: req.body.birth,
    gender: req.body.gender,
    password: req.body.password,
  };//注册时需要提交的用户信息
  if (userSignData.phone == undefined || userSignData.email == undefined || userSignData.password == undefined) {
    res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid input,both phone and email are required', code: MISSING_INPUT });
    return;
  }
  try {
    if (!(await check.signupCheck(req, res, next)))
      return;
    userSignData.password = await bcrypt.hash(req.body.password, saltRounds);
    await models.user.create(userSignData)
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}//用户注册



var infoUpdate = async function (req, res, next) {
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
    if (req.body.birth) {
      if (!check.checkDate(req.body.birth, res))
        return;
    }
    const allowedUserUpdateData = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      birth: req.body.birth,
      gender: req.body.gender,
      bio: req.body.bio,
      about: req.body.about,
      password: req.body.password,
    };//允许更新的顾问信息
    const userId = req.authData.id;
    const user = await models.user.findByPk(userId);
    if (req.body.password && check.checkPassword(req.body.password, res)) {
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    }
    Object.keys(allowedUserUpdateData).forEach(key => allowedUserUpdateData[key] === undefined && delete allowedUserUpdateData[key]);

    user.update(req.body);
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });

  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}


var getAdvisorList = async function (req, res, next) {
  try {
    var page = parseInt(req.body.page) || 1; // 默认为第1页
    var pageSize = parseInt(req.body.pageSize) || 10; // 默认每页显示10条
    var offset = (page - 1) * pageSize; // 计算偏移量
    var advisor = await models.advisor.findAll({
      attributes: { exclude: ['password'] },
      limit: pageSize,
      offset: offset,
    });
    var advisorList = [];
    for (var i = 0; i < advisor.length; i++) {
      advisorList[i] = {
        id: advisor[i].id,
        name: advisor[i].name,
        about: advisor[i].about,
      };
    }
    res.json({ status: SUCCESS, advisorList: advisorList });
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var getAdvisorInfo = async function (req, res, next) {
  try {
    var advisor = await models.advisor.findOne({ where: { id: req.body.id } });
    if (advisor == null) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Advisor not found', code: errorCode.ADVISOR_NOT_FOUND });
      return;
    }
    var orderType = await models.advisor_order_type.findAll({ where: { advisorid: advisor.id } });
    var showAdvisor = {
      id: advisor.id,
      name: advisor.name,
      about: advisor.about,
      orderType: orderType,
      comments_count: advisor.comments_count,
      rate: advisor.rate,
      ontime_rate: advisor.ontime_rate,
    };
    res.json({ status: SUCCESS, advisor: showAdvisor });
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: 'Server error' });
  }
}


var orderCreate = async function (req, res, next) {
  const orderData = {
    userid: req.authData.id,
    advisorid: req.body.advisorid,
    type: parseInt(req.body.type),
    content_general_situation: req.body.content_general_situation,
    content_specific_question: req.body.specific_question,

  };//允许用户定义的订单信息,type为int,0,1,2,3,4分别为文字、语音、视频、实时文字、实时视频
  if (orderData.type > 4 || orderData.type < 0) {
    res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid order type', code: errorCode.INVALID_ORDER_TYPE });
    return;
  }
  orderData.status = orderStatus.PENDING;
  const t = await models.sequelize.transaction();
  try {
    const user = await models.user.findByPk(req.authData.id);
    const advisor = await models.advisor.findByPk(orderData.advisorid);
    if (advisor.status == false) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Advisor not available', code: errorCode.ADVISOR_NOT_AVAILABLE });
      return;
    }
    if (advisor == null) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Advisor not found', code: errorCode.ADVISOR_NOT_FOUND });
      return;
    }
    var pricePerOrder;
    var orderType = await models.advisor_order_type.findOne({ where: { advisorid: advisor.id, type: orderData.type } });
    if (orderType == null) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order type not found', code: errorCode.ORDER_TYPE_NOT_FOUND });
      return;
    }
    if (orderType.status == 0) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order type not available', code: errorCode.ORDER_TYPE_NOT_AVAILABLE });
      return;
    };
    pricePerOrder = orderType.price;
    var count = req.body.count || 1;
    Object.keys(orderData).forEach(key => orderData[key] === undefined && delete orderData[key]);
    if (user.coin < count * pricePerOrder) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Not enough coin', code: errorCode.NOT_ENOUGH_COIN });
      return;
    }
    var coin_change = -count * pricePerOrder;
    orderData.price = pricePerOrder * count;
    orderData.is_finished = false;
    orderData.type = orderType.type;
    await models.order.create(orderData), { transaction: t };
    await user.increment('coin', { by: coin_change, transaction: t });
    await models.coin_log.create({
      account_type: coinLogs.accountType.USER,
      account_id: user.id,
      coin_change: coin_change,
      action: coinLogs.coinAction.createOrder,
    }, { transaction: t });
    await t.commit();
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
  }
  catch (error) {
    t.rollback();
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var getMyOrders = async function (req, res, next) {
  try {
    const orders = await order_.getOrdersByUserId(req.authData.id);
    res.json({ status: SUCCESS, orderList: orders });
    return;
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var queryOrder = async function (req, res, next) {
  try {
    var order = await models.order.findByPk(req.body.id);
    var orderInfo = {
      id: order.id,
      type: order.type,
      userid: order.userid,
      advisorid: order.advisorid,
      price: order.price,
      contentGeneralSituation: order.content_general_situation,
      contentSpecificQuestion: order.content_specific_question,
      contentReplyMessage: order.content_reply_message,
      isFinished: order.is_finished,
      timeUrgent: order.time_urgent,
      timeFinished: order.time_finished,
      status: order.status,
    };
    res.json({ status: SUCCESS, orderInfo: orderInfo });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var putOrderUrgent = async function (req, res, next) {
  const t = await models.sequelize.transaction();
  try {
    var order = await models.order.findByPk(req.body.id);
    if (!order) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order not found', code: errorCode.ORDER_NOT_FOUND });
      return;
    };
    var user = await models.user.findByPk(order.userid);
    if (order.status == orderStatus.PENDING) {
      if (user.coin < order.price * 0.5) {
        res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Not enough coin', code: errorCode.NOT_ENOUGH_COIN });
        return;
      }
      await order.update({ status: orderStatus.URGENT, time_urgent: new Date() }, { transaction: t });
      await user.decrement('coin', { by: order.price * 0.5, transaction: t });
      await models.coin_log.create({
        account_type: coinLogs.accountType.USER,
        account_id: user.id,
        coin_change: -order.price * 0.5,
        action: coinLogs.coinAction.putOrderUrgent,
      }, { transaction: t });
      await t.commit();
      res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
    }
    else {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order is NOT pending!', code: errorCode.ORDER_STATUS_NOT_MATCH });
    }
  }
  catch (error) {
    t.rollback();
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var commentOrder = async function (req, res, next) {
  try {
    var order = await models.order.findByPk(req.body.id);
    if (req.body.comment == null) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid comment', code: errorCode.MISSING_INPUT });
      return;
    }
    if (req.body.rate < 0 || req.body.rate > 5) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid rate', code: errorCode.INVALID_RATE });
      return;
    }
    if (order.is_comment == true) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Already commented', code: errorCode.COMMENT_ALREADY_EXIST });
      return;
    }
    if (order.status == orderStatus.FINISHED) {
      await models.comment.create({
        userid: order.userid,
        advisorid: order.advisorid,
        orderid: order.id,
        comment: req.body.comment,
        rate: req.body.rate,
      });
      await order.update({ is_comment: true });
      order_.updateCommentsCache(order.advisorid);
      res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
    }

    else {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order status error', code: errorCode.ORDER_STATUS_NOT_MATCH });
    }
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var getCommentList = async function (req, res, next) {
  try {
    var page = parseInt(req.body.page) || 1; // 默认为第1页
    var pageSize = parseInt(req.body.pageSize) || 10; // 默认每页显示10条
    var offset = (page - 1) * pageSize; // 计算偏移量
    const comments = await comment.getAdvisorComments(req.body.advisorid, pageSize, offset);
    res.json({ status: SUCCESS, comments: comments });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var cancelOrder = async function (req, res, next) {
  try {
    var order = await models.order.findByPk(req.body.id);
    var user = await models.user.findByPk(order.userid);
    if (req.authData.id != order.userid) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Not your order', code: errorCode.ORDER_PERMISSION_AUTH_FAILED });
      return;
    }
    if (order.status == orderStatus.PENDING || order.status == orderStatus.URGENT) {
      var coinChange = order.price;
      if (order.status == orderStatus.URGENT) {
        coinChange = order.price * 1.5;
      }
      const t = await models.sequelize.transaction();
      await models.coin_log.create({
        account_type: coinLogs.accountType.USER,
        account_id: user.id,
        coin_change: coinChange,
        action: coinLogs.coinAction.cancelOrder,
      }, { transaction: t });
      await user.increment('coin', { by: coinChange, transaction: t });
      await order.update({ status: orderStatus.CANCELLED }, { transaction: t });
      await t.commit();
      res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
    }
    else {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order status error', code: errorCode.ORDER_STATUS_NOT_MATCH });
    }
  }
  catch (error) {
    t.rollback();
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var tipOrder = async function (req, res, next) {
  const t = await models.sequelize.transaction();
  try {
    const result = await models.sequelize.transaction(async (t) => {
    var user = await models.user.findByPk(req.authData.id, { transaction: t });
    var order = await models.order.findOne({ where: { id: req.body.orderid, userid: req.authData.id }, transaction: t});
    if (!order) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order not found', code: errorCode.ORDER_NOT_FOUND });
      return;
    }
    var advisor = await models.advisor.findByPk(order.advisorid, { transaction: t });
    if (order.status != orderStatus.FINISHED) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order status error', code: errorCode.ORDER_STATUS_NOT_MATCH });
      return;
    }
    if (order.is_tip == true) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Already tipped', code: errorCode.ALREADY_TIP });
      return;
    }
    if (user.coin < req.body.coin) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Not enough coin', code: errorCode.NOT_ENOUGH_COIN });
      return;
    }
    user.coin = user.coin - req.body.coin;
    advisor.coin = advisor.coin + req.body.coin;
    await models.coin_log.create({
      account_type: coinLogs.accountType.USER,
      account_id: user.id,
      coin_change: -req.body.coin,
      action: coinLogs.coinAction.tipAdvisor,
    }, { transaction: t });
    await models.coin_log.create({
      account_type: coinLogs.accountType.ADVISOR,
      account_id: advisor.id,
      coin_change: req.body.coin,
      action: coinLogs.coinAction.tipAdvisor,
    }, { transaction: t });
    await order.update({ is_tip: true }, { transaction: t });
    await user.decrement('coin', { by: req.body.coin, transaction: t });
    await advisor.increment('coin', { by: req.body.coin, transaction: t });
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });});
    return result;
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var favoriteAdvisor = async function (req, res, next) {
  try {
    const fav = await models.user_fav.findOne({ where: { userid: req.authData.id, advisorid: req.body.id } })
    if (fav && fav.is_del == false) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Already favorite', code: errorCode.FAVORITE_ALREADY_EXIST });
      return;
    }
    if (fav && fav.is_del == true) {
      await models.user_fav.update({ is_del: false }, { where: { userid: req.authData.id, advisorid: req.body.id } });
      res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
      return;
    }
    await models.user_fav.create({
      userid: req.authData.id,
      advisorid: req.body.id,
    });
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var getFavoriteList = async function (req, res, next) {
  try {
    var userFav = await models.user_fav.findAll({ where: { userid: req.authData.id, is_del: false }, });
    res.json({ status: SUCCESS, favoriteList: userFav });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var deleteFavorite = async function (req, res, next) {
  try {
    const fav = await models.user_fav.findOne({ where: { userid: req.authData.id, advisorid: req.body.id } })
    if (!fav||fav.is_del==true) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Not favorite', code: errorCode.FAVORITE_NOT_FOUND });
      return;
    }
    await models.user_fav.update({ is_del: true }, { where: { userid: req.authData.id, advisorid: req.body.id } });
    res.json({ status: SUCCESS, code: errorCode.NO_ERROR });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var showCoinLogs = async function (req, res, next) {
  try {
    var page = parseInt(req.body.page) || 1; // 默认为第1页
    var pageSize = parseInt(req.body.pageSize) || 10; // 默认每页显示10条
    var offset = (page - 1) * pageSize; // 计算偏移量
    var coinLog = await models.coin_log.findAll({
      where: { account_id: req.authData.id, account_type: coinLogs.accountType.USER },
      limit: pageSize,
      offset: offset,
    });
    res.json({ status: SUCCESS, coinLogs: coinLog });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }

}

module.exports = {
  login,
  getInfo,
  signup,
  infoUpdate,
  getAdvisorList,
  getAdvisorInfo,
  orderCreate,
  getMyOrders,
  queryOrder,
  putOrderUrgent,
  commentOrder,
  getCommentList,
  cancelOrder,
  tipOrder,
  favoriteAdvisor,
  getFavoriteList,
  deleteFavorite,
  showCoinLogs,
}