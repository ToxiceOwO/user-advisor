'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameTable('advisor_order_type', 'advisor_order_types');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameTable('advisor_order_types', 'advisor_order_type');
  }
};
