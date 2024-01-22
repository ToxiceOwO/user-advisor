var cron = require('node-cron');
var models = require('../models');
const orders = require('../constants/orders');
const status = orders.orderStatus;
const coinLogs = require('../constants/coinLogs');

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
                let createdAtPlusOneDay = new Date(createdAt.getTime() +  60 * 1000);
                if (createdAtPlusOneDay < now) {
                    await refundOrder(pendingOrders[i]);
                }
            }
            for (var i = 0; i < urgentOrders.length; i++) {
                let timeUrgent = new Date(urgentOrders[i].time_urgent);
                let endUrgent = new Date(timeUrgent.getTime() +   60 * 1000);
                let createdAt = new Date(urgentOrders[i].createdAt);
                let createdAtPlusOneDay = new Date(createdAt.getTime() +  60 * 1000);
                if (endUrgent < now) {
                    (createdAtPlusOneDay < now)? await refundUrgentOrder(urgentOrders[i]) && await refundOrder(urgentOrders[i]) : await refundUrgentOrder(urgentOrders[i]);
                }
            } 
            
            console.log('check success')
        } catch (error) {
            console.log(error);
        }
    })
}


async function refundOrder(order) {
    const t = await models.sequelize.transaction();
    try {
        var user = await models.user.findByPk(order.userid);
        user.coin += order.price;
        await user.save( {transaction: t});
        order.status = status.EXPIRED;
        await order.save( {transaction: t});
        await models.coin_log.create({
            account_type: coinLogs.accountType.USER,
            account_id: user.id,
            coin_change: order.price,
            action: coinLogs.coinAction.refundOrder,
          }, { transaction: t });
        await t.commit();
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
        await user.save( {transaction: t});
        order.status = status.PENDING;
        await order.save( {transaction: t});
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
    refundUrgentOrder
}