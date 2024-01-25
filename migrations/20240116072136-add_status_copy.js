'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('advisors', 'text_price', {
      type: Sequelize.FLOAT,
      defaultValue: false,
    }
    ); queryInterface.addColumn('advisors', 'audio_price', {
      type: Sequelize.FLOAT,
      defaultValue: false,
    }
    );
    await queryInterface.addColumn('advisors', 'video_price', {
      type: Sequelize.FLOAT,
      defaultValue: false,
    }
    );
    await queryInterface.addColumn('advisors', 'live_text_price', {
      type: Sequelize.FLOAT,
      defaultValue: false,
    }
    );
    await queryInterface.addColumn('advisors', 'live_video_status', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }
    );
    await queryInterface.addColumn('advisors', 'live_video_price', {
      type: Sequelize.FLOAT,
      defaultValue: false,
    }
    );
    await queryInterface.removeColumn('advisors', 'price_per_order');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('advisors', 'text_price');
    await queryInterface.removeColumn('advisors', 'audio_price');
    await queryInterface.removeColumn('advisors', 'video_price');
    await queryInterface.removeColumn('advisors', 'live_text_price');
    await queryInterface.removeColumn('advisors', 'live_video_status');
    await queryInterface.removeColumn('advisors', 'live_video_price');
    await queryInterface.addColumn('advisors', 'price_per_order', {
      type: Sequelize.FLOAT,
    }
    );
  }
};
