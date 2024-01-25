'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('advisors', 'about', {
      type: Sequelize.TEXT,
    }
    );
    await queryInterface.addColumn('advisors', 'bio', {
      type: Sequelize.STRING,
    }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('advisors', 'about');
    await queryInterface.removeColumn('advisors', 'bio');
  }
};
