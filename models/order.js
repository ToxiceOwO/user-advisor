const { Model, DataTypes } = require('sequelize');
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
        created_at: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updated_at: {
            allowNull: false,
            type: DataTypes.DATE
        },
        status: {
            type: DataTypes.STRING
        },
    }, {
        sequelize,
        underscored: true,
        modelName: 'order',
    });
    return order;
};