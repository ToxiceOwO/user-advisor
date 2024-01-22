'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('advisor_order_type', {
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
      typeid: {
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
    }
  });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('advisor_order_type');
}
};
