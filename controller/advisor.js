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
const ORDER_STATUS = require('../constants/orderStatus.js');
const { where } = require('sequelize');
const saltRounds = 10;
const SUCCESS = 'success';

var signup = async function (req, res, next) {
  const advisorSignupData = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    password: req.body.password,
  };//允许注册的顾问信息
  if (advisorSignupData.phone == undefined || advisorSignupData.email == undefined || advisorSignupData.password == undefined) {
    res.status(HttpStatusCodes.FORBIDDEN).send('Invalid input,both phone and email are required');
    return;
  }
  try {
    if (await check.signupCheck(req, res, next) == false)
      return;
    advisorSignupData.password = await bcrypt.hash(req.body.password, saltRounds);
    await models.advisor.create(advisorSignupData);
    res.json({ "status": SUCCESS });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}//顾问注册

var login = async function (req, res, next) {
  try {
    var advisor = await models.advisor.findOne({ where: { email: req.body.email } });
    if (advisor && await bcrypt.compare(req.body.password, advisor.password)) {
      var token = jwt.sign({ id: advisor.id, name: advisor.name }, secret, { expiresIn: '24h' });
      res.json(token);
    } else {
      res.json({ error: 'Invalid login' }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
}
//顾问登录

var update = async function (req, res, next) {
  try {
    const allowedAdvisorUpdateData = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      password: req.body.password,
      status: req.body.status,
      price_per_order: req.body.price_per_order,
    };//允许更新的顾问信息
    if (req.body.password && check.checkPassword(req.body.password, res, next)) {
      allowedAdvisorUpdateData.password = await bcrypt.hash(req.body.password, saltRounds);
    }
    Object.keys(allowedAdvisorUpdateData).forEach(key => allowedAdvisorUpdateData[key] === undefined && delete allowedAdvisorUpdateData[key]);
    const advisor = await models.advisor.findByPk(req.authData.id);
    advisor.update(allowedAdvisorUpdateData);
    res.json({ "status": SUCCESS });

  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
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
      res.json({ advisor: advisor });
    } else {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'advisor not found' });
    }

  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
}//顾问访问自己主页

var patch = async function (req, res, next) {
  try {
    advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    advisor.update(req.body);
    res.json({ "status": SUCCESS });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
}//顾问信息部分更新

var changeAdvisorStatus = async function (req, res, next) {
  try {
    const advisor = await models.advisor.findByPk(req.authData.id);
    advisor.status = req.body.status;
    res.json({ "status": SUCCESS });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
}//顾问状态更新

var getOrderList = async function (req, res, next) {
  try {
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    const orders = await models.order.findAll({ where: { advisorid: advisorId } });
    res.json({ orders });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
}//顾问获取订单列表

var respondOrder = async function (req, res, next) {
  try {
    const orderId = req.body.orderId;
    const advisorId = req.authData.id;
    const advisor = await models.advisor.findByPk(advisorId);
    const order = await models.order.findByPk(orderId);
    order.content_reply_message = req.body.content_reply_message;
    order.is_finished = true;
    advisor.coin += order.price;
    if (order.status == ORDER_STATUS.URGENT) {
      advisor.coin += order.price * 0.5;
    }
    order.status = advisorStatus.FINISHED;
    await advisor.save();
    await order.save();
    res.json({ "status": SUCCESS });
  } catch (error) {
    console.log(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
}//顾问响应订单

module.exports = {
  signup,
  login,
  update,
  getAdvisorInfo,
  patch,
  changeAdvisorStatus,
  getOrderList,
  respondOrder,
}; 