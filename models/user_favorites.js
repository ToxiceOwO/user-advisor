const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  class user_favorite extends Model {
    static associate(models) {

      // define association here
    }
  }


  user_favorite.init({
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
  }, {
    sequelize,
    underscored: true,
    modelName: 'user_favorite',
  });
  return user_favorite;
};