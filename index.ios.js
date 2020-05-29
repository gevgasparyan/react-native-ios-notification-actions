/* eslint-disable max-classes-per-file */
import { NativeModules, NativeAppEventEmitter } from 'react-native';

const { RNNotificationActions } = NativeModules;

const actions = {};

function handleActionCompleted() {
  RNNotificationActions.callCompletionHandler();
};

export class Action {

  constructor(opts, onComplete) {
    // TODO - check options
    this.opts = opts;
    this.onComplete = onComplete;
    // When a notification is received, we'll call this action by it's identifier
    actions[opts.identifier] = this;
    NativeAppEventEmitter.addListener('notificationActionReceived', this._onAction);
  }

  removeListener = () => {
    NativeAppEventEmitter.removeListener('notificationActionReceived', this._onAction);
  }

  _onAction = (body) => {
    if (body.identifier === this.opts.identifier) {
      this.onComplete(body, handleActionCompleted);
    }
  }
}

export class Category {
  constructor(opts) {
    this.opts = opts;
  }
}

class PushNotificationActions {
  categories = [];

  removeAll = () => {
    this.categories.forEach(category => {
      if (category.opts && category.opts.actions) {
        category.opts.actions.forEach(action => {
          action.removeListener();
        });
      }
    });
  }

  updateCategories = (_categories) => {
    this.removeAll();
    const categories = _categories.map((cat) => {
      return { ...cat.opts, actions: cat.opts.actions.map((action) => action.opts)};
    });

    RNNotificationActions.updateCategories(categories);
    this.categories = _categories;
  };
}

export const NotificationActions = new PushNotificationActions()