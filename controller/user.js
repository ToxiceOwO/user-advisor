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


var login = async function (req, res, next) {
  try {
    var user = await models.user.findOne({ where: { email: req.body.email } });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      var token = jwt.sign({ id: user.id, name: user.name }, secret, { expiresIn: '24h' });
      res.json({ token: token });
    } else {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid login' });
    }
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, errorMessage: error.message });
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
      res.status(HttpStatusCodes.NOT_FOUND).json({ status: FAIL, error: 'user not found' });
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
    res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid input,both phone and email are required' });
    return;
  }
  try {
    if (!(await check.signupCheck(req, res, next)))
      return;
    userSignData.password = await bcrypt.hash(req.body.password, saltRounds);
    if (!await models.user.create(userSignData)) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'please check your input' });
      return;
    }
    res.json({ status: SUCCESS });
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
    res.json({ status: SUCCESS });

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
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Advisor not found' });
      return;
    }
    var showAdvisor = {
      id: advisor.id,
      name: advisor.name,
      about: advisor.about,
      textStatus: advisor.text_status,
      voiceStatus: advisor.voice_status,
      videoStatus: advisor.video_status,
      liveTextStatus: advisor.live_text_status,
      liveVideoStatus: advisor.live_video_status,
      coin: advisor.coin,
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
    price: req.body.price,
    typeid: parseInt(req.body.typeid),
    content_general_situation: req.body.content_general_situation,
    content_specific_question: req.body.specific_question,

  };//允许用户定义的订单信息,type为int,0,1,2,3,4分别为文字、语音、视频、实时文字、实时视频
  orderData.status = orderStatus.PENDING;
  const t = await models.sequelize.transaction();
  try {
    const user = await models.user.findByPk(req.authData.id);
    const advisor = await models.advisor.findByPk(req.body.advisorid);
    if (advisor.status == false) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Advisor not available' });
      return;
    }
    if (advisor == null) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Advisor not found' });
      return;
    }
    var pricePerOrder;
    var orderType = models.advisor_order_type.findOne({ where: { advisorid: advisor.id, typeid: typeid } });
    if (orderType == null) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order type not found' });
      return;
    }
    if (orderType.status == false) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order type not available' });
      return;
    };
    pricePerOrder = orderType.price;
    var count = req.body.count || 1;
    Object.keys(orderData).forEach(key => orderData[key] === undefined && delete orderData[key]);
    if (user.coin < count * pricePerOrder) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Not enough coin' });
      return;
    }
    var coin_change = -count * pricePerOrder;
    user.coin = user.coin + coin_change;
    orderData.price = pricePerOrder * count;
    orderData.is_finished = false;
    await models.order.create(orderData), { transaction: t };
    await user.save({ transaction: t });
    await models.coin_log.create({
      account_type: coinLogs.accountType.USER,
      account_id: user.id,
      coin_change: coin_change,
      action: coinLogs.coinAction.createOrder,
    }, { transaction: t });
    await t.commit();
    res.json({ status: SUCCESS });
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
  try {
    var order = await models.order.findByPk(req.body.id);
    if (!order) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order not found' });
      return;
    };
    var user = await models.user.findByPk(order.userid);
    if (order.status == orderStatus.PENDING) {
      if (user.coin < order.price * 0.5) {
        res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Not enough coin' });
        return;
      }
      user.coin = user.coin - order.price * 0.5;
      order.status = orderStatus.URGENT;
      order.time_urgent = new Date();
      const t = await models.sequelize.transaction();
      await order.save({ transaction: t });
      await user.save({ transaction: t });
      await models.coin_log.create({
        account_type: coinLogs.accountType.USER,
        account_id: user.id,
        coin_change: -order.price * 0.5,
        action: coinLogs.action.putOrderUrgent,
      }, { transaction: t });
      await t.commit();
      res.json({ status: SUCCESS });
    }
    else {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order status error' });
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
    var advisor = await models.advisor.findByPk(order.advisorid);
    if (req.body.comment == null) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid comment' });
      return;
    }
    if (req.body.rate < 0 || req.body.rate > 5) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Invalid rate' });
      return;
    }
    if (order.comment != null) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Already commented' });
      return;
    }
    if (order.status == orderStatus.FINISHED) {
      order.rate = req.body.rate;
      order.comment = req.body.comment;
      await order.save();
      res.json({ status: SUCCESS });
    }

    else {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order status error' });
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
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Not your order' });
      return;
    }
    if (order.status == orderStatus.PENDING || order.status == orderStatus.URGENT) {
      user.coin = user.coin + order.price;
      if (order.status == orderStatus.URGENT) {
        user.coin = user.coin + order.price * 0.5;
      }
      order.status = orderStatus.CANCELLED;
      const t = await models.sequelize.transaction();
      await models.coin_log.create({
        account_type: coinLogs.accountType.USER,
        account_id: user.id,
        coin_change: order.price,
        action: coinLogs.coinAction.cancelOrder,
      }, { transaction: t });
      await user.save({ transaction: t });
      await order.save({ transaction: t });
      await t.commit();
      res.json({ status: SUCCESS });
    }
    else {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Order status error' });
    }
  }
  catch (error) {
    t.rollback();
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var tipAdvisor = async function (req, res, next) {
  const t = await models.sequelize.transaction();
  try {
    var advisor = await models.advisor.findByPk(req.body.id);
    var user = await models.user.findByPk(req.authData.id);
    if (user.coin < req.body.coin) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Not enough coin' });
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
    await user.save({ transaction: t });
    await advisor.save({ transaction: t });
    await t.commit();
    res.json({ status: SUCCESS });
  }
  catch (error) {
    await t.rollback();
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var favoriteAdvisor = async function (req, res, next) {
  try {
    var user = await models.user.findByPk(req.authData.id);
    var advisor = await models.advisor.findByPk(req.body.id);
    if (advisor == null) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Advisor not found' });
      return;
    }
    if (user.favorite_advisor.indexOf(advisor.id) != -1) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Already favorite' });
      return;
    }
    user.favorite_advisor.push(advisor.id);
    user.changed('favorite_advisor', true);
    await user.save();
    res.json({ status: SUCCESS });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var getFavoriteList = async function (req, res, next) {
  try {
    var user = await models.user.findByPk(req.authData.id);
    var favoriteList = [];
    for (var i = 0; i < user.favorite_advisor.length; i++) {
      var advisor = await models.advisor.findByPk(user.favorite_advisor[i]);
      favoriteList.push({
        id: advisor.id,
        name: advisor.name,
        about: advisor.about,
      });
    }
    res.json({ status: SUCCESS, favoriteList: favoriteList });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ status: INTERNAL_ERROR, error: error.message });
  }
}

var deleteFavorite = async function (req, res, next) {
  try {
    var user = await models.user.findByPk(req.authData.id);
    var index = user.favorite_advisor.indexOf(parseInt(req.body.id));
    if (index == -1) {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status: FAIL, error: 'Not favorite' });
      return;
    }
    user.favorite_advisor.splice(index, 1);
    user.changed('favorite_advisor', true);
    await user.save();
    res.json({ status: SUCCESS });
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
    var coinLogs = await models.coin_log.findAll({
      where: { account_id: req.authData.id, account_type: coinLogs.accountType.USER },
      limit: pageSize,
      offset: offset,
    });
    res.json({ status: SUCCESS, coinLogs: coinLogs });
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
  tipAdvisor,
  favoriteAdvisor,
  getFavoriteList,
  deleteFavorite,
  showCoinLogs,
}