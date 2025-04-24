import { sequelize } from "../../config/db"
import { TenantInstance } from "./base"
import { DataTypes } from "sequelize"


const TenantModel = sequelize.define<TenantInstance>(
    'tbl_tenant',
    {
      id: {
          primaryKey: true,
          type: DataTypes.UUID,
          unique: true,
          defaultValue: DataTypes.UUIDV4
      },
      name: DataTypes.STRING,
      key: DataTypes.STRING,
    },
    {
        freezeTableName: true,
        underscored: true
    }
)

export default TenantModel