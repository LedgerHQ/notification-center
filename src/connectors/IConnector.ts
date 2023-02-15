// This custom error is used to identify errors thrown by connectors
// and to provide a way to identify the connector that threw the error
class ConnectorError extends Error {
  #CONNECTOR_ID: string;

  constructor(cause: string, connectorId: string) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConnectorError);
    }

    this.name = 'ConnectorError';
    this.message = cause;
    this.#CONNECTOR_ID = connectorId;
  }

  get connectorId() {
    return this.#CONNECTOR_ID;
  }
}

// This class is used to provide a default implementation of the connector interface
// connector must inherit from this class
export class DefaultConnector {
  id: string;

  constructor(connectorId: string) {
    this.id = connectorId;
  }

  throwError(cause: string) {
    throw new ConnectorError(cause, this.id);
  }
}

// Define the interface of a connector. connector must implement this interface.
// The interface extends from the DefaultConnector in order to make sure
// typescript throw an error if a connector does not extends from the DefaultConnector
// and implements the interface. The interface will be used elsewhere in the code
// to confirm that a connector implementation is valid.
export default interface IConnector extends DefaultConnector {
  notify(message: string, targets: string[]): Promise<void>;
}
