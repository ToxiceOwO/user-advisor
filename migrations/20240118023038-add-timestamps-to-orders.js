'use strict';

  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.changeColumn('orders', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
  
      await queryInterface.changeColumn('orders', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('orders', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('orders', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};