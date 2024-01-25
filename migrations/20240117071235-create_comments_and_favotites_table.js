'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
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
      
    },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_favorites');
  }
};
