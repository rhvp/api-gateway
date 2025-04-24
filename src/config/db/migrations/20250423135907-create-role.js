'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.createTable('tbl_role', {
      id: {
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tbl_tenant',
          key: 'id'
        }
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.dropTable('tbl_role');
  }
};
