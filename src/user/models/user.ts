import { sequelize } from "../../config/db"
import { UserInstance } from "./base"
import { DataTypes } from "sequelize"
import TenantModel from "./tenant"
import RoleModel from "./role"


const UserModel = sequelize.define<UserInstance>(
    'tbl_user',
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
        role_id: DataTypes.UUID,
    },
    {
        freezeTableName: true,
        underscored: true
    }
)

UserModel.prototype.toJSON = function () {
    let values = Object.assign({}, this.get());
    delete values.password;
    return values;
}

export default UserModel