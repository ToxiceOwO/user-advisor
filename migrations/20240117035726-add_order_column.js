'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'rate', {
      type: Sequelize.FLOAT,
      allowNull: true,
  })
  await queryInterface.addColumn('orders', 'comment', {
    type: Sequelize.TEXT,
    allowNull: true,})


},

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'rate');
    await queryInterface.removeColumn('orders', 'comment');
  }
};
