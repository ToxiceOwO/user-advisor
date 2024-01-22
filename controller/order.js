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
        const orders = await models.order.findAll({ where: { userid: userId } });
        await redis.set(cacheKey, JSON.stringify(orders), 'EX', 12 * 3600);
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
        await redis.set(cacheKey, JSON.stringify(orders), 'EX', 12 * 3600);
        return orders;
    } catch (error) {
        console.error("Error in getOrdersByAdvisorId:", error);
        throw error;
    }
}


async function getAdvisorComments(advisorId,pagesize,offset) {
    const cacheKey = `advisorOrders:${advisorId}`;
    try {
        // 尝试从 Redis 获取缓存的评论
        const cachedOrders = await redis.get(cacheKey);
        if (cachedOrders) {
            var orders = JSON.parse(cachedOrders);

        }
        else {
            // 缓存未命中，从数据库中读取评论
            var orders = await models.order.findAll({
                where: {
                    advisorid: advisorId,
                    comment: {
                        [Op.ne]: null
                    }
                },
            });
            // 将数据库读取到的评论数据写入 Redis
            await redis.set(cacheKey, JSON.stringify(orders), 'EX', 12 * 3600);
        }
        var comments = [];
        for (var i = offset; i < offset + pagesize && i < orders.length; i++) {
            if (orders[i].comment) {
                comments.push({ rate: orders[i].rate, comment: orders[i].comment });
            }
        }
        return comments;
    } catch (error) {
        console.error("Error in getAdvisorComments:", error);
        throw error;
    }
}

async function updateCacheByUserId(userId) {
    try {
        const cacheKey = `userOrders:${userId}`;
        const orders = await models.order.findAll({
            where: {
                userid: userId
            }
        })
        await redis.set(cacheKey, JSON.stringify(orders), 'EX', 12 * 3600);
    } catch (error) {
        console.error("Error in updateCacheByUserId:", error);
        throw error;
    }
}

async function updateCacheByAdvisorId(advisorId) {
    try {
        const cacheKey = `advisorOrders:${advisorId}`;
        const orders = await models.order.findAll({
            where: {
                advisorid: advisorId
            }
        })
        await redis.set(cacheKey, JSON.stringify(orders), 'EX', 12 * 3600);
    } catch (error) {
        console.error("Error in updateCacheByAdvisorId:", error);
        throw error;
    }
}

module.exports = {
    getOrdersByUserId,
    getOrdersByAdvisorId,
    getAdvisorComments,
    updateCacheByUserId,
    updateCacheByAdvisorId,
};