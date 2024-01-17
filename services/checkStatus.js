var cron = require('node-cron');
var models = require('../models');
const status = require('../constants/orders');

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
                let createdAt = new Date(pendingOrders[i].created_at);
                let createdAtPlusOneDay = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
                if (createdAtPlusOneDay < now) {

                    await refundOrder(pendingOrders[i]);
                    await pendingOrders[i].save();
                }
            }
            for (var i = 0; i < urgentOrders.length; i++) {
                let timeUrgent = new Date(pendingOrders[i].created_at);
                let endUrgent = new Date(timeUrgent.getTime() +  60 * 60 * 1000);
                let createdAt = new Date(pendingOrders[i].created_at);
                let createdAtPlusOneDay = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
                if (endUrgent < now) {
                    (createdAtPlusOneDay < now)? await refundUrgentOrder(urgentOrders[i]) && await refundOrder(urgentOrders[i]) : await refundUrgentOrder(urgentOrders[i]);
                    await urgentOrders[i].save();
                }
            } 
            console.log('check success')
        } catch (error) {
            console.log(error);
        }
    })
}


async function refundOrder(order) {
    try {
        var user = await models.user.findByPk(order.userid);
        user.coin += order.price;
        await user.save();
        order.status = status.EXPIRED;
    } catch (error) {
        console.log(error);
    }
}

async function refundUrgentOrder(order) {
    try {
        var user = await models.user.findByPk(order.userid);
        user.coin += order.price * 0.5;
        await user.save();
        order.status = status.PENDING;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    schedule,
    refundOrder,
    refundUrgentOrder
}