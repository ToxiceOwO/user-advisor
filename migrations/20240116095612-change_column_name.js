'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('advisors', 'createdAt', 'created_at');
    await queryInterface.renameColumn('advisors', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('users', 'createdAt', 'created_at');
    await queryInterface.renameColumn('users', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('orders', 'createdAt', 'created_at');
    await queryInterface.renameColumn('orders', 'updatedAt', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('advisors', 'created_at', 'createdAt');
    await queryInterface.renameColumn('advisors', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('users', 'created_at', 'createdAt');
    await queryInterface.renameColumn('users', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('orders', 'created_at', 'createdAt');
    await queryInterface.renameColumn('orders', 'updated_at', 'updatedAt');
    

  }
};
