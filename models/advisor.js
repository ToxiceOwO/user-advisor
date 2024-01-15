const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class advisor extends Model {
        static associate(models) {

            // define association here
        }
    }


    advisor.init({
        phone: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        name: DataTypes.STRING,
        coin: DataTypes.INTEGER,
        status: DataTypes.STRING,
        orders_count: DataTypes.INTEGER,
        rate: DataTypes.FLOAT,
        comments_count: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'advisor',
    });
    return advisor;
};