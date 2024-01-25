'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('advisor_order_types', 'type', {
      type: Sequelize.TINYINT,
      allowNull: false,
    });


  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('advisor_order_types', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
