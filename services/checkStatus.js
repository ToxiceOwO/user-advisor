var cron = require('node-cron');
var models = require('../models');
const orders = require('../constants/orders');
const orders_ = require('../controller/order');
const status = orders.orderStatus;
const coinLogs = require('../constants/coinLogs');
const Redis = require('ioredis');
const redis = new Redis();

async function schedule() {
    cron.schedule('* * * * *', async function () {
        try {
            var pendingOrders = await models.order.findAll({
                where: {
                    status: status.PENDING
                }
            });
            var urgentOrders = await models.order.findAll({
                where: {
                    status: status.URGENT
                }
            });
            var now = new Date();
            for (var i = 0; i < pendingOrders.length; i++) {
                let createdAt = new Date(pendingOrders[i].createdAt);
                let createdAtPlusOneDay = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
                if (createdAtPlusOneDay < now) {
                    await refundOrder(pendingOrders[i]);
                }
            }
            for (var i = 0; i < urgentOrders.length; i++) {
                let timeUrgent = new Date(urgentOrders[i].time_urgent);
                let endUrgent = new Date(timeUrgent.getTime() + 60 * 1000);
                let createdAt = new Date(urgentOrders[i].createdAt);
                let createdAtPlusOneDay = new Date(createdAt.getTime() + 60 * 60 * 1000);
                if (endUrgent < now) {
                    (createdAtPlusOneDay < now) ? await refundUrgentOrder(urgentOrders[i]) && await refundOrder(urgentOrders[i]) : await refundUrgentOrder(urgentOrders[i]);
                }
            }
            var advisors = await models.advisor.findAll();
            for (var i = 0; i < advisors.length; i++) {
                await updateAdvisorInfo(advisors[i].id);
            }

            console.log('check success')
        } catch (error) {
            console.log(error);
        }
    })
}

async function updateAdvisorInfo(advisorId) {
    try {
        const orders = await orders_.getOrdersByAdvisorId(advisorId);
        const comment = await orders_.getAdvisorComments(advisorId, 1000, 0);
        var totalRate = 0;
        var finishedOrders = 0;
        for (let i = 0; i < comment.length; i++) {
            totalRate += comment[i].rate;
        }
        for (let i = 0; i < orders.length; i++) {
            if (orders[i].status === status.FINISHED) {
                finishedOrders++;
            }
        }
        const result = await models.sequelize.transaction(async (t) => {
            const advisor = await models.advisor.findByPk(advisorId, { transaction: t });
            advisor.rate = totalRate / comment.length;
            if (comment.length === 0) {
                advisor.rate = 0;
            }
            advisor.comments_count = comment.length;
            advisor.orders_count = orders.length;
            advisor.ontime_rate = finishedOrders / orders.length;
            if (orders.length === 0) {
                advisor.ontime_rate = 0;
            }
            await advisor.save({ transaction: t });
        });
        return result;
    }
    catch (error) {

        console.log(error);
    }
}




async function refundOrder(order) {
    const t = await models.sequelize.transaction();
    try {
        const result = await models.sequelize.transaction(async (t) => {
            order = await models.order.findByPk(order.id, { transaction: t });
        if (order.status != status.PENDING) {
            throw new Error(9000);
        }
        var user = await models.user.findByPk(order.userid);
        await user.increment('coin', { by: order.price, transaction: t });
        order.status = status.EXPIRED;
        await order.save({ transaction: t });
        await models.coin_log.create({
            account_type: coinLogs.accountType.USER,
            account_id: user.id,
            coin_change: order.price,
            action: coinLogs.coinAction.refundOrder,
        }, { transaction: t });
    });
        return result;
    } catch (error) {
        t.rollback();
        console.log(error);
    }
}

async function refundUrgentOrder(order) {
    const t = await models.sequelize.transaction();
    try {
        var user = await models.user.findByPk(order.userid);
        user.coin += order.price * 0.5;
        await user.increment('coin', { by: order.price * 0.5, transaction: t });
        order.status = status.PENDING;
        await order.save({ transaction: t });
        await models.coin_log.create({
            account_type: coinLogs.accountType.USER,
            account_id: user.id,
            coin_change: order.price * 0.5,
            action: coinLogs.coinAction.refundOrder,
        }, { transaction: t });
        await t.commit();
    } catch (error) {
        t.rollback();
        console.log(error);
    }
}

module.exports = {
    schedule,
    refundOrder,
    refundUrgentOrder,
}