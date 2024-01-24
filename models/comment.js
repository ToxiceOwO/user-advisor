const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class comment extends Model {
        static associate(models) {

            // define association here
        }
    }


    comment.init({
        advisorid: DataTypes.INTEGER,
        userid: DataTypes.INTEGER,
        orderid: DataTypes.INTEGER,
        rate: DataTypes.FLOAT,
        comment: DataTypes.TEXT,
    }, {
        sequelize,
        underscored: true,
        modelName: 'comment',
    });
    return comment;
};