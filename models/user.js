const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class user extends Model {
        static associate(models) {

            // define association here
        }
    }


    user.init({
        phone: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        name: DataTypes.STRING,
        birth: DataTypes.DATE,
        gender: DataTypes.STRING,
        bio: DataTypes.TEXT,
        about: DataTypes.TEXT,
        coin: DataTypes.INTEGER,
        favorite_advisor: DataTypes.JSON,
    }, {
        sequelize,
        underscored: true,
        modelName: 'user',
    });
    return user;
};