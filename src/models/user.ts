import { sequelize } from "config/db"
import { UserInstance } from "./base"
import { DataTypes } from "sequelize"
import TenantModel from "./tenant"


const UserModel = sequelize.define<UserInstance>(
    'user',
    {
      id: {
          primaryKey: true,
          type: DataTypes.UUID,
          unique: true,
          defaultValue: DataTypes.UUIDV4
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      tenant_id: DataTypes.UUID,
    },
    {
        freezeTableName: true,
        underscored: true
    }
)

UserModel.belongsTo(TenantModel, {
    as: 'users',
    foreignKey: 'tenant_id'
})

export default UserModel