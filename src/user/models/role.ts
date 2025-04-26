import { sequelize } from "../../config/db"
import { BaseRepository, RoleInstance } from "./base"
import { DataTypes } from "sequelize"
import {PermissionModel} from "./permission"


export const RoleModel = sequelize.define<RoleInstance>(
    'tbl_role',
    {
      id: {
          primaryKey: true,
          type: DataTypes.UUID,
          unique: true,
          defaultValue: DataTypes.UUIDV4,
      },
      name: DataTypes.STRING,
      tenant_id: DataTypes.UUID
    },
    {
        freezeTableName: true,
        underscored: true
    }
)

RoleModel.hasMany(PermissionModel, {
    as: "permissions",
    foreignKey: "role_id"
})

class RoleRepository extends BaseRepository {
    constructor() {
        super(RoleModel)
    }
}

export default RoleRepository