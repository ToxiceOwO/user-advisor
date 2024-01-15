'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('advisors', 'orderscount', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('advisors', 'rate', {
      type: Sequelize.FLOAT,
    });
    await queryInterface.addColumn('advisors', 'commentscount', {
      type: Sequelize.INTEGER,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('advisors', 'orderscount');
    await queryInterface.removeColumn('advisors', 'rate');  
    await queryInterface.removeColumn('advisors', 'commentscount');
    }
};
