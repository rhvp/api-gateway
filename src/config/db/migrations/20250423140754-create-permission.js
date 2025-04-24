'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.createTable('tbl_role_permission', {
      id: {
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4
      },
      resource_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tbl_role',
          key: 'id'
        }
      },
      can_create: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      can_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      can_update: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      can_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      secondary_privileges: {
        type: Sequelize.JSONB
      },
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.dropTable('tbl_role_permission');
  }
};
