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
        text_status: DataTypes.BOOLEAN,
        text_price: DataTypes.FLOAT,
        audio_status: DataTypes.BOOLEAN,
        audio_price: DataTypes.FLOAT,
        video_status: DataTypes.BOOLEAN,
        video_price: DataTypes.FLOAT,
        live_text_status: DataTypes.BOOLEAN,
        live_text_price: DataTypes.FLOAT,
        live_video_status: DataTypes.BOOLEAN,
        live_video_price: DataTypes.FLOAT,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
    }, {
        sequelize,
        underscored: true,
        modelName: 'advisor',
    });
    return advisor;
};