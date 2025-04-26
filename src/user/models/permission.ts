import { sequelize } from "../../config/db"
import { BaseRepository, PermissionInstance } from "./base"
import { DataTypes } from "sequelize"




export const PermissionModel = sequelize.define<PermissionInstance>(
    'tbl_role_permission',
    {
      id: {
          primaryKey: true,
          type: DataTypes.UUID,
          unique: true,
          defaultValue: DataTypes.UUIDV4
      },
      resource_name: DataTypes.STRING,
      role_id: DataTypes.UUID,
      can_create: DataTypes.BOOLEAN,
      can_read: DataTypes.BOOLEAN,
      can_update: DataTypes.BOOLEAN,
      can_delete: DataTypes.BOOLEAN,
      secondary_privileges: DataTypes.JSONB,
    },
    {
        freezeTableName: true,
        timestamps: false
    }
)

class PermissionRepository extends BaseRepository {
    constructor() {
        super(PermissionModel)
    }
}

export default PermissionRepository