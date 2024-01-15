'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('advisors', 'orderscount', 'orders_count');
    await queryInterface.renameColumn('advisors', 'commentscount', 'comments_count');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('advisors', 'orders_count', 'orderscount');
    await queryInterface.renameColumn('advisors', 'comments_count', 'commentscount');
  }
};
