// This custom error is used to identify errors thrown by plugins
// and to provide a way to identify the plugin that threw the error
class PluginError extends Error {
  #PLUGIN_ID: string;

  constructor(cause: string, pluginId: string) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PluginError);
    }

    this.name = 'PluginError';
    this.message = cause;
    this.#PLUGIN_ID = pluginId;
  }

  get pluginId() {
    return this.#PLUGIN_ID;
  }
}

// This class is used to provide a default implementation of the plugin interface
// Plugin must inherit from this class
export class DefaultPlugin {
  id: string;

  constructor(pluginId: string) {
    this.id = pluginId;
  }

  throwError(cause: string) {
    throw new PluginError(cause, this.id);
  }
}

// Define the interface of a plugin. Plugin must implement this interface.
// The interface extends from the DefaultPlugin in order to make sure
// typescript throw an error if a plugin does not extends from the DefaultPlugin
// and implements the interface. The interface will be used elsewhere in the code
// to confirm that a plugin implementation is valid.
export default interface IPlugin extends DefaultPlugin {
  notify(message: string, targets: string[]): Promise<void>;
}
