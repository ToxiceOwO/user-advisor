'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'favorite_advisor', {
      type: Sequelize.JSON,
      allowNull: false, 
      defaultValue: '[]',

    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'favorite_advisor', {
      allowNull: true, 
      type: Sequelize.JSON,
    });
  }
};
