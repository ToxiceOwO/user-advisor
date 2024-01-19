const { Model, DataTypes } = require('sequelize');
const Redis = require('ioredis');
const redis = new Redis();
module.exports = (sequelize, DataTypes) => {
    class order extends Model {
       
        static associate(models) {

            // define association here
        }
    }


    order.init({
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        userid: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'id'
            }
        },
        advisorid: {
            type: DataTypes.INTEGER,
            references: {
                model: 'advisor',
                key: 'id'
            }
        },
        price: {
            type: DataTypes.INTEGER
        },
        content_general_situation: {
            type: DataTypes.TEXT
        },
        content_specific_question: {
            type: DataTypes.TEXT
        },
        content_reply_message: {
            type: DataTypes.TEXT
        },
        is_finished: {
            type: DataTypes.BOOLEAN
        },
        time_urgent: {
            type: DataTypes.DATE,
            allowNull: true
        },
        time_finished: {
            type: DataTypes.DATE,
            allowNull: true
        },

        status: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.TINYINT
        },
        comment: {
            type: DataTypes.TEXT
        },
        rate: {
            type: DataTypes.FLOAT
        },

    }, {
        sequelize,
        underscored: true,
        modelName: 'order',
        hooks: {
            async afterCreate(order) {
                var order_ = require('../controller/order');
                await order_.updateCacheByUserId(order.userid);
                await order_.updateCacheByAdvisorId(order.advisorid);
            },
            async afterUpdate(order) {
                var order_ = require('../controller/order');
                await order_.updateCacheByUserId(order.userid);
                await order_.updateCacheByAdvisorId(order.advisorid);
            },
            async afterDestroy(order) {
                var order_ = require('../controller/order');
                await order_.updateCacheByUserId(order.userid);
                await order_.updateCacheByAdvisorId(order.advisorid);
        }
    }});
    return order;
};