'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'favorite_advisor');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'favorite_advisor', {
      type: Sequelize.INTEGER,
      references: {
        model: 'advisors',
        key: 'id',
      },
      allowNull: true,
    });
  }
};
