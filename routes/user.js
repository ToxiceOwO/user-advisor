var express = require('express');
var router = express.Router();
var models = require('../models');
var jwt = require('jsonwebtoken');
var verifyToken = require('../controller/verify').verifyToken;
var user = require('../controller/user');
const e = require('express');
const secret = 'secret';



router.post('/login', user.login);//用户登录

router.get('/get',verifyToken, user.getInfo);
//用户信息获取

router.post('/signup', user.signup);
//用户注册

router.put('/update', verifyToken, user.infoUpdate);//更新用户信息


router.get('/getAdvisorList', verifyToken, user.getAdvisorList);//拉取顾问列表

router.get('/getAdvisor', verifyToken, user.getAdvisorInfo);//拉取顾问主页信息

router.post('/orderCreate', verifyToken, user.orderCreate)//创建订单

router.get('/myOrderList', verifyToken, user.getMyOrders)//获取我的订单列表

router.post('/queryOrder', verifyToken, user.queryOrder)//查询订单

router.patch('/putOrderUrgent', verifyToken, user.putOrderUrgent)//加急订单')

module.exports = router;
