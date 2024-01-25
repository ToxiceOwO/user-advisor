const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    class coin_log extends Model {
        static associate(models) {

            // define association here
        }
    }


    coin_log.init({
      account_type: DataTypes.STRING,
      account_id: DataTypes.INTEGER,
      coin_change: DataTypes.INTEGER,
      action: DataTypes.STRING,
    }, {
        sequelize,
        underscored: true,
        modelName: 'coin_log',
    });
    return coin_log;
};