const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    client.logger.success(`Logged in as ${client.user.tag}`);
    client.logger.info(`Serving ${client.guilds.cache.size} guild(s).`);

    const activities = [
      { name: '/setup to build your server 🖤', type: ActivityType.Playing },
      { name: '120+ features', type: ActivityType.Watching },
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
    ];
    let i = 0;
    const rotate = () => {
      client.user.setActivity(activities[i % activities.length]);
      i++;
    };
    rotate();
    setInterval(rotate, 60_000);
  },
};
