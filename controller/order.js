var Redis = require('ioredis');
var redis = new Redis();
var models = require('../models');
var express = require('express');
var Op = require('sequelize').Op;

async function getOrdersByUserId(userId) {
    try {
        const cacheKey = `userOrders:${userId}`;
        const cachedOrders = await redis.get(cacheKey);
        if (cachedOrders) {
            return JSON.parse(cachedOrders);
        }
        const orders = await models.order.findAll({
            where: {
                userid: userId
            }
        })
        await redis.set(cacheKey, JSON.stringify(orders), 'EX', 12*3600);
        return orders;
    } catch (error) {
        console.error("Error in getOrdersByUserId:", error);
        throw error;
    }
    }

async function getOrdersByAdvisorId(advisorId) {
    try {
        const cacheKey = `advisorOrders:${advisorId}`;
        const cachedOrders = await redis.get(cacheKey);
        if (cachedOrders) {
            return JSON.parse(cachedOrders);
        };
        const orders = await models.order.findAll({
            where: {
                advisorid: advisorId
            }
        })
        await redis.set(cacheKey, JSON.stringify(orders), 'EX', 12*3600);
        return orders;
    } catch (error) {
        console.error("Error in getOrdersByAdvisorId:", error);
        throw error;
    }
    }


async function getAdvisorComments(advisorId) {
  const cacheKey = `advisorOrders:${advisorId}`;
  try {
      // 尝试从 Redis 获取缓存的评论
      const cachedOrders = await redis.get(cacheKey);
      if (cachedOrders) {
          orders = JSON.parse(cachedOrders); // 缓存命中，返回解析后的评论数据
      }
      var comments = [];
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].comment) {
                comments.push({rate:orders[i].rate,comment:orders[i].comment});
            }
        }
    return comments;
  } catch (error) {
      console.error("Error in getAdvisorComments:", error);
      throw error; 
  }
}


module.exports = {
    getOrdersByUserId,
    getOrdersByAdvisorId,
    getCommentsFromDatabase,
    getAdvisorComments,

};