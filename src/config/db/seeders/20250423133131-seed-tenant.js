'use strict';
const v4 = require("uuid").v4;
const tenants = [
  {
    id: v4(),
    name: "Tenant A",
    key: "tk_23h1iebe123",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: v4(),
    name: "Tenant B",
    key: "tk_3brf3h3923",
    created_at: new Date(),
    updated_at: new Date(),
  },
]

const base_roles = tenants.map(t => {
  return {
    tenant_id: t.id,
    name: "default",
    id: v4(),
    created_at: new Date(),
    updated_at: new Date(),
  }
})

const role_permissions = base_roles.map(r => {
  let permissions = [
    {
      id: v4(),
      resource_name: "products",
      role_id: r.id,
      can_read: true,
    },
    {
      id: v4(),
      resource_name: "users",
      role_id: r.id,
      can_read: true,
    }
  ]
  return permissions
})

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert("tbl_tenant", tenants);

    await queryInterface.bulkInsert("tbl_role", base_roles);

    for(const r of role_permissions) {
      await queryInterface.bulkInsert("tbl_role_permission", r);
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
