var Redis = require('ioredis');
var redis = new Redis();
var models = require('../models');
var express = require('express');


async function getCommentsFromDatabase(advisorId) {
  try {
      const orders = await models.order.findAll({
          where: {
              advisorid: advisorId
          }
      })
      const comments = [];
      for (var i = 0; i < comments.length; i++) {
            comments[i] = {
                id: orders[i].id,
                userid: orders[i].userid,
                advisorid: orders[i].advisorid,
                rate: orders[i].rate,
                comment: orders[i].comment,
            };

      }
      return comments;
  } catch (error) {
      console.error("Error in getCommentsFromDatabase:", error);
      throw error;
  }
}

async function getAdvisorComments(advisorId) {
  const cacheKey = `advisor_comments:${advisorId}`;
  try {
      // 尝试从 Redis 获取缓存的评论
      const cachedComments = await redis.get(cacheKey);
      if (cachedComments) {
          return JSON.parse(cachedComments); // 缓存命中，返回解析后的评论数据
      }
      // 缓存未命中，从数据库获取评论
      const comments = await getCommentsFromDatabase(advisorId);
      // 更新 Redis 缓存，设置过期时间
      await redis.set(cacheKey, JSON.stringify(comments), 'EX', 12*3600);

      return comments;
  } catch (error) {
      console.error("Error in getAdvisorComments:", error);
      throw error; 
  }
}


module.exports = {
  getAdvisorComments: getAdvisorComments
};