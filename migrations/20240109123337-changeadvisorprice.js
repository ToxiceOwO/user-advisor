'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('advisors', 'price_per_order', {
      type: Sequelize.FLOAT,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('advisors', 'price_per_order');
  }
};
