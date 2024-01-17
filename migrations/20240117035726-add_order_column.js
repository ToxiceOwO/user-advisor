'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'rate', {
      type: Sequelize.FLOAT,
      defaultValue: false,
      allowNull: false,
  })
  await queryInterface.addColumn('orders', 'comment', {
    type: Sequelize.TEXT,
    defaultValue: false,
    allowNull: false,})


},

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'rate');
    await queryInterface.removeColumn('orders', 'comment');
  }
};
