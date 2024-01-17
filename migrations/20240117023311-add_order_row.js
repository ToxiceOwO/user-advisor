'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'type', {
      type: Sequelize.TINYINT,
      defaultValue: false,
      allowNull: false,
  })},

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'type');
  }
};

