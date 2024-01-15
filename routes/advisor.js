var express = require('express');
var router = express.Router();
var models = require('../models');
var jwt = require('jsonwebtoken');
var verifyToken = require('../controller/verify').verifyToken;
var advisor = require('../controller/advisor');
const e = require('express');
const secret = 'secret';



router.post('/signup',advisor.signup );//顾问注册

router.post('/login', advisor.login);//顾问登录

router.put('/update', verifyToken, advisor.update);//顾问信息更新

router.get('/get',verifyToken, advisor.getAdvisorInfo);
//顾问访问自己主页

router.patch('/patch', verifyToken, advisor.patch);

router.patch('/changeAdvisorStatus', verifyToken, advisor.changeAdvisorStatus);//顾问状态更新
;//顾问信息部分更新

router.get('/getOrderList', verifyToken, advisor.getOrderList);//拉取订单列表

router.post('respondOrder', verifyToken, advisor.respondOrder);//顾问接单

module.exports = router;