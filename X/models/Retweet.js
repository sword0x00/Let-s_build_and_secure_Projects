import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Retweet = sequelize.define('Retweet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Posts',
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
        fields: ['userId', 'postId']
      }
    ]
  });

  Retweet.associate = (models) => {
    Retweet.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'retweeter',
    });
    Retweet.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'retweetedPost',
    });
  };

  return Retweet;
};
