'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
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
      price: {
        type: Sequelize.INTEGER
      },
      content_general_situation: {
        type: Sequelize.TEXT
      },
      content_specific_question: {
        type: Sequelize.TEXT
      },
      content_reply_message: {
        type: Sequelize.TEXT
      },
      is_finished: {
        type: Sequelize.BOOLEAN
      },
      time_urgent: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      time_finished: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
 
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};
