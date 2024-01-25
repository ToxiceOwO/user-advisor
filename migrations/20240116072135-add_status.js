'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('advisors', 'text_status', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }
    );

    await queryInterface.addColumn('advisors', 'audio_status', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }
    );

    await queryInterface.addColumn('advisors', 'video_status', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }
    );

    await queryInterface.addColumn('advisors', 'live_text_status', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('advisors', 'text_status');
    await queryInterface.removeColumn('advisors', 'audio_status');
    await queryInterface.removeColumn('advisors', 'video_status');
    await queryInterface.removeColumn('advisors', 'live_text_status');
  }
};
