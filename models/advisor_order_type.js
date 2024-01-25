const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class advisor_order_type extends Model {
        static associate(models) {

            // define association here
        }
    }


    advisor_order_type.init({
        advisorid: DataTypes.INTEGER,
        type: DataTypes.TINYINT,
        status: DataTypes.BOOLEAN,
        price: DataTypes.INTEGER,
    }, {
        sequelize,
        underscored: true,
        modelName: 'advisor_order_type',
    });
    return advisor_order_type;
};