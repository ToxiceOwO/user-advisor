'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_favorites');
    await queryInterface.addColumn('users', 'favorite_advisor', {
      type: Sequelize.JSON,
      allowNull: true, 
      defaultValue: '[]',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'favorite_advisor');
    await queryInterface.createTable('user_favorites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
      },
      advisorid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'advisors',
          key: 'id'
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  }
};
