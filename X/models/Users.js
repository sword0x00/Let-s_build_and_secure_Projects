import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userType: {
      type: DataTypes.ENUM('normal', 'premium'),
      defaultValue: 'normal',
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Post, {
      foreignKey: 'userId',
      as: 'posts',
    });

    User.hasMany(models.Like, {
      foreignKey: 'userId',
      as: 'likes',
    });

    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments',
    });

    User.hasMany(models.Retweet, {
      foreignKey: 'userId',
      as: 'retweets',
    });

    // Subscriptions
    User.hasMany(models.Subscription, {
      foreignKey: 'subscriberId',
      as: 'subscriptionsAsSubscriber', // Subscriptions where this user is the subscriber
    });
    User.hasMany(models.Subscription, {
      foreignKey: 'publisherId',
      as: 'subscriptionsAsPublisher', // Subscriptions where this user is the publisher
    });

    // FOLLOW ASSOCIATIONS (Crucial for Follow.js)
    // A user can follow many other users
    User.belongsToMany(models.User, {
      through: models.Follow, // The junction table model
      as: 'following', // The users this user is following
      foreignKey: 'followerId', // The foreign key in the Follow table that refers to this user (as the follower)
      otherKey: 'followingId', // The foreign key in the Follow table that refers to the user being followed
    });

    // A user can be followed by many other users
    User.belongsToMany(models.User, {
      through: models.Follow, // The junction table model
      as: 'followers', // The users who are following this user
      foreignKey: 'followingId', // The foreign key in the Follow table that refers to this user (as the one being followed)
      otherKey: 'followerId', // The foreign key in the Follow table that refers to the user doing the following
    });
  };

  return User;
};
