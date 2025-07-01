// models/Subscription.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subscriberId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Refers to the 'Users' table name
        key: 'id',
      },
    },
    publisherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Refers to the 'Users' table name
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    // Ensure unique pairs of subscriberId and publisherId
    uniqueKeys: {
      ActionsUnique: {
        fields: ['subscriberId', 'publisherId']
      }
    }
  });

  // ADD THIS ASSOCIATE METHOD
  Subscription.associate = (models) => {
    // A subscription has a subscriber (who is a User)
    Subscription.belongsTo(models.User, {
      foreignKey: 'subscriberId',
      as: 'subscriber',
    });

    // A subscription has a publisher (who is a User)
    Subscription.belongsTo(models.User, {
      foreignKey: 'publisherId',
      as: 'publisher',
    });
  };

  return Subscription;
};
