module.exports = class BrokerManager {
	constructor() {
		// TODO: merge _connection and _brokerConnection
		this._connection = {};
		this._brokerConnection = {};
	}

	handleNewBrokerConnection(connection, brokerClient, system, topicTree, proxyClient) {
		this._brokerClient = brokerClient;
		this._connection = connection;
		this._brokerConnection = {
			name: connection.name,
			broker: brokerClient,
			system,
			topicTree,
			proxyClient
		};
	}

	handleNewClientWebSocketConnection(ws) {}

	getBrokerConnection(brokerName) {
		return this._brokerConnection;
	}

	getBrokerConnectionById(brokerId) {
		return this._brokerConnection;
	}

	getBrokerConnections() {
		return [this._connection];
	}

	connectClient(client, broker) {}

	disconnectClient(client) {}

	getBroker(client) {
		return this._brokerClient;
	}
};
