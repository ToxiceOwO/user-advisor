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
        status: DataTypes.BOOLEAN,
        orders_count: DataTypes.INTEGER,
        rate: DataTypes.FLOAT,
        comments_count: DataTypes.INTEGER,
        about: DataTypes.TEXT,
        bio: DataTypes.STRING,
        ontime_rate: DataTypes.FLOAT,
    }, {
        sequelize,
        underscored: true,
        modelName: 'advisor',
    });
    return advisor;
};