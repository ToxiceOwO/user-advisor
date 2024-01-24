var Redis = require('ioredis');
var redis = new Redis();
var models = require('../models');
var express = require('express');
var Op = require('sequelize').Op;
const random = Math.random();

async function getOrdersByUserId(userId) {
    try {
        const cacheKey = `user_orders:${userId}`;
        const cachedOrders = await redis.get(cacheKey);
        if (cachedOrders) {
            return JSON.parse(cachedOrders);
        }
        const orders = await models.order.findAll({ where: { userid: userId } });
        redis.set(cacheKey, JSON.stringify(orders), 'EX', random * 12 * 3600); //设置随机过期时间防止缓存雪崩
        return orders;
    } catch (error) {
        console.error("Error in getOrdersByUserId:", error);
        throw error;
    }
}

async function getOrdersByAdvisorId(advisorId) {
    try {
        const cacheKey = `advisor_orders:${advisorId}`;
        const cachedOrders = await redis.get(cacheKey);
        if (cachedOrders) {
            return JSON.parse(cachedOrders);
        };
        const orders = await models.order.findAll({
            where: {
                advisorid: advisorId
            }
        })
        redis.set(cacheKey, JSON.stringify(orders), 'EX', random * 12 * 3600);
        return orders;
    } catch (error) {
        console.error("Error in getOrdersByAdvisorId:", error);
        throw error;
    }
}

async function updateCommentsCache(advisorId) {
    try {
        const cacheKey = `advisor_comments:${advisorId}`;
        const comments = await models.comment.findAll({
            where: {
                advisorid: advisorId
            }
        })
        redis.set(cacheKey, JSON.stringify(comments), 'EX', random * 12 * 3600);
    } catch (error) {
        console.error("Error in updateCommentsCache:", error);
        throw error;
    }
}

async function getAdvisorComments(advisorId,pagesize,offset) {
    const cacheKey = `advisor_comments:${advisorId}`;
    try {
        // 尝试从 Redis 获取缓存的评论
        const cachedOrders = await redis.get(cacheKey);
        if (cachedOrders) {
            var orders = JSON.parse(cachedOrders);

        }
        else {
            // 缓存未命中，从数据库中读取评论
            var orders = await models.comment.findAll({
                where: {
                    advisorid: advisorId,
                },
            });
            // 将数据库读取到的评论数据写入 Redis
            redis.set(cacheKey, JSON.stringify(orders), 'EX', random * 12 * 3600);
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
        const cacheKey = `user_orders:${userId}`;
        const orders = await models.order.findAll({
            where: {
                userid: userId
            }
        })
        redis.set(cacheKey, JSON.stringify(orders), 'EX', random * 12 * 3600);
    } catch (error) {
        console.error("Error in updateCacheByUserId:", error);
        throw error;
    }
}

async function updateCacheByAdvisorId(advisorId) {
    try {
        const cacheKey = `advisor_orders:${advisorId}`;
        const orders = await models.order.findAll({
            where: {
                advisorid: advisorId
            }
        })
        redis.set(cacheKey, JSON.stringify(orders), 'EX', random * 12 * 3600);
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
    updateCommentsCache
};