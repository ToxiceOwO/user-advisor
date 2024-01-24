const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class user_fav extends Model {
        static associate(models) {

            // define association here
        }
    }


    user_fav.init({
        userid: DataTypes.INTEGER,
        advisorid: DataTypes.INTEGER,
    }, {
        sequelize,
        underscored: true,
        modelName: 'user_fav',
    });
    return user_fav;
};