'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('advisor_order_types', 'typeid');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('advisor_order_types', 'typeid', {
      type: Sequelize.INTEGER,
    });
  }
};
