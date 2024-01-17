const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  class order_comment extends Model {
    static associate(models) {

      // define association here
    }
  }


  order_comment.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    orderid: {
      type: DataTypes.INTEGER,
      references: {
        model: 'order',
        key: 'id'
      }
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
    content: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    underscored: true,
    modelName: 'order_comment',
  });
  return order_comment;
};