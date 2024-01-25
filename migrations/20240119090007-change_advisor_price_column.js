'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 更改列类型为 INTEGER
    await queryInterface.changeColumn('advisors', 'text_price', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.changeColumn('advisors', 'audio_price', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.changeColumn('advisors', 'video_price', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.changeColumn('advisors', 'live_text_price', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.changeColumn('advisors', 'live_video_price', {
      type: Sequelize.INTEGER,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 回滚更改（重新更改为 FLOAT）
    await queryInterface.changeColumn('advisors', 'text_price', {
      type: Sequelize.FLOAT,
    });
    await queryInterface.changeColumn('advisors', 'audio_price', {
      type: Sequelize.FLOAT,
    });
    await queryInterface.changeColumn('advisors', 'video_price', {
      type: Sequelize.FLOAT,
    });
    await queryInterface.changeColumn('advisors', 'live_text_price', {
      type: Sequelize.FLOAT,
    });
    await queryInterface.changeColumn('advisors', 'live_video_price', {
      type: Sequelize.FLOAT,
    });

  }
};