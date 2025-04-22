import { sequelize } from "config/db"
import { RoleInstance } from "./base"
import { DataTypes } from "sequelize"


const RoleModel = sequelize.define<RoleInstance>(
    'role',
    {
      id: {
          primaryKey: true,
          type: DataTypes.UUID,
          unique: true,
          defaultValue: DataTypes.UUIDV4
      },
      name: DataTypes.STRING,
    },
    {
        freezeTableName: true,
        underscored: true
    }
)

export default RoleModel