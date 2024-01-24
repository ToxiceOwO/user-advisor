'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'comment');
    await queryInterface.removeColumn('orders', 'rate');
    await queryInterface.addColumn('orders', 'is_comment', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'comment', {
      type: Sequelize.TEXT,
    });
    await queryInterface.addColumn('orders', 'rate', {
      type: Sequelize.FLOAT,
    });
    await queryInterface.removeColumn('orders', 'is_comment');
  }
};
