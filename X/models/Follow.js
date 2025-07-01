// models/Follow.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Follow = sequelize.define('Follow', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['followerId', 'followingId']
      }
    ]
  });

  // ADD THIS ASSOCIATE METHOD
  Follow.associate = (models) => {
    // A Follow record belongs to a follower (User)
    Follow.belongsTo(models.User, {
      foreignKey: 'followerId',
      as: 'followerUser', // This is the user doing the following
    });

    // A Follow record belongs to a user being followed (User)
    Follow.belongsTo(models.User, {
      foreignKey: 'followingId',
      as: 'followingUser', // This is the user being followed
    });
  };

  return Follow;
};
