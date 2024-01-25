var express = require('express');
var router = express.Router();
var models = require('../models');
var jwt = require('jsonwebtoken');
var verifyToken = require('../controller/verify').verifyToken;
var user = require('../controller/user');
const e = require('express');
const secret = 'secret';
const accountType = 0;



router.post('/login', user.login);//用户登录

router.get('/get',verifyToken, user.getInfo);
//用户信息获取

router.post('/signup', user.signup);
//用户注册

router.put('/update', verifyToken, user.infoUpdate);//更新用户信息


router.get('/getAdvisorList', verifyToken, user.getAdvisorList);//拉取顾问列表,传入body.pagesize,body.page

router.get('/getAdvisor', verifyToken, user.getAdvisorInfo);//拉取顾问主页信息

router.post('/orderCreate', verifyToken, user.orderCreate)//创建订单，可接受的参数为:
//body.advisorid,body.type,body.price,body.type,body.content_general_situation,body_content_specific_question.

router.get('/myOrderList', verifyToken, user.getMyOrders)//获取我的订单列表，无需传入参数

router.get('/queryOrder', verifyToken, user.queryOrder)//查询订单,传入body.id

router.patch('/putOrderUrgent', verifyToken, user.putOrderUrgent)//加急订单，传入body.id

router.patch('/cancelOrder', verifyToken, user.cancelOrder)//取消订单，传入body.id

router.post('/commentOrder', verifyToken, user.commentOrder)//评论订单，传入body.id和body.comment

router.get('/getCommentList', verifyToken, user.getCommentList)//获取评论列表，传入body.advisor.id，pagesize，page

router.post('/tipOrder', verifyToken, user.tipOrder)//打赏顾问，传入body.id和body.coin

router.post('/favoriteAdvisor', verifyToken, user.favoriteAdvisor)//收藏顾问，传入body.id

router.get('/getFavoriteList', verifyToken, user.getFavoriteList)//获取收藏列表，无需传入参数

router.delete('/deleteFavorite', verifyToken, user.deleteFavorite)//删除收藏，传入body.id

router.get('/showCoinLogs', verifyToken, user.showCoinLogs)//查看金币日志，传入body.pagesize，body.page

module.exports = router;
