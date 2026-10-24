const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo Go no Android não inclui o módulo de tópicos de push. O app usa apenas
// notificações locais, então este import recebe o substituto do próprio pacote.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'android' &&
    moduleName === './TopicSubscriptionModule' &&
    context.originModulePath.endsWith(path.join('expo-notifications', 'build', 'topicSubscription.js'))
  ) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'node_modules/expo-notifications/build/TopicSubscriptionModule.js'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
