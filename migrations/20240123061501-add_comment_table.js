'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      advisorid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'advisors',
          key: 'id'
        },
      },
      userid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
      },
      orderid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'orders',
          key: 'id'
        },
      },
      rate: {
        type: Sequelize.FLOAT
      },
      comment: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
    }
  })
},

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  }
};
