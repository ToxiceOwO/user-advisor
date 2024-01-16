var express = require('express');
var router = express.Router();
var models = require('../models');
var jwt = require('jsonwebtoken');
var verifyToken = require('./verify').verifyToken;
var bcrypt = require('bcrypt');
var check = require('../controller/checkInput.js');
const e = require('express');
const secret = 'secret';
const HttpStatusCodes = require('../constants/httpStatusCodes');
const saltRounds = 10;
const orderStatus = require('../constants/orderStatus');
const SUCCESS = 'success';
const FAIL = 'fail';
const INTERNAL_ERROR = 'internal error';

var login = async function (req, res, next) {
  try {
    var user = await models.user.findOne({ where: { email: req.body.email } });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      var token = jwt.sign({ id: user.id, name: user.name }, secret, { expiresIn: '24h' });
      res.json({token:token});
    } else {
      res.status(HttpStatusCodes.FORBIDDEN).json({ status:FAIL, error: 'Invalid login' });
    }
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({status:INTERNAL_ERROR, errorMessage: error.message});
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
      res.status(HttpStatusCodes.NOT_FOUND).json({status:FAIL, error: 'user not found' });
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
    res.status(HttpStatusCodes.FORBIDDEN).json({status:FAIL,error:'Invalid input,both phone and email are required'});
    return;
  }
  try {
    if (!(await check.signupCheck(req, res, next)))
      return;
    userSignData.password = await bcrypt.hash(req.body.password, saltRounds);
    if (!await models.user.create(userSignData)) {
      res.status(HttpStatusCodes.FORBIDDEN).json({status:FAIL,error:'please check your input'});
      return;
    }
    res.json({ "status": SUCCESS });
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({status:INTERNAL_ERROR, error:error.message});
  }
}//用户注册

var infoUpdate = async function (req, res, next) {
  try {
    const allowedUserUpdateData = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      birth: req.body.birth,
      gender: req.body.gender,
      bio: req.body.bio,
      about: req.body.about,
      password: req.body.password,
      status: req.body.status,
    };//允许更新的顾问信息
    const userId = req.authData.id;
    const user = await models.user.findByPk(userId);
    if (req.body.password && check.checkPassword(req.body.password, res)) {
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    }
    Object.keys(allowedUserUpdateData).forEach(key => allowedUserUpdateData[key] === undefined && delete allowedUserUpdateData[key]);

    user.update(req.body);
    res.json({status:SUCCESS});

  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({status:INTERNAL_ERROR,error: error.message});
  }
}


var getAdvisorList = async function (req, res, next) {
  try {
    var advisor = await models.advisor.findAll({ attributes: { exclude: ['password'] } });
    var advisorList = [];
    for (var i = 0; i < advisor.length; i++) {
      advisorList[i] = {
        id: advisor[i].id,
        name: advisor[i].name,
        about: advisor[i].about,
      };
    }
    res.json({status: SUCCESS, advisorList: advisorList });
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({status:INTERNAL_ERROR, error: error.message});
  }
}

var getAdvisorInfo = async function (req, res, next) {
  try {
    var advisor = await models.advisor.findOne({ where: { id: req.body.id }, attributes: {
      exclude: ['password'] 
    } } );
    res.json({status:SUCCESS, advisor: advisor });
  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({status:INTERNAL_ERROR,error:'Server error'});
  }
}

var orderCreate = async function (req, res, next) {
  const orderData = {
    userid: req.authData.id,
    advisorid: req.body.advisorid,
    price: req.body.price,
    content_general_situation: req.body.content_general_situation,
    content_specific_question: req.body.specific_question,
    status: orderStatus.PENDING,
  };//允许用户定义的订单信息
  const user = await models.user.findByPk(req.authData.id);
  Object.keys(orderData).forEach(key => orderData[key] === undefined && delete orderData[key]);
  try {
    var order = await models.order.create(orderData);
    if (user.coin < req.body.price) {
      res.status(HttpStatusCodes.FORBIDDEN).json({status:FAIL,error:'Not enough coin'});
      return;
    }
    user.coin = user.coin - req.body.price;
    await user.save();
    order.is_finished = false;
    await order.save();
    res.json({status:SUCCESS});
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({status:INTERNAL_ERROR,error:error.message});
  }
}

var getMyOrders = async function (req, res, next) {
  try {
    var order = await models.order.findAll({ where: { userId: req.authData.id } });
    var orderList = [];
    for (var i = 0; i < order.length; i++) {
      orderList[i] = {
        id: order[i].id,
        advisorid: order[i].advisorid,
        contentReplyMessage: order[i].content_reply_message,
        isFinished: order[i].is_finished,
        timeUrgent: order[i].time_urgent,
        timeFinished: order[i].time_finished,
        status: order[i].status,
      };
    }
    res.json({status:SUCCESS, orderList: orderList });
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({status:INTERNAL_ERROR,error:error.message});
  }
}

var queryOrder = async function (req, res, next) {
  try {
    var order = await models.order.findAll({ where: { id: req.body.id } });
    var orderInfo = {
      id: order.id,
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
    res.json(orderInfo);
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({status:INTERNAL_ERROR,error:error.message});
  }
}

var putOrderUrgent = async function (req, res, next) {
  try {
    var order = await models.order.findByPk(req.body.id);
    var user = await models.user.findByPk(order.userid);
    if (order.status == orderStatus.PENDING) {
      if (user.coin < order.price * 0.5) {
        res.status(HttpStatusCodes.FORBIDDEN).json({status:FAIL,error:'Not enough coin'});
        return;
      }
      user.coin = user.coin - order.price * 0.5;
      order.status = orderStatus.URGENT;
      await order.save();
      res.json({status:SUCCESS});
    }
    else {
      res.status(HttpStatusCodes.FORBIDDEN).json({status:FAIL,error:'Order status error'});
    }
  }
  catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({status:INTERNAL_ERROR,error:error.message});
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
}