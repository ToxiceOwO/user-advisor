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

router.post('/changeTextStatus', verifyToken, advisor.changeTextStatus);//顾问修改文本状态

router.post('/changeVoiceStatus', verifyToken, advisor.changeVoiceStatus);//顾问修改语音状态

router.post('/changeVideoStatus', verifyToken, advisor.changeVideoStatus);//顾问修改视频状态

router.post('changeLiveTextStatus', verifyToken, advisor.changeLiveTextStatus);//顾问修改直播状态

router.post('/changeLiveVideoStatus', verifyToken, advisor.changeLiveVideoStatus);//顾问修改直播状态

router.post('/changeTextPrice', verifyToken, advisor.changeTextPrice);//顾问修改文本价格

router.post('/changeVoicePrice', verifyToken, advisor.changeVoicePrice);//顾问修改语音价格

router.post('/changeVideoPrice', verifyToken, advisor.changeVideoPrice);//顾问修改视频价格

router.post('/changeLiveTextPrice', verifyToken, advisor.changeLiveTextPrice);//顾问修改直播文本价格

router.post('/changeLiveVideoPrice', verifyToken, advisor.changeLiveVideoPrice);//顾问修改直播视频价格

module.exports = router;